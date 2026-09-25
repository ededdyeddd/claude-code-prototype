import { useRef } from "react";

/**
 * Drag handle on a panel edge. `edge="end"` sits on the right edge (sidebar): dragging right grows
 * the panel. `edge="start"` sits on the left edge (side pane): dragging left grows it.
 * Arrow keys resize by 16px, double click restores the default width.
 */
export function ResizeHandle({
  width,
  min,
  max,
  defaultWidth,
  onResize,
  edge = "end",
  label = "Resize sidebar",
  className = "end-[calc(-6px_-_(var(--cds-ring-outer,0px)_-_var(--cds-ring-inner,0px))_/_2)] dframe-resize-handle",
}: {
  width: number;
  min: number;
  max: number;
  defaultWidth: number;
  onResize: (width: number) => void;
  edge?: "start" | "end";
  label?: string;
  className?: string;
}) {
  const drag = useRef<{ x: number; w: number } | null>(null);
  const dir = edge === "end" ? 1 : -1;
  const clamp = (w: number) => Math.round(Math.min(max, Math.max(min, w)));

  return (
    <div
      data-cds="ResizeHandle"
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={width}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { x: e.clientX, w: width };
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
      }}
      onPointerMove={(e) => {
        if (drag.current) onResize(clamp(drag.current.w + dir * (e.clientX - drag.current.x)));
      }}
      onPointerUp={(e) => {
        e.currentTarget.releasePointerCapture(e.pointerId);
        drag.current = null;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }}
      onDoubleClick={() => onResize(clamp(defaultWidth))}
      onKeyDown={(e) => {
        const step = e.key === "ArrowRight" ? 16 : e.key === "ArrowLeft" ? -16 : 0;
        if (!step) return;
        e.preventDefault();
        onResize(clamp(width + dir * step));
      }}
      className={`cds-reset group/resize outline-none focus-visible:outline-hidden w-3 cursor-col-resize absolute inset-y-0 touch-none ${className}`}
    >
      <div className="absolute rounded-full transition-shadow duration-fast group-focus-visible/resize:shadow-focus inset-y-0 left-1/2 w-3 -translate-x-1/2 cursor-col-resize" />
      <div
        data-cds-part="resize-pill"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current transition-[opacity,color,background-color] h-full max-h-12 w-[3px] group-focus-visible/resize:max-h-none text-muted opacity-[var(--cds-resize-pill-force,0)] delay-200 duration-base group-hover/resize:opacity-100 group-focus-visible/resize:bg-fill-accent group-focus-visible/resize:opacity-100 group-focus-visible/resize:delay-0"
      />
    </div>
  );
}
