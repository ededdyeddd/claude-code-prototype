import { IconButton } from "./IconButton";
import { Contents } from "./Contents";
import { FileUploadInput } from "./FileUploadInput";
import { SelectorButton } from "./SelectorButton";
import { SplitDropdownControl } from "./SplitDropdownControl";
import { SelectorControls } from "./SelectorControls";

export function ChatComposerChin() {
  return (
    <div
      data-cds="ChatComposerChin"
      className="relative z-0 overflow-clip px-2 -mx-2 pt-2 -mt-2 @container [--cmp-pad-x:0.5rem] compact:[--cmp-pad-x:0.5rem] comfortable:[--cmp-pad-x:0.5rem] [--cmp-chin-start:calc(var(--cmp-pad-x)-1px)] [--cmp-chin-end:calc(var(--cmp-pad-x)+2px)] compact:[--cmp-chin-end:calc(var(--cmp-pad-x)+2px)] comfortable:[--cmp-chin-end:calc(var(--cmp-pad-x)+3px)] pb-2 -mb-2"
    >
      <div className="grid grid-cols-[minmax(0,1fr)] transition-[grid-template-rows] duration-[280ms] ease-out motion-reduce:transition-none grid-rows-[1fr]">
        <div className="min-h-0 transition-[opacity,translate] duration-[280ms] ease-out motion-reduce:transition-none translate-none opacity-100">
          <div
            data-size="xs"
            data-touch-size=""
            className="flex min-h-control items-center gap-0 text-footnote font-normal text-secondary mt-1.5 compact:mt-1.5 comfortable:mt-2 ps-[calc(var(--cmp-chin-start)_-_var(--cmp-chin-touch-grow,0px))] pe-[calc(var(--cmp-chin-end)_-_var(--cmp-chin-touch-grow,0px))] [--cmp-chin-row-h:var(--cds-h-control--xs)] @max-[25rem]:text-caption [&_[data-cds=Button]:not([aria-pressed=true])]:text-secondary [&_[data-cds=Button]]:font-normal justify-between"
          >
            <div className="flex items-center self-start">
              <IconButton dataId="7" />
              <FileUploadInput />
              <SplitDropdownControl />
              <Contents />
              <span className="inline-flex min-w-0">
                <SelectorButton dataId="0" />
              </span>
              <Contents />
            </div>
            <div className="ms-auto flex min-w-0 items-center gap-1 ps-2">
              <SelectorControls />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
