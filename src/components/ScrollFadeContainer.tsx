import { useLayoutEffect, useRef, type ReactNode } from "react";

/** How close to the bottom still counts as "at the bottom", px. */
const PIN_SLACK = 32;

/**
 * `stickToBottom`: a key (the chat id). A new key opens at the bottom, and while the reader stays there the
 * feed follows its growth (code blocks laying out, fonts loading, the live status, new messages, the dock
 * above the composer). Scrolling up releases it; scrolling back down pins it again.
 */
export function ScrollFadeContainer({ children, stickToBottom }: { children?: ReactNode; stickToBottom?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || stickToBottom === undefined) return;
    let pinned = true;
    const toBottom = () => {
      el.scrollTop = el.scrollHeight;
    };
    const onScroll = () => {
      pinned = el.scrollHeight - el.scrollTop - el.clientHeight < PIN_SLACK;
    };
    // The scroller resizes with the dock; its children resize with the transcript.
    const observer = new ResizeObserver(() => pinned && toBottom());
    observer.observe(el);
    Array.from(el.children).forEach((c) => observer.observe(c));
    toBottom();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", onScroll);
    };
  }, [stickToBottom]);

  return (
    <div tabIndex={-1} className="h-full isolate focus:outline-none">
      <div ref={ref} className="overflow-y-auto supports-[animation-timeline:scroll()]:[--epitaxy-top-fade-height:32px] h-full overflow-x-hidden [scrollbar-gutter:stable_both-edges] [scrollbar-width:thin] [scrollbar-color:var(--cds-alpha-3)_transparent]">
        <div className="scroll-fade-strip-top [--cds-scroll-fade-size:var(--epitaxy-top-fade-height)] [--cds-scroll-fade-strip-color:var(--epitaxy-transcript-surface,var(--cds-surface-1))]" />
        {children}
        <div className="scroll-fade-strip-bottom scroll-fade-size-[48px] [--cds-scroll-fade-strip-color:var(--epitaxy-transcript-surface,var(--cds-surface-1))]" />
      </div>
    </div>
  );
}
