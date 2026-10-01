import { useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AllRunningIllustration, Button, EmptyState, Hint, Icon, Menu, Tabs } from "../ui";
import { SidePane, SIDE_PANE } from "../components/SidePane";
import { TaskDot } from "../components/StatusMark";
import { AttentionMenu } from "../components/AttentionMenu";
import { usePersistentWidth } from "../data/usePersistentWidth";
import { AWAY, TASKS } from "../data/inbox";
import { currentGate, gateText, type Task } from "../data/task";
import { ChangeButton, PaneMeta, PlanPane, whenHint } from "../components/PlanPane";
import { BriefView, GateCard } from "../components/ChatTask";
import { AcceptanceTab } from "../components/ReviewPane";
import { deriveTask, type TaskState } from "../data/chatTaskStore";
import { openQuestions, useInbox, type Attention } from "../data/inboxStore";
import { introSeen, markIntroSeen } from "../data/onboarding";
import { ONBOARDING_DELAY, useDelay } from "../data/useDelay";
import { Coachmarks, type Coachmark } from "../components/Coachmarks";

// Anthropicons codepoints (see /tokens#icons)
const I = {
  chevronDown: "",
  chevronRight: "",
  send: "",
  check: "",
};

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

type PaneTab = "plan" | "brief" | "result" | "diff";
const PANE_TAB_LABEL: Record<PaneTab, string> = { plan: "Plan", brief: "Brief", result: "Result", diff: "Diff" };

/* ------------------------------------------------------------------ Header */

function Header({
  blocked,
  toReview,
  canWait,
  attention,
  busyUntil,
  onOpenTask,
}: {
  blocked: number;
  toReview: number;
  canWait: number;
  attention: Attention;
  busyUntil: string;
  onOpenTask: (id: string) => void;
}) {
  const summary =
    blocked + toReview + canWait === 0
      ? "All tasks are running"
      : [blocked && `${blocked} blocked`, toReview && `${toReview} to review`, canWait && `${canWait} can wait`].filter(Boolean).join(" · ");
  return (
    <header className="flex flex-col gap-xs">
      {/* Title row: the attention mode belongs to the header and stays on the right edge. */}
      <div className="flex items-center justify-between gap-md">
        <h1
          data-coach="title"
          className="min-w-0 truncate font-serif text-primary"
          style={{
            fontSize: "var(--cds-page-header-title-size)",
            lineHeight: "var(--cds-page-header-title-leading)",
            fontWeight: "var(--cds-font-weight-regular)",
          }}
        >
          Up next
        </h1>
        <span data-coach="attention" className="shrink-0">
          <AttentionMenu attention={attention} busyUntil={busyUntil} />
        </span>
      </div>
      <p className="text-footnote text-secondary">{summary}</p>
      <AwayRecap onOpenTask={onOpenTask} />
    </header>
  );
}

const money = (n: number) => `$${n.toFixed(2)}`;
const dollars = (v: string) => Number(v.replace(/[^0-9.]/g, ""));

type RecapKind = "checks" | "decisions" | "spend";

/** A number in the recap that opens the list behind it. */
function RecapNumber({
  value,
  label,
  open,
  onToggle,
}: {
  value: string;
  label: string;
  open: boolean;
  onToggle: (el: HTMLButtonElement) => void;
}) {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      onClick={(e) => onToggle(e.currentTarget)}
      className={cx(
        "group/num -mx-1 rounded-sm px-1 outline-none transition-colors duration-fast focus-visible:shadow-focus cursor-[var(--cds-cursor-interactive)]",
        open ? "bg-alpha-2" : "hover:bg-fill-ghost-hover",
      )}
    >
      <span className="font-medium tabular-nums text-primary">{value}</span>{" "}
      <span className="text-muted group-hover/num:text-secondary">{label}</span>
    </button>
  );
}

