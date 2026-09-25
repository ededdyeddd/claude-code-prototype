import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "../ui";
import { ResizeHandle } from "./ResizeHandle";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/** Width of the pane in px; the person can drag its left edge. */
export const SIDE_PANE = { default: 560, min: 360 };

const EXPAND = "";
const CLOSE = "";

/**
 * Pane that opens on the right of the main pane when the person clicks an interactive
 * element (a task, an artifact). Same card as a tile: surface-2, hairline outline.
 */
export function SidePane({
  id,
  title,
  meta,
  width,
  maxWidth,
  onResize,
  expanded,
  onToggleExpand,
  onClose,
  actions,
  subheader,
  footer,
  children,
}: {
  /** For aria-controls on the toggle that opens it. */
  id?: string;
  title: ReactNode;
  meta?: ReactNode;
  width: number;
  maxWidth: number;
  onResize: (width: number) => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
  onClose: () => void;
  /** Extra header buttons, before expand/close. */
  actions?: ReactNode;
  /** Under the title, pinned with it: e.g. what the task is about, then the pane's tabs. */
  subheader?: ReactNode;
  /** Pinned under the scroll area, e.g. a reply box. */
  footer?: ReactNode;
  children: ReactNode;
}) {
  // top: content is scrolled under the header; bottom: there is more content below the footer.
  const body = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState({ top: false, bottom: false });
  const onScroll = () => {
    const el = body.current;
    if (!el) return;
    const next = { top: el.scrollTop > 0, bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 1 };
    setScroll((prev) => (prev.top === next.top && prev.bottom === next.bottom ? prev : next));
  };
  // Content changes (a stage folds, a step opens) can change whether there is more below.
  useLayoutEffect(onScroll);
  return (
    <div className="relative flex min-h-0 min-w-0" style={{ flex: expanded ? "1 1 0px" : `0 0 ${width}px` }}>
      {!expanded && (
        // Sits in the gap between the panes.
        <ResizeHandle
          edge="start"
          label="Resize pane"
          width={width}
          min={SIDE_PANE.min}
          max={Math.max(SIDE_PANE.min, maxWidth)}
          defaultWidth={SIDE_PANE.default}
          onResize={onResize}
          className="-start-3 z-[2]"
        />
      )}
      <section
        id={id}
        aria-label="Side pane"
        className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-card bg-surface-2 shadow-panel-sm dark:shadow-sm dark:outline dark:outline-1 dark:outline-alpha-2"
      >
        {/* Hairlines show up only while content scrolls under the header or above the footer, as in chats. */}
        <header
          className={cx(
            "flex shrink-0 flex-col border-b ps-[var(--cds-gap-lg)] pe-sm pt-[var(--cds-gap-md)] transition-colors duration-fast",
            // Tabs in place of the heading are lighter than the serif title: the content needs more room under them.
            typeof title === "string" && !subheader ? "pb-xs" : "pb-[var(--cds-gap-md)]",
            scroll.top ? "border-alpha-2" : "border-transparent",
          )}
        >
          <div className="flex items-start gap-sm">
            <div className="flex min-w-0 flex-1 items-baseline gap-sm pt-xs">
              {typeof title === "string" ? (
                <h2
                  className="truncate font-serif text-primary"
                  style={{
                    fontSize: "var(--cds-font-size-title)",
                    lineHeight: "var(--cds-leading-title)",
                    fontWeight: "var(--cds-font-weight-regular)",
                  }}
                >
                  {title}
                </h2>
              ) : (
                // A control in place of the heading, e.g. the Brief | Plan tabs of the task pane.
                title
              )}
              {meta && <span className="shrink-0 truncate text-footnote text-muted">{meta}</span>}
            </div>
            <div className="flex shrink-0 items-center gap-0.5 [--cds-text-primary:var(--cds-text-secondary)]">
              {actions}
              {onToggleExpand && (
                <Button
                  size="xs"
                  icon={EXPAND}
                  aria-label={expanded ? "Collapse pane" : "Expand pane"}
                  aria-pressed={expanded}
                  onClick={onToggleExpand}
                />
              )}
              <Button size="xs" icon={CLOSE} aria-label="Close pane" onClick={onClose} />
            </div>
          </div>
          {subheader && <div className="pe-[calc(var(--cds-gap-lg)-var(--cds-gap-sm))]">{subheader}</div>}
        </header>
        <div ref={body} className="min-h-0 flex-1 overflow-y-auto" onScroll={onScroll}>
          {children}
        </div>
        {footer && (
          <div
            className={cx(
              "shrink-0 border-t pt-[var(--cds-gap-md)] transition-colors duration-fast",
              scroll.bottom ? "border-alpha-2" : "border-transparent",
            )}
          >
            {footer}
          </div>
        )}
      </section>
    </div>
  );
}
