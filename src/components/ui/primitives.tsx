import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius-md)] transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap";
const variants: Record<Variant, string> = {
  primary: "bg-electric text-white hover:bg-electric-strong active:bg-electric-lo",
  secondary: "border border-line-strong text-fg hover:border-muted hover:bg-panel",
  ghost: "text-muted hover:text-fg hover:bg-panel",
  danger: "border border-bad/50 text-bad hover:bg-bad/10",
};
const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-11 px-4 text-[0.95rem]",
  lg: "min-h-12 px-6 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cx(base, variants[variant], sizes[size], extra);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

export function Tag({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "amber" | "electric" | "ok"; className?: string }) {
  const tones = {
    neutral: "border-line-strong text-muted",
    amber: "border-amber/40 bg-amber/10 text-amber",
    electric: "border-electric/40 bg-electric/10 text-electric-hi",
    ok: "border-ok/40 bg-ok/10 text-ok",
  };
  return <span className={cx("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", tones[tone], className)}>{children}</span>;
}

type Tone = "info" | "success" | "warning" | "error";
const toneStyle: Record<Tone, string> = {
  info: "border-electric/40 bg-electric/[0.08] text-[#d7e4ff]",
  success: "border-ok/40 bg-ok/[0.08] text-[#c8f5e4]",
  warning: "border-warn/40 bg-warn/[0.08] text-[#fbe7c0]",
  error: "border-bad/40 bg-bad/[0.08] text-[#ffd6d6]",
};
const toneIcon = { info: Info, success: CheckCircle2, warning: AlertTriangle, error: AlertTriangle } as const;

export function Alert({ tone = "info", title, children, className }: { tone?: Tone; title?: string; children?: ReactNode; className?: string }) {
  const Icon = toneIcon[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cx("flex gap-3 rounded-[var(--radius-md)] border p-4 text-sm", toneStyle[tone], className)}>
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0" />
      <div className="space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="leading-relaxed">{children}</div>}
      </div>
    </div>
  );
}

export function ProgressBar({ value, label, className }: { value: number; label: string; className?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <div
      className={cx("h-2 w-full overflow-hidden rounded-full bg-line", className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <div className="h-full rounded-full bg-amber transition-[width] duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-line-strong p-8 text-center">
      <p className="text-lg font-semibold">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-md text-sm text-muted">{children}</div>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {description && <div className="mt-2 text-muted">{description}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("mx-auto w-full max-w-6xl px-4 sm:px-6", className)} {...props} />;
}

export function Panel({ className, ...props }: ComponentProps<"section">) {
  return <section className={cx("rounded-[var(--radius-lg)] border border-line bg-navy/70 p-5 sm:p-6", className)} {...props} />;
}

export function Spinner({ label = "Carregando" }: { label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-sm text-muted">
      <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-line-strong border-t-electric" />
      {label}
    </span>
  );
}