/** Row in a recap popover: what happened, in which task; clicking it opens the task on the right. */
function RecapRow({
  task,
  children,
  trailing,
  withAgent,
  onOpenTask,
}: {
  task: Task;
  children: ReactNode;
  trailing?: ReactNode;
  /** Show who made it: agent glyph + name in the sub line. */
  withAgent?: boolean;
  onOpenTask: (id: string) => void;
}) {
  return (
    <div className="group/change flex items-center gap-sm rounded-sm px-sm py-xs hover:bg-fill-ghost-hover">
      <button
        type="button"
        onClick={() => onOpenTask(task.id)}
        className="flex min-w-0 flex-1 flex-col text-left outline-none focus-visible:shadow-focus cursor-[var(--cds-cursor-interactive)]"
      >
        <span className="text-body text-primary">{children}</span>
        <span className="flex min-w-0 items-center gap-1 text-footnote text-muted">
          {withAgent && (
            <>
              <span className="shrink-0">{task.agent}</span>
              <span> · </span>
            </>
          )}
          <span className="truncate">
            {task.title} · {task.project}
          </span>
        </span>
      </button>
      {trailing}
    </div>
  );
}

/** Away recap: one line under the summary. Each number opens what is behind it. */
function AwayRecap({ onOpenTask }: { onOpenTask: (id: string) => void }) {
  const [open, setOpen] = useState<RecapKind | null>(null);
  const anchor = useRef<HTMLElement | null>(null);
  const byId = (id: string) => TASKS.find((t) => t.id === id)!;
  const decisions = TASKS.flatMap((t) => t.autoDecisions.map((d) => ({ task: t, d })));
  const spend = TASKS.map((t) => ({ task: t, amount: dollars(t.spent) })).sort((a, b) => b.amount - a.amount);
  const total = spend.reduce((n, x) => n + x.amount, 0);

  const toggle = (kind: RecapKind) => (el: HTMLButtonElement) => {
    anchor.current = el;
    setOpen(open === kind ? null : kind);
  };
  const go = (id: string) => {
    setOpen(null);
    onOpenTask(id);
  };
  const title: Record<RecapKind, string> = {
    checks: "Checks passed",
    decisions: "Auto-decided",
    spend: "Spent by task",
  };

  return (
    <p data-coach="recap" className="text-footnote text-muted">
      While you were away, <span className="tabular-nums">{AWAY.window}</span>
      {" · "}
      <RecapNumber value={String(AWAY.checks.length)} label="checks passed" open={open === "checks"} onToggle={toggle("checks")} />
      {" · "}
      <RecapNumber value={String(decisions.length)} label="auto-decided" open={open === "decisions"} onToggle={toggle("decisions")} />
      {" · "}
      <RecapNumber value={money(total)} label="spent" open={open === "spend"} onToggle={toggle("spend")} />
      <Menu density="compact" anchor={anchor} open={open !== null} onClose={() => setOpen(null)} placement="bottom-start" minWidth={340}>
        {open && <span className="px-sm pt-xs pb-1 text-footnote text-muted">{title[open]}</span>}
        <div className="flex max-h-[360px] flex-col overflow-y-auto">
          {open === "checks" &&
            AWAY.checks.map((c) => (
              <RecapRow key={c.taskId + c.text} task={byId(c.taskId)} onOpenTask={go}>
                <span className="flex items-center gap-sm">
                  <TaskDot state="done" />
                  {c.text}
                </span>
              </RecapRow>
            ))}
          {open === "decisions" &&
            decisions.map(({ task, d }) => (
              <RecapRow key={task.id + d.id} task={task} withAgent onOpenTask={go} trailing={<ChangeButton />}>
                {d.text}
              </RecapRow>
            ))}
          {open === "spend" &&
            spend.map(({ task, amount }) => (
              <RecapRow
                key={task.id}
                task={task}
                onOpenTask={go}
                trailing={<span className="shrink-0 text-footnote tabular-nums text-secondary">{money(amount)}</span>}
              >
                {task.agent} <span className="text-muted">· {task.model}</span>
              </RecapRow>
            ))}
        </div>
      </Menu>
    </p>
  );
}

/* --------------------------------------------------------------- Task list */

