export function ScrollFadeContainer() {
  return (
    <div tabIndex={-1} className="h-full isolate focus:outline-none">
      <div className="overflow-y-auto supports-[animation-timeline:scroll()]:[--epitaxy-top-fade-height:32px] h-full overflow-x-hidden [scrollbar-gutter:stable_both-edges]">
        <div className="scroll-fade-strip-top [--cds-scroll-fade-size:var(--epitaxy-top-fade-height)] [--cds-scroll-fade-strip-color:var(--epitaxy-transcript-surface,var(--cds-surface-1))]" />
        <div className="scroll-fade-strip-bottom scroll-fade-size-[48px] [--cds-scroll-fade-strip-color:var(--epitaxy-transcript-surface,var(--cds-surface-1))]" />
      </div>
    </div>
  );
}
