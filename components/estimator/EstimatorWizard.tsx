"use client";

import {
  startTransition,
  useDeferredValue,
  useReducer,
  type Dispatch,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { ProgressBar } from "@/components/estimator/ProgressBar";
import { ResultsScreen } from "@/components/estimator/ResultsScreen";
import { StepAdmin } from "@/components/estimator/steps/StepAdmin";
import { StepAppSize } from "@/components/estimator/steps/StepAppSize";
import { StepDesigns } from "@/components/estimator/steps/StepDesigns";
import { StepExtras } from "@/components/estimator/steps/StepExtras";
import { StepFeatures } from "@/components/estimator/steps/StepFeatures";
import { StepIntegrations } from "@/components/estimator/steps/StepIntegrations";
import { StepMigration } from "@/components/estimator/steps/StepMigration";
import { StepRebuildType } from "@/components/estimator/steps/StepRebuildType";
import { StepUIQuality } from "@/components/estimator/steps/StepUIQuality";
import { StepUserRoles } from "@/components/estimator/steps/StepUserRoles";
import { Button } from "@/components/ui/button";
import { RESULT_STEP_INDEX, STEP_TITLES, TOTAL_STEPS } from "@/lib/constants";
import {
  calculateEstimate,
  isEstimateReady,
  normalizeEstimateInput,
} from "@/lib/calculator";
import {
  createFallbackClassifications,
  normalizeIntegrationText,
  parseIntegrationInput,
} from "@/lib/integrations";
import { INTEGRATION_HOURS } from "@/lib/integrations";
import { cn } from "@/lib/utils";
import type {
  ClassificationResponse,
  EstimatorAnswers,
  EstimatorState,
  IntegrationComplexity,
} from "@/lib/types";

const INITIAL_ANSWERS: EstimatorAnswers = {
  appSize: null,
  userRoles: null,
  rebuildType: null,
  simpleFeatureCount: 0,
  mediumFeatureCount: 0,
  complexFeatureCount: 0,
  integrationsText: "",
  integrationClassifications: [],
  uiQuality: null,
  deviceSupport: null,
  existingDesigns: null,
  adminDashboard: null,
  dataMigration: null,
  techDebt: null,
  documentation: null,
  includeDesignPhase: false,
  includeProjectManagement: false,
  qaLevel: "none",
};

const INITIAL_STATE: EstimatorState = {
  currentStep: 0,
  direction: 1,
  answers: INITIAL_ANSWERS,
  integrationStatus: "idle",
  integrationMessage: null,
  lastClassifiedText: "",
};

type Action =
  | {
      type: "set-answer";
      key: keyof EstimatorAnswers;
      value: EstimatorAnswers[keyof EstimatorAnswers];
    }
  | {
      type: "set-feature-count";
      key: "simpleFeatureCount" | "mediumFeatureCount" | "complexFeatureCount";
      value: number;
    }
  | {
      type: "set-integrations-text";
      value: string;
    }
  | {
      type: "set-integration-complexity";
      integrationName: string;
      complexity: IntegrationComplexity;
    }
  | {
      type: "start-integration-classification";
    }
  | {
      type: "complete-integration-classification";
      message: string | null;
      classifiedText: string;
      classifications: EstimatorAnswers["integrationClassifications"];
    }
  | {
      type: "fail-integration-classification";
      message: string;
      classifications: EstimatorAnswers["integrationClassifications"];
      classifiedText: string;
    }
  | {
      type: "next-step";
    }
  | {
      type: "previous-step";
    }
  | {
      type: "go-to-step";
      step: number;
      direction: 1 | -1;
    };

function reducer(state: EstimatorState, action: Action): EstimatorState {
  switch (action.type) {
    case "set-answer":
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.key]: action.value,
        },
      };
    case "set-feature-count":
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.key]: sanitizeCount(action.value),
        },
      };
    case "set-integrations-text":
      return {
        ...state,
        answers: {
          ...state.answers,
          integrationsText: action.value,
          integrationClassifications: [],
        },
        integrationStatus: "idle",
        integrationMessage: null,
        lastClassifiedText: "",
      };
    case "set-integration-complexity":
      return {
        ...state,
        answers: {
          ...state.answers,
          integrationClassifications: state.answers.integrationClassifications.map(
            (classification) =>
              classification.name === action.integrationName
                ? {
                    ...classification,
                    complexity: action.complexity,
                    hours: INTEGRATION_HOURS[action.complexity],
                    source: "manual",
                  }
                : classification
          ),
        },
      };
    case "start-integration-classification":
      return {
        ...state,
        integrationStatus: "loading",
        integrationMessage: null,
      };
    case "complete-integration-classification":
      return {
        ...state,
        answers: {
          ...state.answers,
          integrationClassifications: action.classifications,
        },
        integrationStatus: "ready",
        integrationMessage: action.message,
        lastClassifiedText: action.classifiedText,
      };
    case "fail-integration-classification":
      return {
        ...state,
        answers: {
          ...state.answers,
          integrationClassifications: action.classifications,
        },
        integrationStatus: "error",
        integrationMessage: action.message,
        lastClassifiedText: action.classifiedText,
      };
    case "next-step":
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, RESULT_STEP_INDEX),
        direction: 1,
      };
    case "previous-step":
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 0),
        direction: -1,
      };
    case "go-to-step":
      return {
        ...state,
        currentStep: action.step,
        direction: action.direction,
      };
    default:
      return state;
  }
}

