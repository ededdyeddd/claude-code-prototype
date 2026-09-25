import { IconButton } from "./IconButton";

export function SplitDropdownControl() {
  return (
    <div className="[&_[data-cds=SplitDropdownButton]_button:not([aria-haspopup=menu])]:rounded-e-none [&_[data-cds=SplitDropdownButton]_button[aria-haspopup=menu]]:rounded-s-none flex shrink-0 items-center empty:hidden gap-xs">
      <div
        data-cds="SplitDropdownButton"
        role="group"
        className="relative inline-flex w-fit shrink-0 items-stretch rounded group/split shadow-[inset_0_0_0_1px_var(--cds-split-ring,transparent)] transition-[box-shadow] duration-fast ease-out [&:not([data-disabled])]:hover:[--cds-split-ring:var(--cds-border)] data-[popup-open]:[--cds-split-ring:var(--cds-border)] [&:not([data-disabled])]:has-[[aria-pressed=true]]:[--cds-split-ring:var(--cds-border)] [&_[data-cds-part=paint]]:p-(--cds-split-inset) [&_[data-cds-part=paint]]:bg-clip-content"
        style={{
          "--cds-split-inset":
            "min(calc(calc((var(--cds-h-control) - calc(1rem*var(--cds-rem-scale,1)))/2)/2),calc(0.1875rem*var(--cds-rem-scale,1)))",
        }}
      >
        <div data-cds-segment="" className="contents">
          <div className="contents">
            <IconButton dataId="8" />
          </div>
        </div>
        <span className="w-px shrink-0 self-stretch" />
        <div data-cds-segment="" className="contents">
          <IconButton dataId="9" />
        </div>
      </div>
    </div>
  );
}
