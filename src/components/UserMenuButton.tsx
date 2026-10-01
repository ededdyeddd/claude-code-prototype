import { Img } from "./Img";
import { attentionStatus } from "./AttentionMenu";
import { useInbox, type Attention } from "../data/inboxStore";

/**
 * Attention mark on the avatar, told apart by shape, not color (clay means only "needs you"):
 * Busy is a ring, Do not disturb a filled dot with a bar. Available shows nothing, it is the norm.
 */
function AttentionMark({ attention }: { attention: Attention }) {
  if (attention === "available") return null;
  return (
    <span
      aria-hidden="true"
      className="absolute -bottom-px -right-px flex size-[9px] items-center justify-center rounded-full bg-[var(--df-web-sidebar-bg)]"
    >
      {attention === "busy" ? (
        <span className="size-[7px] rounded-full border-[1.5px] border-[var(--cds-text-secondary)]" />
      ) : (
        <span className="flex size-[7px] items-center justify-center rounded-full bg-[var(--cds-text-secondary)]">
          <span className="h-[1.5px] w-[4px] rounded-full bg-[var(--df-web-sidebar-bg)]" />
        </span>
      )}
    </span>
  );
}

/**
 * Name and plan, or the attention mode when it is not Available: the reason for a quiet app is
 * visible from any screen, and a forgotten Do not disturb doesn't leave blocked tasks waiting for hours.
 * It only shows the mode; the modes are switched in the Up next header.
 */
export function UserMenuButton() {
  const { attention, busyUntil } = useInbox();
  const status = attentionStatus(attention, busyUntil);
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
        <span className="absolute left-1/2 top-1/2 size-[var(--cds-avatar-sm)] -translate-x-1/2 -translate-y-1/2">
          <AttentionMark attention={attention} />
        </span>
      </span>
      <span className="flex min-w-0 gap-1 overflow-hidden text-[length:var(--df-row-font)] df-footer-suffix items-baseline">
        <span
          className="whitespace-nowrap text-secondary max-w-full shrink-0"
          data-editable-text="true"
        >
          Eduard
        </span>
        <span
          className="df-footer-suffix-text text-muted"
          data-editable-text="true"
        >
          ·
        </span>
        <span
          className={
            "df-footer-suffix-text min-w-0 truncate whitespace-nowrap " +
            (status ? "text-secondary" : "text-muted")
          }
          data-editable-text="true"
        >
          {status ?? "Max"}
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
