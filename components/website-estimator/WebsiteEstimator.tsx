"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, CodeXml, Mail, Paintbrush, PenTool } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CounterInput } from "@/components/ui/counter-input";
import { InfoPopover } from "@/components/ui/info-popover";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import {
  calculateWebsiteEstimate,
  DEFAULT_WEBSITE_ESTIMATE_INPUT,
  isValidEstimateEmail,
  WEBSITE_INCLUDED_DELIVERABLE_INFO,
  WEBSITE_INDEX_PAGE_META,
  WEBSITE_PAGE_CATEGORY_META,
  type WebsiteIndexPageKey,
  type WebsitePageCategory,
  type WebsiteIncludedDeliverable,
} from "@/lib/website-estimator";

type QuoteSubmissionStatus = "idle" | "submitting";

function WebsiteEstimator() {
  const [configuration, setConfiguration] = useState(DEFAULT_WEBSITE_ESTIMATE_INPUT);
  const [quotePanelOpen, setQuotePanelOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submissionStatus, setSubmissionStatus] =
    useState<QuoteSubmissionStatus>("idle");

  const reducedMotion = useReducedMotion() ?? false;
  const emailInputRef = useRef<HTMLInputElement>(null);

  const estimate = calculateWebsiteEstimate(configuration);
  const hasTypedEmail = email.trim().length > 0;
  const emailIsValid = isValidEstimateEmail(email);

  useEffect(() => {
    if (quotePanelOpen) {
      emailInputRef.current?.focus();
    }
  }, [quotePanelOpen]);

  function updatePageCount(key: WebsitePageCategory, value: number) {
    setConfiguration((current) => ({
      ...current,
      [key]: Math.max(0, Math.floor(value) || 0),
    }));
  }

  function updateIndexSelection(key: WebsiteIndexPageKey, checked: boolean) {
    setConfiguration((current) => ({
      ...current,
      [key]: checked,
    }));
  }

  async function handleQuoteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!emailIsValid || submissionStatus === "submitting") {
      return;
    }

    setSubmissionStatus("submitting");

    try {
      const response = await fetch("/api/website-estimate-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          configuration,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string }
        | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(
          payload?.message ||
            "We couldn't send your quote just now. Please try again."
        );
      }

      setQuotePanelOpen(false);
      setEmail("");
      toast.success("Quote sent.", {
        description: "We sent the detailed breakdown to your inbox.",
      });
    } catch (error) {
      toast.error("Couldn’t send your quote.", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again in a moment.",
      });
    } finally {
      setSubmissionStatus("idle");
    }
  }

  return (
    <div
      data-estimator-scroll
      className="surface-panel h-full min-h-0 w-full overflow-y-auto overscroll-y-contain rounded-none border border-border/80 bg-[var(--gs-surface-strong)] touch-pan-y [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch] sm:rounded-[2rem]"
    >
      <div className="grid gap-5 p-4 sm:gap-6 sm:p-6 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] lg:p-8">
        <WebsiteEstimateSummary
          estimate={estimate}
          quotePanelOpen={quotePanelOpen}
          email={email}
          hasTypedEmail={hasTypedEmail}
          emailIsValid={emailIsValid}
          submissionStatus={submissionStatus}
          emailInputRef={emailInputRef}
          reducedMotion={reducedMotion}
          onEmailChange={setEmail}
          onOpenQuotePanel={() => setQuotePanelOpen(true)}
          onCloseQuotePanel={() => setQuotePanelOpen(false)}
          onSubmitQuote={handleQuoteSubmit}
        />

        <div className="space-y-5">
          <Card
            eyebrow="Add pages · $1,000 each"
            className="border-border/80 bg-white/82"
          >
            <div className="space-y-3">
              {WEBSITE_PAGE_CATEGORY_META.slice(0, 5).map((category) => (
                <CounterInput
                  key={category.key}
                  label={category.label}
                  value={configuration[category.key]}
                  onChange={(value) => updatePageCount(category.key, value)}
                  density="compact"
                />
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <p className="text-[0.72rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Other
              </p>
              <CounterInput
                label={WEBSITE_PAGE_CATEGORY_META[5].label}
                value={configuration.otherPages}
                onChange={(value) => updatePageCount("otherPages", value)}
                density="compact"
              />
            </div>
          </Card>

          <Card
            eyebrow="Index pages"
            className="border-border/80 bg-white/76"
          >
            <div className="grid gap-3 md:grid-cols-2">
              {WEBSITE_INDEX_PAGE_META.map((indexPage) => (
                <IndexPageToggle
                  key={indexPage.key}
                  label={indexPage.label}
                  checked={configuration[indexPage.key]}
                  onChange={(checked) => updateIndexSelection(indexPage.key, checked)}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        Current website estimate total {estimate.ctaLabelAmount}.
      </p>
    </div>
  );
}

interface WebsiteEstimateSummaryProps {
  estimate: ReturnType<typeof calculateWebsiteEstimate>;
  quotePanelOpen: boolean;
  email: string;
  hasTypedEmail: boolean;
  emailIsValid: boolean;
  submissionStatus: QuoteSubmissionStatus;
  emailInputRef: RefObject<HTMLInputElement | null>;
  reducedMotion: boolean;
  onEmailChange: (value: string) => void;
  onOpenQuotePanel: () => void;
  onCloseQuotePanel: () => void;
  onSubmitQuote: (event: FormEvent<HTMLFormElement>) => void;
}

function WebsiteEstimateSummary({
  estimate,
  quotePanelOpen,
  email,
  hasTypedEmail,
  emailIsValid,
  submissionStatus,
  emailInputRef,
  reducedMotion,
  onEmailChange,
  onOpenQuotePanel,
  onCloseQuotePanel,
  onSubmitQuote,
}: WebsiteEstimateSummaryProps) {
  return (
    <Card
      className="relative overflow-hidden border-white/10 bg-[#182019] p-5 text-[#f2eae4] shadow-none sm:p-6 lg:p-7"
      style={{
        backgroundColor: "#182019",
        boxShadow: "none",
      }}
    >
      <div className="space-y-6">
        <div className="relative z-10 space-y-3">
          <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-[#aeb8ad] uppercase">
            {estimate.packageLabel}
          </p>

          <div className="space-y-2">
            <h1 className="text-balance text-3xl leading-[0.98] font-semibold tracking-[-0.05em] sm:text-4xl lg:text-[2.9rem]">
              {estimate.basePackageName}
            </h1>
            <div className="flex flex-wrap items-end gap-3">
              <p
                className="text-4xl leading-none font-semibold tracking-[-0.06em] sm:text-5xl"
                data-testid="website-estimate-total"
              >
                {estimate.ctaLabelAmount}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="rounded-full border border-white/10 bg-transparent px-3 py-1 text-[0.72rem] font-semibold tracking-[0.16em] text-[#d7d0ca] uppercase">
              {estimate.platform}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-[1.1rem] border border-white/10 bg-white/4 px-4 py-3 text-sm text-[#f2eae4]">
            <div className="flex items-center gap-2 text-[#d8e48f]">
              <PenTool className="size-4" />
              <Paintbrush className="size-4" />
              <CodeXml className="size-4" />
            </div>
            <span className="font-medium tracking-[-0.02em]">
              Copy, design & development included
            </span>
          </div>
        </div>

        <div className="relative z-10 rounded-[1.45rem] border border-white/10 bg-white/4 px-4 py-4">
          <p className="text-sm font-semibold tracking-[0.01em] text-[#f2eae4]">
            Included deliverables
          </p>
          <div className="mt-3 grid gap-2">
            {estimate.includedDeliverables.map((item) => (
              <IncludedDeliverableRow key={item} item={item} />
            ))}
          </div>
        </div>

        <div className="relative z-10 space-y-3">
          <a
            href="https://goodspeed.studio/contact"
            className={cn(
              buttonVariants({ size: "lg" }),
              "w-full justify-between px-4 shadow-[0_22px_50px_-28px_rgba(0,0,0,0.7)]"
            )}
          >
            <span>Book a Call · {estimate.ctaLabelAmount}</span>
            <span className="inline-flex size-9 items-center justify-center rounded-[0.85rem] bg-[#182019] text-[#f2eae4]">
              <ArrowUpRight className="size-4" />
            </span>
          </a>

          <AnimatePresence initial={false} mode="wait">
            {quotePanelOpen ? (
              <motion.form
                key="quote-panel"
                data-testid="quote-panel"
                initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : -10 }}
                transition={{ duration: reducedMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
                onSubmit={onSubmitQuote}
                className="rounded-[1.45rem] border border-white/10 bg-white/4 p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-[1rem] bg-primary/14 text-[#d8e48f]">
                    <Mail className="size-4" />
                  </span>
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#f2eae4]">
                      Get your quote
                    </h2>
                    <p className="text-sm leading-6 text-[#b4beb3]">
                      We&apos;ll send a detailed breakdown to your inbox.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Input
                    ref={emailInputRef}
                    type="email"
                    value={email}
                    onChange={(event) => onEmailChange(event.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    aria-label="Email address"
                    aria-invalid={hasTypedEmail && !emailIsValid}
                    className="h-12 rounded-[1rem] border-white/10 bg-white/8 px-4 text-base text-[#f2eae4] placeholder:text-[#94a096]"
                  />
                  {hasTypedEmail && !emailIsValid ? (
                    <p className="text-sm leading-6 text-destructive">
                      Enter a valid email to send the quote.
                    </p>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="submit"
                    size="lg"
                    className="sm:flex-1"
                    disabled={!emailIsValid || submissionStatus === "submitting"}
                  >
                    {submissionStatus === "submitting" ? "Sending..." : "Send My Quote"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    className="sm:flex-1 border border-white/10 bg-white/4 text-[#f2eae4] hover:bg-white/8"
                    onClick={onCloseQuotePanel}
                    disabled={submissionStatus === "submitting"}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="quote-trigger"
                initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reducedMotion ? 0 : -10 }}
                transition={{ duration: reducedMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="w-full border border-white/10 bg-white/4 text-[#f2eae4] hover:bg-white/8"
                  onClick={onOpenQuotePanel}
                >
                  Get your quote
                  </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
}

function IncludedDeliverableRow({
  item,
}: {
  item: WebsiteIncludedDeliverable;
}) {
  const info = WEBSITE_INCLUDED_DELIVERABLE_INFO[item];

  return (
    <div className="flex items-start gap-3 text-sm leading-6">
      <span className="mt-2 size-1.5 rounded-full bg-[#d7d0ca]" />
      <div className="flex min-w-0 items-start gap-1">
        <span className="text-[#f2eae4]">{item}</span>
        {info ? <InfoPopover label={item} description={info} className="mt-0.5" /> : null}
      </div>
    </div>
  );
}

interface IndexPageToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function IndexPageToggle({ label, checked, onChange }: IndexPageToggleProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-4 rounded-[1.3rem] border border-border/80 bg-white/75 px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--gs-soft)] hover:bg-white",
        checked &&
          "border-[var(--gs-deep)] bg-[color-mix(in_srgb,var(--primary)_16%,white)] shadow-[0_18px_38px_-28px_rgba(54,73,60,0.45)]"
      )}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(nextChecked) => onChange(Boolean(nextChecked))}
        className="mt-1 size-5 rounded-[0.45rem] border-border/90 bg-white data-checked:border-[var(--gs-deep)] data-checked:bg-[var(--gs-deep)]"
      />
      <div className="space-y-1">
        <span className="text-base font-semibold tracking-[-0.02em]">{label}</span>
      </div>
    </label>
  );
}

export { WebsiteEstimator };
