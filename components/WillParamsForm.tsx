"use client";

import { useState } from "react";
import { DURATION_UNITS, PERIOD_PRESETS, splitDuration, type Periods } from "@/lib/periods";
import { Field, inputClass } from "./ui";

const FIELDS: { key: keyof Periods; label: string; help: string }[] = [
  { key: "checkInInterval", label: "Check-in interval", help: "How often you must prove you are alive." },
  { key: "gracePeriod", label: "Grace period", help: "Extra time after a missed check-in before your heir can claim." },
  { key: "challengePeriod", label: "Challenge period", help: "Time you have to cancel a claim by checking in." },
];

/** Controlled form for the will amount and the three periods. Values are kept in seconds. */
export function WillParamsForm({
  amount,
  onAmountChange,
  periods,
  onPeriodsChange,
}: {
  amount: string;
  onAmountChange: (amount: string) => void;
  periods: Periods;
  onPeriodsChange: (periods: Periods) => void;
}) {
  // Bumped on every preset click so each DurationInput remounts and re-picks its display unit.
  const [presetVersion, setPresetVersion] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <Field label="Amount (ETH)" help="Locked in the contract until you cancel or your heir inherits.">
        <input
          className={`${inputClass} font-mono`}
          inputMode="decimal"
          placeholder="0.001"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value.trim())}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">Timing preset</span>
        {Object.entries(PERIOD_PRESETS).map(([key, preset]) => (
          <button
            key={key}
            type="button"
            className="rounded-full border border-line-strong bg-card px-3 py-1 text-xs font-medium text-ink-soft transition-colors hover:border-brass hover:text-ink"
            onClick={() => {
              onPeriodsChange({ ...preset.periods });
              setPresetVersion((v) => v + 1);
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {FIELDS.map((field) => (
        <DurationInput
          key={`${field.key}-${presetVersion}`}
          label={field.label}
          help={field.help}
          seconds={periods[field.key]}
          onChange={(seconds) => onPeriodsChange({ ...periods, [field.key]: seconds })}
        />
      ))}
    </div>
  );
}

function DurationInput({
  label,
  help,
  seconds,
  onChange,
}: {
  label: string;
  help: string;
  seconds: number;
  onChange: (seconds: number) => void;
}) {
  // Keep the chosen unit locally so typing "0" or clearing the field doesn't reset it.
  const [unitSeconds, setUnitSeconds] = useState(() => splitDuration(seconds).unitSeconds);
  const value = seconds / unitSeconds;

  return (
    <Field label={label} help={help}>
      <div className="grid grid-cols-[8rem_9rem] gap-2">
        <input
          className={`${inputClass} font-mono`}
          type="number"
          min={1}
          step={1}
          value={value}
          onChange={(e) => onChange(Math.max(0, Math.floor(Number(e.target.value))) * unitSeconds)}
        />
        <select
          className={inputClass}
          value={unitSeconds}
          onChange={(e) => {
            const next = Number(e.target.value);
            setUnitSeconds(next);
            onChange(Math.round(seconds / unitSeconds) * next);
          }}
        >
          {DURATION_UNITS.map((u) => (
            <option key={u.seconds} value={u.seconds}>
              {u.label}
            </option>
          ))}
        </select>
      </div>
    </Field>
  );
}
