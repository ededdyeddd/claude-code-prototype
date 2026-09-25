import { SectionLabel } from "./SectionLabel";
import { ProjectNav } from "./ProjectNav";

export function SidebarContents() {
  return (
    <div data-kind="code" className="contents">
      <div className="contents">
        <div
          data-testid="sidebar-pinned"
          data-stub=""
          inert
          className="group/section flex flex-col gap-px df-pin-section-reveal"
        >
          <div>
            <div className="group/labelrow df-label-inset flex w-full items-center gap-[var(--df-row-gap)] pt-[var(--df-group-pt)] pr-[calc((var(--df-row-h)-24px)/2)] pb-1 text-[length:var(--df-group-font)] leading-4 min-h-[calc(var(--df-group-pt)+(var(--df-row-h)-8px)+4px)] text-muted">
              <SectionLabel label="Pinned" />
            </div>
          </div>
          <div className="flex h-[var(--df-row-h)] items-center gap-[var(--df-row-gap)] rounded-[var(--df-radius-pill)] px-[var(--df-row-px)] text-[length:var(--df-row-font)] transition-colors text-muted opacity-80">
            <span className="df-leading-slot">
              <span
                data-cds="Icon"
                className="transition-transform"
                style={{
                  fontSize: "calc(1.25rem*var(--cds-rem-scale,1))",
                  fontWeight: "433.3",
                }}
                data-editable-text="true"
              >
                
              </span>
            </span>
            <span data-editable-text="true">Drag to pin</span>
          </div>
        </div>
        <div data-testid="sidebar-recents" className="df-recents-anchor grow shrink-0 min-h-[120px]">
          <ProjectNav />
        </div>
      </div>
    </div>
  );
}
