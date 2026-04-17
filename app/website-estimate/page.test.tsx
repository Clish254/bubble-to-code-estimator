import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import WebsiteEstimatePage from "@/app/website-estimate/page";

vi.mock("@/components/estimator/EmbedResizer", () => ({
  EmbedResizer: () => <div data-testid="embed-resizer" />,
}));

describe("WebsiteEstimatePage", () => {
  it("keeps the website estimator inside the embed-safe shell", () => {
    const { container } = render(<WebsiteEstimatePage />);

    expect(container.querySelector("main[data-estimator-root]")).toBeInTheDocument();
    expect(container.querySelector("main[data-estimator-root] > section")).toBeInTheDocument();
    expect(container.querySelector("[data-estimator-scroll]")).toBeInTheDocument();
    expect(screen.getByTestId("embed-resizer")).toBeInTheDocument();
  });
});
