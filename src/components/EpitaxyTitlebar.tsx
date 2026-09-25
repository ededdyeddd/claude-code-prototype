import type { Session } from "../data/sessions";
import { Button, Icon } from "../ui";

const LAPTOP = "\uE093";
const CHEVRON_DOWN = "\uE027";
const TERMINAL = "\uE051";
const PANEL = "\uE113";
const GLOBE = "\uE082";
const MORE = "\uE062";


/** The toggle of the task pane on the right of the chat: "Brief and plan" (level 3) or "Plan" (level 2). */
export type TaskPaneToggle = { label: string; open: boolean; changed?: boolean; onToggle: () => void };

export function EpitaxyTitlebar({ chat, taskPane }: { chat?: Session; taskPane?: TaskPaneToggle }) {
  return (
    <div className="epitaxy-titlebar relative flex items-center h-[calc(2rem*var(--cds-rem-scale,1))] pl-0 pr-[12px] [[data-chat-gutter-end=shave]_&]:pr-0 [[data-tile-overflow-anchor=left]_&]:mr-[max(0px,var(--tile-overflow-min,0px)_-_100cqw)] [[data-tile-overflow-anchor=right]_&]:ml-[max(0px,var(--tile-overflow-min,0px)_-_100cqw)]">
      <div className="draggable absolute inset-0 -z-[1]" />
      <div className="group/lead relative z-[1] flex min-w-0 items-center [[data-tile-overflow-anchor]_&]:[@container_tile-slot_(max-width:320px)]:[clip-path:inset(-32px_-12px)] draggable-none">
        {chat && (
          <div className="flex min-w-0 items-center gap-sm ps-sm">
            <button
              type="button"
              aria-haspopup="menu"
              className="flex min-w-0 items-center gap-1.5 rounded-sm px-1 h-[var(--cds-h-control--xs)] text-body text-primary hover:bg-fill-ghost-hover outline-none focus-visible:shadow-focus"
            >
              <Icon glyph={LAPTOP} className="!text-secondary" />
              <span className="truncate">{chat.title}</span>
              <Icon glyph={CHEVRON_DOWN} size="sm" className="!text-muted" />
            </button>
          </div>
        )}
      </div>
      <div className="relative z-[1] ml-auto flex shrink-0 items-center gap-1 pl-[24px] [[data-pane-overlay]_&]:mr-[calc(-1*var(--epitaxy-overlay-titlebar-shift,0px))] draggable-none [--cds-h-control:26px] [--cds-text-primary:var(--cds-text-secondary)]">
        {chat ? (
          <div className="flex items-center gap-0.5">
            {taskPane && (
              // Text, not an icon: it says what opens. The grey dot means an edit changed it since it was last open.
              <button
                type="button"
                aria-pressed={taskPane.open}
                aria-controls="task-pane"
                onClick={taskPane.onToggle}
                className={
                  "me-1 flex h-[var(--cds-h-control--xs)] items-center gap-1.5 rounded-sm px-sm text-body outline-none transition-colors duration-fast focus-visible:shadow-focus cursor-[var(--cds-cursor-interactive)] " +
                  (taskPane.open ? "bg-alpha-2 text-primary" : "text-secondary hover:bg-alpha-1 hover:text-primary")
                }
              >
                {taskPane.label}
                {taskPane.changed && !taskPane.open && <span aria-label="Changed" className="block size-[6px] rounded-full bg-muted" />}
              </button>
            )}
            <Button size="xs" icon={TERMINAL} aria-label="Terminal" />
            <Button size="xs" icon={PANEL} aria-label="Toggle panel" />
            <Button size="xs" icon={GLOBE} aria-label="Preview" />
            <Button size="xs" icon={MORE} aria-label="More" />
          </div>
        ) : (
          <div className="flex items-center gap-1 empty:hidden sf-hidden" />
        )}
      </div>
    </div>
  );
}
