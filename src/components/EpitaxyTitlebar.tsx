export function EpitaxyTitlebar() {
  return (
    <div className="epitaxy-titlebar relative flex items-center h-[calc(2rem*var(--cds-rem-scale,1))] pl-0 pr-[12px] [[data-chat-gutter-end=shave]_&]:pr-0 [[data-tile-overflow-anchor=left]_&]:mr-[max(0px,var(--tile-overflow-min,0px)_-_100cqw)] [[data-tile-overflow-anchor=right]_&]:ml-[max(0px,var(--tile-overflow-min,0px)_-_100cqw)]">
      <div className="draggable absolute inset-0 -z-[1]" />
      <div className="group/lead relative z-[1] flex min-w-0 items-center [[data-tile-overflow-anchor]_&]:[@container_tile-slot_(max-width:320px)]:[clip-path:inset(-32px_-12px)] draggable-none" />
      <div className="relative z-[1] ml-auto flex shrink-0 items-center gap-1 pl-[24px] [[data-pane-overlay]_&]:mr-[calc(-1*var(--epitaxy-overlay-titlebar-shift,0px))] draggable-none [--cds-h-control:26px] [--cds-text-primary:var(--cds-text-secondary)]">
        <div className="flex items-center gap-1 empty:hidden sf-hidden" />
      </div>
    </div>
  );
}
