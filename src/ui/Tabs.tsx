/** Pill tabs (e.g. "Yours / Templates" on Routines). The selected tab gets a soft alpha fill. */
export function Tabs<T extends string>({
  value,
  items,
  onChange,
  label,
}: {
  value: T;
  items: { value: T; label: string }[];
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
              "h-[var(--cds-h-control--xs)] rounded-sm px-sm text-body outline-none transition-colors duration-fast",
              "focus-visible:shadow-focus cursor-[var(--cds-cursor-interactive)]",
              selected ? "bg-alpha-2 text-primary" : "text-muted hover:text-primary hover:bg-alpha-1",
            ].join(" ")}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
