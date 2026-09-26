"use client";

import { useState } from "react";
import { DURATION_UNITS, PERIOD_PRESETS, splitDuration, type Periods } from "@/lib/periods";

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
      <label className="flex flex-col gap-1">
        <span className="font-medium">Amount (ETH)</span>
        <input
          className="rounded border px-2 py-1 font-mono dark:bg-zinc-900"
          inputMode="decimal"
          placeholder="0.001"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value.trim())}
        />
      </label>

      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500">Presets:</span>
        {Object.entries(PERIOD_PRESETS).map(([key, preset]) => (
          <button
            key={key}
            type="button"
            className="rounded border px-2 py-0.5 text-sm"
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
    <label className="flex flex-col gap-1">
      <span className="font-medium">{label}</span>
      <div className="flex gap-2">
        <input
          className="w-28 rounded border px-2 py-1 font-mono dark:bg-zinc-900"
          type="number"
          min={1}
          step={1}
          value={value}
          onChange={(e) => onChange(Math.max(0, Math.floor(Number(e.target.value))) * unitSeconds)}
        />
        <select
          className="rounded border px-2 py-1 dark:bg-zinc-900"
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
      <span className="text-xs text-zinc-500">{help}</span>
    </label>
  );
}
