import type { Session } from "../data/sessions";
import { Button, Icon } from "../ui";

const LAPTOP = "\uE093";
const CHEVRON_DOWN = "\uE027";
const TERMINAL = "\uE051";
const PANEL = "\uE113";
const GLOBE = "\uE082";
const MORE = "\uE062";

const TASK = "\uE041"; // clipboard with a list: the task's brief and plan

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
              // A pane like the others on this side; the grey dot means an edit changed it since it was last open.
              <span className="relative flex">
                <Button
                  size="xs"
                  icon={TASK}
                  aria-label={taskPane.changed ? `${taskPane.label} · changed` : taskPane.label}
                  title={taskPane.changed ? `${taskPane.label} · changed` : taskPane.label}
                  aria-pressed={taskPane.open}
                  aria-controls="task-pane"
                  onClick={taskPane.onToggle}
                  className={taskPane.open ? "bg-alpha-2 [--cds-text-primary:var(--cds-text-primary)]" : undefined}
                />
                {taskPane.changed && !taskPane.open && (
                  <span aria-hidden="true" className="pointer-events-none absolute end-0.5 top-0.5 size-[6px] rounded-full bg-muted" />
                )}
              </span>
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
