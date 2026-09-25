import { useLocation, useNavigate } from "react-router-dom";

export function NewNavigationRow() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <a
      href="/code"
      onClick={(e) => {
        e.preventDefault();
        navigate("/code");
      }}
      draggable="false"
      data-row=""
      className="w-full shrink-0 border-none text-left text-[length:var(--df-row-font)] text-secondary flex items-center gap-[var(--df-row-gap)] h-[var(--df-row-h)] px-[var(--df-row-px)] [&_.df-leading-slot]:text-secondary data-[selected=focused]:[&_.df-leading-slot]:text-primary rounded-[var(--df-radius-pill)] hover:bg-[var(--df-hover)] focus-visible:bg-[var(--df-hover)] has-[:focus-visible]:bg-[var(--df-hover)] data-[selected=focused]:bg-[var(--df-selected)] data-[selected=focused]:text-primary data-[selected=open]:bg-[var(--df-selected)] data-[menu-open=true]:bg-[var(--df-hover)] data-[context-menu-open=true]:bg-[var(--df-hover)] hide-focus-ring focus-visible:shadow-[inset_0_0_0_1px_var(--cds-fill-accent),0_0_6px_0_color-mix(in_srgb,var(--cds-fill-accent)_20%,transparent)] group mt-1"
      {...(pathname === "/code" ? { "data-selected": "focused" } : {})}
    >
      <span className="df-leading-slot">
        <span className="df-new-circle flex shrink-0 items-center justify-center rounded-full">
          <span
            data-cds="Icon"
            className="text-secondary group-hover:text-primary group-data-[selected=focused]:text-primary"
            style={{
              fontSize: "calc(1rem*var(--cds-rem-scale,1))",
              fontWeight: "533.3",
            }}
            data-editable-text="true"
          >
            
          </span>
        </span>
      </span>
      <span className="flex min-w-0 flex-1 items-center">
        <span className="min-w-0 truncate" data-editable-text="true">
          New
        </span>
      </span>
      <span
        data-cds="Shortcut"
        data-variant="text"
        className="inline-flex shrink-0 items-baseline gap-[0.3em] text-caption [--cds-shortcut-cap-ink:currentColor] ml-1 mr-[var(--df-radius-pill)] leading-none text-muted opacity-0 group-hover:opacity-100"
      >
        <kbd className="font-inherit [font-variation-settings:inherit] [color:var(--cds-shortcut-cap-ink)]">
          <span data-editable-text="true">⇧</span>
          <span className="sr-only select-none" data-editable-text="true">
            Shift
          </span>
        </kbd>
        <kbd className="font-inherit [font-variation-settings:inherit] [color:var(--cds-shortcut-cap-ink)]">
          <span data-editable-text="true">⌘</span>
          <span className="sr-only select-none" data-editable-text="true">
            Command
          </span>
        </kbd>
        <kbd
          className="font-inherit [font-variation-settings:inherit] [color:var(--cds-shortcut-cap-ink)]"
          data-editable-text="true"
        >
          O
        </kbd>
      </span>
    </a>
  );
}
