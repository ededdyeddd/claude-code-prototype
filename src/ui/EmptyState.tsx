import type { ReactNode } from "react";

/** Centered placeholder for an empty list: illustration + short muted message (+ optional action). */
export function EmptyState({ illustration, children, action }: { illustration?: ReactNode; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-sm py-xl text-center">
      {illustration}
      <p className="text-footnote text-muted">{children}</p>
      {action}
    </div>
  );
}

/** Stopwatch drawing used by the empty Routines list. Colors come from tokens, so it works in both modes. */
export function StopwatchIllustration({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" aria-hidden="true">
      <rect x="23" y="2" width="14" height="4" rx="1.5" fill="var(--cds-alpha-4)" stroke="var(--cds-text-secondary)" strokeWidth="1.5" />
      <path d="M30 6v5" stroke="var(--cds-text-secondary)" strokeWidth="1.5" />
      <circle cx="30" cy="35" r="23" fill="var(--cds-alpha-3)" stroke="var(--cds-text-secondary)" strokeWidth="1.5" />
      <path d="M30 20v15l-7 6" stroke="var(--cds-text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Three task rows, every one with the grey "working" dot: agents are busy and none waits for you.
 * Used by the empty Up next; same drawing style as the stopwatch.
 */
export function AllRunningIllustration({ size = 60 }: { size?: number }) {
  const row = (y: number, line: number) => (
    <g>
      <rect x="6" y={y} width="48" height="12" rx="3" fill="var(--cds-alpha-3)" stroke="var(--cds-text-secondary)" strokeWidth="1.5" />
      <circle cx="13" cy={y + 6} r="2.5" fill="var(--cds-text-muted)" />
      <path d={`M20 ${y + 6}h${line}`} stroke="var(--cds-text-secondary)" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" aria-hidden="true">
      {row(6, 26)}
      {row(24, 20)}
      {row(42, 14)}
    </svg>
  );
}
