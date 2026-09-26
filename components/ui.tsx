import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";

// Shared primitives for the "estate document" look. Keep page code free of one-off styling.

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-ink-soft",
  secondary: "border border-line-strong bg-card text-ink hover:border-brass hover:bg-brass-tint/40",
  ghost: "text-ink-soft underline-offset-4 hover:text-ink hover:underline",
  danger: "bg-danger text-paper hover:opacity-90",
};

export function buttonClass(variant: Variant = "primary", className = "") {
  const shape = variant === "ghost" ? "px-1 py-1" : "px-4 py-2";
  return `inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 ${shape} ${VARIANTS[variant]} ${className}`;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type="button" className={buttonClass(variant, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-line bg-card p-6 shadow-[0_1px_2px_rgba(28,36,51,0.04)] ${className}`}>
      {children}
    </section>
  );
}

/** Small caps label in brass, used above headings. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass-deep">{children}</p>;
}

export function Title({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h1 className={`font-display text-4xl leading-tight font-medium tracking-tight text-ink ${className}`}>{children}</h1>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="font-display text-xl font-medium text-ink">{children}</h2>;
}

export const inputClass =
  "w-full rounded-md border border-line-strong bg-paper/60 px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-brass focus:outline-none focus:ring-2 focus:ring-brass/20";

export function Field({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
      {help && <span className="text-xs text-muted">{help}</span>}
    </label>
  );
}

type Tone = "info" | "success" | "warning" | "error";
const TONES: Record<Tone, string> = {
  info: "border-line bg-paper text-ink-soft",
  success: "border-success/30 bg-success-tint text-success",
  warning: "border-warning/30 bg-warning-tint text-warning",
  error: "border-danger/30 bg-danger-tint text-danger",
};

export function Notice({ tone = "info", children }: { tone?: Tone; children: ReactNode }) {
  return <div className={`rounded-md border px-3 py-2 text-sm ${TONES[tone]}`}>{children}</div>;
}

/** Monospace short address with the full value on hover. */
export function Address({ value, full = false }: { value: string; full?: boolean }) {
  return (
    <span className="font-mono text-sm break-all" title={value}>
      {full ? value : `${value.slice(0, 6)}…${value.slice(-4)}`}
    </span>
  );
}
