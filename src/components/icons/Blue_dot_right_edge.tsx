export const Blue_dot_right_edge = () => {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" className="-rotate-90">
      <circle cx="6" cy="6" r="5" fill="none" strokeWidth="2" stroke="var(--cds-alpha-2)" />
      <circle
        cx="6"
        cy="6"
        r="5"
        fill="none"
        strokeWidth="2"
        strokeDasharray="31.41592653589793"
        strokeDashoffset="31.41592653589793"
        strokeLinecap="round"
        stroke="var(--cds-fill-accent)"
        className="transition-[stroke-dashoffset] duration-300"
      />
    </svg>
  );
};
