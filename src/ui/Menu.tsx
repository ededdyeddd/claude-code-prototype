import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { createPortal } from "react-dom";
import { Icon } from "./index";

const CHEVRON_RIGHT = "";
const CHECK = "";

type Placement = "bottom-end" | "bottom-start" | "right-start";

function useAnchoredPosition(anchor: RefObject<HTMLElement | null>, open: boolean, placement: Placement) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!open || !anchor.current || !menuRef.current) return;
    const a = anchor.current.getBoundingClientRect();
    const m = menuRef.current.getBoundingClientRect();
    let top = placement === "right-start" ? a.top - 4 : a.bottom + 4;
    let left = placement === "bottom-end" ? a.right - m.width : placement === "bottom-start" ? a.left : a.right + 2;
    // Keep the menu inside the viewport.
    left = Math.max(8, Math.min(left, window.innerWidth - m.width - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - m.height - 8));
    setPos({ top, left });
  }, [open, anchor, placement]);
  return { pos, menuRef };
}

const MenuContext = createContext<{ close: () => void }>({ close: () => {} });

/**
 * Popover menu anchored to an element. Rendered in a portal, so it is never clipped by
 * scrolling sidebars. Closes on outside click and Escape.
 */
export function Menu({
  anchor,
  open,
  onClose,
  placement = "bottom-end",
  children,
  minWidth = 200,
}: {
  anchor: RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  placement?: Placement;
  children: ReactNode;
  minWidth?: number;
}) {
  const { pos, menuRef } = useAnchoredPosition(anchor, open, placement);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (anchor.current?.contains(t)) return;
      if ((t as Element).closest?.("[data-menu-popup]")) return;
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
    <MenuContext.Provider value={{ close: onClose }}>
      <div
        ref={menuRef}
        data-menu-popup=""
        role="menu"
        className="cds-root fixed z-popover flex flex-col rounded-lg bg-surface-popover p-1 text-body text-primary shadow-popover"
        data-mode="dark"
        data-density="comfortable"
        data-font="anthropic"
        style={{
          top: pos?.top ?? -9999,
          left: pos?.left ?? -9999,
          minWidth,
          boxShadow: "var(--cds-shadow-popover), inset 0 0 0 1px var(--cds-alpha-2)",
        }}
      >
        {children}
      </div>
    </MenuContext.Provider>,
    document.body
  );
}

const itemClass =
  "flex h-[var(--cds-h-control--sm)] w-full items-center gap-sm rounded-sm px-sm text-left outline-none cursor-[var(--cds-cursor-interactive)] hover:bg-fill-ghost-hover focus-visible:bg-fill-ghost-hover";

/** Plain action row. */
export function MenuItem({ children, icon, onSelect }: { children: ReactNode; icon?: string; onSelect?: () => void }) {
  const { close } = useContext(MenuContext);
  return (
    <button
      type="button"
      role="menuitem"
      className={itemClass}
      onClick={() => {
        onSelect?.();
        close();
      }}
    >
      {icon && <Icon glyph={icon} />}
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </button>
  );
}

/** Toggle row with a trailing check mark (e.g. "Show PR status"). Keeps the menu open. */
export function MenuCheckboxItem({ children, checked, onChange }: { children: ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="menuitemcheckbox" aria-checked={checked} className={itemClass} onClick={() => onChange(!checked)}>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {checked && <Icon glyph={CHECK} className="!text-accent" />}
    </button>
  );
}

/** Row that shows its current value and opens a submenu of options on hover/click. */
export function MenuSelectItem<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const current = options.find((o) => o.value === value)?.label ?? value;
  const show = () => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hide = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };
  return (
    <div onMouseEnter={show} onMouseLeave={hide}>
      <button
        ref={ref}
        type="button"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={open}
        className={itemClass + (open ? " bg-fill-ghost-hover" : "")}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <span className="text-muted">{current}</span>
        <Icon glyph={CHEVRON_RIGHT} size="sm" className="-me-1 !text-muted" />
      </button>
      <div onMouseEnter={show} onMouseLeave={hide}>
        <Menu anchor={ref} open={open} onClose={() => setOpen(false)} placement="right-start" minWidth={160}>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="menuitemradio"
              aria-checked={o.value === value}
              className={itemClass}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
            >
              <span className="min-w-0 flex-1 truncate">{o.label}</span>
              {o.value === value && <Icon glyph={CHECK} className="!text-accent" />}
            </button>
          ))}
        </Menu>
      </div>
    </div>
  );
}

export function MenuSeparator() {
  return <div role="separator" className="-mx-1 my-1 h-px bg-alpha-2" />;
}
