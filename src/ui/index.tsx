/**
 * Design-system primitives for NEW UI.
 *
 * They follow the markup of the original app (data-cds="Button", a "paint" layer, data-size),
 * so the compiled design-system CSS styles them, and they only use --cds-* tokens.
 * See docs/DESIGN_GUIDE.md and the live catalog at /tokens.
 */
import type { ButtonHTMLAttributes, CSSProperties, ReactNode, Ref } from "react";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/* ------------------------------------------------------------------ Theme */

export type Mode = "dark" | "light";
export type Density = "comfortable" | "compact";

/** Scope that switches tokens: every --cds-* value resolves for this mode/density. */
export function Theme({
  mode = "dark",
  density = "comfortable",
  className,
  style,
  children,
}: {
  mode?: Mode;
  density?: Density;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div
      className={cx("cds-root text-primary", className)}
      data-mode={mode}
      data-density={density}
      data-font="anthropic"
      style={{ fontSize: "var(--cds-font-size-body)", "--cds-page-bg": "var(--cds-surface-1)", ...style }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------- Icon */

/** Anthropicons glyph. Pick codepoints at /tokens#icons, e.g. <Icon glyph={""} />. */
export function Icon({ glyph, className, style }: { glyph: string; className?: string; style?: CSSProperties }) {
  return (
    <span data-cds="Icon" aria-hidden="true" className={className} style={style}>
      {glyph}
    </span>
  );
}

/* ----------------------------------------------------------------- Button */

export type ButtonVariant = "ghost" | "secondary" | "primary" | "accent" | "danger";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

const PAINT: Record<ButtonVariant, string> = {
  ghost: "bg-transparent group-hover/btn:bg-fill-ghost-hover",
  secondary: "bg-fill-secondary group-hover/btn:bg-fill-secondary-hover",
  primary: "bg-fill-primary group-hover/btn:bg-fill-primary-hover",
  accent: "bg-fill-accent group-hover/btn:bg-fill-accent-hover",
  danger: "bg-fill-danger group-hover/btn:bg-fill-danger-hover",
};

const TEXT: Record<ButtonVariant, string> = {
  ghost: "text-primary",
  secondary: "text-primary",
  primary: "text-on-primary",
  accent: "text-on-accent",
  danger: "text-on-danger",
};

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Leading icon glyph (Anthropicons codepoint). Without children the button is square. */
  icon?: string;
  ref?: Ref<HTMLButtonElement>;
  /** Trailing icon, e.g. a chevron for buttons that open a menu. */
  trailingIcon?: string;
  children?: ReactNode;
};

export function Button({
  variant = "ghost",
  size = "md",
  icon,
  trailingIcon,
  children,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  const iconOnly = icon && !children;
  return (
    <button
      type={type}
      data-cds="Button"
      {...(variant === "ghost" ? { "data-cds-ghost": "" } : {})}
      {...(iconOnly ? { "data-cds-icon-only": "" } : {})}
      data-size={size === "md" ? undefined : size}
      className={cx(
        "cds-reset group/btn relative isolate inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap select-none",
        "cursor-[var(--cds-cursor-interactive)] border-0 outline-none focus-visible:outline-hidden rounded h-control font-sans text-body",
        "transition-shadow duration-fast focus-visible:shadow-focus disabled:opacity-disabled disabled:pointer-events-none",
        iconOnly ? "aspect-square w-control px-0" : "px-md",
        TEXT[variant],
        className
      )}
      {...rest}
    >
      <span className="absolute -z-[1] rounded-[inherit] inset-0 cds-btn-squish">
        <span
          data-cds-part="paint"
          className={cx("absolute inset-0 rounded-[inherit] transition-[background-color,box-shadow,color] duration-fast ease-out", PAINT[variant])}
        />
      </span>
      {icon && <Icon glyph={icon} className={variant === "ghost" ? undefined : "!text-current"} />}
      {children != null && <span className="inline-flex min-w-0 items-center truncate">{children}</span>}
      {trailingIcon && <Icon glyph={trailingIcon} className="-me-0.5 !text-current opacity-70" />}
    </button>
  );
}

export { Tabs } from "./Tabs";
export { PageHeader } from "./PageHeader";
export { EmptyState, StopwatchIllustration } from "./EmptyState";
export { WavyDivider } from "./WavyDivider";
export { ListCard, CardGrid } from "./ListCard";
export { Menu, MenuItem, MenuCheckboxItem, MenuSelectItem, MenuSeparator } from "./Menu";
