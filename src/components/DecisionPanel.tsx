import { useEffect, useRef, type ReactNode, type Ref } from "react";
import { Button } from "../ui";

/*
 * The decision dock's frame, drawn like Claude Code's own "ask the user a question" panel: the question in the
 * header with collapse and close, options as numbered rows on a soft fill, "Other" with a field in its row,
 * then Skip and Submit. Shared by every decision of the chat (ChatTask.tsx) and the agent's questions (PlanPane.tsx).
 */

// Anthropicons codepoints (see /tokens#icons)
const CHEVRON_DOWN = "";
const CHEVRON_LEFT = "";
const CHEVRON_RIGHT = "";
const CLOSE = "";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/** What the dock gives the decision it shows: where it is in the queue, and the dock's own controls. */
export type DockNav = {
  index: number;
  count: number;
  prev: () => void;
  next: () => void;
  collapsed: boolean;
  toggle: () => void;
  close: () => void;
  /** To the next decision without answering; on the last one, folds the dock. */
  skip: () => void;
};

/** The option's number as a key cap, like the shortcut hints of the original app. */
export function Keycap({ children }: { children: ReactNode }) {
  return (
    <span data-cds="Shortcut" data-variant="keycap" aria-hidden="true" className="inline-flex shrink-0 items-center text-caption">
      <kbd className="inline-flex h-[calc(1em+6px)] w-[calc(1em+6px)] shrink-0 items-center justify-center rounded-[var(--cds-keycap-radius,4px)] border border-[color:var(--cds-shortcut-cap-line)] bg-[color:var(--cds-shortcut-cap-fill)] px-0 font-inherit tabular-nums [color:var(--cds-shortcut-cap-ink)] [font-variation-settings:inherit] [line-height:1]">
        {children}
      </kbd>
    </span>
  );
}

/**
 * One option: the title (the recommended one says so), a muted description under it, anything the option opens
 * (the plan changes it makes, a field), and its number on the right. The fill brightens on hover, stronger when picked.
 */
export function OptionRow({
  n,
  title,
  recommended,
  description,
  selected,
  disabled,
  onSelect,
  children,
}: {
  n: number;
  title: ReactNode;
  recommended?: boolean;
  description?: ReactNode;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  children?: ReactNode;
}) {
  return (
    <div
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onSelect()}
      onKeyDown={(e) => {
        if (e.key === " " && e.target === e.currentTarget && !disabled) {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cx(
        "flex items-center gap-md rounded px-1.5 py-sm text-left outline-none transition-colors duration-fast focus-visible:shadow-focus",
        disabled
          ? "bg-alpha-1 opacity-disabled"
          : cx("cursor-[var(--cds-cursor-interactive)]", selected ? "bg-alpha-2 shadow-[inset_0_0_0_1px_var(--cds-alpha-5)]" : "bg-alpha-1 hover:bg-alpha-2"),
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-body text-primary">
          {title}
          {recommended && " (Recommended)"}
        </span>
        {description && <div className="text-footnote text-muted">{description}</div>}
        {children}
      </div>
      <Keycap>{n}</Keycap>
    </div>
  );
}

/** The field inside the "Other" row (or "Correct it"): plain, on the row's fill, submits on Enter. */
export function RowField({
  value,
  onChange,
  onEnter,
  onFocus,
  placeholder,
  label,
  ref,
}: {
  ref?: Ref<HTMLInputElement>;
  value: string;
  onChange: (v: string) => void;
  onEnter: () => void;
  onFocus?: () => void;
  placeholder: string;
  label: string;
}) {
  return (
    <input
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={onFocus}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onEnter();
        }
      }}
      placeholder={placeholder}
      aria-label={label}
      className="w-full bg-transparent py-0.5 text-body text-primary outline-none placeholder:text-muted"
    />
  );
}

/**
 * The dock itself: header (question, a tag, "1 of N", collapse, close), the body, and one footer — a quiet
 * control on the left, Skip and Submit on the right. Number keys pick an option and Enter submits while the
 * dock has focus or nothing else does; typing in a field or the composer is left alone.
 */
