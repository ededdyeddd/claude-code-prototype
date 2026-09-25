export function SegmentedControlThumb() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-clip rounded">
      <div
        className="invisible absolute left-0 origin-left rounded-[calc(var(--cds-radius)-1px)] bg-[var(--cds-segmented-control-thumb)] top-px bottom-px [box-shadow:inset_0_0_0_1px_var(--cds-border),0_1px_2px_0_rgb(0_0_0/0.05)]"
        style={{
          width: "34px",
          transform: "translateX(35px)",
          visibility: "inherit",
          willChange: "transform",
        }}
      />
    </div>
  );
}