function TaskRow({
  task,
  answers,
  group,
  chat,
  selected,
  onSelect,
}: {
  task: Task;
  answers: Record<string, string>;
  /** Session of a task chat: marked assumptions, escalation. */
  chat?: TaskState;
  /** The group the row sits in: a task can be blocked by a gate or an escalation, not only by a question. */
  group: "blocked" | "toReview" | "canWait" | "running";
  selected: boolean;
  onSelect: () => void;
}) {
  const open = openQuestions(task, answers);
  const blocking = open.filter((q) => q.blocking).length;
  const later = open.length - blocking;
  // Blocked without a question: what exactly the person has to do, in the same words as "1 question".
  const session = deriveTask(task, chat);
  const gate = currentGate(task);
  const decision = session.acceptancePending
    ? session.acceptance?.canAccept
      ? "accept the result"
      : "a locked criterion is broken"
    : group !== "blocked" || blocking
      ? undefined
      : session.escalationPending
        ? "split into stages?"
        : session.unmarked.length > 0
          ? `${session.unmarked.length} ${plural(session.unmarked.length, "assumption", "assumptions")} to confirm`
          : gate
            ? `approve ${gate.title}`
            : undefined;
  const needs = open.length > 0 || !!decision;
  // Blocked on one step, not stopped: steps that do not need the answer keep running in parallel.
  const working = group === "blocked" ? task.stages.flatMap((st) => st.steps).filter((p) => p.status === "running" && !p.question).length : 0;
  const turn = turnEta(task);
  const stageText = needs ? task.stage : task.waitingFor ? `${task.stage} · resumed` : task.now;

  // Two lines, same height for every row: what + how long it waits (or when it is your turn);
  // project, stage and what it needs from you + which agent at what cost.
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected || undefined}
      className={cx(
        "flex w-full items-start gap-sm rounded px-sm py-sm text-left outline-none transition-[background-color,opacity] duration-fast focus-visible:shadow-focus cursor-[var(--cds-cursor-interactive)]",
        selected ? "bg-alpha-2" : "hover:bg-fill-ghost-hover",
      )}
    >
      {/* Clay only when the agent stopped for you. Can wait keeps working: the running dot, as in the sidebar; the group and "1 question" say it has a question. */}
      {/* To review: the agent finished, the still grey dot as in the sidebar; "a locked criterion is broken" says the rest. */}
      <TaskDot state={group === "canWait" ? "running" : group === "toReview" ? "done" : group} className="mt-[5px]" />
      <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-md gap-y-0.5">
        <span className="truncate text-body font-medium text-primary">{task.title}</span>
        <span className="justify-self-end text-footnote tabular-nums text-secondary">
          {needs && task.waitingFor ? (
            `waiting ${task.waitingFor}`
          ) : !needs && turn ? (
            <Hint text={whenHint(turn.source)} focusable={false}>
              Your turn by {turn.eta}
            </Hint>
          ) : (
            ""
          )}
        </span>
        <span className="flex min-w-0 items-center">
          <span className="truncate text-footnote text-muted">
            {task.project} · {stageText}
            {needs && <span> · </span>}
            {decision && <span className="text-secondary">{decision}</span>}
            {blocking > 0 && (
              <span className="text-secondary">
                {blocking} {plural(blocking, "question", "questions")}
              </span>
            )}
            {blocking > 0 && later > 0 && <span className="text-secondary"> · +{later} can wait</span>}
            {working > 0 && <span> · {working} in parallel</span>}
            {needs && !blocking && !decision && (
              <span className="text-secondary">
                {later} {plural(later, "question", "questions")}
              </span>
            )}
          </span>
        </span>
        <span className="justify-self-end truncate text-footnote tabular-nums text-muted" title={`${task.tokens} tokens`}>
          {task.agent} · <span className="text-secondary">{task.spent}</span>
        </span>
      </div>
    </button>
  );
}

