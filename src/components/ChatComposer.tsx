import { IconButton } from "./IconButton";
import { PromptEditor } from "./PromptEditor";

export function ChatComposer({ placeholder }: { placeholder?: string }) {
  return (
    <div className="bg-surface-3 [--cmp-pad-x:0.5rem] compact:[--cmp-pad-x:0.5rem] comfortable:[--cmp-pad-x:0.5rem] relative z-[1] flex w-full min-w-0 flex-col text-primary rounded-composer px-[var(--cmp-pad-x)] py-2 compact:py-2 comfortable:py-2 [--cmp-gap-y:0.375rem] compact:[--cmp-gap-y:0.375rem] comfortable:[--cmp-gap-y:0.5rem] gap-y-[var(--cmp-gap-y)] [--cmp-type-size:max(var(--cds-font-size-text-entry-floor,0px),var(--cmp-font-size,var(--cds-font-size-prose)))] [--cmp-leading:round(var(--cmp-type-size)*1.4,1px)] [--cmp-row-py:max(0px,(var(--cds-h-control)-var(--cmp-leading))/2)] [--cmp-row-h:calc(var(--cmp-leading)+2*var(--cmp-row-py))] transition-[background-color,border-color,box-shadow,opacity] duration-200 shadow-composer hover:[&:not(:where(:has(button:hover,a:hover,[role=button]:hover,label:hover)))]:shadow-composer-hover focus-within:shadow-composer-focus hover:focus-within:shadow-composer-focus cursor-text">
      <div
        className="relative w-full min-w-0"
        style={{
          "--cmp-lead-w": "0px",
          "--cmp-trail-w": "30px",
        }}
      >
        <div
          className="w-full min-w-0 motion-safe:transition-[padding-left,padding-right,padding-bottom] motion-safe:duration-200 pr-[var(--cmp-trail-w,0px)]"
          style={{
            "--cmp-wrap-h": "20px",
          }}
        >
          <div className="relative min-w-0 break-words">
            <div className="relative min-w-0">
              <span
                data-composer-placeholder=""
                className="pointer-events-none select-none absolute left-0 top-0 max-w-full max-h-96 overflow-hidden [--cmp-type-size:max(var(--cds-font-size-text-entry-floor,0px),var(--cmp-font-size,var(--cds-font-size-prose)))] [--cmp-leading:round(var(--cmp-type-size)*1.4,1px)] [--cmp-row-py:max(0px,(var(--cds-h-control)-var(--cmp-leading))/2)] [--cmp-row-h:calc(var(--cmp-leading)+2*var(--cmp-row-py))] py-[var(--cmp-row-py)] text-[length:var(--cmp-type-size)] leading-[var(--cmp-leading)] font-normal break-words pl-[4px] compact:pl-[4px] comfortable:pl-[6px] transition-opacity duration-200 motion-safe:transition-[opacity,padding-left,padding-right] motion-safe:duration-200 text-muted"
                style={{
                  maxHeight: "min(24rem,40svh)",
                }}
                data-editable-text="true"
              >
                {placeholder ?? "Describe a task or ask a question"}
              </span>
              <div
                data-cds="ChatComposerEditor"
                className="w-full max-h-96 min-h-[var(--cmp-row-h)] overflow-y-auto break-words [--cmp-type-size:max(var(--cds-font-size-text-entry-floor,0px),var(--cmp-font-size,var(--cds-font-size-prose)))] [--cmp-leading:round(var(--cmp-type-size)*1.4,1px)] [--cmp-row-py:max(0px,(var(--cds-h-control)-var(--cmp-leading))/2)] [--cmp-row-h:calc(var(--cmp-leading)+2*var(--cmp-row-py))] py-[var(--cmp-row-py)] text-[length:var(--cmp-type-size)] leading-[var(--cmp-leading)] font-normal transition-opacity duration-200 motion-safe:transition-[opacity,padding-left,padding-right] motion-safe:duration-200 pl-[4px] compact:pl-[4px] comfortable:pl-[6px] [&_.ProseMirror]:![font-feature-settings:inherit] [&_.ProseMirror]:![font-variant-ligatures:inherit] [&_.ProseMirror]:![-webkit-font-variant-ligatures:inherit] [&_.ProseMirror:focus]:outline-none [&_img.ProseMirror-separator]:inline [&_img.ProseMirror-separator]:m-0 [&_img.ProseMirror-separator]:size-0 [&_img.ProseMirror-separator]:border-none [&_.is-editor-empty]:before:!content-[''] [&_ul]:[list-style-type:unset] [&_ul]:pl-8 [&_ol]:[list-style-type:decimal] [&_ol]:pl-8 [&_a]:cursor-pointer [&_a]:font-medium [&_a]:[font-variation-settings:inherit] [&_a]:text-[hsl(214_72%_34%)] dark:[&_a]:text-[hsl(213_80%_79%)] [&_a:hover]:text-[hsl(213_68%_45%)] dark:[&_a:hover]:text-[hsl(212_75%_62%)] [&_.ProseMirror>p>code]:border-[0.5px] [&_.ProseMirror>p>code]:border-solid [&_.ProseMirror>p>code]:border-[hsl(60_2%_12%/0.25)] dark:[&_.ProseMirror>p>code]:border-[hsl(53_12%_87%/0.25)] [&_.ProseMirror>p>code]:bg-[hsl(60_3%_21%/0.05)] dark:[&_.ProseMirror>p>code]:bg-[hsl(55_9%_74%/0.05)] [&_.ProseMirror>p>code]:text-[0.9rem] [&_.ProseMirror>p>code]:text-[hsl(0_58%_35%)] dark:[&_.ProseMirror>p>code]:text-[hsl(0_77%_81%)] [&_.ProseMirror>p>code]:px-[4px] [&_.ProseMirror>p>code]:py-[1px] [&_.ProseMirror>p>code]:rounded-[0.3rem] [&_.ProseMirror>p>code]:whitespace-pre-wrap grid [&>*]:[grid-area:1/1] [&>*]:min-w-0 epitaxy-prompt-input"
                style={{
                  maxHeight: "min(24rem,40svh)",
                }}
              >
                <span
                  className="invisible pointer-events-none select-none max-w-full self-start break-words"
                  data-composer-placeholder-ghost={placeholder ?? "Describe a task or ask a question"}
                />
                <PromptEditor placeholder={placeholder} />
                <span
                  id="skill-arg-hint-sr-u3bxjx"
                  role="status"
                  style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "1px",
                    height: "1px",
                    overflow: "hidden",
                    clip: "rect(0 0 0 0)",
                    clipPath: "inset(50%)",
                    whiteSpace: "nowrap",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div data-cds="ChatComposerActions" className="contents">
          <div className="absolute bottom-0 right-0 flex shrink-0 items-center gap-xs pl-1.5 compact:pl-1.5 comfortable:pl-2 min-h-[var(--cmp-row-h)]">
            <div className="grid shrink-0 items-center justify-items-end">
              <div
                data-cds-part="send-slot"
                className="col-start-1 row-start-1 flex cursor-default items-center transition-[opacity,visibility] duration-fast"
              >
                <div className="flex items-center gap-xs">
                  <div className="grid items-center justify-items-end">
                    <div className="col-start-1 row-start-1 flex cursor-default items-center justify-end">
                      <div className="flex" id="_r_dg_">
                        <IconButton dataId="6" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