export function DockFrame({
  nav,
  title,
  tag,
  count,
  pick,
  canSubmit,
  onSubmit,
  submitLabel = "Submit",
  left,
  lead,
  children,
}: {
  nav: DockNav;
  title: ReactNode;
  /** What the question is about, right under it (e.g. the assumption itself), before the options. */
  lead?: ReactNode;
  /** Next to the question: "Blocking" in clay (it needs you), "Can wait" muted. */
  tag?: ReactNode;
  /** Options that number keys can pick, 1 to count. */
  count: number;
  pick: (i: number) => void;
  canSubmit: boolean;
  onSubmit: () => void;
  submitLabel?: string;
  left?: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const keys = useRef({ count, pick, canSubmit, onSubmit });
  keys.current = { count, pick, canSubmit, onSubmit };

  useEffect(() => {
    if (nav.collapsed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = document.activeElement as HTMLElement | null;
      const idle = !t || t === document.body;
      if (!idle && !ref.current?.contains(t)) return;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const k = keys.current;
      if (/^[1-9]$/.test(e.key)) {
        const i = Number(e.key) - 1;
        if (i < k.count) {
          e.preventDefault();
          k.pick(i);
        }
      } else if (e.key === "Enter" && t?.tagName !== "BUTTON" && k.canSubmit) {
        e.preventDefault();
        k.onSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nav.collapsed]);

  return (
    <section
      ref={ref}
      aria-label="Decision"
      className="not-prose mb-xs flex max-h-[min(60vh,560px)] flex-col rounded-lg border border-alpha-2 bg-surface-2 p-2"
    >
      {/* The header is inset like the text inside the option rows: the same distance from the top, left and right edges.
          The icon buttons' own padding makes up the difference on the right. */}
      <div className="flex items-start gap-sm ps-1.5 pe-1">
        <p className="min-w-0 flex-1 pt-0.5 text-body font-medium text-primary">
          {title}
          {tag && <span className="ms-sm text-footnote font-normal">{tag}</span>}
        </p>
        <div className="flex shrink-0 items-center gap-0.5 text-footnote tabular-nums text-muted">
          {nav.count > 1 && (
            <>
              <span className="me-0.5">
                {nav.index + 1} of {nav.count}
              </span>
              <Button size="xs" icon={CHEVRON_LEFT} aria-label="Previous decision" disabled={nav.index === 0} onClick={nav.prev} className="text-muted" />
              <Button size="xs" icon={CHEVRON_RIGHT} aria-label="Next decision" disabled={nav.index === nav.count - 1} onClick={nav.next} className="text-muted" />
            </>
          )}
          <Button
            size="xs"
            icon={CHEVRON_DOWN}
            aria-label={nav.collapsed ? "Expand" : "Collapse"}
            aria-expanded={!nav.collapsed}
            onClick={nav.toggle}
            className={cx("text-muted [&>[data-cds=Icon]]:transition-transform [&>[data-cds=Icon]]:duration-fast", nav.collapsed && "[&>[data-cds=Icon]]:rotate-180")}
          />
          <Button size="xs" icon={CLOSE} aria-label="Hide" title="Hide" onClick={nav.close} className="text-muted" />
        </div>
      </div>
      {!nav.collapsed && (
        <>
          {/* What the question is about: the full width under the header, not squeezed beside its controls in a narrow chat. */}
          {lead && <div className="mt-sm ps-1.5 pe-1">{lead}</div>}
          <div className="-mx-1 mt-lg flex min-h-0 flex-col gap-md overflow-y-auto px-1">{children}</div>
          <div className="mt-md flex flex-wrap items-center justify-end gap-xs">
            {/* Ghost button: its text, not its box, lines up with the options' text. */}
            {left && <span className="me-auto ms-0.5 flex items-center">{left}</span>}
            <Button size="sm" variant="secondary" onClick={nav.skip}>
              Skip
            </Button>
            <Button size="sm" variant="primary" disabled={!canSubmit} onClick={onSubmit}>
              {submitLabel}
            </Button>
          </div>
        </>
      )}
    </section>
  );
}

/** The options as a radio group with ~6px between rows. */
export function OptionList({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-col gap-xs">
      {children}
    </div>
  );
}
