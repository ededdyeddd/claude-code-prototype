import { useRef, useState, type RefObject } from "react";
import { Button, Icon, Menu } from "../ui";
import { setAttention, useInbox, type Attention } from "../data/inboxStore";

// Anthropicons codepoints (see /tokens#icons)
const I = {
  chevronDown: "\uE027",
  check: "\uE03B",
};

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

const ATTENTION: { value: Attention; label: string; note: string }[] = [
  {
    value: "available",
    label: "Available",
    note: "Blocked tasks notify you right away. The rest comes in the 16:00 digest.",
  },
  { value: "busy", label: "Busy", note: "Only blocked tasks notify you." },
  {
    value: "dnd",
    label: "Do not disturb",
    note: "No notifications. Everything goes to the digest.",
  },
];

const BUSY_UNTIL = ["16:00", "18:00", "end of day"];

const busyLabel = (until: string) => `Busy until ${until}`;

const menuRow =
  "flex w-full items-start gap-sm rounded-sm px-sm py-xs text-left outline-none cursor-[var(--cds-cursor-interactive)] hover:bg-fill-ghost-hover focus-visible:bg-fill-ghost-hover";

/** One button with the current mode; the menu explains each mode and sets how long Busy lasts. */
export function AttentionMenu({ attention, busyUntil }: { attention: Attention; busyUntil: string }) {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLButtonElement>(null);
  // On the button the status reads as the person's own; menu rows stay short.
  const current =
    attention === "busy"
      ? `You're ${busyLabel(busyUntil).toLowerCase()}`
      : attention === "available"
        ? "You're available"
        : "Do not disturb";
  return (
    <>
      <Button
        ref={anchor}
        size="sm"
        trailingIcon={I.chevronDown}
        // Filled like a selected tab: it shows a state, not just an action.
        className="bg-alpha-2"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {current}
      </Button>
      <AttentionOptions anchor={anchor} open={open} onClose={() => setOpen(false)} />
    </>
  );
}


/**
 * The modes menu itself. Opened from the Inbox header and from the avatar in the sidebar,
 * so the mode can be checked and changed from anywhere in the app.
 */
export function AttentionOptions({
  anchor,
  open,
  onClose,
  placement,
}: {
  anchor: RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  placement?: "bottom-end" | "top-start";
}) {
  const { attention, busyUntil } = useInbox();
  const pick = (value: Attention, until?: string) => {
    setAttention(value, until);
    onClose();
  };
  return (
    <Menu density="compact" anchor={anchor} open={open} onClose={onClose} placement={placement} minWidth={300}>
      {ATTENTION.map((a) => {
        const on = a.value === attention;
        return (
          <div key={a.value} className="flex flex-col">
            <button type="button" role="menuitemradio" aria-checked={on} className={menuRow} onClick={() => pick(a.value)}>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-footnote text-primary">{a.value === "busy" ? busyLabel(busyUntil) : a.label}</span>
                <span className="text-caption text-muted">{a.note}</span>
              </span>
              <Icon glyph={I.check} className={cx("mt-0.5 !text-accent", !on && "invisible")} />
            </button>
            {a.value === "busy" && (
              <div role="group" aria-label="Busy until" className="flex flex-wrap gap-0.5 ps-sm pb-xs pt-0.5">
                {BUSY_UNTIL.map((t) => {
                  const sel = on && t === busyUntil;
                  return (
                    <button
                      key={t}
                      type="button"
                      role="menuitemradio"
                      aria-checked={sel}
                      onClick={() => pick("busy", t)}
                      className={cx(
                        "h-[var(--cds-h-control--xs)] rounded-sm px-sm text-caption outline-none transition-colors duration-fast focus-visible:shadow-focus cursor-[var(--cds-cursor-interactive)]",
                        sel ? "bg-alpha-2 text-primary" : "bg-alpha-1 text-secondary hover:bg-fill-ghost-hover hover:text-primary",
                      )}
                    >
                      {t === "end of day" ? "End of day" : `Until ${t}`}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </Menu>
  );
}

/** Short status for the sidebar avatar; null when available, which is the norm and needs no label. */
export function attentionStatus(attention: Attention, busyUntil: string) {
  if (attention === "busy") return busyLabel(busyUntil);
  if (attention === "dnd") return "Do not disturb";
  return null;
}
