import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Hover/focus tooltip for a piece of inline text, e.g. where a forecast comes from.
 * Rendered in a portal (like Menu) so scrolling panes never clip it; placed above the text,
 * or below when there is no room. Styled with popover tokens.
 */
export function Hint({
  text,
  children,
  className,
  focusable = true,
}: {
  text: ReactNode;
  children: ReactNode;
  className?: string;
  /** Off inside another interactive element (a button row), where a nested tab stop would be wrong. */
  focusable?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number; below: boolean } | null>(null);
  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const below = r.top < 64;
    setPos({ x: r.left + r.width / 2, y: below ? r.bottom + 6 : r.top - 6, below });
  };
  const hide = () => setPos(null);
  return (
    <>
      <span
        ref={ref}
        tabIndex={focusable ? 0 : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className={"cursor-help outline-none focus-visible:shadow-focus rounded-sm " + (className ?? "")}
      >
        {children}
      </span>
      {pos &&
        createPortal(
          <div
            role="tooltip"
            className="cds-root pointer-events-none fixed z-popover w-max max-w-[260px] rounded bg-surface-popover px-sm py-xs text-footnote text-secondary shadow-popover"
            data-mode="dark"
            data-density="compact"
            data-font="anthropic"
            style={{
              // Centered on the text, kept inside the window (max width 260px).
              left: Math.min(Math.max(138, pos.x), window.innerWidth - 138),
              top: pos.y,
              transform: `translate(-50%, ${pos.below ? "0" : "-100%"})`,
              boxShadow: "var(--cds-shadow-popover), inset 0 0 0 1px var(--cds-alpha-2)",
            }}
          >
            {text}
          </div>,
          document.body,
        )}
    </>
  );
}
