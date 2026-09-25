import type { ReactElement } from "react";
import type { Status } from "../data/inbox";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/**
 * Status is carried by shape, not color: ✓ done, ● running, ○ ahead, ‖ waits for you, ◇ gate, ◆ your gate.
 * Anthropicons has no pause or filled-diamond glyph, so the set is one small SVG family in currentColor.
 * Only "waits for you" takes the clay accent.
 */
export function StatusMark({ status, className }: { status: Status; className?: string }) {
  const paths: Record<Status, ReactElement> = {
    done: (
      <path d="M2.5 6.2 5 8.6l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    ),
    running: <circle cx="6" cy="6" r="3.25" fill="currentColor" />,
    ahead: <circle cx="6" cy="6" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.25" />,
    waiting: (
      <g fill="currentColor">
        <rect x="3" y="2.5" width="2" height="7" rx="0.75" />
        <rect x="7" y="2.5" width="2" height="7" rx="0.75" />
      </g>
    ),
    gate: <path d="M6 1.9 10.1 6 6 10.1 1.9 6Z" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />,
    myGate: <path d="M6 1.4 10.6 6 6 10.6 1.4 6Z" fill="currentColor" />,
  };
  const tone = status === "waiting" ? "text-clay" : status === "ahead" || status === "gate" ? "text-muted" : "text-secondary";
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      role="img"
      aria-label={STATUS_LABEL[status]}
      className={cx("shrink-0", tone, className)}
    >
      {paths[status]}
    </svg>
  );
}

const STATUS_LABEL: Record<Status, string> = {
  done: "Done",
  running: "Running",
  ahead: "Up next",
  waiting: "Waiting for you",
  gate: "Automatic check",
  myGate: "Your approval",
};

/**
 * Task state as a dot, shared by the Inbox list and the sidebar:
 * blocked and can wait = clay dot (needs you), running = grey dot that pulses;
 * plan steps add done = grey dot and ahead = grey ring (also for previewed new steps).
 * Clay still means only "needs you".
 */
export type DotState = "blocked" | "canWait" | "running" | "done" | "ahead";

const DOT_LABEL: Record<DotState, string> = {
  blocked: "Blocked on you",
  canWait: "Questions can wait",
  running: "Running",
  done: "Done",
  ahead: "Up next",
};

export function TaskDot({ state, className }: { state: DotState; className?: string }) {
  const label = DOT_LABEL[state];
  return (
    <span role="img" aria-label={label} className={cx("flex size-3 shrink-0 items-center justify-center", className)}>
      {/* Blocked and can-wait share one clay dot: both mean "needs you"; the group heading tells them apart. */}
      {(state === "blocked" || state === "canWait") && <span className="block size-[6px] rounded-full bg-clay" />}
      {state === "done" && <span className="block size-[6px] rounded-full bg-current text-muted" />}
      {state === "ahead" && <span className="block size-[6px] rounded-full text-muted shadow-[inset_0_0_0_0.75px_currentColor]" />}
      {state === "running" && (
        <span
          // working-dot-pulse: src/styles/app.css, same as working chats in the sidebar
          className="block size-[6px] rounded-full bg-current text-secondary motion-reduce:!animate-none"
          style={{ animation: "working-dot-pulse 2.4s infinite" }}
        />
      )}
    </span>
  );
}
