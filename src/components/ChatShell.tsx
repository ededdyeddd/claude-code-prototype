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
import { SIDE_PANE, SidePane } from "./SidePane";
import { BriefView, ChatTaskContext, PlanView } from "./ChatTask";
import { seeTab, type TaskTab } from "../data/chatTaskStore";
import { useEffect } from "react";

export function ChatShell({ name, transcript, chat }: { name: string; transcript?: Turn[]; chat?: Session }) {
  // One pane on the right of the chat, like the task pane in the Inbox: the task's brief or plan (?panel=brief|plan),
  // or a result's review (?review=changes|screens|checks). The chat stays where it is; decisions stay in its dock.
  const [params, setParams] = useSearchParams();
  const view = useChatTask(chat?.id);
  const reviewTab = params.get("review") as ReviewTab | null;
  const review = view?.task.result?.review && reviewTab ? reviewTab : null;
  const panelParam = params.get("panel") as TaskTab | null;
  const panel = !review && view && panelParam && panelParam !== "chat" && view.tabs.includes(panelParam) ? panelParam : null;
  const setPane = (key: "review" | "panel", value: string | null) =>
    setParams(
      (p) => {
        const next = new URLSearchParams(p);
        next.delete("review");
        next.delete("panel");
        if (value) next.set(key, value);
        return next;
      },
      { replace: true },
    );
  const setReview = (t: ReviewTab | null) => setPane("review", t);
  const setPanel = (t: TaskTab | null) => {
    if (t && t !== "chat" && view) seeTab(view.id, t);
    setPane("panel", t && t !== "chat" ? t : null);
  };
  // An open panel counts as seen, also when an edit lands while it is open.
  const unseen = !!(panel && view?.changed.includes(panel));
  useEffect(() => {
    if (view && panel && unseen) seeTab(view.id, panel);
  }, [view, panel, unseen]);
  const [paneWidth, setPaneWidth] = usePersistentWidth("cc:review-pane-width", SIDE_PANE.default);
  const root = useRef<HTMLDivElement>(null);
  const paneMax = (root.current?.clientWidth ?? 1200) - 400;
  return (
    <div ref={root} className={"absolute inset-0 flex gap-[var(--tiles-gap,12px)]" + (review || panel ? " pe-[var(--tiles-padding,8px)]" : "")}>
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
              <EpitaxyTitlebar
                chat={transcript ? chat : undefined}
                panes={
                  view && view.tabs.length > 0
                    ? view.tabs
                        .filter((t) => t !== "chat")
                        .map((t) => ({ id: t, label: t === "brief" ? "Brief" : "Plan", open: panel === t, changed: view.changed.includes(t) && panel !== t }))
                    : undefined
                }
                onPane={(id) => setPanel(panel === id ? null : (id as TaskTab))}
              />
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
    {panel && view && (
      <ChatTaskContext.Provider value={{ chatId: view.id, view, setTab: (t) => setPanel(t) }}>
        <SidePane
          title={panel === "brief" ? "Brief" : "Plan"}
          meta={view.task.title}
          width={Math.min(paneWidth, Math.max(SIDE_PANE.min, paneMax))}
          maxWidth={paneMax}
          onResize={setPaneWidth}
          onClose={() => setPanel(null)}
        >
          {panel === "brief" ? <BriefView view={view} /> : <PlanView view={view} />}
        </SidePane>
      </ChatTaskContext.Provider>
    )}
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
