export function MoreNavigationButton() {
  return (
    <button
      type="button"
      data-row=""
      className="w-full shrink-0 border-none text-left text-[length:var(--df-row-font)] text-secondary flex items-center gap-[var(--df-row-gap)] h-[var(--df-row-h)] px-[var(--df-row-px)] [&_.df-leading-slot]:text-secondary data-[selected=focused]:[&_.df-leading-slot]:text-primary rounded-[var(--df-radius-pill)] hover:bg-[var(--df-hover)] focus-visible:bg-[var(--df-hover)] has-[:focus-visible]:bg-[var(--df-hover)] data-[selected=focused]:bg-[var(--df-selected)] data-[selected=focused]:text-primary data-[selected=open]:bg-[var(--df-selected)] data-[menu-open=true]:bg-[var(--df-hover)] data-[context-menu-open=true]:bg-[var(--df-hover)] hide-focus-ring focus-visible:shadow-[inset_0_0_0_1px_var(--cds-fill-accent),0_0_6px_0_color-mix(in_srgb,var(--cds-fill-accent)_20%,transparent)] group"
      tabIndex={0}
      id="base-ui-_r_q_"
    >
      <span className="df-leading-slot relative">
        <span
          data-cds="Icon"
          className="opacity-50"
          style={{
            // A chevron, not a nav icon: one size down from the 20px icons above, so it doesn't outweigh them.
            fontSize: "calc(1rem*var(--cds-rem-scale,1))",
            fontWeight: "533.3",
            fontVariationSettings: '"opsz" 16, "wght" 533.3',
          }}
          data-editable-text="true"
        >
          
        </span>
      </span>
      <span className="text-muted" data-editable-text="true">
        More
      </span>
    </button>
  );
}
