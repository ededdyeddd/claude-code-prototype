import { Irregular_radiating_starburst } from "./icons/Irregular_radiating_starburst";

export function NextHeader({ name }) {
  return (
    <header className={"w-full mx-auto [.epitaxy-chat-panel_&amp;]:[@container_tile-slot_(max-width:560px)]:[--chat-gutter:16px] [--chat-column-gutter-start:var(--chat-gutter-start,var(--chat-gutter,32px))] [--chat-column-gutter-end:var(--chat-gutter-end,var(--chat-gutter,32px))] [[data-chat-gutter-start=shave]_&amp;]:[--chat-column-gutter-start:var(--chat-gutter-start,calc(var(--chat-gutter)-(var(--tiles-gap)-var(--tiles-padding))))] [[data-chat-gutter-end=shave]_&amp;]:[--chat-column-gutter-end:var(--chat-gutter-end,calc(var(--chat-gutter)-(var(--tiles-gap)-var(--tiles-padding))))] [[data-chat-gutter-end=bleed]_&amp;]:[--chat-column-gutter-end:var(--chat-gutter-end,calc(var(--chat-gutter)+var(--tiles-padding)))] max-w-[calc(var(--max-content-width)+var(--chat-column-gutter-start)+var(--chat-column-gutter-end))] ps-[var(--chat-column-gutter-start)] pe-[var(--chat-column-gutter-end)] [[data-pane-overlay]_&amp;]:[translate:var(--epitaxy-overlay-column-shift,none)] *:[--epitaxy-overlay-column-shift:none] [[data-pane-overlay]_&amp;]:[transition:translate_var(--tile-overlay-duration)_var(--tile-overlay-ease)] [--max-content-width:var(--chat-column-measure,768px)] [[data-transcript-width=m]_&amp;]:[--max-content-width:var(--chat-column-measure,960px)] [[data-transcript-width=l]_&amp;]:[--max-content-width:var(--chat-column-measure,1280px)] flex flex-row items-center gap-1.5 pt-[12px] pb-[24px]"}>
      <Irregular_radiating_starburst />
      <h1 className="text-title text-primary">
        {"What’s up next, "}
        {name}?
      </h1>
    </header>
  );
}
