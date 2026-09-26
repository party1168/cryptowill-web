import type { ReactNode } from "react";
import { Card, CardTitle } from "./ui";

/** Numbered step in a multi-step flow; done steps get a brass check. */
export function StepCard({
  n,
  title,
  description,
  done = false,
  children,
}: {
  n: number;
  title: string;
  description?: ReactNode;
  done?: boolean;
  children: ReactNode;
}) {
  return (
    <Card className="flex gap-5">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-display text-sm ${
          done ? "border-brass bg-brass text-paper" : "border-line-strong text-ink-soft"
        }`}
        aria-hidden
      >
        {done ? "✓" : n}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle>{title}</CardTitle>
          {description && <p className="text-sm text-ink-soft">{description}</p>}
        </div>
        {children}
      </div>
    </Card>
  );
}
