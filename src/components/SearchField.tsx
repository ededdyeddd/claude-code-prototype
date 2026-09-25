export function SearchField() {
  return (
    <button
      type="button"
      data-row=""
      className="df-search-field mx-[calc(var(--df-rail-shift,0px)/2)] mt-1 flex h-[var(--df-row-h)] w-[calc(100%-var(--df-rail-shift,0px))] shrink-0 items-center gap-[var(--df-row-gap)] rounded-[var(--df-radius-pill)] border-none bg-fill-field px-[var(--df-row-px)] text-left text-[length:var(--df-row-font)] text-muted forced-colors:border forced-colors:border-solid hide-focus-ring focus-visible:shadow-[inset_0_0_0_1px_var(--cds-fill-accent),0_0_6px_0_color-mix(in_srgb,var(--cds-fill-accent)_20%,transparent)]"
    >
      <span className="ml-[calc(var(--df-rail-shift,0px)/2)] flex size-[var(--df-leading-slot)] shrink-0 items-center justify-center">
        <span
          data-cds="Icon"
          style={{
            fontSize: "calc(1rem*var(--cds-rem-scale,1))",
            fontWeight: "533.3",
          }}
          data-editable-text="true"
        >
          
        </span>
      </span>
      <span className="min-w-0 flex-1 truncate" data-editable-text="true">
        Search
      </span>
      <span className="df-search-field-keys flex shrink-0 items-center pr-[calc((var(--df-row-h)-1em-6px)/2-var(--df-row-px))] text-caption">
        <span
          data-cds="Shortcut"
          data-variant="keycap"
          className="inline-flex shrink-0 items-center gap-[2px] text-caption"
        >
          <kbd className="inline-flex shrink-0 items-center justify-center h-[calc(1em+6px)] rounded-[var(--cds-keycap-radius,4px)] [color:var(--cds-shortcut-cap-ink)] bg-[color:var(--cds-shortcut-cap-fill)] border border-[color:var(--cds-shortcut-cap-line)] font-inherit [font-variation-settings:inherit] [line-height:1] w-[calc(1em+6px)] px-0">
            <span data-editable-text="true">⌘</span>
            <span className="sr-only select-none" data-editable-text="true">
              Command
            </span>
          </kbd>
          <kbd
            className="inline-flex shrink-0 items-center justify-center h-[calc(1em+6px)] rounded-[var(--cds-keycap-radius,4px)] [color:var(--cds-shortcut-cap-ink)] bg-[color:var(--cds-shortcut-cap-fill)] border border-[color:var(--cds-shortcut-cap-line)] font-inherit [font-variation-settings:inherit] [line-height:1] w-[calc(1em+6px)] px-0"
            data-editable-text="true"
          >
            K
          </kbd>
        </span>
      </span>
    </button>
  );
}
