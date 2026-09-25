export function ResizeHandle() {
  return (
    <div
      id="_r_2_"
      data-cds="ResizeHandle"
      role="separator"
      tabIndex={0}
      className="cds-reset group/resize outline-none focus-visible:outline-hidden w-3 cursor-col-resize absolute inset-y-0 end-[calc(-6px_-_(var(--cds-ring-outer,0px)_-_var(--cds-ring-inner,0px))_/_2)] dframe-resize-handle"
    >
      <div className="absolute rounded-full transition-shadow duration-fast group-focus-visible/resize:shadow-focus inset-y-0 left-1/2 w-3 -translate-x-1/2 cursor-col-resize" />
      <div
        data-cds-part="resize-pill"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current transition-[opacity,color,background-color] h-full max-h-12 w-[3px] group-focus-visible/resize:max-h-none text-muted opacity-[var(--cds-resize-pill-force,0)] delay-200 duration-base group-hover/resize:opacity-100 group-focus-visible/resize:bg-fill-accent group-focus-visible/resize:opacity-100 group-focus-visible/resize:delay-0"
      />
    </div>
  );
}
