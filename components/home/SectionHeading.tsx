import type { ReactNode } from "react";
import { Eyebrow } from "../ui";

export function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex max-w-2xl flex-col gap-2">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-display text-3xl font-medium tracking-tight">{title}</h2>
      {children && <p className="leading-relaxed text-ink-soft">{children}</p>}
    </div>
  );
}
