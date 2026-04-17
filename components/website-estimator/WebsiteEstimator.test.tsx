import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WebsiteEstimator } from "@/components/website-estimator/WebsiteEstimator";

const toastSuccessMock = vi.hoisted(() => vi.fn());
const toastErrorMock = vi.hoisted(() => vi.fn());

vi.mock("@/components/ui/sonner", () => ({
  Toaster: () => null,
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}));

describe("WebsiteEstimator", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    toastSuccessMock.mockReset();
    toastErrorMock.mockReset();
  });

  it("renders the base package and included deliverables", () => {
    render(<WebsiteEstimator />);

    expect(screen.getByText(/Starter Kit/i)).toBeInTheDocument();
    expect(screen.getByTestId("website-estimate-total")).toHaveTextContent("$15,000");
    expect(screen.getByText("Copy, design & development included")).toBeInTheDocument();
    expect(
      screen.queryByText(/Fixed package plus any extra pages or index hubs you add\./i)
    ).not.toBeInTheDocument();
    expect(screen.getByText("Positioning Workshop")).toBeInTheDocument();
    expect(screen.getByText("Blog and content migration")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /More information about/i })
    ).toHaveLength(3);
  });

  it("renders workshop info descriptions for the summary tooltips", () => {
    render(<WebsiteEstimator />);

    expect(
      screen.getByText(
        /We align on your audience, value prop, and positioning before any copy or design starts\./i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /We define the visual direction, references, and overall site feel so every page stays cohesive\./i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /We map the core pages and user journeys together so the website structure is clear before the build\./i
      )
    );
    expect(screen.getByRole("button", { name: /More information about Sitemap Workshop/i })).toBeInTheDocument();
  });

  it("updates the total and selected extras when counters and toggles change", async () => {
    const user = userEvent.setup();

    render(<WebsiteEstimator />);

    await user.click(screen.getByRole("button", { name: /Increase Feature pages/i }));
    await user.click(screen.getByRole("button", { name: /Increase Feature pages/i }));
    await user.click(screen.getByRole("checkbox", { name: /Solution index/i }));

    expect(screen.getByTestId("website-estimate-total")).toHaveTextContent("$18,000");
    expect(screen.getByRole("link", { name: /Book a Call/i })).toHaveTextContent(
      "$18,000"
    );
  });

  it("keeps decrement buttons disabled at zero", () => {
    render(<WebsiteEstimator />);

    expect(
      screen.getByRole("button", { name: /Decrease Feature pages/i })
    ).toBeDisabled();
  });

  it("reveals the quote panel and only enables send for a valid email", async () => {
    const user = userEvent.setup();

    render(<WebsiteEstimator />);

    await user.click(screen.getByRole("button", { name: /Get your quote/i }));

    expect(await screen.findByTestId("quote-panel")).toBeInTheDocument();

    const sendButton = screen.getByRole("button", { name: /Send My Quote/i });
    expect(sendButton).toBeDisabled();

    await user.type(await screen.findByLabelText(/Email address/i), "not-valid");
    expect(sendButton).toBeDisabled();

    await user.clear(screen.getByLabelText(/Email address/i));
    await user.type(
      screen.getByLabelText(/Email address/i),
      "hello@goodspeed.studio"
    );

    expect(sendButton).toBeEnabled();
  });

  it("closes the quote panel on cancel", async () => {
    const user = userEvent.setup();

    render(<WebsiteEstimator />);

    await user.click(screen.getByRole("button", { name: /Get your quote/i }));
    await user.click(await screen.findByRole("button", { name: /Cancel/i }));

    await waitFor(() => {
      expect(screen.queryByTestId("quote-panel")).not.toBeInTheDocument();
    });
  });

  it("submits the quote successfully and shows a toast", async () => {
    const user = userEvent.setup();

    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      })
    );

    render(<WebsiteEstimator />);

    await user.click(screen.getByRole("button", { name: /Increase Feature pages/i }));
    await user.click(screen.getByRole("button", { name: /Get your quote/i }));
    await user.type(
      await screen.findByLabelText(/Email address/i),
      "hello@goodspeed.studio"
    );
    await user.click(screen.getByRole("button", { name: /Send My Quote/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/website-estimate-quote",
        expect.objectContaining({
          method: "POST",
        })
      );
    });

    expect(toastSuccessMock).toHaveBeenCalledWith("Quote sent.", {
      description: "We sent the detailed breakdown to your inbox.",
    });
    await waitFor(() => {
      expect(screen.queryByTestId("quote-panel")).not.toBeInTheDocument();
    });
  });

  it("shows an error toast when quote submission fails", async () => {
    const user = userEvent.setup();

    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: false,
          message: "Slack webhook delivery failed.",
        }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    );

    render(<WebsiteEstimator />);

    await user.click(screen.getByRole("button", { name: /Get your quote/i }));
    await user.type(
      await screen.findByLabelText(/Email address/i),
      "hello@goodspeed.studio"
    );
    await user.click(screen.getByRole("button", { name: /Send My Quote/i }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Couldn’t send your quote.", {
        description: "Slack webhook delivery failed.",
      });
    });

    expect(screen.getByTestId("quote-panel")).toBeInTheDocument();
  });

  it("keeps the Book a Call CTA pointed at Goodspeed contact", () => {
    render(<WebsiteEstimator />);

    expect(screen.getByRole("link", { name: /Book a Call/i })).toHaveAttribute(
      "href",
      "https://goodspeed.studio/contact"
    );
  });
});
