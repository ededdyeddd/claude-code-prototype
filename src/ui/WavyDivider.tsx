// One wave period as an SVG mask; the visible color comes from a token so it adapts to the theme.
const WAVE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='6' viewBox='0 0 12 6'%3E%3Cpath d='M0 3 Q3 0.5 6 3 T12 3' fill='none' stroke='black' stroke-width='1.2'/%3E%3C/svg%3E\")";

/** Hand-drawn style wavy separator between page sections. */
export function WavyDivider({ className = "" }: { className?: string }) {
  return (
    <div
      role="separator"
      className={`h-[6px] w-full ${className}`}
      style={{
        backgroundColor: "var(--cds-alpha-3)",
        maskImage: WAVE,
        WebkitMaskImage: WAVE,
        maskRepeat: "repeat-x",
        WebkitMaskRepeat: "repeat-x",
      }}
    />
  );
}
