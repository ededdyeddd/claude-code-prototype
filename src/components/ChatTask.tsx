import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Block } from "../data/transcripts";
import { costRange, currentGate, gateText, money, type Assumption, type Question, type ReviewTab } from "../data/task";
import { useInbox } from "../data/inboxStore";
import { PANE_BODY, PlanPane, QuestionCard, answerLabel, type CustomAnswer } from "./PlanPane";
import { TASKS } from "../data/inbox";
import { answerKey, openQuestions, unanswer } from "../data/inboxStore";
import {
  accept,
  escalate,
  launch,
  markAssumption,
  type ChatTaskView,
  type TaskTab,
} from "../data/chatTaskStore";
import { Button, Hint, Icon, Tabs } from "../ui";
import { StatusMark, TaskDot } from "./StatusMark";
import { Inline } from "./Transcript";

const LOCK = "";
const CHEVRON = "\uE02A";
const CHEVRON_LEFT = "\uE029";
const FILES = "\uE02D";
const PEN = "";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/** `code` spans in the brief, plan and cards (outside .prose, which styles them in the transcript). */
export const CODE = "[&_code]:rounded-sm [&_code]:bg-alpha-2 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.9em]";

const fieldClass =
  "w-full rounded border border-alpha-2 bg-fill-field px-sm py-xs text-body text-primary outline-none placeholder:text-muted focus-visible:shadow-focus";

/** The task of the open chat and a way to switch its tabs, for blocks rendered deep in the transcript. */
/** `chatId` is set for every chat, `view` only for chats with a task level. */
export const ChatTaskContext = createContext<{
  chatId?: string;
  view?: ChatTaskView;
  setTab: (t: TaskTab) => void;
  /** Opens the review artifact of a result next to the chat. */
  openReview?: (t: ReviewTab) => void;
}>({ setTab: () => {} });

/* ------------------------------------------------------------ Derived plan */

/** What is left to spend: forecasts of the steps not done and not removed, against the envelope limit. */
function totals(view: ChatTaskView) {
  let min = 0;
  let max = 0;
  for (const st of view.live.stages)
    for (const p of st.steps) {
      if (p.status === "done" || !p.work || view.removed.has(p.id)) continue;
      const r = costRange(p.work.cost);
      min += r.min;
      max += r.max;
    }
  return { min, max, over: max > view.envelope.limit };
}

/* ---------------------------------------------------------------- Tab bar */

const TAB_LABEL: Record<TaskTab, string> = { chat: "Chat", brief: "Brief", plan: "Plan" };

/** Neutral dot: an edit changed this tab since it was last opened. */
function ChangedDot() {
  return <span aria-label="Changed" title="Changed by your edit" className="block size-[6px] rounded-full bg-muted" />;
}

