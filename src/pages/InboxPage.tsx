import { useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, EmptyState, Hint, Icon, Menu } from "../ui";
import { SESSIONS } from "../data/sessions";
import { SidePane, SIDE_PANE } from "../components/SidePane";
import { TaskDot } from "../components/StatusMark";
import { AttentionMenu } from "../components/AttentionMenu";
import { usePersistentWidth } from "../data/usePersistentWidth";
import {
  AWAY,
  STEP_RESULT,
  STEP_WORK,
  TASKS,
  type Option,
  type PlanDiff,
  type PlanStep,
  type Question,
  type Stage,
  type StepResult,
  type Status,
  type Task,
} from "../data/inbox";
import { answer, answerKey, openQuestions, setAttention, unanswer, useInbox, type Attention } from "../data/inboxStore";

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

/** A gate is a stop in the plan: either the person approves, or an automatic check has to pass. */
function gateText(gate: NonNullable<Stage["gate"]>) {
  if (gate.mine) return gate.status === "passed" ? `You approved ${gate.title}` : `You approve ${gate.title}`;
  return gate.status === "passed" ? `Passed: ${gate.title}` : `Check: ${gate.title}`;
}

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
          Inbox
        </h1>
        <AttentionMenu attention={attention} busyUntil={busyUntil} />
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
    <p className="text-footnote text-muted">
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
  selected,
  onSelect,
}: {
  task: Task;
  answers: Record<string, string>;
  selected: boolean;
  onSelect: () => void;
}) {
  const open = openQuestions(task, answers);
  const blocking = open.filter((q) => q.blocking).length;
  const later = open.length - blocking;
  const needs = open.length > 0;
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
      <TaskDot state={blocking ? "blocked" : needs ? "canWait" : "running"} className="mt-[4px]" />
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
            {blocking > 0 && (
              <span className="text-secondary">
                {blocking} {plural(blocking, "question", "questions")}
              </span>
            )}
            {blocking > 0 && later > 0 && <span className="text-secondary"> · +{later} can wait</span>}
            {needs && !blocking && (
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
function Group({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <section className={cx("flex flex-col", open ? "pb-lg" : "pb-sm")}>
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

/* --------------------------------------------------------------- Plan pane */

/*
 * Every forecast says where it comes from, in its own tooltip: one for money, one for time.
 * Time is the agent's working time, never a deadline. Actual numbers need no explanation.
 */
const AGENT_ESTIMATE = "the agent's estimate for this step";
const isForecast = (value: string) => value.startsWith("~");
const costHint = (basis: string | undefined, model: string) => `Cost forecast from ${basis ?? AGENT_ESTIMATE}, priced at ${model} rates.`;
const timeHint = (basis: string | undefined) => `Agent working time, forecast from ${basis ?? AGENT_ESTIMATE}. Not a deadline.`;
const whenHint = (source: string | undefined) =>
  `When you are likely to be needed, forecast from ${source ?? AGENT_ESTIMATE}. It moves as the agents work.`;

/** Money and time; a forecast (~) gets a tooltip each with its source, actual numbers stay plain. */
function Forecast({
  cost,
  time,
  basis,
  model,
  focusable,
}: {
  cost?: string;
  time?: string;
  basis?: string;
  model: string;
  focusable?: boolean;
}) {
  return (
    <>
      {cost &&
        (isForecast(cost) ? (
          <Hint text={costHint(basis, model)} focusable={focusable}>
            {cost}
          </Hint>
        ) : (
          cost
        ))}
      {cost && time && " · "}
      {time &&
        (isForecast(time) ? (
          <Hint text={timeHint(basis)} focusable={focusable}>
            {time}
          </Hint>
        ) : (
          time
        ))}
    </>
  );
}

/** Plan changes in words instead of + ~ − ◆, so they need no legend; no color coding, the word and strike-through carry it. */
const DIFF_WORD: Record<PlanDiff["kind"], string> = { add: "New", change: "Changes", remove: "Removed", gate: "New" };

function DiffChip({ kind }: { kind: PlanDiff["kind"] }) {
  return (
    <span className="ml-sm inline-block rounded-sm bg-alpha-3 px-1.5 text-footnote leading-5 text-secondary">{DIFF_WORD[kind]}</span>
  );
}

/** Agent name shown on hover: out of flow so it takes no width from the title; over the title's end, which fades out under it. */
const HOVER_AGENT =
  "pointer-events-none absolute right-full top-0 whitespace-nowrap pl-[var(--cds-gap-lg)] bg-[linear-gradient(to_right,transparent,var(--cds-surface-2)_var(--cds-gap-lg))] opacity-0 transition-opacity duration-fast group-hover/step:opacity-100";

/** Text followed by its chip; the chip is glued to the last word so a wrapped title never leaves it alone on a line. */
function WithChip({ text, kind }: { text: string; kind?: PlanDiff["kind"] }) {
  if (!kind) return <>{text}</>;
  const cut = text.lastIndexOf(" ") + 1;
  return (
    <>
      {text.slice(0, cut)}
      <span className="whitespace-nowrap">
        {text.slice(cut)}
        <DiffChip kind={kind} />
      </span>
    </>
  );
}

/** "Yes, form is isolated" → "reversible": the short form fits on the option row; the full text shows once it is picked. */
const reversibleShort = (r: string) =>
  r.startsWith("Yes") ? "reversible" : r.startsWith("Partly") ? "partly reversible" : "not reversible";

/** Custom answers typed in the reply box are stored as `text:…` next to option ids. */
const answerLabel = (q: Question, picked: string) =>
  picked.startsWith("text:") ? `“${picked.slice(5)}”` : (q.options.find((o) => o.id === picked)?.label ?? picked);

/** A question inside its plan step: every option shows its cost, time and reversibility, so they can be compared at a glance. */
/** A custom answer typed into the card: the agent turns it into a plan change you review and apply. */
type CustomAnswer = { text: string; ready: boolean };

const fieldClass =
  "w-full resize-none rounded border border-alpha-2 bg-fill-field px-sm py-xs text-body text-primary outline-none placeholder:text-muted focus-visible:shadow-focus";

/**
 * The only place to answer a question: pick an option, or give your own answer, which comes back as a plan
 * change to apply. "Ask" is a thread about the question; it never answers it.
 */
function QuestionCard({
  task,
  question,
  choice,
  setChoice,
  custom,
  setCustom,
  onAnswered,
}: {
  task: Task;
  question: Question;
  /** Picked option; lives in PlanPane so the plan below can preview it. */
  choice: string;
  setChoice: (id: string) => void;
  custom?: CustomAnswer;
  setCustom: (c: CustomAnswer | undefined) => void;
  onAnswered: () => void;
}) {
  const chosen = question.options.find((o) => o.id === choice)!;
  const recommended = question.options.find((o) => o.recommended);
  const [mode, setMode] = useState<"choose" | "other" | "ask">("choose");
  const [draft, setDraft] = useState("");
  const [thread, setThread] = useState<{ q: string; a?: string }[]>([]);

  const sendOther = () => {
    const text = draft.trim();
    if (!text) return;
    setCustom({ text, ready: false });
    setMode("choose");
    // Mock: the agent needs a moment to turn the answer into a plan change.
    window.setTimeout(() => setCustom({ text, ready: true }), 1500);
  };
  const sendAsk = () => {
    const text = draft.trim();
    if (!text) return;
    setThread((t) => [...t, { q: text }]);
    setDraft("");
    setMode("choose");
    const reply =
      `${question.context ?? ""} ` +
      (recommended
        ? `Рекомендую «${recommended.label}»: ${recommended.cost}, ${recommended.toAcceptance}, ${reversibleShort(recommended.reversible)}.`
        : "");
    window.setTimeout(() => setThread((t) => t.map((m, k) => (k === t.length - 1 ? { ...m, a: reply.trim() } : m))), 700);
  };

  return (
    <section
      id={questionAnchor(task.id, question.id)}
      aria-label={question.text}
      className="flex scroll-mt-[var(--cds-gap-xl)] flex-col gap-lg rounded-lg border border-alpha-2 p-lg"
    >
      <div className="flex flex-col gap-xs">
        <span className={cx("text-footnote", question.blocking ? "text-clay" : "text-muted")}>
          {question.blocking ? "Blocking" : "Can wait"}
        </span>
        <p className="text-body font-medium text-primary">{question.text}</p>
        {question.context && <p className="text-footnote text-muted">{question.context}</p>}
      </div>

      {/* Questions about the question: answered by the agent right here; the question stays open. */}
      {thread.length > 0 && (
        <ul className="flex flex-col gap-sm">
          {thread.map((m, k) => (
            <li key={k} className="flex flex-col gap-0.5 text-footnote">
              <span className="text-secondary">
                <span className="text-muted">You · </span>
                {m.q}
              </span>
              <span className="text-secondary">
                <span className="text-muted">{task.agent} · </span>
                {m.a ?? <span className="text-muted">thinking…</span>}
              </span>
            </li>
          ))}
        </ul>
      )}

      {custom ? (
        <div className="flex flex-col gap-xs">
          <span className="text-footnote text-muted">Your answer</span>
          <p className="text-body text-primary">“{custom.text}”</p>
          <span className="text-footnote text-muted">
            {custom.ready ? "The plan change is ready — review it in the plan below." : `${task.agent} is drafting the plan change…`}
          </span>
        </div>
      ) : mode === "choose" ? (
        <div role="radiogroup" aria-label={question.text} className="flex flex-col gap-xs">
          {question.options.map((o) => {
            const on = o.id === choice;
            return (
              // What an option does to the plan is previewed in the plan itself, right below the card.
              <div key={o.id} className={cx("rounded transition-colors duration-fast", on ? "bg-alpha-2" : "hover:bg-fill-ghost-hover")}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setChoice(o.id)}
                  className="flex w-full items-start gap-sm rounded px-sm py-sm text-left outline-none focus-visible:shadow-focus cursor-[var(--cds-cursor-interactive)]"
                >
                  <span
                    aria-hidden="true"
                    className={cx(
                      "mt-[3px] size-[12px] shrink-0 rounded-full border",
                      on ? "border-[4px] border-[var(--cds-text-primary)]" : "border-alpha-4",
                    )}
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-body">
                      <span className={on ? "text-primary" : "text-secondary"}>{o.label}</span>
                      {o.recommended && <span className="text-footnote text-muted"> · Recommended</span>}
                    </span>
                    <span className="text-footnote tabular-nums text-secondary">
                      <Forecast cost={o.cost} time={o.toAcceptance} basis={o.forecastSource} model={task.model} focusable={false} /> ·{" "}
                      <Hint text={`Reversible: ${o.reversible}.`} focusable={false}>
                        {reversibleShort(o.reversible)}
                      </Hint>
                    </span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <textarea
          autoFocus
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (mode === "other") sendOther();
              else sendAsk();
            }
            if (e.key === "Escape") setMode("choose");
          }}
          placeholder={
            mode === "other"
              ? "Your answer in your own words. The agent turns it into a plan change for you to review."
              : "Ask about this question"
          }
          aria-label={mode === "other" ? "Your answer" : "Ask about this question"}
          className={fieldClass}
        />
      )}

      <div className="flex items-center justify-end gap-xs">
        {custom ? (
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setDraft(custom.text);
                setCustom(undefined);
                setMode("other");
              }}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="primary"
              disabled={!custom.ready}
              onClick={() => {
                answer(task.id, question.id, `text:${custom.text}`);
                onAnswered();
              }}
            >
              Apply
            </Button>
          </>
        ) : mode === "choose" ? (
          <>
            <Button size="sm" className="me-auto" onClick={() => (setDraft(""), setMode("ask"))}>
              Ask
            </Button>
            <Button size="sm" variant="secondary" onClick={() => (setDraft(""), setMode("other"))}>
              Other answer…
            </Button>
            <Button
              size="sm"
              variant="primary"
              title={`Go with “${chosen.label}”`}
              onClick={() => {
                answer(task.id, question.id, choice);
                onAnswered();
              }}
            >
              Answer
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="secondary" onClick={() => setMode("choose")}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" disabled={!draft.trim()} onClick={mode === "other" ? sendOther : sendAsk}>
              {mode === "other" ? "Send" : "Ask"}
            </Button>
          </>
        )}
      </div>
    </section>
  );
}

function AutoDecisions({ task }: { task: Task }) {
  const [open, setOpen] = useState(false);
  if (!task.autoDecisions.length) return null;
  return (
    <section className="flex flex-col">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="-mx-sm flex items-center gap-xs rounded-sm px-sm py-xs text-left text-footnote text-muted outline-none hover:bg-fill-ghost-hover hover:text-secondary focus-visible:shadow-focus cursor-[var(--cds-cursor-interactive)]"
      >
        Auto-decided · {task.autoDecisions.length}
        <Icon glyph={open ? I.chevronDown : I.chevronRight} size="sm" />
      </button>
      {open && (
        <ul className="flex flex-col">
          {task.autoDecisions.map((d) => (
            <li key={d.id} className="flex items-center gap-sm py-xs">
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-body text-primary">{d.text}</span>
                <span className="text-footnote text-muted">{d.why}</span>
              </div>
              <Button size="xs">Change</Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const fmtNum = (n: number) => n.toLocaleString("en-US");

/** What a finished step produced: summary, the agent's own decisions, and changed files with diff stats as in chats. */
function StepResultView({ result }: { result: StepResult }) {
  return (
    <div className="flex flex-col gap-md pt-xs">
      <p className="text-body text-secondary">{result.summary}</p>
      {result.decisions && result.decisions.length > 0 && (
        <div className="flex flex-col gap-xs">
          <span className="text-footnote text-muted">Decided on the way</span>
          <ul className="flex flex-col gap-0.5">
            {result.decisions.map((d) => (
              <li key={d} className="text-footnote text-secondary">
                {d}
              </li>
            ))}
          </ul>
        </div>
      )}
      {result.files && result.files.length > 0 && (
        <div className="flex flex-col gap-xs">
          <span className="text-footnote text-muted">
            Changed {result.files.length} {plural(result.files.length, "file", "files")}
          </span>
          <ul className="flex flex-col gap-0.5">
            {result.files.map((f) => (
              <li key={f.name} className="flex items-baseline justify-between gap-md font-mono text-footnote">
                <span className="truncate text-secondary">{f.name}</span>
                {/* Same diff stat as the repo bar in chats: git colors on a soft backing. */}
                <span className="flex shrink-0 items-center gap-1.5 rounded-sm bg-alpha-1 px-1.5 leading-5 tabular-nums">
                  <span className="text-git-added">+{fmtNum(f.added)}</span>
                  <span className="text-git-removed">−{fmtNum(f.removed)}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * One quiet meta line under the brief: status first, then where the task works and what it has used.
 * One size, one color; the only emphasis is the question count, which scrolls to the question.
 */
function PaneMeta({ task, answers }: { task: Task; answers: Record<string, string> }) {
  const open = openQuestions(task, answers).sort((a, b) => Number(b.blocking) - Number(a.blocking));
  const next = task.stages.flatMap((st) => st.steps).find((x) => x.status === "running" || x.status === "ahead");
  const branch = SESSIONS.find((x) => x.id === task.id)?.repo?.branch;
  const spentTime = Object.entries(STEP_WORK)
    .filter(([key]) => key.startsWith(`${task.id}:`))
    .reduce((n, [, w]) => n + minutes(w.time), 0);
  return (
    <p className="text-footnote text-muted">
      {open.length > 0 ? (
        <button
          type="button"
          onClick={() =>
            document.getElementById(questionAnchor(task.id, open[0].id))?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          className="-mx-1 rounded-sm px-1 text-secondary outline-none transition-colors duration-fast hover:bg-fill-ghost-hover hover:text-primary focus-visible:shadow-focus cursor-[var(--cds-cursor-interactive)]"
        >
          {open.length} {plural(open.length, "question", "questions")}
        </button>
      ) : (
        <span>Running{next && ` · next: ${next.title}`}</span>
      )}
      {" · "}
      {task.project}
      {branch && ` · ${branch}`}
      {" · "}
      <span title={`${task.tokens} tokens`}>
        {task.spent} spent · {duration(spentTime)}
      </span>
    </p>
  );
}

/**
 * Side pane for a task: the plan, with open questions expanded on their steps.
 * Questions are answered only here, in their plan row: no chat box on this screen.
 */
function PlanPane({ task, answers, onTaskDone }: { task: Task; answers: Record<string, string>; onTaskDone: () => void }) {
  const open = openQuestions(task, answers).sort((a, b) => Number(b.blocking) - Number(a.blocking));
  const afterAnswer = () => {
    // `answers` is from before this answer: the last open question means the task no longer needs you.
    if (open.length <= 1) onTaskDone();
  };
  const single = task.stages.length === 1;

  // Picked option per question (recommended first). The plan previews it before you answer.
  const questions = task.stages.flatMap((st) => st.steps.flatMap((x) => (x.question ? [x.question] : [])));
  const [choices, setChoices] = useState<Record<string, string>>(() =>
    Object.fromEntries(questions.map((q) => [q.id, q.options.find((o) => o.recommended)?.id ?? q.options[0].id])),
  );
  // Own answers typed into a card, until applied. Once the agent has drafted it, the plan previews the change.
  const [customs, setCustoms] = useState<Record<string, CustomAnswer | undefined>>({});
  const stepOfQuestion = (qid: string) => task.stages.flatMap((st) => st.steps).find((x) => x.question?.id === qid)?.id ?? "";
  // What the options do to the plan: answered ones are final, open ones are a preview of the picked option.
  const effects = questions.flatMap((q): (PlanDiff & { preview: boolean })[] => {
    const picked = answers[answerKey(task.id, q.id)];
    const own = picked?.startsWith("text:") ? picked.slice(5) : !picked && customs[q.id]?.ready ? customs[q.id]!.text : undefined;
    if (own) return [{ kind: "change", step: stepOfQuestion(q.id), text: `Follows your answer: “${own}”`, preview: !picked }];
    if (!picked && customs[q.id]) return [];
    const option = q.options.find((o) => o.id === (picked ?? choices[q.id]));
    return (option?.diff ?? []).map((d) => ({ ...d, preview: !picked }));
  });
  const effectOn = (stepId: string, kind: PlanDiff["kind"]) => effects.find((e) => e.step === stepId && e.kind === kind);

  // Each stage is its own section: steps and gates in order, joined by a vertical line inside the stage.
  type Item =
    | { kind: "step"; key: string; step: PlanStep }
    | { kind: "gate"; key: string; gate: NonNullable<Stage["gate"]> }
    | { kind: "added"; key: string; text: string; preview: boolean; diff: PlanDiff };
  const stages = task.stages.map((stage) => ({
    stage,
    items: [
      ...stage.steps.flatMap((step) => {
        // A final removal drops the step; a previewed one stays, struck through.
        const removed = effectOn(step.id, "remove");
        const added = effects
          .filter((e) => (e.kind === "add" || e.kind === "gate") && e.step === step.id)
          .map((e) => ({ kind: "added" as const, key: `${stage.id}-${step.id}-${e.text}`, text: e.text, preview: e.preview, diff: e }));
        return [...(removed && !removed.preview ? [] : [{ kind: "step" as const, key: `${stage.id}-${step.id}`, step }]), ...added];
      }),
      ...(stage.gate ? [{ kind: "gate" as const, key: `${stage.id}-gate`, gate: stage.gate }] : []),
    ] as Item[],
  }));
  const items = stages.flatMap((g) => g.items);
  // Finished stages start collapsed; the current one and the ones ahead are open.
  const stageDone = (st: Stage) => st.steps.every((x) => x.status === "done" && !x.question);
  const [openSteps, setOpenSteps] = useState<Record<string, boolean>>({});
  const [openQs, setOpenQs] = useState<Record<string, boolean>>({});
  const hasBlocking = open.some((q) => q.blocking);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(task.stages.map((st) => [st.id, stageDone(st)])),
  );

  // Name the agent only where it changes along the plan; repeating the same name on every step reads as a table.
  const newAgent = new Set<string>();
  items.reduce<string | undefined>((prev, it) => {
    // Done steps show their line on hover only (with the agent), so they do not count here.
    if (it.kind === "added") {
      if (it.diff.agent && it.diff.agent !== prev) newAgent.add(it.key);
      return it.diff.agent ?? prev;
    }
    if (it.kind !== "step" || (it.step.status === "done" && !it.step.question)) return prev;
    const agent = STEP_WORK[`${task.id}:${it.step.id}`]?.agent;
    if (agent && agent !== prev) newAgent.add(it.step.id);
    return agent ?? prev;
  }, undefined);

  const renderItem = (item: Item, last: boolean) => {
    // The line runs from under this mark to the next one; the mark sits on a pane-colored backing so the line never shows through it.
    const rail = !last && <span aria-hidden="true" className="absolute top-[18px] bottom-[-2px] left-[5.5px] w-px bg-alpha-3" />;
    if (item.kind === "added")
      return (
        <li key={item.key} className="group/step relative flex items-start gap-md pb-[var(--cds-gap-lg)]">
          {rail}
          <span className="relative mt-[4px] flex bg-surface-2">
            <TaskDot state="ahead" />
          </span>
          <span className="flex min-w-0 flex-1 items-baseline justify-between gap-md">
            <span className={cx("min-w-0 text-body", item.preview ? "text-primary" : "text-secondary")}>
              <WithChip text={item.text} kind={item.preview ? "add" : undefined} />
            </span>
            {item.diff.time && (
              <span className="relative shrink-0 text-footnote tabular-nums text-secondary">
                {item.diff.agent && (
                  <span className={cx("text-muted", !newAgent.has(item.key) && HOVER_AGENT)}>
                    {item.diff.agent} ·{" "}
                  </span>
                )}
                <Forecast cost={item.diff.cost} time={item.diff.time} basis={item.diff.basis} model={task.model} />
              </span>
            )}
          </span>
        </li>
      );
    if (item.kind === "gate")
      return (
        <li key={item.key} className="relative flex items-start gap-md pb-[var(--cds-gap-lg)]">
          {rail}
          <span className="relative mt-[4px] flex bg-surface-2">
            {/* Gates use the same dots as steps: the text says who approves. */}
            <TaskDot state={item.gate.status === "passed" ? "done" : "ahead"} />
          </span>
          <span className="flex min-w-0 flex-1 items-baseline justify-between gap-md">
            <span className="text-body text-secondary">{gateText(item.gate)}</span>
            {item.gate.eta && (
              <span className="shrink-0 text-footnote tabular-nums text-secondary">
                <Hint text={whenHint(item.gate.etaSource)}>{item.gate.eta}</Hint>
              </span>
            )}
          </span>
        </li>
      );
    const step = item.step;
    const q = step.question;
    const picked = q && answers[answerKey(task.id, q.id)];
    const status: Status = q ? (picked ? "running" : "waiting") : step.status;
    const work = STEP_WORK[`${task.id}:${step.id}`];
    const removing = effectOn(step.id, "remove");
    const changed = effectOn(step.id, "change");
    // Finished steps open to show what they produced.
    const result = status === "done" ? STEP_RESULT[`${task.id}:${step.id}`] : undefined;
    const expanded = !!result && !!openSteps[step.id];
    return (
      <li key={item.key} className="group/step relative flex items-start gap-md pb-[var(--cds-gap-lg)]">
        {rail}
        <span className="relative mt-[4px] flex bg-surface-2">
          <TaskDot
            state={
              status === "waiting"
                ? q?.blocking
                  ? "blocked"
                  : "canWait"
                : status === "running"
                  ? "running"
                  : status === "done"
                    ? "done"
                    : "ahead"
            }
          />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-sm">
          <div className="flex items-baseline justify-between gap-md">
            {result ? (
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpenSteps((o) => ({ ...o, [step.id]: !expanded }))}
                className="flex min-w-0 items-baseline gap-sm rounded-sm text-left outline-none focus-visible:shadow-focus cursor-[var(--cds-cursor-interactive)]"
              >
                <span className="text-body text-primary">{step.title}</span>
                <Icon
                  glyph={I.chevronRight}
                  size="sm"
                  className={cx(
                    "self-center text-muted transition-[opacity,transform] duration-fast motion-reduce:transition-none",
                    expanded ? "rotate-90" : "opacity-0 group-hover/step:opacity-100",
                  )}
                />
              </button>
            ) : (
              <span className="min-w-0">
                <span
                  className={cx("text-body", removing ? "text-muted line-through" : status === "ahead" ? "text-secondary" : "text-primary")}
                >
                  <WithChip text={step.title} kind={removing ? "remove" : undefined} />
                </span>
              </span>
            )}
            {work && (
              // Done steps keep their cost on hover; for steps ahead it is a forecast that informs the answer, so it stays visible.
              <span
                className={cx(
                  "relative shrink-0 text-footnote tabular-nums",
                  status === "done"
                    ? cx("text-muted transition-opacity duration-fast", !expanded && "opacity-0 group-hover/step:opacity-100")
                    : "text-secondary",
                  removing && "text-muted line-through",
                )}
              >
                {/* Agent: always where it changes, on hover everywhere else (overlaid, so nothing shifts and the title keeps its width). */}
                <span className={cx("text-muted", status !== "done" && !newAgent.has(step.id) && HOVER_AGENT)}>
                  {work.agent} ·{" "}
                </span>
                <Forecast cost={work.cost} time={work.time} basis={work.basis} model={task.model} />
              </span>
            )}
          </div>
          {changed && (
            <span className="text-footnote text-secondary">
              <WithChip text={changed.text} kind={changed.preview ? "change" : undefined} />
            </span>
          )}
          {expanded && result && <StepResultView result={result} />}
          {q && !picked && !q.blocking && hasBlocking && !openQs[q.id] && (
            // A blocking question is open elsewhere in the task: this one folds into a line so it does not compete.
            <div
              id={questionAnchor(task.id, q.id)}
              className="flex scroll-mt-[var(--cds-gap-xl)] items-baseline justify-between gap-md rounded bg-alpha-1 py-xs ps-md pe-xs"
            >
              <span className="min-w-0 truncate text-footnote">
                <span className="text-muted">Can wait · </span>
                <span className="text-secondary">{q.text}</span>
              </span>
              {/* Opens the card; it does not answer, so it is not called "Answer" and is not the white commit button. */}
              <Button size="xs" variant="secondary" onClick={() => setOpenQs((o) => ({ ...o, [q.id]: true }))}>
                Show options
              </Button>
            </div>
          )}
          {q && !picked && (q.blocking || !hasBlocking || openQs[q.id]) && (
            <QuestionCard
              task={task}
              question={q}
              choice={choices[q.id]}
              setChoice={(id) => setChoices((c) => ({ ...c, [q.id]: id }))}
              onAnswered={afterAnswer}
              custom={customs[q.id]}
              setCustom={(c) => setCustoms((m) => ({ ...m, [q.id]: c }))}
            />
          )}
          {q && picked && (
            <span className="flex flex-wrap items-center gap-x-xs text-footnote text-muted">
              Your answer: {answerLabel(q, picked)}
              <button
                type="button"
                onClick={() => unanswer(task.id, q.id)}
                className="rounded-sm px-1 text-secondary outline-none hover:bg-fill-ghost-hover hover:text-primary focus-visible:shadow-focus"
              >
                Change
              </button>
            </span>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="flex flex-col gap-[var(--cds-gap-lg)] px-[var(--cds-gap-lg)] pt-xs pb-[var(--cds-gap-xl)]">
      {/* Under the title: the brief as a subtitle, then one quiet meta line. */}
      <div className="flex flex-col gap-xs">
        <p className="text-body text-secondary">{task.brief}</p>
        <PaneMeta task={task} answers={answers} />
      </div>

      {/* Questions sit on their steps, so it is clear where in the task you are. */}
      <ol aria-label="Plan" className="flex flex-col">
        {stages.map(({ stage, items: list }, si) => {
          // Progress counts the plan as it would be: steps that are being removed drop out, new ones count as not done.
          const kept = list.flatMap((it) => (it.kind === "step" && !effectOn(it.step.id, "remove") ? [it.step] : []));
          const total = kept.length + list.filter((it) => it.kind === "added").length;
          const done = kept.filter((x) => x.status === "done" && !x.question).length;
          // Stage total: actual for done steps, estimates for the rest, as the plan would be with the picked options.
          const costs = [
            ...kept.flatMap((x) => {
              const w = STEP_WORK[`${task.id}:${x.id}`];
              return w ? [{ cost: w.cost, time: w.time }] : [];
            }),
            ...list.flatMap((it) => (it.kind === "added" ? [{ cost: it.diff.cost ?? "$0", time: it.diff.time ?? "0m" }] : [])),
          ];
          const approx = costs.some((c) => c.cost.startsWith("~") || c.time.startsWith("~"));
          const sumCost = costs.reduce((n, c) => n + dollars(c.cost), 0);
          const sumTime = costs.reduce((n, c) => n + anyMinutes(c.time), 0);
          const actual = costs.filter((c) => !c.cost.startsWith("~") && !c.time.startsWith("~")).length;
          const sumWhy = `Sum of ${costs.length} steps: ${actual} done, ${costs.length - actual} forecast.`;
          const stageMeta = (
            <>
              {done === total ? "Done" : `${done} of ${total} done`} ·{" "}
              {approx ? (
                <>
                  <Hint text={`${sumWhy} Each forecast shows its source on hover.`} focusable={false}>
                    ~{money(sumCost)}
                  </Hint>{" "}
                  ·{" "}
                  <Hint text={`${sumWhy} Agent working time, not a deadline.`} focusable={false}>
                    ~{duration(sumTime)}
                  </Hint>
                </>
              ) : (
                `${money(sumCost)} · ${duration(sumTime)}`
              )}
            </>
          );
          const isCollapsed = !single && collapsed[stage.id];
          return (
            // Room comes after an open stage; collapsed stages stack tightly, like the Inbox groups.
            <li key={stage.id} className={cx("flex flex-col", isCollapsed ? "pb-md" : si < stages.length - 1 && "pb-lg")}>
              {/* One stage: a plain "Plan" heading; several: numbered, collapsible stages. */}
              {single && (
                <div className="sticky top-0 z-[2] flex items-baseline gap-sm bg-surface-2 py-xs mb-[var(--cds-gap-md)]">
                  <h3 className="text-body font-medium text-primary">Plan</h3>
                  <span className="ms-auto shrink-0 text-footnote tabular-nums text-muted">{stageMeta}</span>
                </div>
              )}
              {!single && (
                <button
                  type="button"
                  aria-expanded={!isCollapsed}
                  onClick={() => setCollapsed((c) => ({ ...c, [stage.id]: !isCollapsed }))}
                  className={cx(
                    // Sticky while its steps scroll by, so you always know which stage you are in.
                    "group/stage sticky top-0 z-[2] flex w-full items-baseline gap-sm bg-surface-2 py-xs text-left outline-none focus-visible:shadow-focus cursor-[var(--cds-cursor-interactive)]",
                    !isCollapsed && "pb-[var(--cds-gap-md)]",
                  )}
                >
                  <span className="text-body font-medium text-primary">
                    <span className="tabular-nums">{si + 1}</span>
                    {" · "}
                    {stage.title}
                  </span>
                  {/* Same chevron as group headings: after the label, on hover, rotated when open. */}
                  <Icon
                    glyph={I.chevronRight}
                    size="sm"
                    className={cx(
                      "self-center text-muted opacity-0 transition-[opacity,transform] duration-fast group-hover/stage:opacity-100 group-focus-visible/stage:opacity-100 motion-reduce:transition-none",
                      !isCollapsed && "rotate-90",
                    )}
                  />
                  <span className="ms-auto shrink-0 text-footnote tabular-nums text-muted">{stageMeta}</span>
                </button>
              )}
              {!isCollapsed && <ol className="flex flex-col">{list.map((item, idx) => renderItem(item, idx === list.length - 1))}</ol>}
            </li>
          );
        })}
        {task.autoDecisions.length > 0 && (
          <li>
            <AutoDecisions task={task} />
          </li>
        )}
      </ol>
    </div>
  );
}

/** Free-text reply to the agent: answers the first open question in your own words, or just adds a note. */
/** Minutes from "18m" / "1h 10m"; estimates ("~20m") are not counted. */
const minutes = (t: string) => (t.startsWith("~") ? 0 : Number(t.match(/(\d+)h/)?.[1] ?? 0) * 60 + Number(t.match(/(\d+)m/)?.[1] ?? 0));
/** Minutes from "18m" / "~1h 20m", estimates included. */
const anyMinutes = (t: string) => Number(t.match(/(\d+)h/)?.[1] ?? 0) * 60 + Number(t.match(/(\d+)m/)?.[1] ?? 0);
const duration = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`);

const questionAnchor = (taskId: string, questionId: string) => `question-${taskId}-${questionId}`;

/* -------------------------------------------------------------------- Page */

export function InboxPage() {
  const { answers, attention, busyUntil, blocked, canWait, needsYou, running } = useInbox();
  // The first task that needs the person is open on arrival; clicking a task opens it on the right.
  // "Answer in the plan" from a task's chat opens that task (?task=id); otherwise the first task that needs you.
  const { search } = useLocation();
  const [selectedId, setSelectedId] = useState<string | null>(() => new URLSearchParams(search).get("task") ?? needsYou[0]?.id ?? null);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const [paneWidth, setPaneWidth] = usePersistentWidth("cc:side-pane-width", SIDE_PANE.default);
  // The list keeps at least 400px next to the pane.
  const root = useRef<HTMLDivElement>(null);
  const paneMax = (root.current?.clientWidth ?? 1200) - 400;
  const selected = TASKS.find((t) => t.id === selectedId);

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
                  .map(([title, tasks]) => (
                    <Group key={title} title={title} count={tasks.length}>
                      {tasks.map((t) => (
                        <TaskRow
                          key={t.id}
                          task={t}
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
          title={selected.title}
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
          <PlanPane task={selected} answers={answers} onTaskDone={openNext} />
        </SidePane>
      )}
    </div>
  );
}
