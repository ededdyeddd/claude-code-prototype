import { EpitaxyTitlebar } from "./EpitaxyTitlebar";
import { NextHeader } from "./NextHeader";
import { ChatPanel } from "./ChatPanel";
import type { Turn } from "../data/transcripts";
import type { Session } from "../data/sessions";
import { useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useChatTask } from "../data/chatTaskStore";
import { planProgress, type ReviewTab, type Task } from "../data/task";

/** "3/6 · by 17:30": steps done of all, and when you are next needed. An ETA says "by", not "~": its hint says it is a forecast. */
function chipStatus(task: Task) {
  const p = planProgress(task);
  if (!p.total) return undefined;
  return [`${p.done}/${p.total}`, p.yourTurn && `by ${p.yourTurn}`].filter(Boolean).join(" · ");
}
import { usePersistentWidth } from "../data/usePersistentWidth";
import { ReviewPane } from "./ReviewPane";
import { SIDE_PANE, SidePane } from "./SidePane";
import { BriefView, ChatTaskContext, PlanView } from "./ChatTask";
import { Tabs } from "../ui";
import { seeTab, type TaskTab } from "../data/chatTaskStore";
import { useEffect, useMemo, useState } from "react";
import { Coachmarks, type Coachmark } from "./Coachmarks";
import { markPlanHintSeen, planHintSeen } from "../data/onboarding";
import { ONBOARDING_DELAY, useDelay } from "../data/useDelay";

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
  // First task chat with a "Plan" toggle: light it up once and say what is behind it.
  const hasToggle = !!view && view.tabs.length > 1;
  const hasBrief = !!view?.tabs.includes("brief");
  const [planHint, setPlanHint] = useState(() => !planHintSeen());
  // The chat comes up first; the hint follows a moment later, and starts over if another chat opens meanwhile.
  const showPlanHint = useDelay(planHint && hasToggle && !panel && !review, ONBOARDING_DELAY, view?.id);
  // The hint's steps stay the same object while it is up (Coachmarks measures them once); the button opens the current chat's plan.
  const openPlan = useRef(() => {});
  openPlan.current = () => setPanel("plan");
  const planHintSteps = useMemo<Coachmark[]>(
    () => [
      {
        target: "plan-toggle",
        title: hasBrief ? "Plan and brief" : "Plan",
        body: hasBrief
          ? "What the agent will do, step by step, with cost and time for each and where you approve. The Brief tab says how it understood the task and what it assumed."
          : "What the agent will do, step by step, with cost and time for each and where you approve.",
        sides: ["bottom", "left"],
        action: { label: "Open plan", onClick: () => openPlan.current() },
      },
    ],
    [hasBrief],
  );
  const endPlanHint = () => {
    markPlanHintSeen();
    setPlanHint(false);
  };
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
                taskPane={
                  view && view.tabs.length > 1
                    ? {
                        // One word at every level: the pane opens on the plan, the brief is a tab inside.
                        label: "Plan",
                        // A running task shows its progress right here, so it needs no opening; a gate asks in the dock instead.
                        status: view.atGate ? undefined : chipStatus(view.live),
                        open: !!panel,
                        changed: view.changed.length > 0,
                        // Opens on the plan: it is what the task will do and what it costs; the brief is one tab away.
                        onToggle: () => setPanel(panel ? null : "plan"),
                      }
                    : undefined
                }
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
    {showPlanHint && <Coachmarks key={view?.id} steps={planHintSteps} onDone={endPlanHint} skipLabel="Got it" />}
    {panel && view && (
      <ChatTaskContext.Provider value={{ chatId: view.id, view, setTab: (t) => setPanel(t) }}>
        {/* Beside 14px messages the task pane reads at the same size: its text-body maps to the prose size. */}
        <div className="contents [--cds-font-size-body:var(--cds-font-size-prose)] [--cds-leading-body:var(--cds-leading-prose)]">
          <SidePane
            id="task-pane"
            // The task first, what it is about under it, then the tabs: the plan leads, the brief explains it.
            title={view.task.title}
            subheader={
              <div className="flex flex-col gap-md pt-xs">
                <p className="text-body text-secondary">{view.task.summary}</p>
                {view.tabs.includes("brief") && (
                  <Tabs
                    label="Plan and brief"
                    value={panel}
                    onChange={(t) => setPanel(t)}
                    items={(["plan", "brief"] as const).map((t) => ({
                      value: t,
                      label: t === "brief" ? "Brief" : "Plan",
                      badge: view.changed.includes(t) && panel !== t ? <span aria-label="Changed" className="block size-[6px] rounded-full bg-muted" /> : undefined,
                    }))}
                  />
                )}
              </div>
            }
            width={Math.min(paneWidth, Math.max(SIDE_PANE.min, paneMax))}
            maxWidth={paneMax}
            onResize={setPaneWidth}
            onClose={() => setPanel(null)}
          >
            {panel === "brief" ? <BriefView view={view} /> : <PlanView view={view} />}
          </SidePane>
        </div>
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
