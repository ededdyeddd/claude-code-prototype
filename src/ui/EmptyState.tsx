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
