import { IconButton } from "./IconButton";
import { SelectorButton } from "./SelectorButton";

export function SelectorControls() {
  return (
    <div className="grid min-w-0 grid-flow-col auto-cols-[minmax(0,max-content)] items-center gap-1">
      <SelectorButton dataId="1" />
      <SelectorButton dataId="2" />
      <IconButton dataId="10" />
      <span role="status" className="sr-only" data-editable-text="true">
        Fast mode off
      </span>
      <span role="status" className="sr-only" />
    </div>
  );
}
