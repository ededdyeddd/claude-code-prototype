import { useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, EmptyState, Hint, Icon, Menu, Tabs, WavyDivider } from "../ui";
import { SidePane, SIDE_PANE } from "../components/SidePane";
import { TaskDot } from "../components/StatusMark";
import { AttentionMenu } from "../components/AttentionMenu";
import { usePersistentWidth } from "../data/usePersistentWidth";
import { AWAY, TASKS } from "../data/inbox";
import { currentGate, gateText, type Task } from "../data/task";
import { PaneMeta, PlanPane, whenHint } from "../components/PlanPane";
import { BriefView, GateCard } from "../components/ChatTask";
import { deriveTask, type TaskState } from "../data/chatTaskStore";
import { openQuestions, useInbox, type Attention } from "../data/inboxStore";
import { introSeen, markIntroSeen } from "../data/onboarding";
import { UpNextIntro } from "../components/UpNextIntro";
import { Coachmarks, type Coachmark } from "../components/Coachmarks";

// Anthropicons codepoints (see /tokens#icons)
const I = {
  chevronDown: "",
  chevronRight: "",
  warning: "",
  send: "",
  check: "",
};

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

/* ------------------------------------------------------------------ Header */

function Header({
  blocked,
  canWait,
  attention,
  busyUntil,
  onOpenTask,
}: {
  blocked: number;
  canWait: number;
  attention: Attention;
  busyUntil: string;
  onOpenTask: (id: string) => void;
}) {
  const summary =
    blocked + canWait === 0
      ? "All tasks are running"
      : [blocked && `${blocked} blocked`, canWait && `${canWait} can wait`].filter(Boolean).join(" · ");
  return (
    <header className="flex flex-col gap-xs">
      {/* Title row: the attention mode belongs to the header and stays on the right edge. */}
      <div className="flex items-center justify-between gap-md">
        <h1
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
      <div className="pt-md empty:hidden">
        <AwayAlert />
      </div>
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
    <div className="flex items-center gap-sm rounded-sm px-sm py-xs hover:bg-fill-ghost-hover">
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
              <RecapRow key={task.id + d.id} task={task} withAgent onOpenTask={go} trailing={<Button size="xs">Change</Button>}>
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

/** A problem that stops agents and needs the person (access, budget, a stuck agent, red main). Not for self-healed events. */
function AwayAlert() {
  // In the prototype the action just resolves the problem, so the banner goes away.
  const [resolved, setResolved] = useState(false);
  if (!AWAY.alarm || resolved) return null;
  return (
    <div
      role="alert"
      className="flex items-center gap-sm rounded-[calc(var(--cds-radius--sm)+4px)] bg-alpha-1 ps-sm pe-xs py-xs text-footnote text-secondary"
    >
      {/* The glyph sits high in its box; 1px down lines it up with the text optically. */}
      <Icon glyph={I.warning} size="sm" className="translate-y-px" />
      <span className="min-w-0 flex-1">{AWAY.alarm.text}</span>
      <Button size="xs" onClick={() => setResolved(true)}>
        {AWAY.alarm.action}
      </Button>
    </div>
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
  group: "blocked" | "canWait" | "running";
  selected: boolean;
  onSelect: () => void;
}) {
  const open = openQuestions(task, answers);
  const blocking = open.filter((q) => q.blocking).length;
  const later = open.length - blocking;
  // Blocked without a question: what exactly the person has to do, in the same words as "1 question".
  const session = deriveTask(task, chat);
  const gate = currentGate(task);
  const decision =
    group !== "blocked" || blocking
      ? undefined
      : session.escalationPending
        ? "split into stages?"
        : session.unmarked.length > 0
          ? `${session.unmarked.length} ${plural(session.unmarked.length, "assumption", "assumptions")} to confirm`
          : gate
            ? `approve ${gate.title}`
            : undefined;
  const needs = open.length > 0 || !!decision;
  const nextGate = task.stages.flatMap((s) => (s.gate?.status === "ahead" && s.gate.eta ? [s.gate] : []))[0];
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
      <TaskDot state={group === "canWait" ? "running" : group} className="mt-[4px]" />
      <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-md gap-y-0.5">
        <span className="truncate text-body font-medium text-primary">{task.title}</span>
        <span className="justify-self-end text-footnote tabular-nums text-secondary">
          {needs && task.waitingFor ? (
            `waiting ${task.waitingFor}`
          ) : !needs && nextGate ? (
            <Hint text={whenHint(nextGate.etaSource)} focusable={false}>
              Your turn {nextGate.eta}
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
function NothingNeedsYou() {
  const upcoming = TASKS.flatMap((t) =>
    t.stages.flatMap((s) => (s.gate?.mine && s.gate.status === "ahead" && s.gate.eta ? [{ task: t, gate: s.gate }] : [])),
  );
  return (
    <div className="flex flex-col gap-md">
      <EmptyState>Nothing needs you</EmptyState>
      <section className="flex flex-col gap-0.5">
        <h2 className="px-sm pb-xs text-footnote text-muted">Coming up for you</h2>
        {upcoming.map(({ task, gate }) => (
          <div key={task.id + gate.title} className="flex items-start gap-sm px-sm py-xs">
            <TaskDot state="ahead" className="mt-[4px]" />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-body text-primary">
                {gateText(gate)} · {task.title}
              </span>
              <span className="text-footnote text-muted">
                {gate.eta} · based on {gate.etaSource}
              </span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------ Onboarding */

// Micro-onboarding tour: what is inside the page, one element at a time. Steps whose element is not on the page are skipped.
const TOUR: Coachmark[] = [
  {
    target: "groups",
    title: "Start at the top",
    body: (
      <>
        <span className="text-primary">Blocked</span>: the agent stopped and waits for you. <span className="text-primary">Can wait</span>: it
        has a question but keeps working. <span className="text-primary">Running</span>: nothing needed yet.
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
  const { answers, attention, busyUntil, blocked, canWait, needsYou, running, chats } = useInbox();
  // The first task that needs the person is open on arrival; clicking a task opens it on the right.
  // "Answer in the plan" from a task's chat opens that task (?task=id); otherwise the first task that needs you.
  const { search } = useLocation();
  // First visit: the intro above the list, then the tour. `?intro` shows it again (for demos).
  const [onboarding, setOnboarding] = useState<"intro" | "tour" | null>(() =>
    new URLSearchParams(search).has("intro") || !introSeen() ? "intro" : null,
  );
  const finishOnboarding = () => {
    markIntroSeen();
    setOnboarding(null);
  };
  const [selectedId, setSelectedId] = useState<string | null>(() => new URLSearchParams(search).get("task") ?? needsYou[0]?.id ?? null);
  const [expanded, setExpanded] = useState(false);
  // Same pane as beside a task chat: Plan first, Brief a tab away for tasks that have one.
  const [paneTab, setPaneTab] = useState<"plan" | "brief">("plan");
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
                canWait={canWait.length}
                attention={attention}
                busyUntil={busyUntil}
                onOpenTask={setSelectedId}
              />
              {onboarding === "intro" && (
                <>
                  <UpNextIntro onTour={() => setOnboarding("tour")} onSkip={finishOnboarding} />
                  <WavyDivider />
                </>
              )}
              {needsYou.length === 0 && <NothingNeedsYou />}
              {/* One list: space comes after an open group, so collapsed headings stack tightly. */}
              <div className="flex flex-col pt-xs">
                {(
                  [
                    ["Blocked", blocked],
                    ["Can wait", canWait],
                    ["Running", running],
                  ] as const
                )
                  .filter(([, tasks]) => tasks.length > 0)
                  .map(([title, tasks], i) => (
                    <Group key={title} title={title} count={tasks.length} coach={i === 0 ? "groups" : undefined}>
                      {tasks.map((t) => (
                        <TaskRow
                          key={t.id}
                          task={t}
                          group={title === "Blocked" ? "blocked" : title === "Can wait" ? "canWait" : "running"}
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
              {selected.brief && (
                <Tabs
                  label="Plan and brief"
                  value={paneTab}
                  onChange={(t) => setPaneTab(t as "plan" | "brief")}
                  items={[
                    { value: "plan" as const, label: "Plan" },
                    { value: "brief" as const, label: "Brief" },
                  ]}
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
          {paneTab === "brief" && selected.brief && session ? (
            <BriefView view={{ id: selected.id, task: selected, ...session }} />
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
                    onDone={openNext}
                  />
                )
              }
            />
          )}
        </SidePane>
      )}
      {onboarding === "tour" && <Coachmarks steps={TOUR} onDone={finishOnboarding} />}
    </div>
  );
}
