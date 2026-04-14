import type { Metadata } from "next";

import { EstimatorWizard } from "@/components/estimator/EstimatorWizard";

export const metadata: Metadata = {
  title: "Bubble-to-Code Estimator",
  description:
    "Answer a few questions about your Bubble app to get a realistic Goodspeed rebuild range.",
};

export default function EstimatePage() {
  return (
    <main className="flex h-dvh items-center justify-center overflow-hidden px-3 py-3 sm:px-5 sm:py-5 lg:px-8 lg:py-8">
      <section className="flex h-full min-h-0 w-full max-w-7xl">
        <EstimatorWizard />
      </section>
    </main>
  );
}
