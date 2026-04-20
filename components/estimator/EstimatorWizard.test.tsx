import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EstimatorWizard } from "@/components/estimator/EstimatorWizard";

describe("EstimatorWizard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("keeps the first next button disabled until an option is chosen", async () => {
    const user = userEvent.setup();

    render(<EstimatorWizard />);

    const nextButton = screen.getByRole("button", { name: "Next" });
    expect(nextButton).toBeDisabled();

    await user.click(screen.getByRole("radio", { name: /^Medium/i }));

    expect(nextButton).toBeEnabled();

    await user.click(getActionButton("Next"));

    expect(await screen.findByRole("heading", {
      name: /How many types of users/i,
    })).toBeInTheDocument();
  });

  it("does not emit a controlled-state warning when a radio step is selected", async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<EstimatorWizard />);

    await user.click(screen.getByRole("radio", { name: /^Medium/i }));

    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining(
        "A component is changing the uncontrolled value state of RadioGroup"
      )
    );
  });

  it("shows the integration loading state while classifying", async () => {
    const user = userEvent.setup();
    let resolveFetch: (value: Response) => void = () => undefined;

    vi.mocked(fetch).mockImplementation(
      (input: RequestInfo | URL) => {
        const url = typeof input === "string" ? input : input.toString();
        if (url.includes("classify-features")) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                classification: {
                  simple: 3,
                  medium: 2,
                  complex: 1,
                  summary: "A balanced mix of features.",
                  source: "ai",
                },
              }),
              { status: 200, headers: { "Content-Type": "application/json" } }
            )
          ) as Promise<Response>;
        }
        return new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        });
      }
    );

    render(<EstimatorWizard />);

    await advanceToIntegrationStep(user);

    await user.type(screen.getByLabelText("Integrations"), "Stripe");
    await user.click(getActionButton("Analyze Integrations"));

    expect(await screen.findByRole("heading", {
      name: /Checking your integrations/i,
    })).toBeInTheDocument();

    resolveFetch(
      new Response(
        JSON.stringify({
          classifications: [
            {
              name: "Stripe",
              complexity: "low",
              hours: 7,
              reason: "Matches the Stripe payment reference.",
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    await screen.findByTestId("integration-Stripe");
  });

  it("keeps focus in the integrations textarea while typing", async () => {
    const user = userEvent.setup();

    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            classification: {
              simple: 3,
              medium: 2,
              complex: 1,
              summary: "Ok.",
              source: "ai",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )
    );

    render(<EstimatorWizard />);

    await advanceToIntegrationStep(user);

    const integrationsInput = screen.getByLabelText("Integrations");

    await user.click(integrationsInput);
    await user.keyboard("Stripe");

    expect(integrationsInput).toHaveValue("Stripe");
    expect(integrationsInput).toHaveFocus();
  });

  it("completes the golden path and renders the final estimate", async () => {
    const user = userEvent.setup();

    vi.mocked(fetch).mockImplementation((input: RequestInfo | URL) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("classify-features")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              classification: {
                simple: 3,
                medium: 2,
                complex: 1,
                summary: "A balanced feature set.",
                source: "ai",
              },
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          )
        );
      }
      return Promise.resolve(
        new Response(
          JSON.stringify({
            classifications: [
              {
                name: "Stripe",
                complexity: "low",
                hours: 12,
                reason: "Matches the Stripe payment reference.",
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      );
    });

    render(<EstimatorWizard />);

    await completeGoldenFlow(user);

    // sameUx (×0.8), mid app, twoToThree roles, 3/2/1 features, Stripe low 12h,
    // polished + desktopMobile, partial designs, basic admin, no migration,
    // no techDebt, partial docs, no extras.
    // directHours = 367, combined = 0.8, buffered = 352.32
    // costMid = $17,616 → low $11,450.40, high $19,377.60
    // Rounded up to $1k: $12,000 – $20,000 (headline shows "Starts at $12,000")
    // totalWeeks = 13.01 → daysLow 45, daysHigh 63 → 3–4 months
    // Tier: Growth (costLow $11,450 falls in $10k–$24,999.99)
    expect(
      await screen.findByRole("heading", { name: /Starts at \$12,000/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/\$12,000\s*–\s*\$20,000/i)).toBeInTheDocument();
    expect(screen.getByText(/3[–-]4 months/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Book a 15 min call/i })
    ).toHaveAttribute("href", "https://goodspeed.studio/contact");

    await user.click(screen.getByRole("button", { name: "Recalculate" }));

    expect(
      await screen.findByRole("heading", { name: /How big is your app/i })
    ).toBeInTheDocument();
  }, 10000);

  it("skips the admin step when a partial rebuild is selected", async () => {
    const user = userEvent.setup();

    vi.mocked(fetch).mockImplementation(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            classification: {
              simple: 3,
              medium: 1,
              complex: 0,
              summary: "A focused feature set.",
              source: "fallback",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )
    );

    render(<EstimatorWizard />);

    await screen.findByRole("heading", { name: /How big is your app/i });
    await user.click(screen.getByRole("radio", { name: /^Medium/i }));
    await user.click(getActionButton("Next"));

    await screen.findByRole("heading", { name: /How many types of users/i });
    await user.click(screen.getByRole("radio", { name: /^Two or three/i }));
    await user.click(getActionButton("Next"));

    await screen.findByRole("heading", { name: /What are you looking for/i });
    await user.click(
      screen.getByRole("radio", { name: /A partial rebuild/i })
    );
    await user.click(getActionButton("Next"));

    // Step 4: features (pre-filled, but user can still advance)
    await screen.findByRole("heading", {
      name: /What are the main things people do/i,
    });
    await user.click(getActionButton("Next"));

    // Step 5: integrations
    await screen.findByRole("heading", { name: /Which tools does your app connect to/i });
    await user.click(getActionButton("Next"));

    // Step 6: UI quality
    await screen.findByRole("heading", {
      name: /How should the app look/i,
    });
    await user.click(screen.getByRole("radio", { name: /^Polished and branded/i }));
    await user.click(screen.getByRole("radio", { name: /^Desktop and mobile/i }));
    await user.click(getActionButton("Next"));

    // Step 7: designs
    await screen.findByRole("heading", { name: /Do you already have designs/i });
    await user.click(screen.getByRole("radio", { name: /^Some are done/i }));
    await user.click(getActionButton("Next"));

    // Admin step (index 7) should be skipped — we jump straight to migration (index 8).
    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: /Do you need an admin dashboard/i })
      ).not.toBeInTheDocument();
    });
    expect(
      await screen.findByRole("heading", {
        name: /Tell us about your data/i,
      })
    ).toBeInTheDocument();
  }, 10000);
});

