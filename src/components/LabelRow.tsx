import { IconButton } from "./IconButton";
import { SectionLabel } from "./SectionLabel";

export function LabelRow() {
  return (
    <div className="group/labelrow df-label-inset flex w-full items-center gap-[var(--df-row-gap)] pt-[var(--df-group-pt)] pr-[calc((var(--df-row-h)-24px)/2)] pb-1 text-[length:var(--df-group-font)] leading-4 min-h-[calc(var(--df-group-pt)+(var(--df-row-h)-8px)+4px)] text-muted">
      <SectionLabel label="Recents" />
      <div className="flex items-center gap-1">
        <IconButton dataId="2" />
      </div>
    </div>
  );
}
