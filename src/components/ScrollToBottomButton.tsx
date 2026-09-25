export function ScrollToBottomButton() {
  return (
    <button
      type="button"
      tabIndex={-1}
      className="inline-flex items-center h-[24px] px-xs rounded bg-surface-panel text-secondary shadow-field hover:bg-[linear-gradient(var(--cds-fill-secondary-hover),var(--cds-fill-secondary-hover))] border-0 focus-visible:outline-hidden hide-focus-ring focus-visible:shadow-focus absolute -top-[32px] left-1/2 -translate-x-1/2 z-[1] gap-xs transition-opacity duration-150 opacity-0 pointer-events-none"
    >
      <span
        data-cds="Icon"
        style={{
          fontSize: "calc(0.75rem*var(--cds-rem-scale,1))",
          fontWeight: "577.8",
        }}
        data-editable-text="true"
      >
        
      </span>
    </button>
  );
}
