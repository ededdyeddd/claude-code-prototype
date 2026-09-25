import type { ReactNode } from "react";
import { Icon } from "./index";

/** Two-column responsive grid for ListCards. */
export function CardGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-x-md gap-y-xs md:grid-cols-2">{children}</div>;
}

/**
 * Clickable card: icon tile, title, description and a meta line (schedule, trigger…).
 * Uses the design-system Card/CardLink pair, so the hover fill (surface-2) comes from the DS CSS.
 */
export function ListCard({
  icon,
  title,
  description,
  metaIcon,
  meta,
  onClick,
}: {
  icon: string;
  title: string;
  description?: string;
  metaIcon?: string;
  meta?: string;
  onClick?: () => void;
}) {
  return (
    <div data-cds="Card" className="relative isolate rounded-lg">
      <div className="cds-card-fill absolute inset-0 -z-[1] rounded-[inherit] transition-colors duration-fast" />
      <button
        type="button"
        data-cds="CardLink"
        onClick={onClick}
        className="flex w-full items-start gap-md rounded-[inherit] p-sm text-left outline-none focus-visible:shadow-focus cursor-[var(--cds-cursor-interactive)]"
      >
        <span className="flex size-[var(--cds-h-control)] shrink-0 items-center justify-center rounded border border-alpha-2 bg-alpha-1">
          <Icon glyph={icon} />
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-body text-primary" style={{ fontWeight: "var(--cds-font-weight-medium)" }}>
            {title}
          </span>
          {description && <span className="text-body text-secondary">{description}</span>}
          {meta && (
            <span className="mt-0.5 flex items-center gap-1.5 text-footnote text-muted">
              {metaIcon && <Icon glyph={metaIcon} className="!text-muted" style={{ fontSize: "0.875rem" }} />}
              {meta}
            </span>
          )}
        </span>
      </button>
    </div>
  );
}
