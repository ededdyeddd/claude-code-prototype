export function SectionLabel({ label, collapsed = false, onClick }: { label: string; collapsed?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={!collapsed}
      className="hide-focus-ring focus-visible:shadow-[inset_0_0_0_1px_var(--cds-fill-accent),0_0_6px_0_color-mix(in_srgb,var(--cds-fill-accent)_20%,transparent)] group/label -my-1 -ml-1 flex min-w-0 flex-1 items-center gap-1 rounded-[var(--df-radius-pill)] py-1 pl-1 text-left hover:text-secondary"
    >
      <span className="min-w-0 truncate">{label}</span>
      <span
        data-cds="Icon"
        className={"shrink-0 transition-transform duration-fast motion-reduce:transition-none group-data-[hover-within]/section:opacity-100 group-focus-visible/label:opacity-100 opacity-0 " + (collapsed ? "rotate-0" : "rotate-90")}
        style={{
          fontSize: "calc(0.75rem*var(--cds-rem-scale,1))",
          fontWeight: "577.8",
        }}
        data-editable-text="true"
      >
        
      </span>
    </button>
  );
}