/** `spaced`: extra room above every group but the first, so a heading clearly belongs to the rows below it. */
/** Collapsible group of tasks. Every group gets room above it, so its heading belongs to the rows below. */
function Group({ title, count, coach, children }: { title: string; count: number; coach?: string; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <section data-coach={coach} className={cx("flex flex-col", open ? "pb-lg" : "pb-sm")}>
      <h2>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="group/head flex w-full items-center gap-1 rounded-sm px-sm py-1 text-left text-footnote text-muted outline-none transition-colors duration-fast hover:text-secondary focus-visible:shadow-focus cursor-[var(--cds-cursor-interactive)]"
        >
          <span>{title}</span>
          <span aria-hidden="true" className="size-[3px] shrink-0 rounded-full bg-current" />
          <span className="tabular-nums">{count}</span>
          {/* As in the Claude sidebar: chevron right after the label, shown on hover, rotated when open. */}
          <Icon
            glyph={I.chevronRight}
            size="sm"
            className={cx(
              "opacity-0 transition-[opacity,transform] duration-fast group-hover/head:opacity-100 group-focus-visible/head:opacity-100 motion-reduce:transition-none",
              open && "rotate-90",
            )}
          />
        </button>
      </h2>
      {open && children}
    </section>
  );
}

/** Nobody needs the person: when they will be needed next, by plan. */
/** Nothing needs the person: the Running list below says when they will be needed, soonest first. */
function NothingNeedsYou() {
  return <EmptyState illustration={<AllRunningIllustration />}>Nothing needs you</EmptyState>;
}

