import { IconButton } from "./IconButton";
import { SessionRow } from "./SessionRow";

export function SessionEntry() {
  return (
    <div className="relative df-drag-shiftable" id="base-ui-_r_c4_">
      <div>
        <div
          data-row=""
          className="group relative rounded-[var(--df-radius-pill)] hover:bg-[var(--df-hover)] focus-visible:bg-[var(--df-hover)] has-[:focus-visible]:bg-[var(--df-hover)] data-[selected=focused]:bg-[var(--df-selected)] data-[selected=focused]:text-primary data-[selected=open]:bg-[var(--df-selected)] data-[menu-open=true]:bg-[var(--df-hover)] data-[context-menu-open=true]:bg-[var(--df-hover)]"
        >
          <SessionRow title="Встроенные функции" />
          <div className="absolute right-[calc((var(--df-row-h)-var(--df-row-ctl))/2)] -translate-y-1/2 flex items-center gap-0.5 top-1/2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-has-[:focus-visible]:opacity-100 group-has-[:focus-visible]:pointer-events-auto touch:group-data-[touch-menu]:opacity-100 touch:group-data-[touch-menu]:pointer-events-auto">
            <IconButton dataId="3" />
          </div>
        </div>
      </div>
    </div>
  );
}
