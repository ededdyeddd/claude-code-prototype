export function ModeRadio({ id, mode, checked }) {
  const icon = mode === "cowork" ? "" : "";
  return (
    <span
      role="radio"
      tabIndex={checked ? 0 : -1}
      id={id}
      className="cds-reset relative z-[1] inline-flex h-full items-center justify-center gap-1.5 select-none border-0 bg-transparent outline-none focus-visible:outline-hidden rounded-[calc(var(--cds-radius)-2px)] text-body font-normal [&:not([data-disabled])]:hover:text-primary data-[checked]:text-primary data-[disabled]:opacity-disabled transition-shadow duration-fast focus-visible:shadow-focus text-muted aspect-square"
      data-mode={mode}
      {...(checked
        ? {
            "data-checked": "",
          }
        : {
            "data-unchecked": "",
          })}
    >
      <span
        data-cds="Icon"
        style={{
          fontSize: "calc(1.25rem*var(--cds-rem-scale,1))",
          fontWeight: "433.3",
        }}
      >
        {icon}
      </span>
    </span>
  );
}