/** "Now" in the prototype: the end of the away window ("14:00–16:00"), in minutes from the start of today. */
const NOW = (() => {
  const m = AWAY.window.match(/(\d{1,2}):(\d{2})$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : 16 * 60;
})();

/** Minutes in a step's time, "~1h 20m" or "40m"; none if the step has no time. */
function minutesOf(time: string | undefined) {
  const h = time?.match(/(\d+)\s*h/);
  const m = time?.match(/(\d+)\s*m/);
  return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
}

const clock = (min: number) => {
  const day = Math.floor(min / (24 * 60));
  const t = min % (24 * 60);
  const hhmm = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
  return day > 0 ? `tomorrow ${hhmm}` : hhmm;
};

/**
 * When the person is likely needed next: the next gate's own time, if it has one; otherwise now plus the estimates of
 * the steps left before that gate (or before the end of the plan, where the result waits for them), rounded up to
 * 5 minutes. None when no step left has an estimate.
 */
function turnEta(t: Task): { eta: string; source?: string; at: number } | undefined {
  const gate = t.stages.flatMap((s) => (s.gate?.status === "ahead" && s.gate.eta ? [s.gate] : []))[0];
  if (gate?.eta) {
    const m = gate.eta.match(/(tomorrow )?(\d{1,2}):(\d{2})/);
    return { eta: gate.eta, source: gate.etaSource, at: m ? (m[1] ? 24 * 60 : 0) + Number(m[2]) * 60 + Number(m[3]) : Infinity };
  }
  let left = 0;
  for (const st of t.stages) {
    left += st.steps.filter((p) => p.status === "running" || p.status === "ahead").reduce((n, p) => n + minutesOf(p.work?.time), 0);
    if (st.gate?.mine && st.gate.status !== "passed") break;
  }
  if (left === 0) return undefined;
  const at = Math.ceil((NOW + left) / 5) * 5;
  return { eta: clock(at), source: "the estimates of the steps left", at };
}

/** Minutes from the start of today to a task's next turn of yours; none goes last. */
const turnAt = (t: Task) => turnEta(t)?.at ?? Infinity;

/* ------------------------------------------------------------ Onboarding */

// Micro-onboarding tour: what is inside the page, one element at a time. Steps whose element is not on the page are skipped.
// Invited by the sidebar hint, the tour follows the page after a beat, just enough for it to settle.
const TOUR_DELAY = 200;

// Arrived on their own, nobody asked the person: the page says what it is for first, and the tour is theirs to start.
const INTRO: Coachmark = {
  target: "title",
  title: "Which task to go to first",
  body: "Agents work on your tasks in parallel. Up next shows where one waits for you, what it needs and what it will cost, then lets you get back to work.",
  sides: ["bottom"],
  lead: { nextLabel: "Show me around" },
};

const TOUR: Coachmark[] = [
  {
    target: "groups",
    title: "Start at the top",
    body: (
      <>
        <span className="text-primary">Blocked</span>: the agent stopped and waits for you. <span className="text-primary">To review</span>:
        it finished, and the result waits for you to accept it. <span className="text-primary">Can wait</span>: it has a question but keeps
        working. <span className="text-primary">Running</span>: nothing needed yet.
      </>
    ),
    sides: ["right", "bottom", "top"],
  },
  {
    target: "pane",
    title: "Decide on the plan",
    body: "Open a task to see its plan. A question sits on its step, and each option shows its cost, time and whether you can undo it. The same question waits in the task’s chat: answer once, it closes everywhere.",
    sides: ["left", "bottom"],
  },
  {
    target: "recap",
    title: "What happened without you",
    body: "Checks that passed, what agents decided on their own and what it cost. Click a number to see the list.",
    sides: ["bottom", "top"],
  },
  {
    target: "attention",
    title: "Say when you are free",
    body: "Busy and Do not disturb hold notifications. The list here stays the same.",
    sides: ["bottom", "left"],
  },
];

/* -------------------------------------------------------------------- Page */

export function InboxPage() {
  const { answers, attention, busyUntil, blocked, toReview, canWait, needsYou, running, chats } = useInbox();
  // The first task that needs the person is open on arrival; clicking a task opens it on the right.
  // "Answer in the plan" from a task's chat opens that task (?task=id); otherwise the first task that needs you.
  const { search, state } = useLocation();
  // Onboarding, step two, one tour of coachmarks either way. By "Take a look" in the sidebar hint the person has asked
  // to be shown around: the tour starts right away. On their own: the page comes up first, then the intro step asks.
  const invited = (state as { tour?: boolean } | null)?.tour === true;
  const [onboarding, setOnboarding] = useState<Coachmark[] | null>(() => (introSeen() ? null : invited ? TOUR : [INTRO, ...TOUR]));
  const onboardingReady = useDelay(!!onboarding, invited ? TOUR_DELAY : ONBOARDING_DELAY);
  const finishOnboarding = () => {
    markIntroSeen();
    setOnboarding(null);
  };
  const [selectedId, setSelectedId] = useState<string | null>(() => new URLSearchParams(search).get("task") ?? needsYou[0]?.id ?? null);
  const [expanded, setExpanded] = useState(false);
  // Same pane as beside a task chat: Plan first, Brief a tab away for tasks that have one.
  const [paneTab, setPaneTab] = useState<PaneTab>("plan");
  // Another task opens on its plan.
  const [tabFor, setTabFor] = useState(selectedId);
  if (tabFor !== selectedId) {
    setTabFor(selectedId);
    setPaneTab("plan");
  }
  const navigate = useNavigate();
  const [paneWidth, setPaneWidth] = usePersistentWidth("cc:side-pane-width", SIDE_PANE.default);
  // The list keeps at least 400px next to the pane.
  const root = useRef<HTMLDivElement>(null);
  const paneMax = (root.current?.clientWidth ?? 1200) - 400;
  const selected = TASKS.find((t) => t.id === selectedId);
  // Tasks with a chat level carry session state (gate passed, text edits); the pane shows the plan as it stands.
  const session = selected && deriveTask(selected, chats[selected.id]);
  const view = selected && session ? { id: selected.id, task: selected, ...session } : undefined;
  // The same tabs as the task pane beside a chat: Plan, Brief if there is one, and Result | Diff while a result waits for review.
  const paneTabs: PaneTab[] = [
    "plan",
    ...(selected?.brief ? (["brief"] as const) : []),
    ...(session?.acceptance ? (["result", "diff"] as const) : []),
  ];
  // Accepted or sent back, Result | Diff go away: the pane falls back to the plan.
  const tab = paneTabs.includes(paneTab) ? paneTab : "plan";

  const openNext = () => {
    const next = needsYou.find((t) => t.id !== selectedId);
    setSelectedId(next?.id ?? null);
  };

  return (
    <div ref={root} className="absolute inset-0 flex gap-[var(--tiles-gap,12px)] pe-[var(--tiles-padding,8px)]">
      {!expanded && (
        <div className="relative flex min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-[800px] flex-col gap-lg px-xl pt-[var(--cds-gap-lg)] pb-xl">
              <Header
                blocked={blocked.length}
                toReview={toReview.length}
                canWait={canWait.length}
                attention={attention}
                busyUntil={busyUntil}
                onOpenTask={setSelectedId}
              />
              {needsYou.length === 0 && <NothingNeedsYou />}
              {/* One list: space comes after an open group, so collapsed headings stack tightly. */}
              <div className="flex flex-col pt-xs">
                {(
                  [
                    ["Blocked", blocked],
                    // The agent finished: it waits for you like Blocked, but nothing is stuck mid-work.
                    ["To review", toReview],
                    ["Can wait", canWait],
                    // Running: the soonest "Your turn by" first, so the list also says when you will be needed.
                    ["Running", [...running].sort((a, b) => turnAt(a) - turnAt(b))],
                  ] as const
                )
                  .filter(([, tasks]) => tasks.length > 0)
                  .map(([title, tasks], i) => (
                    <Group key={title} title={title} count={tasks.length} coach={i === 0 ? "groups" : undefined}>
                      {tasks.map((t) => (
                        <TaskRow
                          key={t.id}
                          task={t}
                          group={title === "Blocked" ? "blocked" : title === "To review" ? "toReview" : title === "Can wait" ? "canWait" : "running"}
                          chat={chats[t.id]}
                          answers={answers}
                          selected={t.id === selectedId}
                          onSelect={() => setSelectedId(t.id)}
                        />
                      ))}
                    </Group>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <SidePane
          key={selected.id}
          coach="pane"
          title={selected.title}
          subheader={
            <div className="flex flex-col gap-md pt-xs">
              <p className="text-body text-secondary">{selected.summary}</p>
              {paneTabs.length > 1 && (
                <Tabs
                  label="Task"
                  value={tab}
                  onChange={(t) => setPaneTab(t as PaneTab)}
                  items={paneTabs.map((t) => ({ value: t, label: PANE_TAB_LABEL[t] }))}
                />
              )}
            </div>
          }
          width={Math.min(paneWidth, Math.max(SIDE_PANE.min, paneMax))}
          maxWidth={paneMax}
          onResize={setPaneWidth}
          expanded={expanded}
          onToggleExpand={() => setExpanded(!expanded)}
          onClose={() => {
            setSelectedId(null);
            setExpanded(false);
          }}
          actions={
            // Talking to the agent happens in the session.
            <Button size="xs" onClick={() => navigate(`/code/${selected.id}`)}>
              Open task
            </Button>
          }
        >
          {(tab === "result" || tab === "diff") && view?.acceptance ? (
            <AcceptanceTab view={view} acc={view.acceptance} tab={tab} onTab={setPaneTab} />
          ) : tab === "brief" && view ? (
            <BriefView view={view} />
          ) : (
            <PlanPane
              task={session?.live ?? selected}
              answers={answers}
              header={<PaneMeta task={session?.live ?? selected} answers={answers} />}
              onTaskDone={openNext}
              edits={session?.planEdits}
              gateCard={
                // A gate of a task chat is decided right here, like a question; the full brief stays a link.
                session &&
                selected.level !== undefined && (
                  <GateCard
                    view={{ id: selected.id, task: selected, ...session }}
                    onOpenBrief={selected.brief ? () => setPaneTab("brief") : undefined}
                    // The review opens right here, in the Result tab; talking to the agent stays in the chat.
                    onOpenResult={() => setPaneTab("result")}
                    onDone={openNext}
                  />
                )
              }
            />
          )}
        </SidePane>
      )}
      {onboardingReady && onboarding && <Coachmarks steps={onboarding} onDone={finishOnboarding} />}
    </div>
  );
}
