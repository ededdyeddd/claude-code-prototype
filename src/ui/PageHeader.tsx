import type { ReactNode } from "react";

/**
 * Title of a full page (Routines, Artifacts, Customize…): serif title,
 * then a row with tabs/filters on the left and actions on the right.
 */
export function PageHeader({ title, tabs, actions }: { title: string; tabs?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="flex flex-col gap-md">
      <h1
        className="font-serif text-primary"
        style={{
          fontSize: "var(--cds-page-header-title-size)",
          lineHeight: "var(--cds-page-header-title-leading)",
          fontWeight: "var(--cds-font-weight-regular)",
        }}
      >
        {title}
      </h1>
      {(tabs || actions) && (
        <div className="flex min-h-[var(--cds-h-control--sm)] items-center justify-between gap-md">
          <div className="min-w-0">{tabs}</div>
          <div className="flex shrink-0 items-center gap-0.5">{actions}</div>
        </div>
      )}
    </header>
  );
}
