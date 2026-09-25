import { Blue_dot_right_edge } from "./icons/Blue_dot_right_edge";

export function IconButton({ dataId }) {
  const data = getIconButtonData(dataId);
  return (
    <button
      type="button"
      {...(data.disabled !== void 0
        ? {
            disabled: data.disabled,
          }
        : {})}
      data-cds="Button"
      data-cds-icon-only=""
      data-cds-ghost=""
      {...(data.size !== void 0
        ? {
            "data-size": data.size,
          }
        : {})}
      className={data.className}
      {...(data.tabIndex !== void 0
        ? {
            tabIndex: data.tabIndex,
          }
        : {})}
      {...(data.testId !== void 0
        ? {
            "data-testid": data.testId,
          }
        : {})}
      {...(data.id !== void 0
        ? {
            id: data.id,
          }
        : {})}
      {...(data.style !== void 0
        ? {
            style: data.style,
          }
        : {})}
    >
      <span className={data.paintWrapperClassName}>
        <span
          data-cds-part="paint"
          className="absolute inset-0 rounded-[inherit] transition-[background-color,box-shadow,color] duration-fast ease-out group-focus-visible/btn:shadow-[inset_0_0_0_1px_var(--cds-page-bg)] group-[[data-initial-focus]:focus]/btn:shadow-[inset_0_0_0_1px_var(--cds-page-bg)] bg-transparent group-hover/btn:bg-fill-ghost-hover group-[[aria-haspopup][aria-expanded=true]]/btn:bg-fill-ghost-hover group-aria-pressed/btn:bg-accent group-hover/btn:group-aria-pressed/btn:bg-accent"
        />
      </span>
      <span className="inline-flex min-w-0 items-center gap-1">
        {data.content.kind === "blueDot" ? (
          <Blue_dot_right_edge />
        ) : (
          <span
            data-cds="Icon"
            {...(data.content.iconClassName !== void 0
              ? {
                  className: data.content.iconClassName,
                }
              : {})}
            style={data.content.iconStyle}
          >
            {data.content.glyph}
          </span>
        )}
      </span>
    </button>
  );
}

