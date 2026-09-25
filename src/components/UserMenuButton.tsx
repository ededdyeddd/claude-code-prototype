import { Img } from "./Img";

export function UserMenuButton() {
  return (
    <button
      type="button"
      data-testid="user-menu-button"
      className="df-user-menu-btn cds-reset flex h-[max(28px,var(--df-footer-btn-size))] max-w-full items-center gap-[var(--df-row-gap)] rounded-[var(--df-radius-pill)] pl-[var(--df-row-px)] pr-2 text-left outline-none hover:bg-[var(--df-hover)] focus-visible:shadow-focus"
      tabIndex={0}
      id="base-ui-_r_17_"
    >
      <span className="df-on-rail relative flex w-[var(--df-leading-slot)] shrink-0 items-center justify-center">
        <span
          data-cds="Avatar"
          className="inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full font-sans font-medium size-[var(--cds-avatar-sm)] text-[calc(0.5625rem*var(--cds-rem-scale,1))] bg-fill-control text-primary"
        >
          <Img id="0" />
        </span>
      </span>
      <span className="flex min-w-0 gap-1 overflow-hidden text-[length:var(--df-row-font)] df-footer-suffix items-baseline">
        <span className="whitespace-nowrap text-secondary max-w-full shrink-0" data-editable-text="true">
          Eduard
        </span>
        <span className="df-footer-suffix-text text-muted" data-editable-text="true">
          ·
        </span>
        <span className="df-footer-suffix-text min-w-0 whitespace-nowrap text-muted" data-editable-text="true">
          Max
        </span>
      </span>
      <span
        data-cds="Icon"
        className="shrink-0 text-muted"
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
