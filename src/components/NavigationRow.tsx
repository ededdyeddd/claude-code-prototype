export function NavigationRow({ label, icon, variant = "standard" }) {
  const className =
    variant === "artifacts"
      ? "w-full shrink-0 border-none text-left text-[length:var(--df-row-font)] text-secondary flex items-center gap-[var(--df-row-gap)] h-[var(--df-row-h)] px-[var(--df-row-px)] [&_.df-leading-slot]:text-secondary data-[selected=focused]:[&_.df-leading-slot]:text-primary hide-focus-ring focus-visible:shadow-[inset_0_0_0_1px_var(--cds-fill-accent),0_0_6px_0_color-mix(in_srgb,var(--cds-fill-accent)_20%,transparent)] rounded-[var(--df-radius-pill)] data-[selected=focused]:text-primary touch:group-data-[touch-menu]:pr-[calc(var(--df-row-px)+var(--df-row-ctl)+4px)]"
      : "w-full shrink-0 border-none text-left text-[length:var(--df-row-font)] text-secondary flex items-center gap-[var(--df-row-gap)] h-[var(--df-row-h)] px-[var(--df-row-px)] [&_.df-leading-slot]:text-secondary data-[selected=focused]:[&_.df-leading-slot]:text-primary rounded-[var(--df-radius-pill)] hover:bg-[var(--df-hover)] focus-visible:bg-[var(--df-hover)] has-[:focus-visible]:bg-[var(--df-hover)] data-[selected=focused]:bg-[var(--df-selected)] data-[selected=focused]:text-primary data-[selected=open]:bg-[var(--df-selected)] data-[menu-open=true]:bg-[var(--df-hover)] data-[context-menu-open=true]:bg-[var(--df-hover)] hide-focus-ring focus-visible:shadow-[inset_0_0_0_1px_var(--cds-fill-accent),0_0_6px_0_color-mix(in_srgb,var(--cds-fill-accent)_20%,transparent)] group";
  return (
    <a
      draggable="false"
      {...(variant === "standard"
        ? {
            "data-row": "",
          }
        : {})}
      className={className}
    >
      <span className="df-leading-slot">
        <span
          data-cds="Icon"
          data-cds-anim=""
          style={{
            fontSize: "calc(1.25rem*var(--cds-rem-scale,1))",
            fontWeight: "433.3",
            "--cds-opsz": "20",
            "--cds-wght": "433.3",
          }}
        >
          {icon}
        </span>
      </span>
      <span className="flex min-w-0 flex-1 items-center">
        <span className="min-w-0 truncate">{label}</span>
      </span>
    </a>
  );
}
