import { Card } from "@/components/ui/card";
import { RadioGroup } from "@/components/ui/radio-group";
import { RadioOption } from "@/components/ui/radio-option";
import { StepShell } from "@/components/estimator/StepShell";
import type { DeviceSupportOption, UIQualityOption } from "@/lib/types";

interface StepUIQualityProps {
  uiQuality: UIQualityOption | null;
  deviceSupport: DeviceSupportOption | null;
  onUiQualityChange: (value: UIQualityOption) => void;
  onDeviceSupportChange: (value: DeviceSupportOption) => void;
}

function StepUIQuality({
  uiQuality,
  deviceSupport,
  onUiQualityChange,
  onDeviceSupportChange,
}: StepUIQualityProps) {
  return (
    <StepShell
      eyebrow="Step 6"
      title="What level of UI quality and device support are you aiming for?"
      description="These two answers shape the ambition of the frontend build and the hidden design-system effort we include alongside it."
      aside="UI quality auto-maps a hidden design-system layer in the model: Basic 0 hrs, Polished 24 hrs, Premium 60 hrs."
    >
      <Card
        eyebrow="UI quality"
        title="How polished should the interface feel?"
        description="Choose the quality bar the coded product needs to hit when it launches."
      >
        <RadioGroup
          value={uiQuality ?? ""}
          onValueChange={(value) => onUiQualityChange(value as UIQualityOption)}
          className="gap-4"
        >
          <RadioOption
            value="basic"
            title="Basic"
            description="A cleaner coded rebuild without a lot of custom visual craft."
            badge="×0.80"
            checked={uiQuality === "basic"}
          />
          <RadioOption
            value="polished"
            title="Polished responsive"
            description="A branded, thoughtful product UI that feels ready for active users."
            badge="×1.00"
            checked={uiQuality === "polished"}
          />
          <RadioOption
            value="premium"
            title="Premium custom"
            description="A more ambitious interface with custom components, richer motion, and sharper craft."
            badge="×1.30"
            checked={uiQuality === "premium"}
          />
        </RadioGroup>
      </Card>

      <Card
        eyebrow="Device support"
        title="Where does the product need to work well?"
        description="Pick the device footprint the coded version actually needs to support from day one."
      >
        <RadioGroup
          value={deviceSupport ?? ""}
          onValueChange={(value) =>
            onDeviceSupportChange(value as DeviceSupportOption)
          }
          className="gap-4"
        >
          <RadioOption
            value="desktop"
            title="Desktop only"
            description="A single desktop-oriented interface without deeper mobile constraints."
            badge="×0.85"
            checked={deviceSupport === "desktop"}
          />
          <RadioOption
            value="desktopMobile"
            title="Desktop plus mobile"
            description="A responsive web experience that behaves well across phones and larger screens."
            badge="×1.00"
            checked={deviceSupport === "desktopMobile"}
          />
          <RadioOption
            value="fullResponsive"
            title="Full responsive plus PWA"
            description="A broader build covering desktop, tablet, mobile, and installable app behavior."
            badge="×1.20"
            checked={deviceSupport === "fullResponsive"}
          />
        </RadioGroup>
      </Card>
    </StepShell>
  );
}

export { StepUIQuality };
