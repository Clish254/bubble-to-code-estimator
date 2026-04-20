import { Card } from "@/components/ui/card";
import { RadioGroup } from "@/components/ui/radio-group";
import { RadioOption } from "@/components/ui/radio-option";
import { StepShell } from "@/components/estimator/StepShell";
import type {
  DataMigrationOption,
  DocumentationOption,
  TechDebtOption,
} from "@/lib/types";

interface StepMigrationProps {
  dataMigration: DataMigrationOption | null;
  techDebt: TechDebtOption | null;
  documentation: DocumentationOption | null;
  onDataMigrationChange: (value: DataMigrationOption) => void;
  onTechDebtChange: (value: TechDebtOption) => void;
  onDocumentationChange: (value: DocumentationOption) => void;
}

function StepMigration({
  dataMigration,
  techDebt,
  documentation,
  onDataMigrationChange,
  onTechDebtChange,
  onDocumentationChange,
}: StepMigrationProps) {
  return (
    <StepShell
      eyebrow="Step 9"
      title="Tell us about your data and your app today"
      description="Three quick questions about moving data over, fixing issues, and what's already written down."
    >
      <Card
        eyebrow="Data"
        title="Do you need to move data from Bubble to the new app?"
      >
        <RadioGroup
          value={dataMigration ?? ""}
          onValueChange={(value) =>
            onDataMigrationChange(value as DataMigrationOption)
          }
          className="gap-4"
        >
          <RadioOption
            value="none"
            title="No, we're starting fresh"
            description="No existing data needs to carry over."
            checked={dataMigration === "none"}
          />
          <RadioOption
            value="simple"
            title="Yes, a straightforward move"
            description="The data is clean and can move over with light mapping."
            checked={dataMigration === "simple"}
          />
          <RadioOption
            value="complex"
            title="Yes, and it's messy"
            description="The data needs cleaning, checking, or restructuring on the way."
            checked={dataMigration === "complex"}
          />
        </RadioGroup>
      </Card>

      <Card
        eyebrow="Cleanup"
        title="Does the app's logic need a rework?"
      >
        <RadioGroup
          value={techDebt ?? ""}
          onValueChange={(value) => onTechDebtChange(value as TechDebtOption)}
          className="gap-4"
        >
          <RadioOption
            value="none"
            title="No, keep it as-is"
            description="The current logic works well. Rebuild it exactly as it functions now."
            checked={techDebt === "none"}
          />
          <RadioOption
            value="some"
            title="Some logic needs improving"
            description="Certain workflows or rules need a tidy-up along the way."
            checked={techDebt === "some"}
          />
          <RadioOption
            value="major"
            title="Yes, a full rework"
            description="Major parts of how the app works behind the scenes should be rethought."
            checked={techDebt === "major"}
          />
        </RadioGroup>
      </Card>

      <Card
        eyebrow="Docs"
        title="How well is your app documented?"
      >
        <RadioGroup
          value={documentation ?? ""}
          onValueChange={(value) =>
            onDocumentationChange(value as DocumentationOption)
          }
          className="gap-4"
        >
          <RadioOption
            value="good"
            title="Well documented"
            description="We can understand how it works without guessing."
            checked={documentation === "good"}
          />
          <RadioOption
            value="partial"
            title="Somewhat documented"
            description="Some notes exist, but we'll still need to figure things out."
            checked={documentation === "partial"}
          />
          <RadioOption
            value="none"
            title="No documentation"
            description="We'll learn the app by digging through it ourselves."
            checked={documentation === "none"}
          />
        </RadioGroup>
      </Card>
    </StepShell>
  );
}

export { StepMigration };
