import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "../ui";
import { useFadeIn } from "../data/useDelay";

export type Coachmark = {
  /** Matches `data-coach="…"` on the element the step points at. A step whose element is missing is skipped. */
  target: string;
  title: string;
  body: ReactNode;
  /** Sides to try, in order; the first one that fits the window wins. */
  sides?: Side[];
  /** The primary button of this step, in place of Next / Done (e.g. "Open plan"); the tour ends after it. */
  action?: { label: string; onClick: () => void };
};

type Side = "bottom" | "top" | "left" | "right";
type Rect = { top: number; left: number; width: number; height: number };

const GAP = 12;
const PAD = 4;
const EDGE = 8;

const find = (target: string) => document.querySelector<HTMLElement>(`[data-coach="${target}"]`);

/** Where the card goes: the first side with room, kept inside the window. */
function place(t: Rect, card: { width: number; height: number }, sides: Side[]) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const fits: Record<Side, boolean> = {
    bottom: t.top + t.height + GAP + card.height <= vh - EDGE,
    top: t.top - GAP - card.height >= EDGE,
    right: t.left + t.width + GAP + card.width <= vw - EDGE,
    left: t.left - GAP - card.width >= EDGE,
  };
  const side = sides.find((s) => fits[s]) ?? sides[0];
  let top = 0;
  let left = 0;
  if (side === "bottom" || side === "top") {
    top = side === "bottom" ? t.top + t.height + GAP : t.top - GAP - card.height;
    left = t.left;
  } else {
    left = side === "right" ? t.left + t.width + GAP : t.left - GAP - card.width;
    top = t.top;
  }
  left = Math.max(EDGE, Math.min(left, vw - card.width - EDGE));
  top = Math.max(EDGE, Math.min(top, vh - card.height - EDGE));
  return { top, left };
}

/**
 * A short tour over the page: the page dims, the element of the current step stays lit,
 * a card beside it says what it is. Next / Back / Skip; Escape skips, arrows step.
 */
export function Coachmarks({
  steps,
  onDone,
  skipLabel = "Skip",
}: {
  steps: Coachmark[];
  onDone: () => void;
  /** A single hint reads better with "Got it" than "Skip". */
  skipLabel?: string;
}) {
  // Steps whose element is on the page once it has rendered (e.g. no task pane when nothing is selected).
  const [live, setLive] = useState<Coachmark[] | null>(null);
  useLayoutEffect(() => setLive(steps.filter((s) => find(s.target))), [steps]);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const primary = useRef<HTMLDivElement>(null);
  const step = live?.[index];

  const measure = useCallback(() => {
    const el = step && find(step.target);
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 });
  }, [step]);

  // Bring the step into view, then light it.
  useLayoutEffect(() => {
    const el = step && find(step.target);
    if (!el) return;
    el.scrollIntoView({ block: "nearest" });
    measure();
  }, [step, measure]);

  useLayoutEffect(() => {
    if (!rect || !card.current || !step) return;
    setPos(place(rect, card.current.getBoundingClientRect(), step.sides ?? ["bottom", "top", "left", "right"]));
  }, [rect, step]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    // Capture: the page scrolls inside panes, not the window.
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [measure]);

  const count = live?.length ?? 0;
  const last = index === count - 1;
  const next = useCallback(() => (last ? onDone() : setIndex((i) => i + 1)), [last, onDone]);
  const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDone();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, back, onDone]);

  // Focus goes to the card so Enter/Space press Next and a screen reader reads the step.
  useEffect(() => {
    primary.current?.querySelector("button")?.focus();
  }, [index, pos === null]);

  useEffect(() => {
    if (live && live.length === 0) onDone();
  }, [live, onDone]);

  const shown = useFadeIn();
  if (!step) return null;

  return createPortal(
    <div
      className={
        "cds-root fixed inset-0 z-[var(--cds-z-coachmark)] transition-opacity duration-slow ease-out motion-reduce:transition-none " +
        (shown ? "opacity-100" : "opacity-0")
      }
      data-mode="dark" data-density="comfortable" data-font="anthropic">
      {/* Clicks outside the card do nothing: the tour ends only by Skip, Done or Escape. */}
      <div className="absolute inset-0" />
      {rect && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-lg transition-[top,left,width,height] duration-base ease-out motion-reduce:transition-none"
          style={{
            ...rect,
            boxShadow: "0 0 0 9999px var(--cds-backdrop), inset 0 0 0 1px var(--cds-alpha-3)",
          }}
        />
      )}
      <div
        ref={card}
        role="dialog"
        aria-modal="true"
        aria-labelledby="coachmark-title"
        aria-describedby="coachmark-body"
        className="absolute flex w-[300px] flex-col gap-sm rounded-lg bg-surface-popover p-md text-body shadow-popover"
        style={{
          top: pos?.top ?? 0,
          left: pos?.left ?? 0,
          visibility: pos ? "visible" : "hidden",
          boxShadow: "var(--cds-shadow-popover), inset 0 0 0 1px var(--cds-alpha-2)",
        }}
      >
        <div className="flex flex-col gap-xs">
          {count > 1 && (
            <span className="text-footnote tabular-nums text-muted">
              {index + 1} of {count}
            </span>
          )}
          <h2 id="coachmark-title" className="text-heading font-medium text-primary">
            {step.title}
          </h2>
          <div id="coachmark-body" className="text-body text-secondary">
            {step.body}
          </div>
        </div>
        <div className="flex items-center gap-xs pt-xs">
          <Button size="xs" variant="ghost" className="text-muted" onClick={onDone}>
            {skipLabel}
          </Button>
          <span className="flex-1" />
          {index > 0 && (
            <Button size="xs" onClick={back}>
              Back
            </Button>
          )}
          <div ref={primary} className="contents">
            {step.action ? (
              <Button
                size="xs"
                variant="primary"
                onClick={() => {
                  onDone();
                  step.action!.onClick();
                }}
              >
                {step.action.label}
              </Button>
            ) : (
              <Button size="xs" variant="primary" onClick={next}>
                {last ? "Done" : "Next"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
