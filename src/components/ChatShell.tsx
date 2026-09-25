import { EpitaxyTitlebar } from "./EpitaxyTitlebar";
import { NextHeader } from "./NextHeader";
import { ChatPanel } from "./ChatPanel";
import type { Turn } from "../data/transcripts";
import type { Session } from "../data/sessions";
import { useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useChatTask } from "../data/chatTaskStore";
import type { ReviewTab } from "../data/task";
import { usePersistentWidth } from "../data/usePersistentWidth";
import { ReviewPane } from "./ReviewPane";
import { SIDE_PANE } from "./SidePane";

export function ChatShell({ name, transcript, chat }: { name: string; transcript?: Turn[]; chat?: Session }) {
  // A review artifact opens on the right of the chat (?review=changes|screens|checks), like the task pane in the Inbox.
  const [params, setParams] = useSearchParams();
  const view = useChatTask(chat?.id);
  const reviewTab = params.get("review") as ReviewTab | null;
  const review = view?.task.result?.review && reviewTab ? reviewTab : null;
  const setReview = (t: ReviewTab | null) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        if (t) next.set("review", t);
        else next.delete("review");
        return next;
      },
      { replace: true },
    );
  const [paneWidth, setPaneWidth] = usePersistentWidth("cc:review-pane-width", SIDE_PANE.default);
  const root = useRef<HTMLDivElement>(null);
  const paneMax = (root.current?.clientWidth ?? 1200) - 400;
  return (
    <div ref={root} className={"absolute inset-0 flex gap-[var(--tiles-gap,12px)]" + (review ? " pe-[var(--tiles-padding,8px)]" : "")}>
    <div className="relative min-w-0 flex-1">
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
              <EpitaxyTitlebar chat={transcript ? chat : undefined} />
              <div className="relative">
                {!transcript && <NextHeader name={name} />}
              </div>
              <ChatPanel transcript={transcript} chat={chat} />
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
    {review && view && (
      <ReviewPane
        view={view}
        tab={review}
        onTab={setReview}
        onClose={() => setReview(null)}
        width={Math.min(paneWidth, Math.max(SIDE_PANE.min, paneMax))}
        maxWidth={paneMax}
        onResize={setPaneWidth}
      />
    )}
    </div>
  );
}
