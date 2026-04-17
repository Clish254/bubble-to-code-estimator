import type { Metadata } from "next";

import { EmbedResizer } from "@/components/estimator/EmbedResizer";
import { WebsiteEstimator } from "@/components/website-estimator/WebsiteEstimator";

export const metadata: Metadata = {
  title: "Website Estimator",
  description:
    "Configure a Goodspeed website package and get a live estimate for scope, price, and follow-up.",
};

export default function WebsiteEstimatePage() {
  return (
    <main
      data-estimator-root
      className="flex h-dvh min-h-0 items-stretch justify-center overflow-hidden px-0 py-0 sm:px-3 sm:py-3 lg:items-center lg:px-8 lg:py-8"
    >
      <section className="flex h-full min-h-0 w-full max-w-7xl">
        <WebsiteEstimator />
      </section>
      <EmbedResizer />
    </main>
  );
}
