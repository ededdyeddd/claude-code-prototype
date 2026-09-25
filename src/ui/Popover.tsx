import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { createPortal } from "react-dom";

/**
 * Panel anchored to a control (e.g. the autonomy envelope over its chip). Like Menu: portal, popover
 * surface and shadow, closes on outside click and Escape; unlike Menu it holds arbitrary content.
 */
export function Popover({
  anchor,
  open,
  onClose,
  placement = "top-start",
  label,
  className,
  children,
}: {
  anchor: RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  placement?: "top-start" | "bottom-start";
  /** Accessible name of the dialog. */
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open) return setPos(null);
    const place = () => {
      if (!anchor.current || !ref.current) return;
      const a = anchor.current.getBoundingClientRect();
      const p = ref.current.getBoundingClientRect();
      const top = placement === "top-start" ? a.top - p.height - 6 : a.bottom + 6;
      setPos({
        top: Math.max(8, Math.min(top, window.innerHeight - p.height - 8)),
        left: Math.max(8, Math.min(a.left, window.innerWidth - p.width - 8)),
      });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [open, anchor, placement]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (anchor.current?.contains(t) || ref.current?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, anchor]);

  if (!open) return null;
  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label={label}
      className={"cds-root fixed z-popover rounded-lg bg-surface-popover text-body text-primary shadow-popover " + (className ?? "")}
      data-mode="dark"
      data-density="compact"
      data-font="anthropic"
      style={{
        top: pos?.top ?? -9999,
        left: pos?.left ?? -9999,
        boxShadow: "var(--cds-shadow-popover), inset 0 0 0 1px var(--cds-alpha-2)",
      }}
    >
      {children}
    </div>,
    document.body,
  );
}
