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
import { AcceptanceTab, ReviewPane } from "./ReviewPane";

/** Tabs of the task pane: the plan and brief, and at acceptance the result and its diff (last: proof comes first). */
type PaneTab = "plan" | "brief" | "result" | "diff";
const PANE_TAB_LABEL: Record<PaneTab, string> = { plan: "Plan", brief: "Brief", result: "Result", diff: "Diff" };
import { SIDE_PANE, SidePane } from "./SidePane";
import { BriefView, ChatTaskContext, PlanView } from "./ChatTask";
import { Tabs } from "../ui";
import { enterAcceptance, seeTab, type TaskTab } from "../data/chatTaskStore";
import { useEffect, useMemo, useState } from "react";
import { Coachmarks, type Coachmark } from "./Coachmarks";
import { markPlanHintSeen, onboardingSettled, planHintSeen, useOnboarding } from "../data/onboarding";
import { ONBOARDING_DELAY, useDelay } from "../data/useDelay";

export function ChatShell({ name, transcript, chat }: { name: string; transcript?: Turn[]; chat?: Session }) {
  // One pane on the right of the chat, like the task pane in the Inbox: the task's plan and brief (?panel=plan|brief),
  // and at acceptance its result and diff as two more tabs (?panel=result|diff); a small task's result has its own
  // review (?review=changes|screens|checks). The chat stays where it is; decisions stay in its dock.
  const [params, setParams] = useSearchParams();
  const view = useChatTask(chat?.id);
  const reviewTab = params.get("review") as ReviewTab | null;
  // Level 1 reviews a result as a diff, screenshots and checks, in a pane of its own.
  const review =
    reviewTab && !view?.acceptance && view?.task.result?.review && ["changes", "screens", "checks"].includes(reviewTab) ? reviewTab : null;
  // Demo: ?scene=acceptance jumps the task to its result waiting for acceptance.
  const scene = params.get("scene");
  const round = params.get("round");
  useEffect(() => {
    if (scene === "acceptance" && chat?.id) enterAcceptance(chat.id, round ?? undefined);
  }, [scene, round, chat?.id]);
  // Levels 2–3 at acceptance: Result and Diff are tabs of the task pane. Old links with ?review=result|diff land on them.
  // The plan first, as always; the result and its diff after the brief, the diff last.
  const paneTabs: PaneTab[] = view
    ? [...(["plan", "brief"] as const).filter((t) => view.tabs.includes(t)), ...(view.acceptance ? (["result", "diff"] as const) : [])]
    : [];
  const panelParam = (params.get("panel") ?? (view?.acceptance ? reviewTab : null)) as PaneTab | null;
  const panel = !review && view && panelParam && paneTabs.includes(panelParam) ? panelParam : null;
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
  const setPanel = (t: PaneTab | "chat" | null) => {
    if ((t === "plan" || t === "brief") && view) seeTab(view.id, t);
    setPane("panel", t && t !== "chat" ? t : null);
  };
  // An open panel counts as seen, also when an edit lands while it is open.
  const unseen = !!((panel === "plan" || panel === "brief") && view?.changed.includes(panel));
  useEffect(() => {
    if (view && (panel === "plan" || panel === "brief") && unseen) seeTab(view.id, panel);
  }, [view, panel, unseen]);
  // First task chat with a "Plan" toggle: light it up once and say what is behind it.
  const hasToggle = !!view && view.tabs.length > 1;
  const hasBrief = !!view?.tabs.includes("brief");
  useOnboarding();
  const [planHint, setPlanHint] = useState(() => !planHintSeen());
  // The chat comes up first; the hint follows a moment later, and starts over if another chat opens meanwhile.
  // Only after the Up next announcement has had its turn: two overlays at once would fight.
  const showPlanHint = useDelay(planHint && onboardingSettled() && hasToggle && !panel && !review, ONBOARDING_DELAY, view?.id);
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
                        status: view.atGate || view.acceptancePending ? undefined : chipStatus(view.live),
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
      <ChatTaskContext.Provider
        value={{ chatId: view.id, view, setTab: (t) => setPanel(t), openReview: (t) => (t === "result" || t === "diff" ? setPanel(t) : setReview(t)) }}
      >
        {/* Beside 14px messages the task pane reads at the same size: its text-body maps to the prose size. */}
        <div className="contents [--cds-font-size-body:var(--cds-font-size-prose)] [--cds-leading-body:var(--cds-leading-prose)]">
          <SidePane
            id="task-pane"
            // The task first, what it is about under it, then the tabs: the plan leads, the brief explains it.
            title={view.task.title}
            subheader={
              <div className="flex flex-col gap-md pt-xs">
                <p className="text-body text-secondary">{view.task.summary}</p>
                {paneTabs.length > 1 && (
                  <Tabs
                    label="Task"
                    value={panel}
                    onChange={(t) => setPanel(t)}
                    items={paneTabs.map((t) => ({
                      value: t,
                      label: PANE_TAB_LABEL[t],
                      badge:
                        (t === "plan" || t === "brief") && view.changed.includes(t) && panel !== t ? (
                          <span aria-label="Changed" className="block size-[6px] rounded-full bg-muted" />
                        ) : undefined,
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
            {(panel === "result" || panel === "diff") && view.acceptance ? (
              <AcceptanceTab view={view} acc={view.acceptance} tab={panel} onTab={setPanel} />
            ) : panel === "brief" ? (
              <BriefView view={view} />
            ) : (
              <PlanView view={view} />
            )}
          </SidePane>
        </div>
      </ChatTaskContext.Provider>
    )}
    {review && view && (
      // Beside the chat the review reads at the chat's size, as the plan does.
      <div className="contents [--cds-font-size-body:var(--cds-font-size-prose)] [--cds-leading-body:var(--cds-leading-prose)]">
      <ReviewPane
        view={view}
        tab={review}
        onTab={setReview}
        onClose={() => setReview(null)}
        width={Math.min(paneWidth, Math.max(SIDE_PANE.min, paneMax))}
        maxWidth={paneMax}
        onResize={setPaneWidth}
      />
      </div>
    )}
    </div>
  );
}
