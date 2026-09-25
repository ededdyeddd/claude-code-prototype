export function SelectorButton({ dataId }) {
  const data = getSelectorButtonData(dataId);
  return (
    <button
      type="button"
      data-cds={data.cds}
      data-cds-ghost=""
      className={data.className}
      {...(data.testId
        ? {
            "data-testid": data.testId,
          }
        : {})}
      tabIndex={0}
      id={data.id}
    >
      <span className="absolute -z-[1] rounded-[inherit] inset-0 cds-btn-squish">
        <span
          data-cds-part="paint"
          className="absolute inset-0 rounded-[inherit] transition-[background-color,box-shadow,color] duration-fast ease-out group-focus-visible/btn:shadow-[inset_0_0_0_1px_var(--cds-page-bg)] group-[[data-initial-focus]:focus]/btn:shadow-[inset_0_0_0_1px_var(--cds-page-bg)] bg-transparent group-hover/btn:bg-fill-ghost-hover group-[[aria-haspopup][aria-expanded=true]]/btn:bg-fill-ghost-hover group-aria-pressed/btn:bg-accent group-hover/btn:group-aria-pressed/btn:bg-accent"
        />
      </span>
      <span className="inline-flex min-w-0 items-center gap-1">
        {data.labelVariant === "grid" ? (
          <span className="grid grid-cols-[minmax(0,1fr)]">
            <span className="overflow-x-clip text-ellipsis whitespace-nowrap">{data.label}</span>
          </span>
        ) : (
          <span className={data.labelVariant === "truncate" ? "truncate" : "min-w-0 truncate"}>{data.label}</span>
        )}
      </span>
    </button>
  );
}

function getSelectorButtonData(id) {
  const key = String(id);
  const data = {
    "0": {
      cds: "Button",
      className:
        "cds-reset group/btn relative isolate inline-flex items-center justify-center gap-1.5 whitespace-nowrap select-none cursor-[var(--cds-cursor-interactive)] aria-disabled:cursor-default data-[disabled]:cursor-default border-0 outline-none focus-visible:outline-hidden [&amp;[data-initial-focus]:focus]:outline-hidden rounded h-control font-sans text-body [&amp;:disabled:not([aria-busy])]:opacity-disabled disabled:pointer-events-none transition-shadow duration-fast text-primary font-normal aria-pressed:text-accent focus-visible:shadow-focus [&amp;[data-initial-focus]:focus]:shadow-focus px-md min-w-0 shrink",
      id: "_r_e6_",
      label: "Auto",
      labelVariant: "grid",
    },
    "1": {
      cds: "ModelSelector",
      className:
        "cds-reset group/btn relative isolate inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap select-none cursor-[var(--cds-cursor-interactive)] aria-disabled:cursor-default data-[disabled]:cursor-default border-0 outline-none focus-visible:outline-hidden [&amp;[data-initial-focus]:focus]:outline-hidden rounded h-control font-sans text-body [&amp;:disabled:not([aria-busy])]:opacity-disabled disabled:pointer-events-none transition-shadow duration-fast text-primary font-normal aria-pressed:text-accent focus-visible:shadow-focus [&amp;[data-initial-focus]:focus]:shadow-focus px-md min-w-0 max-w-full",
      testId: "epitaxy-cds-model-selector",
      id: "base-ui-_r_eh_",
      label: "Opus 5.5",
      labelVariant: "truncate",
    },
    "2": {
      cds: "ModelSelectorEffort",
      className:
        "cds-reset group/btn relative isolate inline-flex items-center justify-center gap-1.5 whitespace-nowrap select-none cursor-[var(--cds-cursor-interactive)] aria-disabled:cursor-default data-[disabled]:cursor-default border-0 outline-none focus-visible:outline-hidden [&amp;[data-initial-focus]:focus]:outline-hidden rounded h-control font-sans text-body [&amp;:disabled:not([aria-busy])]:opacity-disabled disabled:pointer-events-none transition-shadow duration-fast text-primary font-normal aria-pressed:text-accent focus-visible:shadow-focus [&amp;[data-initial-focus]:focus]:shadow-focus px-md min-w-0 shrink-0",
      id: "_r_gq_",
      label: "Medium",
      labelVariant: "min-w-truncate",
    },
  };
  return data[key] ?? data["0"];
}