async function advanceToIntegrationStep(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByRole("heading", { name: /How big is your app/i });
  await user.click(screen.getByRole("radio", { name: /^Medium/i }));
  await user.click(getActionButton("Next"));

  await screen.findByRole("heading", { name: /How many types of users/i });
  await user.click(screen.getByRole("radio", { name: /^Two or three/i }));
  await user.click(getActionButton("Next"));

  await screen.findByRole("heading", { name: /What are you looking for/i });
  await user.click(screen.getByRole("radio", { name: /An exact rebuild/i }));
  await user.click(getActionButton("Next"));

  await screen.findByRole("heading", {
    name: /What are the main things people do/i,
  });
  await user.type(
    screen.getByLabelText("Main things users do"),
    "Users sign up, browse listings, book appointments, pay."
  );
  await user.click(getActionButton("Analyze Features"));
  await screen.findByTestId("feature-classification");
  await user.click(getActionButton("Next"));

  await screen.findByRole("heading", {
    name: /Which tools does your app connect to/i,
  });
}

async function completeGoldenFlow(user: ReturnType<typeof userEvent.setup>) {
  await advanceToIntegrationStep(user);

  await user.type(screen.getByLabelText("Integrations"), "Stripe");
  await user.click(getActionButton("Analyze Integrations"));
  await screen.findByTestId("integration-Stripe");
  await user.click(getActionButton("Next"));

  await screen.findByRole("heading", {
    name: /How should the app look/i,
  });
  await user.click(screen.getByRole("radio", { name: /^Polished and branded/i }));
  await user.click(screen.getByRole("radio", { name: /^Desktop and mobile/i }));
  await user.click(getActionButton("Next"));

  await screen.findByRole("heading", { name: /Do you already have designs/i });
  await user.click(screen.getByRole("radio", { name: /^Some are done/i }));
  await user.click(getActionButton("Next"));

  await screen.findByRole("heading", { name: /Do you need an admin dashboard/i });
  await user.click(screen.getByRole("radio", { name: /^Basic admin/i }));
  await user.click(getActionButton("Next"));

  await screen.findByRole("heading", {
    name: /Tell us about your data/i,
  });
  await user.click(screen.getByRole("radio", { name: /^No, we're starting fresh/i }));
  await user.click(screen.getByRole("radio", { name: /^No, it's in good shape/i }));
  await user.click(
    screen.getByRole("radio", { name: /^Somewhat documented/i })
  );
  await user.click(getActionButton("Get Estimate"));

  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: /Starts at \$12,000/i })
    ).toBeInTheDocument()
  );
}

function getActionButton(name: string | RegExp) {
  const matches = screen.getAllByRole("button", { name });

  return matches[matches.length - 1]!;
}
