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
      title="How should the app look and where should it work?"
      description="Two quick picks: the visual bar, and which devices to support."
    >
      <Card
        eyebrow="Look and feel"
        title="How polished should it be?"
      >
        <RadioGroup
          value={uiQuality ?? ""}
          onValueChange={(value) => onUiQualityChange(value as UIQualityOption)}
          className="gap-4"
        >
          <RadioOption
            value="basic"
            title="Clean and simple"
            description="Functional and tidy, without heavy visual design."
            checked={uiQuality === "basic"}
          />
          <RadioOption
            value="polished"
            title="Polished and branded"
            description="A considered, branded UI that's ready for real users."
            checked={uiQuality === "polished"}
          />
          <RadioOption
            value="premium"
            title="Premium and custom"
            description="Richer visuals, custom components, and a sharper craft bar."
            checked={uiQuality === "premium"}
          />
        </RadioGroup>
      </Card>

      <Card
        eyebrow="Devices"
        title="Where does it need to work?"
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
            description="Built for a computer screen."
            checked={deviceSupport === "desktop"}
          />
          <RadioOption
            value="desktopMobile"
            title="Desktop and mobile"
            description="Works well on phones and computers."
            checked={deviceSupport === "desktopMobile"}
          />
          <RadioOption
            value="fullResponsive"
            title="Every device, installable too"
            description="Phones, tablets, computers, plus installable like a mobile app."
            checked={deviceSupport === "fullResponsive"}
          />
        </RadioGroup>
      </Card>
    </StepShell>
  );
}

export { StepUIQuality };
