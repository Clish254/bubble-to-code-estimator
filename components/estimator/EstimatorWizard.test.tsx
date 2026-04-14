import { render, screen, waitFor, within } from "@testing-library/react";
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

    await user.click(screen.getByRole("radio", { name: /Mid-sized app/i }));

    expect(nextButton).toBeEnabled();

    await user.click(getActionButton("Next"));

    expect(await screen.findByRole("heading", {
      name: /How many user roles does your app have/i,
    })).toBeInTheDocument();
  });

  it("does not emit a controlled-state warning when a radio step is selected", async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<EstimatorWizard />);

    await user.click(screen.getByRole("radio", { name: /Mid-sized app/i }));

    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining(
        "A component is changing the uncontrolled value state of RadioGroup"
      )
    );
  });

  it("shows the integration loading state and allows manual classification changes", async () => {
    const user = userEvent.setup();
    let resolveFetch: (value: Response) => void = () => undefined;

    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve as (value: Response) => void;
        }) as Promise<Response>
    );

    render(<EstimatorWizard />);

    await advanceToIntegrationStep(user);

    await user.type(screen.getByLabelText("Integrations"), "Stripe");
    await user.click(getActionButton("Analyze Integrations"));

    expect(await screen.findByRole("heading", {
      name: /Analyzing your integrations/i,
    })).toBeInTheDocument();

    resolveFetch(
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
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    );

    const stripePanel = await screen.findByTestId("integration-Stripe");

    await user.click(within(stripePanel).getByRole("button", { name: "High" }));

    await waitFor(() =>
      expect(screen.getByText(/64\s*hrs/i)).toBeInTheDocument()
    );
  });

  it("keeps focus in the integrations textarea while typing", async () => {
    const user = userEvent.setup();

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

    vi.mocked(fetch).mockResolvedValue(
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
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    );

    render(<EstimatorWizard />);

    await completeGoldenFlow(user);

    expect(
      await screen.findByRole("heading", { name: /\$49,300 - \$69,600/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/4\.8 - 6\.8 months/i)).toBeInTheDocument();
    expect(screen.getByText("Scale")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Book a Call/i })).toHaveAttribute(
      "href",
      "https://goodspeed.studio/contact"
    );

    await user.click(screen.getByRole("button", { name: "Recalculate" }));

    expect(
      await screen.findByRole("heading", { name: /How big is your Bubble app/i })
    ).toBeInTheDocument();
  });
});

async function advanceToIntegrationStep(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByRole("heading", { name: /How big is your Bubble app/i });
  await user.click(screen.getByRole("radio", { name: /Mid-sized app/i }));
  await user.click(getActionButton("Next"));

  await screen.findByRole("heading", { name: /How many user roles does your app have/i });
  await user.click(screen.getByRole("radio", { name: /2 to 3 roles/i }));
  await user.click(getActionButton("Next"));

  await screen.findByRole("heading", { name: /What type of rebuild do you need/i });
  await user.click(screen.getByRole("radio", { name: /Same logic, redesigned/i }));
  await user.click(getActionButton("Next"));

  await screen.findByRole("heading", {
    name: /How many features sit at each complexity level/i,
  });
  await user.clear(screen.getByLabelText("Simple features"));
  await user.type(screen.getByLabelText("Simple features"), "3");
  await user.clear(screen.getByLabelText("Medium features"));
  await user.type(screen.getByLabelText("Medium features"), "2");
  await user.clear(screen.getByLabelText("Complex features"));
  await user.type(screen.getByLabelText("Complex features"), "1");
  await user.click(getActionButton("Next"));

  await screen.findByRole("heading", {
    name: /What integrations does your Bubble app use/i,
  });
}

async function completeGoldenFlow(user: ReturnType<typeof userEvent.setup>) {
  await advanceToIntegrationStep(user);

  await user.type(screen.getByLabelText("Integrations"), "Stripe");
  await user.click(getActionButton("Analyze Integrations"));
  await screen.findByTestId("integration-Stripe");
  await user.click(getActionButton("Next"));

  await screen.findByRole("heading", {
    name: /What level of UI quality and device support are you aiming for/i,
  });
  await user.click(screen.getByRole("radio", { name: /Polished responsive/i }));
  await user.click(screen.getByRole("radio", { name: /Desktop plus mobile/i }));
  await user.click(getActionButton("Next"));

  await screen.findByRole("heading", { name: /Do you have existing designs/i });
  await user.click(screen.getByRole("radio", { name: /Partial designs/i }));
  await user.click(getActionButton("Next"));

  await screen.findByRole("heading", { name: /Do you need an admin dashboard/i });
  await user.click(screen.getByRole("radio", { name: /Basic admin/i }));
  await user.click(getActionButton("Next"));

  await screen.findByRole("heading", {
    name: /What migration, cleanup, or reverse-engineering work is part of the rebuild/i,
  });
  await user.click(screen.getByRole("radio", { name: /No migration/i }));
  await user.click(screen.getByRole("radio", { name: /No tech debt fix/i }));
  await user.click(screen.getByRole("radio", { name: /Partial or outdated docs/i }));
  await user.click(getActionButton("Next"));

  await screen.findByRole("heading", { name: /What extras should we include/i });
  await user.click(getActionButton("Get Estimate"));

  await waitFor(() =>
    expect(
      screen.getByRole("heading", { name: /\$49,300 - \$69,600/i })
    ).toBeInTheDocument()
  );
}

function getActionButton(name: string | RegExp) {
  const matches = screen.getAllByRole("button", { name });

  return matches[matches.length - 1]!;
}