function getIconButtonData(id) {
  switch (String(id)) {
    case "0":
      return {
        className:
          "cds-reset group/btn relative isolate inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap select-none cursor-[var(--cds-cursor-interactive)] aria-disabled:cursor-default data-[disabled]:cursor-default border-0 outline-none focus-visible:outline-hidden [&[data-initial-focus]:focus]:outline-hidden rounded h-control font-sans text-body [&:disabled:not([aria-busy])]:opacity-disabled disabled:pointer-events-none transition-shadow duration-fast text-primary font-normal aria-pressed:text-accent focus-visible:shadow-focus [&[data-initial-focus]:focus]:shadow-focus aspect-square w-control px-0 df-chrome-btn",
        size: "xs",
        tabIndex: void 0,
        id: "_r_5_",
        disabled: void 0,
        testId: void 0,
        style: void 0,
        paintWrapperClassName: "absolute -z-[1] rounded-[inherit] inset-0 cds-btn-squish",
        content: {
          kind: "icon",
          glyph: "",
          iconClassName: void 0,
          iconStyle: {
            fontSize: "calc(1rem*var(--cds-rem-scale,1))",
            fontWeight: "533.3",
          },
        },
      };
    case "1":
      return {
        className:
          "cds-reset group/btn relative isolate inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap select-none cursor-[var(--cds-cursor-interactive)] aria-disabled:cursor-default data-[disabled]:cursor-default border-0 outline-none focus-visible:outline-hidden [&[data-initial-focus]:focus]:outline-hidden rounded font-sans text-body [&:disabled:not([aria-busy])]:opacity-disabled disabled:pointer-events-none transition-shadow duration-fast font-normal aria-pressed:text-accent focus-visible:shadow-focus [&[data-initial-focus]:focus]:shadow-focus aspect-square px-0 size-[var(--df-row-ctl)] text-secondary hover:text-primary aria-expanded:text-primary",
        size: "xs",
        tabIndex: "-1",
        id: "_r_c9_",
        disabled: void 0,
        testId: void 0,
        style: void 0,
        paintWrapperClassName: "absolute -z-[1] rounded-[inherit] inset-0 cds-btn-squish",
        content: {
          kind: "icon",
          glyph: "",
          iconClassName: void 0,
          iconStyle: {
            fontSize: "calc(1rem*var(--cds-rem-scale,1))",
            fontWeight: "533.3",
          },
        },
      };
    case "2":
      return {
        className:
          "cds-reset group/btn isolate inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap select-none cursor-[var(--cds-cursor-interactive)] aria-disabled:cursor-default data-[disabled]:cursor-default border-0 outline-none focus-visible:outline-hidden [&[data-initial-focus]:focus]:outline-hidden rounded h-control font-sans text-body [&:disabled:not([aria-busy])]:opacity-disabled disabled:pointer-events-none transition-shadow duration-fast text-primary font-normal aria-pressed:text-accent focus-visible:shadow-focus [&[data-initial-focus]:focus]:shadow-focus aspect-square w-control px-0 df-chrome-btn relative -my-1",
        size: "xs",
        tabIndex: "0",
        id: "_r_br_",
        disabled: void 0,
        testId: void 0,
        style: void 0,
        paintWrapperClassName: "absolute -z-[1] rounded-[inherit] inset-0 cds-btn-squish",
        content: {
          kind: "icon",
          glyph: "",
          iconClassName: void 0,
          iconStyle: {
            fontSize: "calc(1rem*var(--cds-rem-scale,1))",
            fontWeight: "533.3",
          },
        },
      };
    case "3":
      return {
        className:
          "cds-reset group/btn relative isolate inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap select-none cursor-[var(--cds-cursor-interactive)] aria-disabled:cursor-default data-[disabled]:cursor-default border-0 outline-none focus-visible:outline-hidden [&[data-initial-focus]:focus]:outline-hidden rounded font-sans text-body [&:disabled:not([aria-busy])]:opacity-disabled disabled:pointer-events-none transition-shadow duration-fast font-normal aria-pressed:text-accent focus-visible:shadow-focus [&[data-initial-focus]:focus]:shadow-focus aspect-square px-0 size-[var(--df-row-ctl)] text-secondary hover:text-primary aria-expanded:text-primary",
        size: "xs",
        tabIndex: "-1",
        id: void 0,
        disabled: void 0,
        testId: void 0,
        style: void 0,
        paintWrapperClassName: "absolute -z-[1] rounded-[inherit] inset-0 cds-btn-squish",
        content: {
          kind: "icon",
          glyph: "",
          iconClassName: void 0,
          iconStyle: {
            fontSize: "calc(1rem*var(--cds-rem-scale,1))",
            fontWeight: "533.3",
          },
        },
      };
    case "4":
      return {
        className:
          "cds-reset group/btn relative isolate inline-flex items-center justify-center gap-1.5 whitespace-nowrap select-none cursor-[var(--cds-cursor-interactive)] aria-disabled:cursor-default data-[disabled]:cursor-default border-0 outline-none focus-visible:outline-hidden [&[data-initial-focus]:focus]:outline-hidden rounded h-control font-sans text-body [&:disabled:not([aria-busy])]:opacity-disabled disabled:pointer-events-none transition-shadow duration-fast font-normal aria-pressed:text-accent focus-visible:shadow-focus [&[data-initial-focus]:focus]:shadow-focus aspect-square w-control px-0 shrink-0 text-muted hover:text-primary",
        size: void 0,
        tabIndex: void 0,
        id: void 0,
        disabled: void 0,
        testId: void 0,
        style: void 0,
        paintWrapperClassName: "absolute -z-[1] rounded-[inherit] inset-0 cds-btn-squish",
        content: {
          kind: "icon",
          glyph: "",
          iconClassName: void 0,
          iconStyle: {
            fontSize: "calc(1.25rem*var(--cds-rem-scale,1))",
            fontWeight: "433.3",
          },
        },
      };
    case "5":
      return {
        className:
          "cds-reset group/btn relative isolate inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap select-none cursor-[var(--cds-cursor-interactive)] aria-disabled:cursor-default data-[disabled]:cursor-default border-0 outline-none focus-visible:outline-hidden [&[data-initial-focus]:focus]:outline-hidden rounded h-control font-sans text-body [&:disabled:not([aria-busy])]:opacity-disabled disabled:pointer-events-none transition-shadow duration-fast text-primary font-normal aria-pressed:text-accent focus-visible:shadow-focus [&[data-initial-focus]:focus]:shadow-focus aspect-square w-control px-0 df-chrome-btn",
        size: void 0,
        tabIndex: void 0,
        id: "_r_cj_",
        disabled: "",
        testId: "code-sidebar-feedback-button",
        style: void 0,
        paintWrapperClassName: "absolute -z-[1] rounded-[inherit] inset-0 cds-btn-squish",
        content: {
          kind: "icon",
          glyph: "",
          iconClassName: void 0,
          iconStyle: {
            fontSize: "calc(1.25rem*var(--cds-rem-scale,1))",
            fontWeight: "433.3",
          },
        },
      };
    case "6":
      return {
        className:
          "cds-reset group/btn relative isolate inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap select-none cursor-[var(--cds-cursor-interactive)] aria-disabled:cursor-default data-[disabled]:cursor-default border-0 outline-none focus-visible:outline-hidden [&[data-initial-focus]:focus]:outline-hidden rounded h-control font-sans text-body [&:disabled:not([aria-busy])]:opacity-disabled disabled:pointer-events-none transition-shadow duration-fast text-primary font-normal aria-pressed:text-accent focus-visible:shadow-focus [&[data-initial-focus]:focus]:shadow-focus aspect-square w-control px-0",
        size: void 0,
        tabIndex: void 0,
        id: void 0,
        disabled: "",
        testId: "code-prompt-send",
        style: void 0,
        paintWrapperClassName: "absolute -z-[1] rounded-[inherit] inset-0 cds-btn-squish",
        content: {
          kind: "icon",
          glyph: "",
          iconClassName: void 0,
          iconStyle: {
            fontSize: "calc(1rem*var(--cds-rem-scale,1))",
            fontWeight: "533.3",
          },
        },
      };
    case "7":
      return {
        className:
          "cds-reset group/btn relative isolate inline-flex items-center justify-center gap-1.5 whitespace-nowrap select-none cursor-[var(--cds-cursor-interactive)] aria-disabled:cursor-default data-[disabled]:cursor-default border-0 outline-none focus-visible:outline-hidden [&[data-initial-focus]:focus]:outline-hidden rounded h-control font-sans text-body [&:disabled:not([aria-busy])]:opacity-disabled disabled:pointer-events-none transition-shadow duration-fast text-primary font-normal aria-pressed:text-accent focus-visible:shadow-focus [&[data-initial-focus]:focus]:shadow-focus aspect-square w-control px-0 shrink-0",
        size: void 0,
        tabIndex: "0",
        id: "_r_dm_",
        disabled: void 0,
        testId: void 0,
        style: void 0,
        paintWrapperClassName: "absolute -z-[1] rounded-[inherit] inset-0 cds-btn-squish",
        content: {
          kind: "icon",
          glyph: "",
          iconClassName:
            "text-secondary group-hover/btn:text-primary group-aria-pressed/btn:text-accent group-hover/btn:group-aria-pressed/btn:text-accent",
          iconStyle: {
            fontSize: "calc(1rem*var(--cds-rem-scale,1))",
            fontWeight: "533.3",
          },
        },
      };
    case "8":
      return {
        className:
          "cds-reset group/btn relative isolate inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap select-none cursor-[var(--cds-cursor-interactive)] aria-disabled:cursor-default data-[disabled]:cursor-default border-0 outline-none focus-visible:outline-hidden [&[data-initial-focus]:focus]:outline-hidden rounded h-control font-sans text-body [&:disabled:not([aria-busy])]:opacity-disabled disabled:pointer-events-none transition-shadow duration-fast text-primary font-normal aria-pressed:text-accent focus-visible:shadow-focus [&[data-initial-focus]:focus]:shadow-focus aspect-square w-control px-0 group-data-[popup-open]/split:pointer-events-none",
        size: void 0,
        tabIndex: void 0,
        id: "_r_dr_",
        disabled: void 0,
        testId: void 0,
        style: void 0,
        paintWrapperClassName: "absolute -z-[1] rounded-[inherit] inset-0",
        content: {
          kind: "icon",
          glyph: "",
          iconClassName:
            "text-secondary group-hover/btn:text-primary group-aria-pressed/btn:text-accent group-hover/btn:group-aria-pressed/btn:text-accent",
          iconStyle: {
            fontSize: "calc(1rem*var(--cds-rem-scale,1))",
            fontWeight: "533.3",
          },
        },
      };
    case "9":
      return {
        className:
          "cds-reset group/btn relative isolate inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap select-none cursor-[var(--cds-cursor-interactive)] aria-disabled:cursor-default data-[disabled]:cursor-default border-0 outline-none focus-visible:outline-hidden [&[data-initial-focus]:focus]:outline-hidden rounded h-control font-sans text-body [&:disabled:not([aria-busy])]:opacity-disabled disabled:pointer-events-none transition-shadow duration-fast text-primary font-normal aria-pressed:text-accent focus-visible:shadow-focus [&[data-initial-focus]:focus]:shadow-focus aspect-square w-control px-0 after:absolute after:inset-y-0 after:content-[''] pointer-events-none after:pointer-events-auto after:start-[calc(var(--cds-split-caret-tuck)-1px)] after:-end-[calc(3px+var(--cds-split-caret-tuck))]",
        size: void 0,
        tabIndex: "0",
        id: "base-ui-_r_e1_",
        disabled: void 0,
        testId: void 0,
        style: {
          aspectRatio: "auto",
          paddingInline: "4px",
          minWidth: "0px",
          width: "auto",
          "--cds-split-caret-tuck": "calc((var(--cds-h-control) - calc(1rem*var(--cds-rem-scale,1)))/2)",
          marginInlineStart: "calc(-1*calc((var(--cds-h-control) - calc(1rem*var(--cds-rem-scale,1)))/2))",
        },
        paintWrapperClassName: "absolute -z-[1] rounded-[inherit] inset-0",
        content: {
          kind: "icon",
          glyph: "",
          iconClassName: "text-muted",
          iconStyle: {
            fontSize: "calc(0.75rem*var(--cds-rem-scale,1))",
            fontWeight: "577.8",
          },
        },
      };
    case "10":
      return {
        className:
          "cds-reset group/btn relative isolate inline-flex items-center justify-center gap-1.5 whitespace-nowrap select-none cursor-[var(--cds-cursor-interactive)] aria-disabled:cursor-default data-[disabled]:cursor-default border-0 outline-none focus-visible:outline-hidden [&[data-initial-focus]:focus]:outline-hidden rounded h-control font-sans text-body [&:disabled:not([aria-busy])]:opacity-disabled disabled:pointer-events-none transition-shadow duration-fast text-primary font-normal aria-pressed:text-accent focus-visible:shadow-focus [&[data-initial-focus]:focus]:shadow-focus aspect-square w-control px-0 shrink-0",
        size: void 0,
        tabIndex: "0",
        id: "_r_ek_",
        disabled: void 0,
        testId: void 0,
        style: void 0,
        paintWrapperClassName: "absolute -z-[1] rounded-[inherit] inset-0 cds-btn-squish",
        content: {
          kind: "blueDot",
        },
      };
    default:
      return {
        className:
          "cds-reset group/btn relative isolate inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap select-none cursor-[var(--cds-cursor-interactive)] aria-disabled:cursor-default data-[disabled]:cursor-default border-0 outline-none focus-visible:outline-hidden [&[data-initial-focus]:focus]:outline-hidden rounded h-control font-sans text-body [&:disabled:not([aria-busy])]:opacity-disabled disabled:pointer-events-none transition-shadow duration-fast text-primary font-normal aria-pressed:text-accent focus-visible:shadow-focus [&[data-initial-focus]:focus]:shadow-focus aspect-square w-control px-0 df-chrome-btn",
        size: "xs",
        tabIndex: void 0,
        id: "_r_5_",
        disabled: void 0,
        testId: void 0,
        style: void 0,
        paintWrapperClassName: "absolute -z-[1] rounded-[inherit] inset-0 cds-btn-squish",
        content: {
          kind: "icon",
          glyph: "",
          iconClassName: void 0,
          iconStyle: {
            fontSize: "calc(1rem*var(--cds-rem-scale,1))",
            fontWeight: "533.3",
          },
        },
      };
  }
}
