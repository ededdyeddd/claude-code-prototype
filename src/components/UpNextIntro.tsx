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
 * Micro-onboarding, step one: on the first visit Up next opens with a short "what is this page",
 * in the Routines empty-state style. "Show me around" starts the coachmark tour, "Skip" ends onboarding.
 */
export function UpNextIntro({ onTour, onSkip }: { onTour: () => void; onSkip: () => void }) {
  return (
    <section aria-labelledby="up-next-intro-title" className="flex flex-col items-center gap-sm py-xl text-center">
      <UpNextIllustration />
      <h2 id="up-next-intro-title" className="pt-xs text-heading font-medium text-primary">
        Which task to go to first
      </h2>
      <p className="max-w-[440px] text-footnote text-secondary">
        Agents work on your tasks in parallel. Up next shows where one waits for you, what it needs and what it will cost, then lets
        you get back to work.
      </p>
      <div className="flex items-center gap-xs pt-xs">
        <Button size="sm" variant="ghost" onClick={onSkip}>
          Skip
        </Button>
        <Button size="sm" variant="primary" onClick={onTour}>
          Show me around
        </Button>
      </div>
    </section>
  );
}
