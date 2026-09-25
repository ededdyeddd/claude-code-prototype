import { createContext, useContext } from "react";

/** Share of the context window used by the open chat (0..1). Provided by ChatPanel. */
export const ContextUsage = createContext(0);

const CIRCUMFERENCE = 31.41592653589793;

/** Context ring in the composer: fills as the conversation grows. */
export const Blue_dot_right_edge = () => {
  const used = Math.min(1, Math.max(0, useContext(ContextUsage)));
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" className="-rotate-90" aria-label={`Context ${Math.round(used * 100)}% used`}>
      <title>{`Context: ${Math.round(used * 100)}% used`}</title>
      <circle cx="6" cy="6" r="5" fill="none" strokeWidth="2" stroke="var(--cds-alpha-2)" />
      <circle
        cx="6"
        cy="6"
        r="5"
        fill="none"
        strokeWidth="2"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={CIRCUMFERENCE * (1 - used)}
        strokeLinecap="round"
        stroke="var(--cds-fill-accent)"
        className="transition-[stroke-dashoffset] duration-300"
      />
    </svg>
  );
};