/** "Chat · Brief · Plan" above the feed and, once the task runs, the stage it is in. */
export function TaskTabsBar({ view, tab, onTab }: { view: ChatTaskView; tab: TaskTab; onTab: (t: TaskTab) => void }) {
  const running = view.live.stages.find((st) => st.steps.some((p) => p.status === "running"));
  // Only once the task runs: the stage it is in. At the gate the dot on the tab and the line under the brief say it already.
  const status = running && (
    <>
      <StatusMark status="running" />
      {running.title}
    </>
  );
  return (
    <div className="flex items-center gap-md pt-xs pb-sm">
      <Tabs
        label="Task views"
        value={tab}
        onChange={onTab}
        items={view.tabs.map((t) => ({
          value: t,
          label: TAB_LABEL[t],
          // Only what changed; what waits for you is always in view in the dock over the composer.
          badge: view.changed.includes(t) && tab !== t ? <ChangedDot /> : undefined,
        }))}
      />
      {status && (
        <span className="ms-auto flex min-w-0 items-center gap-1.5 truncate text-footnote text-secondary">
          {status}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Brief */

function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex items-baseline gap-sm">
      <h2 className="text-body font-medium text-primary">{children}</h2>
      {aside && <span className="text-footnote text-muted">{aside}</span>}
    </div>
  );
}

/** Neutral chip after text an edit changed, as "New / Removed / Changes" in the Inbox plan. */
function Chip({ children }: { children: ReactNode }) {
  return <span className="ms-sm inline-block rounded-sm bg-alpha-3 px-1.5 align-baseline text-footnote leading-5 text-secondary">{children}</span>;
}

/**
 * A risky assumption at the gate, as a row like an option of a question card: unmarked, it sits on a soft
 * fill with the clay dot (needs you) and its own small "Confirm" / "Correct…"; marked, it drops the fill and gets ✓
 * with your words. The row's buttons stay xs and inside the row, so the card's footer keeps the one primary.
 */
function RiskyAssumption({ view, a }: { view: ChatTaskView; a: Assumption }) {
  const mark = view.marks[a.id];
  const [fixing, setFixing] = useState(false);
  const [draft, setDraft] = useState("");
  const editable = !view.launched;
  const saveFix = () => {
    if (!draft.trim()) return;
    markAssumption(view.id, a.id, { ok: false, note: draft.trim() });
    setFixing(false);
  };
  const row = "flex items-start gap-sm rounded px-sm py-sm";

  if (mark && !fixing)
    return (
      <li className={cx(row, "group/row")}>
        <span className="mt-[4px] flex">
          <StatusMark status="done" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className={cx("text-body", mark.ok ? "text-primary" : "text-muted line-through")}>
            <Inline text={a.text} />
          </p>
          <p className="text-footnote text-secondary">you: {"note" in mark ? mark.note : "confirmed"}</p>
        </div>
        {editable && (
          <Button
            size="xs"
            className="-my-0.5 opacity-0 transition-opacity duration-fast group-hover/row:opacity-100 focus-visible:opacity-100"
            onClick={() => markAssumption(view.id, a.id, undefined)}
          >
            Change
          </Button>
        )}
      </li>
    );

  return (
    <li className={cx(row, "bg-alpha-2")}>
      <span className="mt-[4px] flex">
        <TaskDot state="blocked" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-sm">
        <div className="flex flex-col gap-0.5">
          <p className="text-body text-primary">
            <Inline text={a.text} />
          </p>
          {a.why && <p className="text-footnote text-muted">{a.why}</p>}
        </div>
        {fixing ? (
          <div className="flex flex-col gap-xs">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveFix();
                if (e.key === "Escape") setFixing(false);
              }}
              placeholder="How it should be, in your words"
              aria-label="Your correction"
              className={fieldClass}
            />
            <div className="flex gap-xs">
              <Button size="xs" variant="secondary" disabled={!draft.trim()} onClick={saveFix}>
                Save
              </Button>
              <Button size="xs" onClick={() => setFixing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-xs">
            <Button size="xs" onClick={() => (setDraft(""), setFixing(true))}>
              Correct…
            </Button>
            <Button size="xs" variant="secondary" onClick={() => markAssumption(view.id, a.id, { ok: true })}>
              Confirm
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}

/** A risky assumption in the Brief tab, read only: marked with your words, or waiting for you in the chat. */
function AssumptionState({ view, a }: { view: ChatTaskView; a: Assumption }) {
  const mark = view.marks[a.id];
  return (
    <li className="flex items-start gap-sm">
      <span className="mt-[5px] flex">{mark ? <StatusMark status="done" /> : <TaskDot state="blocked" />}</span>
      <div className="flex min-w-0 flex-col">
        <p className={cx("text-body", mark && !mark.ok ? "text-muted line-through" : "text-primary")}>
          <Inline text={a.text} />
        </p>
        {mark ? (
          <p className="text-footnote text-secondary">you: {"note" in mark ? mark.note : "confirmed"}</p>
        ) : (
          <p className="text-footnote text-clay">Waiting for you in the chat{a.why && <span className="text-muted"> · {a.why}</span>}</p>
        )}
      </div>
    </li>
  );
}

/** Safe assumption: just listed; struck through with the person's words once an edit rejected it. */
function SafeAssumption({ view, a }: { view: ChatTaskView; a: Assumption }) {
  const note = view.rejected.get(a.id);
  return (
    <li className="flex items-start gap-sm">
      <span className="mt-[5px] flex">
        <TaskDot state="ahead" />
      </span>
      <div className="min-w-0">
        <p className={cx("text-body", note ? "text-muted line-through" : "text-secondary")}>
          <Inline text={a.text} />
        </p>
        {note && (
          <p className="text-footnote text-secondary">
            you: {note}
            <Chip>Changed</Chip>
          </p>
        )}
      </div>
    </li>
  );
}

/** "Brief" tab: how I understood it, assumptions, what I won't touch, done when. */
export function BriefView({ view }: { view: ChatTaskView }) {
  const brief = view.task.brief;
  if (!brief) return null;
  const risky = brief.assumptions.filter((a) => a.risky);
  const safe = brief.assumptions.filter((a) => !a.risky);
  const env = view.envelope;
  const paths = (access: string) =>
    env.paths
      .filter((p) => p.access === access)
      .map((p) => `\`${p.path}\``)
      .join(", ");
  return (
    <div className={cx("flex flex-col gap-[var(--cds-gap-xl)]", PANE_BODY, CODE)}>
      <section className="flex flex-col gap-md">
        <SectionTitle>How I understood the task</SectionTitle>
        <p className="text-body text-primary">
          <Inline text={brief.understanding} />
        </p>
      </section>

      <section className="flex flex-col gap-md">
        <SectionTitle aside={view.unmarked.length ? `${view.unmarked.length} to confirm` : "all confirmed"}>Assumptions</SectionTitle>
        <ul className="flex flex-col gap-sm">
          {risky.map((a) =>
            view.rejected.has(a.id) ? <SafeAssumption key={a.id} view={view} a={a} /> : <AssumptionState key={a.id} view={view} a={a} />,
          )}
        </ul>
        {safe.length > 0 && (
          <div className="flex flex-col gap-xs">
            <span className="text-footnote text-muted">Checked or reversible</span>
            <ul className="flex flex-col gap-sm">
              {safe.map((a) => (
                <SafeAssumption key={a.id} view={view} a={a} />
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-md">
        <SectionTitle>What I won't touch</SectionTitle>
        <ul className="flex flex-col gap-sm">
          {brief.boundaries.map((b) => (
            <li key={b} className="flex items-start gap-sm text-body text-secondary">
              <span className="mt-[5px] flex">
                <TaskDot state="ahead" />
              </span>
              <span>
                <Inline text={b} />
              </span>
            </li>
          ))}
        </ul>
        <p className="text-footnote text-muted">
          <Inline
            text={[
              paths("write") && `Your limits: I edit ${paths("write")}`,
              paths("read") && `read only ${paths("read")}`,
              paths("never") && `don't touch ${paths("never")}`,
            ]
              .filter(Boolean)
              .join(" · ")}
          />
        </p>
      </section>

      <section className="flex flex-col gap-md">
        <SectionTitle>Done when</SectionTitle>
        <ul className="flex flex-col gap-sm">
          {[
            ...brief.doneWhen.map((c) => ({ ...c, mine: false })),
            ...view.criteria.map((text, i) => ({ id: `mine-${i}`, text, locked: true, mine: true })),
          ].map((c) => (
            <li key={c.id} className="flex items-start gap-sm text-body text-primary">
              <span aria-hidden="true" className="mt-[4px] block size-3 shrink-0 rounded-[3px] border border-alpha-5" />
              {/* The lock sits right after its criterion, not at the far edge of the pane. */}
              <span className="min-w-0">
                <Inline text={c.text} />
                {c.mine && <span className="text-footnote text-muted"> · added by you</span>}
                {c.locked && (
                  <Hint text="Locked: I can't loosen or skip this" className="ms-xs inline-flex align-[-2px] text-muted">
                    <Icon glyph={LOCK} size="sm" className="!text-muted" />
                  </Hint>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------- Plan */

/** "Plan" tab: the same plan as in the Inbox pane, headed by what is left against the envelope. */
export function PlanView({ view }: { view: ChatTaskView }) {
  const { answers } = useInbox();
  const t = totals(view);
  const spent = view.live.stages.flatMap((st) => st.steps).reduce((n, p) => n + (p.status === "done" && p.work ? costRange(p.work.cost).min : 0), 0);
  return (
    <div className={CODE}>
      <PlanPane
        task={view.live}
        answers={answers}
        edits={view.planEdits}
        header={
          <header className="flex flex-col gap-0.5">
            <p className="text-heading text-primary">
              ~{money(t.min, t.max)} <span className="text-secondary">of the ${view.envelope.limit} limit</span>
            </p>
            <p className="text-footnote text-muted">Forecast for what is left{spent > 0 && ` · $${spent.toFixed(2)} spent`}</p>
            {t.over && (
              <p className="pt-xs text-footnote text-clay">
                May go over your limit: up to ${t.max} of ${view.envelope.limit}. Raise the limit below the message box, or cut scope.
              </p>
            )}
          </header>
        }
      />
    </div>
  );
}

/* -------------------------------------------------------------- Gate card */

/**
 * The decision at a gate, opened on its row in the plan: in the Inbox pane.
 * The row above already says what is decided and that it waits for you, so the card has no label or title of
 * its own: what I understood (with the full brief a link away), the assumptions to mark as rows, then one
 * footer with what still blocks the start (or the forecast) right next to the one primary action.
 * An escalation offer takes the same place: split the task into stages, or finish it as is.
 */
export function GateCard({ view, onOpenBrief, onDone }: { view: ChatTaskView; onOpenBrief?: () => void; onDone?: () => void }) {
  const esc = view.task.escalation;
  const [open, setOpen] = useState(false);
  if (view.escalationPending && esc)
    return (
      <EscalationDecision view={view} open={open} setOpen={setOpen} onAgree={() => escalate(view.id, true)} onDecline={() => (escalate(view.id, false), onDone?.())} />
    );
  const gate = currentGate(view.live);
  if (!view.atGate || !gate) return null;
  const left = view.unmarked.length;
  const brief = view.task.brief;
  return (
    <DecisionCard
      meta={<GateStatus view={view} />}
      actions={
        <Button size="sm" variant="primary" disabled={left > 0} onClick={() => (launch(view.id), onDone?.())}>
          Approve and start
        </Button>
      }
    >
      {brief && (
        <div className="flex flex-col gap-xs">
          <p className="text-body text-secondary">
            <Inline text={brief.understanding} />
          </p>
          {onOpenBrief && <TextLink onClick={onOpenBrief}>Open brief</TextLink>}
        </div>
      )}
      {view.risky.length > 0 && (
        <div className="flex flex-col gap-xs">
          <span className="text-footnote text-muted">{view.risky.length === 1 ? "Only you can confirm this" : "Only you can confirm these"}</span>
          <ul className="flex flex-col gap-xs">
            {view.risky.map((a) => (
              <RiskyAssumption key={a.id} view={view} a={a} />
            ))}
          </ul>
        </div>
      )}
    </DecisionCard>
  );
}

/** A quiet inline link inside a card: to the full brief, or "Details" that unfold under it. */
function TextLink({ onClick, children, ...rest }: { onClick: () => void; children: ReactNode; "aria-expanded"?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      {...rest}
      className="flex w-fit items-center gap-0.5 rounded-sm text-left text-footnote text-muted underline decoration-alpha-4 underline-offset-2 outline-none hover:text-primary focus-visible:shadow-focus cursor-[var(--cds-cursor-interactive)]"
    >
      {children}
    </button>
  );
}

/**
 * What approving costs: the forecast for what is left in the plan against the task's spend limit.
 * Muted, explained on hover; clay only when the upper bound is over the limit.
 */
function Budget({ view }: { view: ChatTaskView }) {
  const t = totals(view);
  const limit = view.envelope.limit;
  return (
    <Hint
      text={
        <>
          {t.over && <>Over the limit: raise it in the chip under the chat field, or cut scope. </>}
          Forecast for what is left in the plan, summed from its steps. The limit is the task's spend cap from its autonomy envelope.
        </>
      }
      className={cx("tabular-nums", t.over && "text-clay")}
    >
      ~{money(t.min, t.max)} of the ${limit} limit
    </Hint>
  );
}

/** Next to the gate's primary: what still blocks it; once nothing does, what it costs. */
function GateStatus({ view }: { view: ChatTaskView }) {
  const left = view.unmarked.length;
  if (left === 0) return <Budget view={view} />;
  return <span>{left === 1 ? "1 assumption to confirm" : `${left} assumptions to confirm`}</span>;
}

/**
 * One frame for every decision card, the same as the question card: an optional label and title (dropped when
 * the card sits under a plan row that already says it), context in small muted text, the body, then one footer
 * row, right-aligned — the status of the decision (what blocks it, or what it costs) right before the buttons,
 * the committing one last and white. An optional quiet control goes on the left.
 */
function DecisionCard({
  label,
  title,
  context,
  aside,
  meta,
  actions,
  children,
  bare,
  corner,
}: {
  bare?: boolean;
  /** On the label's line, at the right: the dock's "1 of N" navigation. */
  corner?: ReactNode;
  label?: string;
  title?: ReactNode;
  context?: ReactNode;
  aside?: ReactNode;
  meta?: ReactNode;
  actions: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className={cx("not-prose flex flex-col gap-lg", !bare && "rounded-lg border border-alpha-2 p-lg", CODE)}>
      {(label || title || context) && (
        <div className="flex flex-col gap-xs">
          {(label || corner) && (
            <div className="flex min-h-5 items-center justify-between gap-sm">
              {label && <span className="text-footnote text-clay">{label}</span>}
              {corner}
            </div>
          )}
          {title && <p className="text-body font-medium text-primary">{title}</p>}
          {context && <div className="text-footnote text-muted">{context}</div>}
        </div>
      )}
      {children}
      <div className="flex flex-wrap items-center justify-end gap-x-xs gap-y-sm">
        {aside && <span className="me-auto">{aside}</span>}
        {meta && <span className="me-xs text-footnote text-muted">{meta}</span>}
        <span className="flex gap-xs">{actions}</span>
      </div>
    </section>
  );
}

/** The escalation offer as a decision: split the task into stages, or finish it as is; details unfold under the context. */
function EscalationDecision({
  view,
  open,
  setOpen,
  onAgree,
  onDecline,
}: {
  view: ChatTaskView;
  open: boolean;
  setOpen: (v: boolean) => void;
  onAgree: () => void;
  onDecline: () => void;
}) {
  const esc = view.task.escalation!;
  return (
    <DecisionCard
      label="Bigger than it looked"
      title={`Split it into ${view.task.stages.length} stages?`}
      context={
        <div className="flex flex-col gap-xs">
          <p>{esc.text}</p>
          <DetailsToggle open={open} onToggle={() => setOpen(!open)} />
        </div>
      }
      meta={<Budget view={view} />}
      actions={
        <>
          <Button size="sm" variant="secondary" onClick={onDecline}>
            Finish as is
          </Button>
          <Button size="sm" variant="primary" onClick={onAgree}>
            Split into stages
          </Button>
        </>
      }
    >
      {open && <EscalationDetails view={view} />}
    </DecisionCard>
  );
}

/* ------------------------------------------------------- Blocks in the feed */

const CARD = CODE + " not-prose flex flex-col gap-sm rounded-lg border border-alpha-2 p-md";

/**
 * The brief in the feed: the agent's words and where the full brief and plan are. The decisions on them
 * (assumptions, the gate) are asked in the dock over the composer.
 */
function BriefCard({ view, setTab }: { view: ChatTaskView; setTab: (t: TaskTab) => void }) {
  const brief = view.task.brief;
  if (view.atGate && brief)
    return (
      <div className={cx("not-prose flex flex-col gap-sm pt-sm", CODE)}>
        <p className="text-body text-primary">
          <Inline text={brief.understanding} />
        </p>
        <p className="flex flex-wrap items-center gap-x-xs text-body text-secondary">
          Собрал бриф и план — они во вкладках:
          <Button size="xs" variant="secondary" onClick={() => setTab("brief")}>
            Brief
          </Button>
          <Button size="xs" variant="secondary" onClick={() => setTab("plan")}>
            Plan
          </Button>
        </p>
      </div>
    );
  return (
    <div className={cx(CARD, "!flex-row items-center gap-md")}>
      <span className="flex min-w-0 flex-1 items-center gap-sm text-body text-secondary">
        <StatusMark status="done" />
        You approved the brief and plan
      </span>
      <Button size="sm" variant="secondary" onClick={() => setTab("brief")}>
        Open brief
      </Button>
    </div>
  );
}

function ResultCard({ view }: { view: ChatTaskView }) {
  const { openReview } = useContext(ChatTaskContext);
  const claims = view.task.result?.claims ?? [];
  const review = view.task.result?.review;
  return (
    <div className={CARD}>
      <span className="text-footnote text-muted">What I checked</span>
      <ul className="flex flex-col gap-sm">
        {claims.map((c) => (
          <li key={c.text} className="flex items-start gap-sm">
            <span className="mt-[5px] flex">
              <StatusMark status="done" />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="text-body text-primary">
                <Inline text={c.text} />
              </span>
              {/* Each piece of evidence opens where it can be seen: the diff, the screenshots, the checks. */}
              {review && openReview ? (
                <button
                  type="button"
                  onClick={() => openReview(c.show)}
                  className="w-fit rounded-sm text-left text-footnote text-muted underline decoration-alpha-4 underline-offset-2 outline-none hover:text-primary focus-visible:shadow-focus"
                >
                  <Inline text={c.evidence} />
                </button>
              ) : (
                <span className="text-footnote text-muted">
                  <Inline text={c.evidence} />
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
      {review && openReview && (
        // The artifact: one tile that opens the whole review next to the chat.
        <button
          type="button"
          onClick={() => openReview("changes")}
          className="flex w-full items-center gap-md rounded-lg bg-alpha-1 px-md py-sm text-left outline-none hover:bg-alpha-2 focus-visible:shadow-focus cursor-[var(--cds-cursor-interactive)]"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded bg-alpha-2">
            <Icon glyph={FILES} className="!text-secondary" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-body text-primary">Review the change</span>
            <span className="text-footnote text-muted">
              {review.files.length} {review.files.length === 1 ? "file" : "files"} · {review.screens.length * 2} screenshots ·{" "}
              {review.checks.length} checks
            </span>
          </span>
          <Icon glyph={CHEVRON} size="sm" className="!text-muted" />
        </button>
      )}
      {view.accepted && (
        <span className="flex items-center justify-end gap-1.5 text-footnote text-muted">
          <StatusMark status="done" /> Accepted
        </span>
      )}
    </div>
  );
}

/**
 * What stands behind an escalation offer, folded by default: why the task grew, what is already done,
 * the stages and gates it would get, the forecast against the envelope, and what "Finish as is" means.
 */
function EscalationDetails({ view, inFeed }: { view: ChatTaskView; /** In the chat, as part of the agent's reply: always open, no divider. */ inFeed?: boolean }) {
  const esc = view.task.escalation;
  const done = view.live.stages.flatMap((st) => st.steps).filter((p) => p.status === "done");
  const spent = done.reduce((n, p) => n + (p.work ? costRange(p.work.cost).min : 0), 0);
  const ahead = view.live.stages.filter((st) => st.steps.some((p) => p.status !== "done") || st.gate?.status === "current");
  const t = totals(view);
  const row = "flex items-baseline gap-sm text-footnote";
  return (
    <div className={cx("flex flex-col gap-md", !inFeed && "border-t border-alpha-2 pt-md")}>
      {view.task.levelReason && !inFeed && (
        <p className="text-footnote text-secondary">
          Why: <Inline text={view.task.levelReason} />
        </p>
      )}
      {done.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-footnote text-muted">Done so far · ${spent.toFixed(2)}</span>
          {done.map((p) => (
            <div key={p.id} className={row}>
              <StatusMark status="done" />
              <span className="min-w-0 flex-1 text-secondary">
                <Inline text={p.title} />
              </span>
              <span className="shrink-0 tabular-nums text-muted">{p.work?.cost}</span>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <span className="text-footnote text-muted">
          What I propose{inFeed && ` · ~${money(t.min, t.max)} of the $${view.envelope.limit} limit`}
        </span>
        {ahead.map((st) => (
          <div key={st.id} className="flex flex-col gap-1">
            <span className="text-footnote text-primary">{st.title}</span>
            {st.steps
              .filter((p) => p.status !== "done")
              .map((p) => (
                <div key={p.id} className={cx(row, "ps-md")}>
                  <TaskDot state="ahead" />
                  <span className="min-w-0 flex-1 text-secondary">
                    <Inline text={p.title} />
                  </span>
                  {p.work && (
                    <Hint text={`Forecast · ${p.work.basis ?? "the agent's estimate"}`} className="shrink-0 tabular-nums text-muted">
                      {p.work.cost}
                    </Hint>
                  )}
                </div>
              ))}
            {st.gate && (
              <div className={cx(row, "ps-md")}>
                <TaskDot state="ahead" />
                <span className="text-secondary">{gateText(st.gate)}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      {esc && (
        <div className="flex flex-col gap-1">
          <span className="text-footnote text-muted">If you finish as is</span>
          <p className="text-footnote text-secondary">{esc.afterDecline}</p>
        </div>
      )}
    </div>
  );
}

/** "Details" toggle for a card: a quiet link with a chevron after it, turned when open (as on plan steps). */
function DetailsToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <TextLink aria-expanded={open} onClick={onToggle}>
      Details
      <Icon glyph={CHEVRON} size="sm" className={cx("!text-muted transition-transform duration-fast", open && "rotate-90")} />
    </TextLink>
  );
}

function EscalationCard({ view, setTab }: { view: ChatTaskView; setTab: (t: TaskTab) => void }) {
  const esc = view.task.escalation;
  if (!esc) return null;
  // In the chat the offer is the agent's reply itself, with its context in full; the decision is in the dock.
  if (!view.escalation)
    return (
      <div className={cx("not-prose flex flex-col gap-lg pt-sm", CODE)}>
        <p className="text-body text-primary">{esc.text}</p>
        <EscalationDetails view={view} inFeed />
      </div>
    );
  const stages = view.task.stages.length;
  return (
    <div className={CARD}>
      <p className="text-body text-primary">{esc.text}</p>
      {view.escalation === "agreed" ? (
        <div className="flex items-center justify-between gap-md">
          <span className="text-footnote text-muted">Split into {stages} stages · done work is kept</span>
          <Button size="xs" variant="secondary" onClick={() => setTab("plan")}>
            Open plan
          </Button>
        </div>
      ) : (
        <span className="text-footnote text-muted">Finishing as is · I'll still ask at the edge of your limits</span>
      )}
    </div>
  );
}

/**
 * A question in the feed is just what the agent asked: the text, and once answered, the answer.
 * It is answered in the dock over the composer, one question after another, like Claude asks.
 */
function QuestionLine({ chatId, questionId }: { chatId: string; questionId: string }) {
  const { answers } = useInbox();
  const task = TASKS.find((t) => t.id === chatId);
  const question = task?.stages.flatMap((st) => st.steps).find((p) => p.question?.id === questionId)?.question;
  if (!task || !question) return null;
  const picked = answers[answerKey(task.id, question.id)];
  return (
    <div className="not-prose flex flex-col gap-0.5">
      <p className="text-body font-medium text-primary">{question.text}</p>
      {picked && (
        <p className="flex flex-wrap items-center gap-x-xs text-footnote text-muted">
          <StatusMark status="done" />
          Your answer: {answerLabel(question, picked)}
          <button
            type="button"
            onClick={() => unanswer(task.id, question.id)}
            className="rounded-sm px-1 text-secondary outline-none hover:bg-fill-ghost-hover hover:text-primary focus-visible:shadow-focus"
          >
            Change
          </button>
        </p>
      )}
    </div>
  );
}

/** A risky assumption as a decision in the dock: right, or fix it in your words. */
function AssumptionDecision({ view, a, corner }: { view: ChatTaskView; a: Assumption; corner?: ReactNode }) {
  const [fixing, setFixing] = useState(false);
  const [draft, setDraft] = useState("");
  const save = () => draft.trim() && markAssumption(view.id, a.id, { ok: false, note: draft.trim() });
  return (
    <DecisionCard
      bare
      corner={corner}
      label="Only you can confirm this"
      title={<Inline text={a.text} />}
      context={a.why}
      actions={
        fixing ? (
          <>
            <Button size="sm" variant="secondary" onClick={() => setFixing(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" disabled={!draft.trim()} onClick={save}>
              Save
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="secondary" onClick={() => (setDraft(""), setFixing(true))}>
              Correct…
            </Button>
            <Button size="sm" variant="primary" onClick={() => markAssumption(view.id, a.id, { ok: true })}>
              Confirm
            </Button>
          </>
        )
      }
    >
      {fixing && (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") setFixing(false);
          }}
          placeholder="How it should be, in your words"
          aria-label="Your correction"
          className={fieldClass}
        />
      )}
    </DecisionCard>
  );
}

type Decision =
  | { key: string; kind: "escalation" }
  | { key: string; kind: "assumption"; a: Assumption }
  | { key: string; kind: "gate" }
  | { key: string; kind: "question"; q: Question }
  | { key: string; kind: "result" };

/**
 * Every decision of the chat, docked over the composer one at a time, as Claude asks: an escalation offer,
 * then the risky assumptions, then the gate on the brief and plan, then the agent's questions (blocking first),
 * then accepting a small task's result.
 * The Brief and Plan tabs are to read; this is the one place to decide. Answering moves on to the next.
 */
export function DecisionDock({ chatId, view, setTab }: { chatId: string; view?: ChatTaskView; setTab: (t: TaskTab) => void }) {
  const { answers } = useInbox();
  const { openReview } = useContext(ChatTaskContext);
  const [index, setIndex] = useState(0);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [customs, setCustoms] = useState<Record<string, CustomAnswer | undefined>>({});
  const task = TASKS.find((t) => t.id === chatId);
  if (!task) return null;
  const open = openQuestions(task, answers).sort((a, b) => Number(b.blocking) - Number(a.blocking));
  const items: Decision[] = [
    ...(view?.escalationPending ? [{ key: "escalation", kind: "escalation" as const }] : []),
    ...(view?.atGate ? view.unmarked.map((a) => ({ key: `a:${a.id}`, kind: "assumption" as const, a })) : []),
    ...(view?.atGate ? [{ key: "gate", kind: "gate" as const }] : []),
    ...open.map((q) => ({ key: `q:${q.id}`, kind: "question" as const, q })),
    ...(view?.resultPending ? [{ key: "result", kind: "result" as const }] : []),
  ];
  if (items.length === 0) return null;
  const i = Math.min(index, items.length - 1);
  const item = items[i];

  // "1 of N" sits on the label's line of the card, not as a header of its own above it.
  const corner = items.length > 1 && (
    <span className="-my-xs flex shrink-0 items-center gap-0.5 text-footnote tabular-nums text-muted">
      <span className="me-xs">
        {i + 1} of {items.length}
      </span>
      <Button size="xs" icon={CHEVRON_LEFT} aria-label="Previous" disabled={i === 0} onClick={() => setIndex(i - 1)} />
      <Button size="xs" icon={CHEVRON} aria-label="Next" disabled={i === items.length - 1} onClick={() => setIndex(i + 1)} />
    </span>
  );

  let body: ReactNode = null;
  if (item.kind === "escalation" && view) {
    body = (
      <DecisionCard
        bare
        corner={corner}
        label="Bigger than it looked"
        title={`Split it into ${view.task.stages.length} stages?`}
        context="The details are in my message above."
        meta={<Budget view={view} />}
        actions={
          <>
            <Button size="sm" variant="secondary" onClick={() => escalate(view.id, false)}>
              Finish as is
            </Button>
            <Button size="sm" variant="primary" onClick={() => escalate(view.id, true)}>
              Split into stages
            </Button>
          </>
        }
      />
    );
  } else if (item.kind === "assumption" && view) {
    body = <AssumptionDecision key={item.a.id} view={view} a={item.a} corner={corner} />;
  } else if (item.kind === "gate" && view) {
    const gate = currentGate(view.live);
    const left = view.unmarked.length;
    body = (
      <DecisionCard
        bare
        corner={corner}
        label="Before I start"
        title={`Approve ${gate?.title ?? "the plan"}?`}
        context={
          <p className="flex flex-wrap items-baseline gap-x-1">
            {view.edits.length > 0 ? "Your edits are in the" : "Anything to change? Type it below. See the"}
            {view.tabs.includes("brief") && (
              <>
                <TextLink onClick={() => setTab("brief")}>brief</TextLink>
                and the
              </>
            )}
            <TextLink onClick={() => setTab("plan")}>plan</TextLink>
          </p>
        }
        meta={
          left > 0 ? (
            // What blocks the start, as a way back to it: the assumptions come before the gate in the dock.
            <TextLink onClick={() => setIndex(items.findIndex((d) => d.kind === "assumption"))}>
              {left === 1 ? "1 assumption to confirm" : `${left} assumptions to confirm`}
            </TextLink>
          ) : (
            <Budget view={view} />
          )
        }
        actions={
          <Button size="sm" variant="primary" disabled={left > 0} onClick={() => launch(view.id)}>
            Approve and start
          </Button>
        }
      />
    );
  } else if (item.kind === "result" && view) {
    const review = view.task.result?.review;
    body = (
      <DecisionCard
        bare
        corner={corner}
        label="Check the result"
        title="Accept the result?"
        context={
          review && openReview ? (
            <p className="flex flex-wrap items-baseline gap-x-1">
              What I did and how I checked it is in my message above.
              <TextLink onClick={() => openReview("changes")}>Review the change</TextLink>
            </p>
          ) : (
            "What I did and how I checked it is in my message above."
          )
        }
        actions={
          <>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => (document.querySelector("[data-testid=code-prompt-input]") as HTMLElement | null)?.focus()}
            >
              Ask for changes
            </Button>
            <Button size="sm" variant="primary" onClick={() => accept(view.id)}>
              Accept
            </Button>
          </>
        }
      />
    );
  } else if (item.kind === "question") {
    // Keyed by task and question: question ids repeat across tasks ("q1").
    const key = answerKey(task.id, item.q.id);
    const choice = choices[key] ?? item.q.options.find((o) => o.recommended)?.id ?? item.q.options[0].id;
    body = (
      <QuestionCard
        key={key}
        task={task}
        question={item.q}
        choice={choice}
        setChoice={(id) => setChoices((c) => ({ ...c, [key]: id }))}
        custom={customs[key]}
        setCustom={(c) => setCustoms((m) => ({ ...m, [key]: c }))}
        onAnswered={() => {}}
        showChanges
        bare
        corner={corner}
      />
    );
  }

  return (
    <div className="mb-xs flex max-h-[min(60vh,520px)] flex-col overflow-y-auto rounded-lg border border-alpha-2 bg-surface-2 p-lg">
      {body}
    </div>
  );
}

/** Task blocks inside the transcript; their content comes from the chat's task. */
export function TaskBlock({
  block,
}: {
  block: Extract<Block, { type: "brief-card" | "result-card" | "escalation-card" | "edit-note" | "question" }>;
}) {
  const { chatId, view, setTab } = useContext(ChatTaskContext);
  if (block.type === "question") return chatId ? <QuestionLine chatId={chatId} questionId={block.id} /> : null;
  if (block.type === "edit-note")
    return (
      <p className="not-prose flex flex-wrap items-center gap-x-sm text-body text-secondary">
        <Icon glyph={PEN} className="!text-muted" />
        <span>{block.text}</span>
        {view && view.tabs.includes("plan") && (
          <button type="button" onClick={() => setTab("plan")} className="rounded-sm text-muted outline-none hover:text-primary focus-visible:shadow-focus">
            Show in plan
          </button>
        )}
      </p>
    );
  if (!view) return null;
  if (block.type === "brief-card") return <BriefCard view={view} setTab={setTab} />;
  if (block.type === "result-card") return <ResultCard view={view} />;
  return <EscalationCard view={view} setTab={setTab} />;
}
