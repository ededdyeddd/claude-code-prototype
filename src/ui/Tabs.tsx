import type { ReactNode } from "react";

/** Pill tabs (e.g. "Yours / Templates" on Routines). The selected tab gets a soft alpha fill; `badge` goes after the label. */
export function Tabs<T extends string>({
  value,
  items,
  onChange,
  label,
}: {
  value: T;
  items: { value: T; label: string; badge?: ReactNode }[];
  onChange: (value: T) => void;
  /** Accessible name of the tab list. */
  label?: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex items-center gap-0.5">
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.value)}
            className={[
              "inline-flex h-[var(--cds-h-control--xs)] items-center gap-1.5 rounded-sm px-sm text-body outline-none transition-colors duration-fast",
              "focus-visible:shadow-focus cursor-[var(--cds-cursor-interactive)]",
              selected ? "bg-alpha-2 text-primary" : "text-muted hover:text-primary hover:bg-alpha-1",
            ].join(" ")}
          >
            {item.label}
            {item.badge}
          </button>
        );
      })}
    </div>
  );
}
