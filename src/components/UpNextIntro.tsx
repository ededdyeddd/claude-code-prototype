import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "../ui";

/** Three task rows, the front one waiting for you (clay), then running, then ahead. Same drawing style as the Routines stopwatch. */
export function UpNextIllustration({ size = 60 }: { size?: number }) {
  const row = (y: number, dot: "clay" | "running" | "ahead", line: number) => (
    <g>
      <rect x="6" y={y} width="48" height="12" rx="3" fill="var(--cds-alpha-3)" stroke="var(--cds-text-secondary)" strokeWidth="1.5" />
      {dot === "clay" && <circle cx="13" cy={y + 6} r="2.5" fill="var(--cds-clay)" />}
      {dot === "running" && <circle cx="13" cy={y + 6} r="2.5" fill="var(--cds-text-muted)" />}
      {dot === "ahead" && <circle cx="13" cy={y + 6} r="2" stroke="var(--cds-text-muted)" strokeWidth="1" />}
      <path
        d={`M20 ${y + 6}h${line}`}
        stroke={dot === "clay" ? "var(--cds-text-primary)" : "var(--cds-text-secondary)"}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" aria-hidden="true">
      {row(6, "clay", 26)}
      {row(24, "running", 20)}
      {row(42, "ahead", 14)}
    </svg>
  );
}

/**
 * Micro-onboarding, step one: on the first visit a modal over Up next says what the page is for.
 * "Show me around" starts the coachmark tour; "Skip" or Escape ends onboarding.
 */
export function UpNextIntro({ onTour, onSkip }: { onTour: () => void; onSkip: () => void }) {
  const primary = useRef<HTMLDivElement>(null);
  const skip = useRef(onSkip);
  skip.current = onSkip;
  // Once on open: focus the primary button, Escape skips.
  useEffect(() => {
    primary.current?.querySelector("button")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && skip.current();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return createPortal(
    <div
      className="cds-root fixed inset-0 z-[var(--cds-z-modal)] flex items-center justify-center p-xl"
      data-mode="dark"
      data-density="comfortable"
      data-font="anthropic"
    >
      {/* The page stays visible under the backdrop: the modal is about it. A click outside does nothing. */}
      <div aria-hidden="true" className="absolute inset-0 bg-[var(--cds-backdrop)]" />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="up-next-intro-title"
        aria-describedby="up-next-intro-body"
        className="relative flex w-full max-w-[400px] flex-col items-center gap-sm rounded-lg bg-surface-popover px-xl pt-xl pb-lg text-center"
        style={{ boxShadow: "var(--cds-shadow-popover), inset 0 0 0 1px var(--cds-alpha-2)" }}
      >
        <UpNextIllustration />
        <h2
          id="up-next-intro-title"
          className="pt-xs font-serif text-primary"
          style={{
            fontSize: "var(--cds-font-size-title)",
            lineHeight: "var(--cds-leading-title)",
            fontWeight: "var(--cds-font-weight-regular)",
          }}
        >
          Which task to go to first
        </h2>
        <p id="up-next-intro-body" className="text-body text-secondary">
          Agents work on your tasks in parallel. Up next shows where one waits for you, what it needs and what it will cost, then lets
          you get back to work.
        </p>
        <div className="flex items-center gap-xs pt-md">
          <Button size="sm" variant="ghost" onClick={onSkip}>
            Skip
          </Button>
          <div ref={primary} className="contents">
            <Button size="sm" variant="primary" onClick={onTour}>
              Show me around
            </Button>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}
