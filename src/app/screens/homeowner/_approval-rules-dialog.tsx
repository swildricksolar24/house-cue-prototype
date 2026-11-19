import { useState } from 'react';
import { Banner } from '../../../components/Banner/Banner';
import { NumberStepper } from '../../../components/NumberStepper/NumberStepper';
import { SettingRow } from '../../../components/SettingRow/SettingRow';
import { FormDialog } from '../../shells/EditDialog';
import './_approval-rules-dialog.css';

export type ApprovalRules = { routine: number; emergency: number; emergencyRules: boolean };

/** Portfolio defaults (invented): the queue's reports are over these or over a property's own, lower ceiling */
export const DEFAULT_APPROVAL_RULES: ApprovalRules = { routine: 100, emergency: 600, emergencyRules: true };

/**
 * Review change: "Approval rules" on C86 Approval queue opens this dialog over the queue instead of going to C81
 * Property rules. It holds the approval part of the rules as portfolio defaults: the routine auto-approve ceiling, the
 * emergency ceiling and emergency rules, plus the cap order note from C81. Save keeps the changes (for this visit) and
 * closes; Cancel, × or Esc closes without changes. "Rules for one property" opens C81 for a single property's overrides.
 */
export function ApprovalRulesDialog({
  rules,
  onSave,
  onCancel,
  onPropertyRules,
}: {
  rules: ApprovalRules;
  onSave: (rules: ApprovalRules) => void;
  onCancel: () => void;
  onPropertyRules: () => void;
}) {
  const [routine, setRoutine] = useState(rules.routine);
  const [emergency, setEmergency] = useState(rules.emergency);
  const [emergencyRules, setEmergencyRules] = useState(rules.emergencyRules);

  return (
    <FormDialog
      title="Approval rules"
      description="Portfolio defaults for every property. A property’s own rules can set a lower ceiling; the lowest wins."
      width="wide"
      fields={[]}
      values={{}}
      submitLabel="Save rules"
      countsAsEdit={false}
      extraAction={{ label: 'Rules for one property', variant: 'secondary', onClick: onPropertyRules }}
      onSave={() => onSave({ routine, emergency, emergencyRules })}
      onCancel={onCancel}
    >
      <div className="hc-approval-rules">
        {/* NumberStepper shows a bare number; .hc-approval-rules__money adds the $ */}
        <NumberStepper
          className="hc-approval-rules__money"
          title="Routine auto-approve ceiling"
          helper="Reports estimated at or under this are approved for you; over it, they wait in this queue. $0: you approve every report."
          value={routine}
          onValueChange={setRoutine}
          min={0}
          max={2000}
          step={25}
        />
        <NumberStepper
          className="hc-approval-rules__money"
          title="Emergency ceiling"
          helper="Separate from routine; the agent books within this after 15 min with no answer from you."
          value={emergency}
          onValueChange={setEmergency}
          min={0}
          max={5000}
          step={50}
        />
        <SettingRow
          title="Emergency rules"
          description="Gas, flooding, no heat or AC, sewage: safety steps, dispatch, you are notified throughout"
          checked={emergencyRules}
          onCheckedChange={setEmergencyRules}
        />
        <Banner tone="info" title="Cap order">
          Account cap, then property ceiling, then category cap, then per-request cap, then manager limit. The lowest wins.
        </Banner>
      </div>
    </FormDialog>
  );
}
