import type { Metadata } from "next";

import { EmbedResizer } from "@/components/estimator/EmbedResizer";
import { EstimatorWizard } from "@/components/estimator/EstimatorWizard";

export const metadata: Metadata = {
  title: "Bubble-to-Code Estimator",
  description:
    "Answer a few questions about your Bubble app to get a realistic Goodspeed rebuild range.",
};

export default function EstimatePage() {
  return (
    <main
      data-estimator-root
      className="flex h-dvh min-h-0 items-stretch justify-center overflow-hidden px-0 py-0 sm:px-3 sm:py-3 lg:items-center lg:px-8 lg:py-8"
    >
      <section className="flex h-full min-h-0 w-full max-w-7xl">
        <EstimatorWizard />
      </section>
      <EmbedResizer />
    </main>
  );
}
