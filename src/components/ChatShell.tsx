import { EpitaxyTitlebar } from "./EpitaxyTitlebar";
import { NextHeader } from "./NextHeader";
import { ChatPanel } from "./ChatPanel";

export function ChatShell({ name }) {
  return (
    <div
      className="tiles-shell"
      data-tile-overflow-anchor="left"
      style={{
        display: "grid",
        gridTemplateRows: "minmax(0px,1fr)",
        gridTemplateColumns: "minmax(0px,1fr)",
        width: "100%",
        height: "100%",
        position: "absolute",
        top: "0px",
        bottom: "0px",
        left: "0px",
        minWidth: "320px",
        "--tile-overflow-min": "320px",
      }}
    >
      <div
        style={{
          display: "contents",
        }}
      >
        <div
          style={{
            display: "contents",
          }}
        >
          <div className="relative isolate min-w-0 epitaxy-chat-panel" data-chat-gutter-end="bleed">
            <div className="rounded-card bg-surface-2 shadow-panel-sm dark:shadow-sm dark:outline dark:outline-1 dark:outline-alpha-2 pointer-events-none absolute inset-0 -z-[1] opacity-0 transition-opacity duration-200 [.tiles-dragging_&]:opacity-100" />
            <div className="relative h-full min-w-0 flex flex-col">
              <EpitaxyTitlebar />
              <div className="relative">
                <NextHeader name={name} />
              </div>
              <ChatPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
