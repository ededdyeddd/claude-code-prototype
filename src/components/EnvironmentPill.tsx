export function EnvironmentPill({ dataId }) {
  const data = getEnvironmentPillData(dataId);
  return (
    <button
      type="button"
      {...(data.dataPlaceholder !== void 0
        ? {
            "data-placeholder": data.dataPlaceholder,
          }
        : {})}
      tabIndex={0}
      id={data.buttonId}
      {...(data.dataTestId !== void 0
        ? {
            "data-testid": data.dataTestId,
          }
        : {})}
      {...(data.role !== void 0
        ? {
            role: data.role,
          }
        : {})}
      className="relative inline-flex items-center gap-xs h-[var(--pill-h,24px)] px-sm rounded bg-fill-secondary text-secondary text-body shadow-field hover:bg-fill-secondary-hover disabled:bg-fill-disabled disabled:text-disabled aria-[expanded=true]:bg-fill-secondary-hover aria-[expanded=true]:text-primary aria-[expanded=true]:hover:bg-fill-secondary-hover aria-[expanded=true]:hover:text-primary select-none border-0 focus-visible:outline-hidden hide-focus-ring focus-visible:shadow-focus"
    >
      <span
        data-cds="Icon"
        style={{
          fontSize: "calc(1rem*var(--cds-rem-scale,1))",
          fontWeight: "533.3",
        }}
      >
        {data.icon}
      </span>
      <span
        {...(data.labelId !== void 0
          ? {
              id: data.labelId,
            }
          : {})}
        className="truncate max-w-[200px]"
      >
        {data.label}
      </span>
    </button>
  );
}

function getEnvironmentPillData(id) {
  const stringId = String(id);
  const data = {
    "0": {
      buttonId: "_r_d4_",
      icon: "",
      label: "Default",
      dataTestId: "epitaxy-env-pill",
    },
    "1": {
      buttonId: "base-ui-_r_gm_",
      icon: "",
      label: "Select repository…",
      labelId: "_r_gl_",
      dataPlaceholder: "",
      role: "combobox",
    },
  };
  return data[stringId] ?? data["0"];
}