function EstimatorWizard() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const deferredAnswers = useDeferredValue(state.answers);
  const reducedMotion = useReducedMotion();

  const estimate = isEstimateReady(deferredAnswers)
    ? calculateEstimate(normalizeEstimateInput(deferredAnswers))
    : null;

  const integrationNames = parseIntegrationInput(state.answers.integrationsText);
  const freshClassification =
    integrationNames.length > 0 &&
    state.integrationStatus !== "loading" &&
    normalizeIntegrationText(state.answers.integrationsText) ===
      state.lastClassifiedText &&
    state.answers.integrationClassifications.length === integrationNames.length;

  const isResultsStep = state.currentStep === RESULT_STEP_INDEX;
  const showIntro = state.currentStep === 0 || isResultsStep;
  const currentTitle = isResultsStep
    ? "Estimate ready"
    : STEP_TITLES[state.currentStep] ?? "Estimator";

  const primaryLabel = getPrimaryLabel(state, freshClassification);
  const canGoBack = state.currentStep > 0 && !isResultsStep;
  const canUsePrimary = getPrimaryActionEnabled(state);

  async function handlePrimaryAction() {
    if (state.currentStep === 4 && integrationNames.length && !freshClassification) {
      startTransition(() => dispatch({ type: "start-integration-classification" }));

      try {
        const response = await fetch("/api/classify-integrations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            integrations: state.answers.integrationsText,
          }),
        });

        const payload = (await response.json()) as ClassificationResponse;
        const classifications =
          payload.classifications?.length
            ? payload.classifications
            : createFallbackClassifications(
                integrationNames,
                "We couldn’t verify these automatically, so we used the default medium estimate."
              );

        startTransition(() =>
          dispatch({
            type: "complete-integration-classification",
            message: payload.message ?? null,
            classifiedText: normalizeIntegrationText(state.answers.integrationsText),
            classifications,
          })
        );
      } catch {
        startTransition(() =>
          dispatch({
            type: "fail-integration-classification",
            message:
              "We hit an issue while classifying these, so we defaulted them to medium complexity. You can still adjust them below.",
            classifiedText: normalizeIntegrationText(state.answers.integrationsText),
            classifications: createFallbackClassifications(
              integrationNames,
              "We couldn’t verify this automatically, so we used the default medium estimate."
            ),
          })
        );
      }

      return;
    }

    if (state.currentStep === TOTAL_STEPS - 1) {
      startTransition(() =>
        dispatch({
          type: "go-to-step",
          step: RESULT_STEP_INDEX,
          direction: 1,
        })
      );
      return;
    }

    startTransition(() => dispatch({ type: "next-step" }));
  }

  function handleRecalculate() {
    startTransition(() =>
      dispatch({
        type: "go-to-step",
        step: 0,
        direction: -1,
      })
    );
  }

  const motionDistance = reducedMotion ? 0 : 36;

  return (
    <div className="surface-panel grid h-full min-h-0 w-full overflow-hidden rounded-[2rem] border border-border/80 bg-[var(--gs-surface-strong)] lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)]">
      {showIntro ? (
        <div className="hidden min-h-0 border-r border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(255,252,248,0.28))] lg:flex">
          <EstimatorIntroPanel />
        </div>
      ) : null}

      <div
        className={cn(
          "flex min-h-0 flex-col gap-4 p-4 sm:gap-5 sm:p-6 lg:p-8",
          !showIntro && "lg:col-span-full"
        )}
      >
        {showIntro ? (
          <div className="lg:hidden">
            <EstimatorIntroPanel compact />
          </div>
        ) : null}

        <ProgressBar currentStep={state.currentStep} currentTitle={currentTitle} />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2rem] border border-border/80 bg-[var(--gs-surface)]">
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
            <AnimatePresence initial={false} mode="wait" custom={state.direction}>
              <motion.div
                key={isResultsStep ? "results" : state.currentStep}
                custom={state.direction}
                className="min-h-full"
                initial={{
                  opacity: 0,
                  x: state.direction > 0 ? motionDistance : -motionDistance,
                  y: reducedMotion ? 0 : 10,
                }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{
                  opacity: 0,
                  x: state.direction > 0 ? -motionDistance : motionDistance,
                  y: reducedMotion ? 0 : -8,
                }}
                transition={{
                  duration: reducedMotion ? 0 : 0.28,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {isResultsStep && estimate ? (
                  <ResultsScreen estimate={estimate} onRecalculate={handleRecalculate} />
                ) : (
                  renderStep(state, dispatch)
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {!isResultsStep ? (
            <div className="flex flex-col-reverse gap-3 border-t border-border/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-5">
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  startTransition(() => dispatch({ type: "previous-step" }))
                }
                disabled={!canGoBack}
                className="justify-center sm:justify-start"
              >
                Back
              </Button>
              <Button
                type="button"
                size="lg"
                onClick={handlePrimaryAction}
                disabled={!canUsePrimary}
                className="sm:min-w-44"
              >
                {primaryLabel}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface EstimatorIntroPanelProps {
  compact?: boolean;
}

function EstimatorIntroPanel({ compact = false }: EstimatorIntroPanelProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-col justify-between gap-8 overflow-y-auto",
        compact ? "rounded-[1.8rem] border border-border/70 bg-white/58 p-5" : "p-8 xl:p-10"
      )}
    >
      <div className="space-y-5">
        <p className="inline-flex w-fit items-center rounded-full border border-border/70 bg-white/70 px-3 py-1 text-[0.72rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Goodspeed Bubble to Code
        </p>
        <div className="space-y-4">
          <h1
            className={cn(
              "text-balance font-semibold tracking-[-0.04em] text-foreground",
              compact
                ? "max-w-[14ch] text-3xl leading-[0.98] sm:text-4xl"
                : "max-w-[12ch] text-5xl leading-[0.92] xl:text-6xl"
            )}
          >
            Turn Bubble complexity into a sharper rebuild range.
          </h1>
          <p
            className={cn(
              "max-w-[56ch] text-muted-foreground",
              compact ? "text-sm leading-6 sm:text-base sm:leading-7" : "text-base leading-7 sm:text-[1.05rem]"
            )}
          >
            This estimator is built for founders, operators, and product teams
            exploring a Bubble-to-code rebuild. Share the shape of your app,
            and we’ll return a realistic cost range, timeline range, and tier
            recommendation before you book a call.
          </p>
        </div>
      </div>

      <div className={cn("grid gap-4", compact ? "sm:grid-cols-3" : "xl:grid-cols-3")}>
        <EstimatorIntroStat
          value="10 steps"
          description="Structured around Goodspeed’s Bubble-to-code worksheet."
        />
        <EstimatorIntroStat
          value="Range-based"
          description="Built to start a serious conversation, not fake invoice precision."
        />
        <EstimatorIntroStat
          value="AI-assisted"
          description="Only integrations are classified with AI. Everything else is deterministic."
        />
      </div>
    </div>
  );
}

interface EstimatorIntroStatProps {
  value: string;
  description: string;
}

function EstimatorIntroStat({ value, description }: EstimatorIntroStatProps) {
  return (
    <div className="rounded-[1.5rem] border border-border/70 bg-white/55 p-4">
      <p className="text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

function renderStep(
  state: EstimatorState,
  dispatch: Dispatch<Action>
) {
  switch (state.currentStep) {
    case 0:
      return (
        <StepAppSize
          value={state.answers.appSize}
          onChange={(value) =>
            dispatch({ type: "set-answer", key: "appSize", value })
          }
        />
      );
    case 1:
      return (
        <StepUserRoles
          value={state.answers.userRoles}
          onChange={(value) =>
            dispatch({ type: "set-answer", key: "userRoles", value })
          }
        />
      );
    case 2:
      return (
        <StepRebuildType
          value={state.answers.rebuildType}
          onChange={(value) =>
            dispatch({ type: "set-answer", key: "rebuildType", value })
          }
        />
      );
    case 3:
      return (
        <StepFeatures
          simpleCount={state.answers.simpleFeatureCount}
          mediumCount={state.answers.mediumFeatureCount}
          complexCount={state.answers.complexFeatureCount}
          onSimpleChange={(value) =>
            dispatch({ type: "set-feature-count", key: "simpleFeatureCount", value })
          }
          onMediumChange={(value) =>
            dispatch({ type: "set-feature-count", key: "mediumFeatureCount", value })
          }
          onComplexChange={(value) =>
            dispatch({ type: "set-feature-count", key: "complexFeatureCount", value })
          }
        />
      );
    case 4:
      return (
        <StepIntegrations
          value={state.answers.integrationsText}
          status={state.integrationStatus}
          message={state.integrationMessage}
          classifications={state.answers.integrationClassifications}
          onChange={(value) => dispatch({ type: "set-integrations-text", value })}
          onComplexityChange={(integrationName, complexity) =>
            dispatch({
              type: "set-integration-complexity",
              integrationName,
              complexity,
            })
          }
        />
      );
    case 5:
      return (
        <StepUIQuality
          uiQuality={state.answers.uiQuality}
          deviceSupport={state.answers.deviceSupport}
          onUiQualityChange={(value) =>
            dispatch({ type: "set-answer", key: "uiQuality", value })
          }
          onDeviceSupportChange={(value) =>
            dispatch({ type: "set-answer", key: "deviceSupport", value })
          }
        />
      );
    case 6:
      return (
        <StepDesigns
          value={state.answers.existingDesigns}
          onChange={(value) =>
            dispatch({ type: "set-answer", key: "existingDesigns", value })
          }
        />
      );
    case 7:
      return (
        <StepAdmin
          value={state.answers.adminDashboard}
          onChange={(value) =>
            dispatch({ type: "set-answer", key: "adminDashboard", value })
          }
        />
      );
    case 8:
      return (
        <StepMigration
          dataMigration={state.answers.dataMigration}
          techDebt={state.answers.techDebt}
          documentation={state.answers.documentation}
          onDataMigrationChange={(value) =>
            dispatch({ type: "set-answer", key: "dataMigration", value })
          }
          onTechDebtChange={(value) =>
            dispatch({ type: "set-answer", key: "techDebt", value })
          }
          onDocumentationChange={(value) =>
            dispatch({ type: "set-answer", key: "documentation", value })
          }
        />
      );
    case 9:
      return (
        <StepExtras
          includeDesignPhase={state.answers.includeDesignPhase}
          includeProjectManagement={state.answers.includeProjectManagement}
          qaLevel={state.answers.qaLevel}
          onDesignPhaseChange={(checked) =>
            dispatch({
              type: "set-answer",
              key: "includeDesignPhase",
              value: checked,
            })
          }
          onProjectManagementChange={(checked) =>
            dispatch({
              type: "set-answer",
              key: "includeProjectManagement",
              value: checked,
            })
          }
          onQaLevelChange={(value) =>
            dispatch({ type: "set-answer", key: "qaLevel", value })
          }
        />
      );
    default:
      return null;
  }
}

function getPrimaryLabel(state: EstimatorState, hasFreshClassification: boolean) {
  if (state.currentStep === 4) {
    if (state.integrationStatus === "loading") {
      return "Analyzing...";
    }

    const integrationCount = parseIntegrationInput(state.answers.integrationsText).length;

    if (integrationCount > 0 && !hasFreshClassification) {
      return "Analyze Integrations";
    }
  }

  return state.currentStep === TOTAL_STEPS - 1 ? "Get Estimate" : "Next";
}

function getPrimaryActionEnabled(state: EstimatorState) {
  switch (state.currentStep) {
    case 0:
      return Boolean(state.answers.appSize);
    case 1:
      return Boolean(state.answers.userRoles);
    case 2:
      return Boolean(state.answers.rebuildType);
    case 3:
      return true;
    case 4:
      return state.integrationStatus !== "loading";
    case 5:
      return Boolean(state.answers.uiQuality && state.answers.deviceSupport);
    case 6:
      return Boolean(state.answers.existingDesigns);
    case 7:
      return Boolean(state.answers.adminDashboard);
    case 8:
      return Boolean(
        state.answers.dataMigration &&
          state.answers.techDebt &&
          state.answers.documentation
      );
    case 9:
      return true;
    default:
      return false;
  }
}

function sanitizeCount(value: number) {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

export { EstimatorWizard };
