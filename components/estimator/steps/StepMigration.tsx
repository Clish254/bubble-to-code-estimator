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
      title="What migration, cleanup, or reverse-engineering work is part of the rebuild?"
      description="This is where we account for the friction around moving real data, untangling Bubble logic, and reconstructing intent from incomplete documentation."
      aside="Migration and tech debt add direct hours. Documentation acts as a multiplier because it changes how much reverse engineering Goodspeed needs to do."
    >
      <Card
        eyebrow="Data migration"
        title="How complex is the Bubble data migration?"
        description="Think about whether you can move data almost as-is, or whether it needs mapping, cleaning, validation, or reconciliation."
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
            title="No migration"
            description="A fresh start or low-risk manual carryover with no dedicated migration work."
            badge="+0 hrs"
            checked={dataMigration === "none"}
          />
          <RadioOption
            value="simple"
            title="Simple migration"
            description="Export and import with some field mapping, but without heavy transformation logic."
            badge="+24 hrs"
            checked={dataMigration === "simple"}
          />
          <RadioOption
            value="complex"
            title="Complex migration"
            description="Transformation, validation, cleaning, reconciliation, or migration safety requirements."
            badge="+80 hrs"
            checked={dataMigration === "complex"}
          />
        </RadioGroup>
      </Card>

      <Card
        eyebrow="Tech debt"
        title="How much cleanup or architecture work comes with the rebuild?"
        description="This captures the extra work needed beyond a straightforward reimplementation."
      >
        <RadioGroup
          value={techDebt ?? ""}
          onValueChange={(value) => onTechDebtChange(value as TechDebtOption)}
          className="gap-4"
        >
          <RadioOption
            value="none"
            title="No tech debt fix"
            description="Rebuild the current logic without a broader architecture reset."
            badge="+0 hrs"
            checked={techDebt === "none"}
          />
          <RadioOption
            value="some"
            title="Some improvements needed"
            description="Refactoring core patterns, stabilizing workflows, or removing obvious implementation drag."
            badge="+40 hrs"
            checked={techDebt === "some"}
          />
          <RadioOption
            value="major"
            title="Major architecture overhaul"
            description="A deeper rethink of structure, scalability, security, or operating patterns."
            badge="+100 hrs"
            checked={techDebt === "major"}
          />
        </RadioGroup>
      </Card>

      <Card
        eyebrow="Documentation"
        title="How much usable documentation exists?"
        description="Even partial docs change how much reverse engineering the team needs to do."
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
            title="Good documentation"
            description="Workflows, logic, and product rules are already documented clearly."
            badge="×0.90"
            checked={documentation === "good"}
          />
          <RadioOption
            value="partial"
            title="Partial or outdated docs"
            description="Some guidance exists, but it won’t fully remove discovery work."
            badge="×1.00"
            checked={documentation === "partial"}
          />
          <RadioOption
            value="none"
            title="No documentation"
            description="The rebuild needs more reverse engineering from behavior, data, and Bubble logic."
            badge="×1.15"
            checked={documentation === "none"}
          />
        </RadioGroup>
      </Card>
    </StepShell>
  );
}

export { StepMigration };
