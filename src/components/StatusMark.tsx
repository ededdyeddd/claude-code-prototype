
const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

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
