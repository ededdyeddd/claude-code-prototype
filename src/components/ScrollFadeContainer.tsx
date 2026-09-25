import type { ReactNode } from "react";

export function ScrollFadeContainer({ children }: { children?: ReactNode }) {
  return (
    <div tabIndex={-1} className="h-full isolate focus:outline-none">
      <div className="overflow-y-auto supports-[animation-timeline:scroll()]:[--epitaxy-top-fade-height:32px] h-full overflow-x-hidden [scrollbar-gutter:stable_both-edges] [scrollbar-width:thin] [scrollbar-color:var(--cds-alpha-3)_transparent]">
        <div className="scroll-fade-strip-top [--cds-scroll-fade-size:var(--epitaxy-top-fade-height)] [--cds-scroll-fade-strip-color:var(--epitaxy-transcript-surface,var(--cds-surface-1))]" />
        {children}
        <div className="scroll-fade-strip-bottom scroll-fade-size-[48px] [--cds-scroll-fade-strip-color:var(--epitaxy-transcript-surface,var(--cds-surface-1))]" />
      </div>
    </div>
  );
}
