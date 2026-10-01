import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { DockFrame, OptionList, OptionRow, RowField, type DockNav } from "./DecisionPanel";
import type { Block } from "../data/transcripts";
import { costRange, currentGate, flagTitle, gateText, money, planProgress, type Assumption, type Flag, type Question, type ReviewTab } from "../data/task";
import { useInbox } from "../data/inboxStore";
import { ChangeButton, PANE_BODY, PlanPane, QuestionCard, YouSaid, anyMinutes, answerLabel, duration, etaFrom, type CustomAnswer } from "./PlanPane";
import { TASKS } from "../data/inbox";
import { answerKey, openQuestions, unanswer } from "../data/inboxStore";
import {
  accept,
  escalate,
  launch,
  markAssumption,
  nextIteration,
  sendBack,
  type ChatTaskView,
  type TaskTab,
} from "../data/chatTaskStore";
import { revealInReview, type RevealTarget } from "../data/reveal";
import { Button, Hint, Icon } from "../ui";
import { TaskDot } from "./StatusMark";
import { Meter } from "./BudgetLine";
import { Inline } from "./Transcript";

export const LOCK = "";
export const CHEVRON = "\uE02A";
const FILES = "\uE02D";
const TASK = "\uE041";
const PEN = "";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/** `code` spans in the brief, plan and cards (outside .prose, which styles them in the transcript). */
export const CODE = "[&_code]:rounded-sm [&_code]:bg-alpha-2 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.9em]";

const fieldClass =
  "w-full rounded border border-alpha-2 bg-fill-field px-sm py-xs text-body text-primary outline-none placeholder:text-muted focus-visible:shadow-focus";

/** The task of the open chat and a way to switch its tabs, for blocks rendered deep in the transcript. `chatId` is set for every chat, `view` only for chats with a task level. */
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

/* ------------------------------------------------------------------ Brief */

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex items-baseline gap-sm">
      <h2 className="text-body font-medium text-primary">{children}</h2>
      {aside && <span className="text-footnote text-muted">{aside}</span>}
    </div>
  );
}

/**
 * A risky assumption at the gate, as a row like an option of a question card: unmarked, it sits on a soft
 * fill with the clay dot (needs you) and its own small "Confirm" / "Correct…"; marked, it drops the fill and gets ✓
 * with your words. The row's buttons stay xs and inside the row, so the card's footer keeps the one primary.
 */
function RiskyAssumption({ view, a, className }: { view: ChatTaskView; a: Assumption; className?: string }) {
  const mark = view.marks[a.id];
  const [fixing, setFixing] = useState(false);
  const [draft, setDraft] = useState("");
  const editable = !view.launched;
  const saveFix = () => {
    if (!draft.trim()) return;
    markAssumption(view.id, a.id, { ok: false, note: draft.trim() });
    setFixing(false);
  };
  const row = cx("flex items-start gap-sm rounded px-sm py-sm", className);

  if (mark && !fixing)
    return (
      <li className={cx(row, "group/change")}>
        <span className="mt-[5px] flex">
          <TaskDot state="done" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className={cx("text-body", mark.ok ? "text-primary" : "text-muted line-through")}>
            <Inline text={a.text} />
          </p>
          <p className="text-footnote text-secondary">
            <YouSaid>{"note" in mark ? mark.note : "confirmed"}</YouSaid>
          </p>
        </div>
        {editable && <ChangeButton onClick={() => markAssumption(view.id, a.id, undefined)} />}
      </li>
    );

  return (
    <li className={cx(row, "bg-alpha-2")}>
      <span className="mt-[5px] flex">
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

/** A risky assumption in the Brief tab after the gate, read only: marked with your words, or waiting for you in the chat. */
function AssumptionState({ view, a }: { view: ChatTaskView; a: Assumption }) {
  const mark = view.marks[a.id];
  return (
    <li className="flex items-start gap-sm">
      <span className="mt-[5px] flex">{mark ? <TaskDot state="done" /> : <TaskDot state="blocked" />}</span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className={cx("text-body", mark && !mark.ok ? "text-muted line-through" : "text-primary")}>
          <Inline text={a.text} />
        </p>
        {mark ? (
          <p className="text-footnote text-secondary">
            <YouSaid>{"note" in mark ? mark.note : "confirmed"}</YouSaid>
          </p>
        ) : (
          <p className="text-footnote text-clay">Waiting for you in the chat{a.why && <span className="text-muted"> · {a.why}</span>}</p>
        )}
      </div>
    </li>
  );
}

/** A plain list marker in the brief, in the slot of a status dot: rings mean "up next" in the plan, so lists don't use them. */
export function Bullet() {
  return (
    <span aria-hidden="true" className="mt-[5px] flex size-3 shrink-0 items-center justify-center">
      <span className="block size-1 rounded-full bg-alpha-5" />
    </span>
  );
}

/** Safe assumption: just listed; struck through with the person's words once an edit rejected it. */
function SafeAssumption({ view, a }: { view: ChatTaskView; a: Assumption }) {
  const note = view.rejected.get(a.id);
  return (
    <li className="flex items-start gap-sm">
      <Bullet />
      <div className="min-w-0">
        <p className={cx("text-body", note ? "text-muted line-through" : "text-secondary")}>
          <Inline text={a.text} />
        </p>
        {note && (
          <p className="text-footnote text-secondary">
            <YouSaid>{note}</YouSaid>
          </p>
        )}
      </div>
    </li>
  );
}

/** "Brief" tab: how I understood it, what I found, assumptions, what I won't touch, done when. */
export function BriefView({ view }: { view: ChatTaskView }) {
  const brief = view.task.brief;
  if (!brief) return null;
  const risky = brief.assumptions.filter((a) => a.risky);
  // At acceptance the criteria stand as the Result tab counts them: met with its proof, or broken by what was found.
  const judged = new Map((view.acceptance?.criteria ?? []).map((c) => [c.id, c]));
  const criteria = [
    ...brief.doneWhen.map((c) => {
      const j = judged.get(c.id);
      return { ...c, mine: false, met: j ? (j.state === "met" ? j.proof : undefined) : c.met, broken: j?.state === "broken" ? j.broken : undefined };
    }),
    ...view.criteria.map((text, i) => ({ id: `mine-${i}`, text, locked: true, mine: true, met: undefined, broken: undefined })),
  ];
  const safe = brief.assumptions.filter((a) => !a.risky);
  const env = view.envelope;
  const paths = (access: string) =>
    env.paths
      .filter((p) => p.access === access)
      .map((p) => `\`${p.path}\``)
      .join(", ");
  return (
    <div className={cx("flex flex-col gap-[var(--cds-gap-lg)]", PANE_BODY, CODE)}>
      {/* Accepted: the brief is history now, the same line as over the Result and Diff tabs. */}
      {view.acceptance && view.accepted && <p className="text-body text-secondary">Accepted · PR description ready</p>}
      <section className="flex flex-col gap-xs">
        <SectionTitle>How I understood the task</SectionTitle>
        <p className="text-body text-primary">
          <Inline text={brief.understanding} />
        </p>
      </section>

      {/* Facts before assumptions: what the agent checked, then what it could not. */}
      {brief.found && brief.found.length > 0 && (
        <section className="flex flex-col gap-xs">
          <SectionTitle aside="checked in code and data">What I found</SectionTitle>
          <ul className="flex flex-col gap-sm">
            {brief.found.map((f) => (
              <li key={f.text} className="flex items-start gap-sm">
                <Bullet />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="text-body text-secondary">
                    <Inline text={f.text} />
                  </p>
                  {f.source && (
                    <p className="text-footnote text-muted">
                      <Inline text={f.source} />
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-xs">
        {/* A small task's brief can have only safe assumptions: then there is nothing to confirm and no count. */}
        <SectionTitle aside={risky.length === 0 ? undefined : view.unmarked.length ? `${view.unmarked.length} to confirm` : "all confirmed"}>
          Assumptions
        </SectionTitle>
        {/* Only safe assumptions: no empty list above them, or its gap pushes the note away from the heading. */}
        {risky.length > 0 && (
          <ul className="flex flex-col gap-sm">
            {risky.map((a) =>
              view.rejected.has(a.id) ? (
                <SafeAssumption key={a.id} view={view} a={a} />
              ) : view.atGate ? (
                // At the gate the brief is where you read the assumption, so you can confirm it right there; the dock follows.
                <RiskyAssumption key={a.id} view={view} a={a} className="-mx-sm" />
              ) : (
                <AssumptionState key={a.id} view={view} a={a} />
              ),
            )}
          </ul>
        )}
        {safe.length > 0 && (
          <div className={cx("flex flex-col gap-xs", risky.length > 0 && "mt-xs")}>
            <span className="text-footnote text-muted">No need to confirm: checked in code or easy to undo</span>
            <ul className="flex flex-col gap-xs">
              {safe.map((a) => (
                <SafeAssumption key={a.id} view={view} a={a} />
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-xs">
        <SectionTitle>What I won't touch</SectionTitle>
        <ul className="flex flex-col gap-xs">
          {brief.boundaries.map((b) => (
            <li key={b} className="flex items-start gap-sm text-body text-secondary">
              <Bullet />
              <span>
                <Inline text={b} />
              </span>
            </li>
          ))}
        </ul>
        {/* The envelope's territory, one access level per row, so paths are readable and never wrap alone. */}
        <dl className="mt-xs grid grid-cols-[max-content_1fr] items-baseline gap-x-md gap-y-0.5">
          {(
            [
              ["write", "Edits"],
              ["read", "Read only"],
              ["never", "Won't touch"],
            ] as const
          ).map(
            ([access, label]) =>
              paths(access) && (
                <div key={access} className="contents">
                  <dt className="text-footnote text-muted">{label}</dt>
                  <dd className="text-body text-secondary">
                    <Inline text={paths(access)} />
                  </dd>
                </div>
              ),
          )}
        </dl>
      </section>

      <section className="flex flex-col gap-xs">
        <SectionTitle
          aside={
            <Hint text="I check these at the end and mark each one with its proof">
              {criteria.filter((c) => c.met).length} of {criteria.length} met
            </Hint>
          }
        >
          Done when
        </SectionTitle>
        <ul className="flex flex-col gap-sm">
          {criteria.map((c) => (
            <li key={c.id} className="flex items-start gap-sm text-body text-primary">
              {/* Not met yet: the plan's "ahead" ring; met: its "done" dot, with the check that proves it. A ring, not a box: nobody ticks these by hand. */}
              <span className="mt-[5px] flex">
                <TaskDot state={c.met ? "done" : c.broken && c.locked ? "blocked" : "ahead"} />
              </span>
              {/* The lock sits right after its criterion, not at the far edge of the pane. */}
              <span className="min-w-0">
                <span className={c.met ? "text-secondary" : undefined}>
                  <Inline text={c.text} />
                </span>
                {c.mine && <span className="text-muted"> · added by you</span>}
                {c.locked && (
                  <Hint text="Locked: I can't loosen or skip this" className="ms-xs inline-flex align-[-2px] text-muted">
                    <Icon glyph={LOCK} size="sm" className="!text-muted" />
                  </Hint>
                )}
                {c.met && <span className="block text-footnote text-muted">{c.met}</span>}
                {c.broken && (
                  <span className={cx("block text-footnote", c.locked ? "text-clay" : "text-muted")}>
                    Broken: <Inline text={c.broken} />
                  </span>
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

/**
 * One card over the plan: a label (with a quiet word on its right, if any) and the value with its scale in the same
 * size and weight, grey ("8 of 13"), then a quiet grey meter of the share: the numbers lead, the meter only backs them. Outlined, not filled:
 * muted text keeps its contrast on the pane surface. A hint, if any, opens on the whole card.
 */
function Stat({
  label,
  value,
  of,
  aside,
  meter,
  hint,
}: {
  label: string;
  value: string;
  /** The scale after the value ("of 13"): same size and weight, grey. */
  of?: string;
  /** A quiet word on the label's row, right-aligned (the finish time). */
  aside?: ReactNode;
  /** Share done, 0–100; `over` turns it into a warning (the forecast goes past the limit). */
  meter?: { used: number; over?: boolean };
  hint?: ReactNode;
}) {
  const body = (
    <>
      <span className="mb-0.5 flex items-baseline justify-between gap-sm text-footnote">
        <span className="text-secondary">{label}</span>
        {aside && <span className="truncate tabular-nums text-muted">{aside}</span>}
      </span>
      <span className="truncate text-body font-medium tabular-nums text-primary">
        {value}
        {of && <span className="text-muted"> {of}</span>}
      </span>
      {meter && <Meter used={Math.min(100, meter.used)} tight={meter.over} quiet className="mt-sm" />}
    </>
  );
  const box = "flex min-w-0 flex-col gap-1 rounded-lg border border-alpha-2 p-[var(--cds-gap-md)]";
  return hint ? (
    // The hint's own span only carries the hover; the card inside keeps its shape.
    <Hint text={hint} className="flex">
      <div className={cx(box, "flex-1")}>{body}</div>
    </Hint>
  ) : (
    <div className={box}>{body}</div>
  );
}

/** "Plan" tab: the same plan as in the Inbox pane, headed by what is left against the envelope. */
export function PlanView({ view }: { view: ChatTaskView }) {
  const { answers } = useInbox();
  const { openReview } = useContext(ChatTaskContext);
  const t = totals(view);
  const spent = view.live.stages.flatMap((st) => st.steps).reduce((n, p) => n + (p.status === "done" && p.work ? costRange(p.work.cost).min : 0), 0);
  const progress = planProgress(view.live);
  const finished = progress.total > 0 && progress.done === progress.total;
  // When the task is expected to finish: the gate after the last stage.
  const finish = view.live.stages[view.live.stages.length - 1]?.gate;
  // Agent working time so far: done steps only.
  const steps = view.live.stages.flatMap((st) => st.steps).filter((p) => p.work?.time && !view.removed.has(p.id));
  const worked = steps.filter((p) => p.status === "done").reduce((n, p) => n + anyMinutes(p.work!.time!), 0);
  // The whole task's working time: done steps plus the forecast for the rest, rounded to 10 minutes as a forecast.
  const total = Math.round((worked + steps.filter((p) => p.status !== "done").reduce((n, p) => n + anyMinutes(p.work!.time!), 0)) / 10) * 10;
  return (
    <div className={CODE}>
      <PlanPane
        task={view.live}
        answers={answers}
        edits={view.planEdits}
        // A result to accept: the approval row leads to the review; the decision itself stays in the dock.
        gateCard={
          view.acceptancePending &&
          openReview && (
            <TextLink onClick={() => openReview("result")}>{acceptanceMeta(view)}</TextLink>
          )
        }
        header={
          <div className="flex flex-col gap-xs">
            <div className="grid grid-cols-3 gap-sm">
              <Stat label="Done" value={`${progress.done}`} of={`of ${progress.total}`} meter={{ used: (progress.done / progress.total) * 100 }} />
              {/* Facts first: what is left against the limit is on hover; the plan's rows carry the forecasts. */}
              <Stat
                label="Spent"
                value={`$${spent.toFixed(2)}`}
                of={`of $${view.envelope.limit}`}
                meter={{ used: (spent / view.envelope.limit) * 100, over: t.over }}
                hint={`~${money(t.min, t.max)} more, forecast for what's left in the plan.`}
              />
              {/* A finished task has no forecast left: what it took, not "of ~". */}
              <Stat
                label={finished ? "Worked" : "Working"}
                aside={!finished && finish?.eta && `by ${finish.eta}`}
                value={duration(worked)}
                of={finished ? undefined : `of ~${duration(total)}`}
                meter={{ used: finished ? 100 : total ? (worked / total) * 100 : 0 }}
                hint={
                  finished ? (
                    "Agent working time on the whole task."
                  ) : (
                    <>
                      Agent working time: done steps, then the forecast for the rest.
                      {finish?.eta && ` ${finish.mine ? "Ready for you" : "Done"} ${finish.eta}, ${etaFrom(finish.etaSource)}`}
                    </>
                  )
                }
              />
            </div>
            {t.over && (
              <p className="text-footnote text-clay">
                May go over your limit: up to {money(t.max)} of ${view.envelope.limit}. Cut scope to fit.
              </p>
            )}
          </div>
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
export function GateCard({
  view,
  onOpenBrief,
  onOpenResult,
  onDone,
}: {
  view: ChatTaskView;
  onOpenBrief?: () => void;
  /** A result waiting for acceptance: "Details" opens the task's chat at the review. */
  onOpenResult?: () => void;
  onDone?: () => void;
}) {
  const esc = view.task.escalation;
  const [open, setOpen] = useState(false);
  if (view.escalationPending && esc)
    return (
      <EscalationDecision view={view} open={open} setOpen={setOpen} onAgree={() => escalate(view.id, true)} onDecline={() => (escalate(view.id, false), onDone?.())} />
    );
  if (view.acceptancePending && onOpenResult) return <AcceptanceCard view={view} onDetails={onOpenResult} onDone={onDone} />;
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
export function TextLink({
  onClick,
  children,
  underline = true,
  ...rest
}: {
  onClick: () => void;
  children: ReactNode;
  /** Off for toggles that carry a chevron: the chevron already says it is clickable. */
  underline?: boolean;
  "aria-expanded"?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      {...rest}
      className={cx(
        "flex w-fit items-center gap-0.5 rounded-sm text-left text-footnote text-muted outline-none hover:text-primary focus-visible:shadow-focus cursor-[var(--cds-cursor-interactive)]",
        underline && "underline decoration-alpha-4 underline-offset-2",
      )}
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
          {t.over && <>Over the limit: cut scope to fit. </>}
          Forecast for what's left in the plan, summed from its steps. The limit is this task's spending cap.
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
}: {
  label?: string;
  title?: ReactNode;
  context?: ReactNode;
  aside?: ReactNode;
  meta?: ReactNode;
  actions: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className={cx("not-prose flex flex-col gap-lg rounded-lg border border-alpha-2 p-lg", CODE)}>
      {(label || title || context) && (
        <div className="flex flex-col gap-xs">
          {label && <span className="text-footnote text-clay">{label}</span>}
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
      title={`Split it into ${esc.stages.length} stages?`}
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

/** "3 stages · 2 approvals · ~$6–11 of $12": what the tile opens, in one line. */
function briefMeta(view: ChatTaskView) {
  const t = totals(view);
  const approvals = view.live.stages.filter((st) => st.gate?.mine).length;
  return [
    `${view.live.stages.length} ${view.live.stages.length === 1 ? "stage" : "stages"}`,
    approvals > 0 && `${approvals} ${approvals === 1 ? "approval" : "approvals"}`,
    `~${money(t.min, t.max)} of $${view.envelope.limit}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

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
        <div className="pt-xs">
          <ArtifactTile
            icon={TASK}
            title="Plan"
            meta={briefMeta(view)}
            onOpen={() => setTab("plan")}
          />
        </div>
      </div>
    );
  return (
    <p className="not-prose flex flex-wrap items-center gap-x-sm pt-sm text-body text-secondary">
      <TaskDot state="done" />
      You approved the brief and plan
      {/* Once it runs, the plan is what you come back for: it shows the progress. */}
      <TextLink onClick={() => setTab("plan")}>Open plan</TextLink>
    </p>
  );
}

/**
 * A flag the system found, as a row like a risky assumption: soft fill, the clay dot (needs you), what happened
 * as the line and the file as a quiet mono path under it. With `onOpen` the whole row opens the file: hover fill
 * and a chevron, no underline.
 */
export function FlagRow({ flag, onOpen }: { flag: Flag; onOpen?: () => void }) {
  const body = (
    <>
      <span className="mt-[5px] flex">
        <TaskDot state="blocked" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-body text-primary">{flagTitle(flag)}</span>
        <span className="truncate font-mono text-footnote text-muted">{flag.ref}</span>
      </span>
    </>
  );
  // The same row as the dock's options: a soft fill, their padding; the dot sits on the title line, the chevron centred.
  const row = "flex w-full items-start gap-sm rounded bg-alpha-1 px-2.5 py-2.5 text-left";
  if (!onOpen) return <div className={row}>{body}</div>;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cx(row, "outline-none transition-colors duration-fast hover:bg-alpha-2 focus-visible:shadow-focus cursor-[var(--cds-cursor-interactive)]")}
    >
      {body}
      <Icon glyph={CHEVRON} size="sm" className="shrink-0 self-center !text-muted" />
    </button>
  );
}

/** Task icon, shared by the Plan tile and the live step card. */
export const TASK_ICON = TASK;

/**
 * An artifact in the agent's reply: one tile that opens it next to the chat (the review, the brief and plan).
 * Concentric corners: the tile's radius is the icon box's radius plus the padding around it.
 */
export function ArtifactTile({ icon, title, meta, onOpen }: { icon: string; title: ReactNode; meta: ReactNode; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-md rounded-[calc(var(--cds-radius)+var(--cds-gap-sm))] bg-alpha-1 p-[var(--cds-gap-sm)] pe-md text-left outline-none hover:bg-alpha-2 focus-visible:shadow-focus cursor-[var(--cds-cursor-interactive)]"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded bg-alpha-2">
        <Icon glyph={icon} className="!text-secondary" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex min-w-0 items-center gap-sm text-body text-primary">{title}</span>
        <span className="truncate text-footnote text-muted">{meta}</span>
      </span>
      <Icon glyph={CHEVRON} size="sm" className="!text-muted" />
    </button>
  );
}

/** "7 claims · 2 flags · 1 file outside the brief": what the review holds, in one line. */
function acceptanceMeta(view: ChatTaskView) {
  const acc = view.acceptance!;
  const n = acc.claims.length;
  return [
    `${n} ${n === 1 ? "claim" : "claims"}`,
    acc.counts.verified === n && "all proven",
    acc.flags.length > 0 && `${acc.flags.length} ${acc.flags.length === 1 ? "flag" : "flags"}`,
    acc.outsideBrief > 0 && `${acc.outsideBrief} ${acc.outsideBrief === 1 ? "file" : "files"} outside the brief`,
  ]
    .filter(Boolean)
    .join(" · ");
}

/**
 * A level 2–3 result in the feed: the agent's words stay above, the proof opens beside the chat. An older round
 * keeps its tile, marked as sent back; every tile opens the review as it stands now.
 */
function AcceptanceTile({ view, iteration }: { view: ChatTaskView; iteration?: number }) {
  const { openReview } = useContext(ChatTaskContext);
  const acc = view.acceptance!;
  const current = !iteration || iteration === acc.iteration;
  const meta =
    !current || view.sentBack
      ? `Round ${iteration ?? acc.iteration} · sent back`
      : view.accepted
        ? `${acceptanceMeta(view)} · accepted`
        : acceptanceMeta(view);
  return (
    <div className="not-prose pt-xs">
      <ArtifactTile icon={FILES} title="Review the result" meta={meta} onOpen={() => openReview?.("result")} />
    </div>
  );
}

function ResultCard({ view, iteration }: { view: ChatTaskView; iteration?: number }) {
  const { openReview } = useContext(ChatTaskContext);
  if (view.acceptance) return <AcceptanceTile view={view} iteration={iteration} />;
  const claims = view.task.result?.claims ?? [];
  const review = view.task.result?.review;
  return (
    <div className={cx("not-prose flex flex-col gap-sm pt-sm", CODE)}>
      <span className="text-footnote text-muted">What I checked</span>
      <ul className="flex flex-col gap-sm">
        {claims.map((c) => (
          <li key={c.text} className="flex items-start gap-sm">
            <span className="mt-[5px] flex">
              <TaskDot state="done" />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="text-body text-primary">
                <Inline text={c.text} />
              </span>
              {/* Each piece of evidence opens where it can be seen: the diff, the screenshots, the checks. */}
              {review && openReview ? (
                <button
                  type="button"
                  onClick={() => openReview(c.show ?? "changes")}
                  className="w-fit rounded-sm text-left text-footnote text-muted underline decoration-alpha-4 underline-offset-2 outline-none hover:text-primary focus-visible:shadow-focus"
                >
                  <Inline text={c.source?.label ?? ""} />
                </button>
              ) : (
                <span className="text-footnote text-muted">
                  <Inline text={c.source?.label ?? ""} />
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
      {review && openReview && (
        <div className="pt-xs">
          <ArtifactTile
            icon={FILES}
            title="Review the change"
            meta={`${review.files.length} ${review.files.length === 1 ? "file" : "files"} · ${review.screens.length * 2} screenshots · ${review.checks.length} checks`}
            onOpen={() => openReview("changes")}
          />
        </div>
      )}
      {view.accepted && (
        <span className="flex items-center justify-end gap-1.5 text-footnote text-muted">
          <TaskDot state="done" /> Accepted
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
  // What is proposed is the offer's stages, not the plan in force (one list until the person agrees).
  const ahead = (esc?.stages ?? view.live.stages).filter((st) => st.steps.some((p) => p.status !== "done") || st.gate?.status === "current");
  const t = totals(view);
  // Typeset like the rest of the reply: body text in the feed, footnote inside the Inbox card. Each cost follows its
  // item's text, so nothing floats at the far edge of a wide column.
  const size = inFeed ? "text-body" : "text-footnote";
  const mark = inFeed ? "mt-[5px]" : "mt-[3px]";
  const heading = cx(size, "font-medium text-primary");
  const aside = (text: ReactNode) => <span className="font-normal tabular-nums text-muted"> · {text}</span>;
  const row = cx("flex items-start gap-sm", size);
  return (
    <div className={cx("flex flex-col gap-lg", !inFeed && "border-t border-alpha-2 pt-md")}>
      {view.task.levelReason && !inFeed && (
        <p className="text-footnote text-secondary">
          Why: <Inline text={view.task.levelReason} />
        </p>
      )}
      {done.length > 0 && (
        <section className="flex flex-col gap-xs">
          <h3 className={heading}>Done so far{aside(`$${spent.toFixed(2)}`)}</h3>
          <ul className="flex flex-col gap-xs">
            {done.map((p) => (
              <li key={p.id} className={row}>
                <span className={cx("flex", mark)}>
                  <TaskDot state="done" />
                </span>
                <span className="min-w-0 text-secondary">
                  <Inline text={p.title} />
                  {p.work && <span className="tabular-nums text-muted"> · {p.work.cost}</span>}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="flex flex-col gap-sm">
        <h3 className={heading}>
          What I propose{inFeed && aside(`~${money(t.min, t.max)} of the $${view.envelope.limit} limit`)}
        </h3>
        {/* Laid out like the plan: numbered stages, steps on a rail. */}
        <ol className="flex flex-col gap-md">
          {ahead.map((st, n) => {
            const steps = st.steps.filter((p) => p.status !== "done");
            const r = steps.reduce(
              (acc, p) => (p.work ? { min: acc.min + costRange(p.work.cost).min, max: acc.max + costRange(p.work.cost).max } : acc),
              { min: 0, max: 0 },
            );
            const items: { key: string; text: ReactNode }[] = [
              ...steps.map((p) => ({
                key: p.id,
                text: (
                  <>
                    <Inline text={p.title} />
                    {p.work && (
                      <span className="text-muted">
                        {" · "}
                        <Hint text={`Forecast · ${p.work.basis ?? "the agent's estimate"}`} className="tabular-nums">
                          {p.work.cost}
                        </Hint>
                      </span>
                    )}
                  </>
                ),
              })),
              ...(st.gate ? [{ key: "gate", text: gateText(st.gate) }] : []),
            ];
            return (
              <li key={st.id} className="flex flex-col gap-xs">
                <span className={cx(size, "text-primary")}>
                  <span className="tabular-nums">{n + 1}</span> · {st.title}
                  {r.max > 0 && <span className="tabular-nums text-muted"> · ~{money(r.min, r.max)}</span>}
                </span>
                <ol className="flex flex-col">
                  {items.map((it, k) => (
                    <li key={it.key} className={cx("relative flex items-start gap-sm", k < items.length - 1 && "pb-xs", size)}>
                      {k < items.length - 1 && (
                        // From under this dot's box to the top of the next one: the next row starts after pb-xs, its dot box after `mark`.
                        <span aria-hidden="true" className={cx("absolute left-[5.5px] w-px bg-alpha-3", inFeed ? "top-[17px] bottom-[-5px]" : "top-[15px] bottom-[-3px]")} />
                      )}
                      <span className={cx("relative flex", mark)}>
                        <TaskDot state="ahead" />
                      </span>
                      <span className="min-w-0 text-secondary">{it.text}</span>
                    </li>
                  ))}
                </ol>
              </li>
            );
          })}
        </ol>
      </section>
      {esc && (
        <section className="flex flex-col gap-xs">
          <h3 className={heading}>If you finish as is</h3>
          <p className={cx(size, "text-secondary")}>{esc.afterDecline}</p>
        </section>
      )}
    </div>
  );
}

/** "Details" toggle for a card: a quiet link with a chevron after it, turned when open (as on plan steps). */
function DetailsToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <TextLink aria-expanded={open} onClick={onToggle} underline={false}>
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
  const stages = esc.stages.length;
  return (
    <div className={cx("not-prose flex flex-col gap-sm pt-sm", CODE)}>
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
 * A question in the feed is what the agent asked, set apart from the message with its Blocking / Can wait tag;
 * once answered, the answer.
 * It is answered in the dock over the composer, one question after another, like Claude asks.
 */
function QuestionLine({ chatId, questionId }: { chatId: string; questionId: string }) {
  const { answers } = useInbox();
  const task = TASKS.find((t) => t.id === chatId);
  const question = task?.stages.flatMap((st) => st.steps).find((p) => p.question?.id === questionId)?.question;
  if (!task || !question) return null;
  const picked = answers[answerKey(task.id, question.id)];
  // Set apart from the message: a rail and the same Blocking / Can wait tag as the dock. Clay only while it blocks you.
  const blocks = question.blocking && !picked;
  return (
    <div className={cx("not-prose my-md flex flex-col gap-0.5 border-s ps-md", blocks ? "border-clay" : "border-alpha-3")}>
      <span className={cx("pb-sm text-footnote", blocks ? "text-clay" : "text-muted")}>{question.blocking ? "Blocking" : "Can wait"}</span>
      <p className="text-body font-medium text-primary">{question.text}</p>
      {picked && (
        <p className="group/change flex flex-wrap items-center gap-x-xs text-footnote text-secondary">
          <TaskDot state="done" />
          <span>
            <YouSaid>{answerLabel(question, picked)}</YouSaid>
          </span>
          <ChangeButton onClick={() => unanswer(task.id, question.id)} />
        </p>
      )}
    </div>
  );
}

const focusComposer = () => (document.querySelector("[data-testid=code-prompt-input]") as HTMLElement | null)?.focus();

/** A risky assumption in the dock: the assumption is the question, why it matters under it; confirm it, or correct it in the row's field. */
function AssumptionDecision({ view, a, nav }: { view: ChatTaskView; a: Assumption; nav: DockNav }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const field = useRef<HTMLInputElement>(null);
  const pick = (i: number) => {
    setPicked(i);
    if (i === 1) window.setTimeout(() => field.current?.focus());
  };
  const ready = picked === 0 || (picked === 1 && !!draft.trim());
  const submit = () => {
    if (picked === 0) markAssumption(view.id, a.id, { ok: true });
    else if (picked === 1 && draft.trim()) markAssumption(view.id, a.id, { ok: false, note: draft.trim() });
  };
  return (
    <DockFrame
      nav={nav}
      title="Confirm this assumption?"
      count={2}
      pick={pick}
      canSubmit={ready}
      onSubmit={submit}
      // The assumption is what the question is about: right under it, before the options.
      lead={
        <div className={cx("flex flex-col gap-0.5", CODE)}>
          <p className="text-body text-primary">
            <Inline text={a.text} />
          </p>
          {a.why && <p className="text-footnote text-muted">{a.why}</p>}
        </div>
      }
    >
      <OptionList label="Confirm this assumption?">
        <OptionRow n={1} title="Confirm" selected={picked === 0} onSelect={() => pick(0)} description="I'll build on it as written" />
        <OptionRow n={2} title="Correct it" selected={picked === 1} onSelect={() => pick(1)}>
          <RowField
            ref={field}
            value={draft}
            onChange={setDraft}
            onFocus={() => setPicked(1)}
            onEnter={submit}
            placeholder="Type how it should be"
            label="Your correction"
          />
        </OptionRow>
      </OptionList>
    </DockFrame>
  );
}

/** The gate on the brief and plan: approve and start, or not yet (edits go in the chat). What blocks it or what it costs is under "Approve". */
function GateDecision({ view, nav, setTab, toAssumption }: { view: ChatTaskView; nav: DockNav; setTab: (t: TaskTab) => void; toAssumption: () => void }) {
  const gate = currentGate(view.live);
  const left = view.unmarked.length;
  const [picked, setPicked] = useState<number | null>(null);
  const submit = () => {
    if (picked === 0 && left === 0) launch(view.id);
    if (picked === 1) (focusComposer(), nav.toggle());
  };
  const title = `Approve ${gate?.title ?? "the plan"}?`;
  return (
    <DockFrame
      nav={nav}
      title={title}
      count={2}
      pick={setPicked}
      canSubmit={picked === 1 || (picked === 0 && left === 0)}
      onSubmit={submit}
      lead={
        <p className="flex flex-wrap items-baseline gap-x-1 text-footnote text-muted">
          {view.edits.length > 0 ? "Your edits are in the" : "See the"}
          {view.tabs.includes("brief") && (
            <>
              <TextLink onClick={() => setTab("brief")}>brief</TextLink>
              and
            </>
          )}
          <TextLink onClick={() => setTab("plan")}>plan</TextLink>
        </p>
      }
    >
      <OptionList label={title}>
        <OptionRow
          n={1}
          title="Approve and start"
          selected={picked === 0}
          onSelect={() => setPicked(0)}
          description={
            left > 0 ? (
              // What blocks the start, as a way back to it: the assumptions come before the gate in the dock.
              <TextLink onClick={toAssumption}>{left === 1 ? "Confirm 1 assumption first" : `Confirm ${left} assumptions first`}</TextLink>
            ) : (
              <Budget view={view} />
            )
          }
        />
        <OptionRow
          n={2}
          title="Not yet"
          selected={picked === 1}
          onSelect={() => setPicked(1)}
          description="Type the change below; I'll update the brief and plan"
        />
      </OptionList>
    </DockFrame>
  );
}

/** The escalation offer: split into stages (recommended), or finish as is. The reasons are the agent's message above. */
function EscalationChoice({ view, nav }: { view: ChatTaskView; nav: DockNav }) {
  const [picked, setPicked] = useState<number | null>(null);
  const stages = view.task.escalation?.stages.length ?? view.task.stages.length;
  return (
    <DockFrame
      nav={nav}
      title={`Split it into ${stages} stages?`}
      count={2}
      pick={setPicked}
      canSubmit={picked !== null}
      onSubmit={() => picked !== null && escalate(view.id, picked === 0)}
      lead={<p className="text-footnote text-muted">The details are in my message above.</p>}
    >
      <OptionList label={`Split it into ${stages} stages?`}>
        <OptionRow
          n={1}
          title="Split into stages"
          recommended
          selected={picked === 0}
          onSelect={() => setPicked(0)}
          description={
            <>
              Keeps what's done; you approve along the way · <Budget view={view} />
            </>
          }
        />
        <OptionRow
          n={2}
          title="Finish as is"
          selected={picked === 1}
          onSelect={() => setPicked(1)}
          description="No gates; the plan stays, and I'll still ask before going past your limits"
        />
      </OptionList>
    </DockFrame>
  );
}

/** A small task's result: accept it, or ask for changes in the chat. */
function ResultDecision({ view, nav }: { view: ChatTaskView; nav: DockNav }) {
  const { openReview } = useContext(ChatTaskContext);
  const [picked, setPicked] = useState<number | null>(null);
  const review = view.task.result?.review;
  return (
    <DockFrame
      nav={nav}
      title="Accept the result?"
      count={2}
      pick={setPicked}
      canSubmit={picked !== null}
      onSubmit={() => (picked === 0 ? accept(view.id) : picked === 1 && (focusComposer(), nav.toggle()))}
      lead={<p className="text-footnote text-muted">What I did and how I checked it is in my message above.</p>}
    >
      <OptionList label="Accept the result?">
        <OptionRow
          n={1}
          title="Accept"
          selected={picked === 0}
          onSelect={() => setPicked(0)}
          description={
            <span className="flex flex-wrap items-baseline gap-x-1">
              Marks the task done
              {review && openReview && (
                <>
                  <span>·</span>
                  <TextLink onClick={() => openReview("changes")}>Review the change</TextLink>
                </>
              )}
            </span>
          }
        />
        <OptionRow
          n={2}
          title="Ask for changes"
          selected={picked === 1}
          onSelect={() => setPicked(1)}
          description="Type what to change below; I'll redo it"
        />
      </OptionList>
    </DockFrame>
  );
}

type AcceptanceChoice = "accept" | "send-back" | "deeper" | "other";

/**
 * The options of accepting a level 2–3 result, shared by the dock and the Up next card. Accept is off while a
 * locked criterion is broken; "Look deeper first" shows only when something high-risk is only claimed or the
 * system flagged something. "(Recommended)" follows the state: Accept when all is proven and nothing is flagged,
 * Look deeper when there is something to look at, Send back when Accept is blocked.
 */
function acceptanceChoices(view: ChatTaskView, reveal: (t: RevealTarget) => void) {
  const acc = view.acceptance!;
  const choices: { id: AcceptanceChoice; title: string; description: ReactNode }[] = [
    {
      id: "accept",
      title: "Accept",
      description: acc.broken ? (
        <span className="flex flex-wrap items-baseline gap-x-1">
          Blocked:
          <TextLink onClick={() => reveal(`criterion:${acc.broken!.id}`)}>
            <Inline text={acc.blockReason ?? ""} />
          </TextLink>
        </span>
      ) : (
        "Marks the task done · plan and log become the PR description"
      ),
    },
    {
      id: "send-back",
      title: "Send back with the facts",
      description: acc.sendBackFacts ? `I'll fix: ${acc.sendBackFacts}` : "Type what to fix below; I'll redo it",
    },
    ...(acc.deeper
      ? [{ id: "deeper" as const, title: "Look deeper first", description: "Opens the review at the first unproven claim" }]
      : []),
  ];
  return choices;
}

/** The claims by status in one quiet line: "4 proven · 2 only claimed · 1 contradicted"; the flags are said elsewhere. */
function acceptanceCounts(view: ChatTaskView) {
  const acc = view.acceptance!;
  return [
    acc.counts.verified && `${acc.counts.verified} proven`,
    acc.counts.claimed && `${acc.counts.claimed} only claimed`,
    acc.counts.contradicted && `${acc.counts.contradicted} contradicted`,
  ]
    .filter(Boolean)
    .join(" · ");
}

/** What the picked option does. "Look deeper first" opens the review and leaves the decision open. */
function submitAcceptance(view: ChatTaskView, choice: AcceptanceChoice, words: string, reveal: (t: RevealTarget) => void) {
  const acc = view.acceptance!;
  if (choice === "accept" && acc.canAccept) accept(view.id);
  if (choice === "send-back") sendBack(view.id, acc.sendBackFacts, words.trim());
  if (choice === "other") sendBack(view.id, "", words.trim());
  if (choice === "deeper") {
    const first = acc.firstUnverified;
    reveal(first ? `claim:${first.id}` : `file:${acc.flags[0].ref}`);
  }
}

const canSubmitAcceptance = (view: ChatTaskView, choice: AcceptanceChoice | null, words: string) =>
  choice === "accept"
    ? !!view.acceptance?.canAccept
    : choice === "send-back"
      ? !!view.acceptance?.sendBackFacts || !!words.trim()
      : choice === "other"
        ? !!words.trim()
        : choice === "deeper";

/**
 * Accepting a level 2–3 result, in the dock after the agent's questions. Nothing is picked up front. Accept has
 * no number key unless it is the recommended option: one key must not accept a result with something flagged.
 */
function AcceptanceDecision({ view, nav }: { view: ChatTaskView; nav: DockNav }) {
  const { openReview } = useContext(ChatTaskContext);
  const acc = view.acceptance!;
  const [picked, setPicked] = useState<AcceptanceChoice | null>(null);
  const [words, setWords] = useState("");
  const [other, setOther] = useState("");
  const otherRef = useRef<HTMLInputElement>(null);
  const reveal = (t: RevealTarget) => (openReview?.("result"), revealInReview(t));
  const choices = acceptanceChoices(view, reveal);
  const ids: AcceptanceChoice[] = [...choices.map((c) => c.id), "other"];
  const acceptKey = acc.recommended === "accept";
  const pick = (i: number) => {
    const id = ids[i];
    if (!id || (id === "accept" && (!acceptKey || !acc.canAccept))) return;
    setPicked(id);
    if (id === "other") window.setTimeout(() => otherRef.current?.focus());
  };
  const text = picked === "other" ? other : words;
  const submit = () => {
    if (!picked || !canSubmitAcceptance(view, picked, text)) return;
    submitAcceptance(view, picked, text, reveal);
    if (picked === "deeper") setPicked(null);
  };
  const title = "Accept the result?";
  return (
    <DockFrame
      nav={nav}
      title={title}
      count={ids.length}
      pick={pick}
      canSubmit={!!picked && canSubmitAcceptance(view, picked, text)}
      onSubmit={submit}
      lead={
        <p className="flex flex-wrap items-baseline gap-x-1 text-footnote text-muted">
          <span>{acceptanceCounts(view)} ·</span>
          <TextLink onClick={() => openReview?.("result")}>Open the review</TextLink>
        </p>
      }
    >
      <OptionList label={title}>
        {choices.map((c, i) => (
          <OptionRow
            key={c.id}
            n={c.id === "accept" && !acceptKey ? undefined : i + 1}
            title={c.title}
            recommended={acc.recommended === c.id}
            selected={picked === c.id}
            disabled={c.id === "accept" && !acc.canAccept}
            onSelect={() => setPicked(c.id)}
            description={c.description}
          >
            {c.id === "send-back" && picked === "send-back" && (
              <RowField
                value={words}
                onChange={setWords}
                onEnter={submit}
                placeholder={acc.sendBackFacts ? "Anything else to fix? (optional)" : "Type what to fix"}
                label="What else to fix"
              />
            )}
          </OptionRow>
        ))}
        <OptionRow n={ids.length} title="Other" selected={picked === "other"} onSelect={() => pick(ids.length - 1)}>
          <RowField
            ref={otherRef}
            value={other}
            onChange={setOther}
            onFocus={() => setPicked("other")}
            onEnter={submit}
            placeholder="Type your own answer here"
            label="Your answer"
          />
        </OptionRow>
      </OptionList>
    </DockFrame>
  );
}

/**
 * The same decision in the Up next pane, under "You approve the result": the flags as lines, the claims by
 * status, the same options without number keys, and "Details", which opens the review (the Result tab).
 */
export function AcceptanceCard({ view, onDetails, onDone }: { view: ChatTaskView; onDetails: () => void; onDone?: () => void }) {
  const acc = view.acceptance!;
  const [picked, setPicked] = useState<AcceptanceChoice | null>(null);
  const [words, setWords] = useState("");
  const reveal = () => onDetails();
  const choices = acceptanceChoices(view, reveal);
  const submit = () => {
    if (!picked || !canSubmitAcceptance(view, picked, words)) return;
    if (picked === "deeper") return onDetails();
    submitAcceptance(view, picked, words, reveal);
    onDone?.();
  };
  return (
    <DecisionCard
      aside={<TextLink onClick={onDetails}>Details</TextLink>}
      actions={
        <Button size="sm" variant="primary" disabled={!picked || !canSubmitAcceptance(view, picked, words)} onClick={submit}>
          Submit
        </Button>
      }
    >
      <div className="flex flex-col gap-xs">
        {acc.flags.length > 0 && (
          <ul className="flex flex-col gap-xs">
            {acc.flags.map((f) => (
              <li key={f.id}>
                <FlagRow flag={f} />
              </li>
            ))}
          </ul>
        )}
        <p className="text-footnote text-muted">{acceptanceCounts(view)}</p>
      </div>
      <OptionList label="Accept the result?">
        {[...choices, { id: "other" as const, title: "Other", description: undefined }].map((c) => (
          <OptionRow
            key={c.id}
            title={c.title}
            recommended={acc.recommended === c.id}
            selected={picked === c.id}
            disabled={c.id === "accept" && !acc.canAccept}
            onSelect={() => setPicked(c.id)}
            description={c.description}
          >
            {((c.id === "send-back" && picked === "send-back") || c.id === "other") && (
              <RowField
                value={picked === c.id ? words : ""}
                onChange={setWords}
                onFocus={() => picked !== c.id && (setPicked(c.id), setWords(""))}
                onEnter={submit}
                placeholder={c.id === "other" ? "Type your own answer here" : acc.sendBackFacts ? "Anything else to fix? (optional)" : "Type what to fix"}
                label={c.id === "other" ? "Your answer" : "What else to fix"}
              />
            )}
          </OptionRow>
        ))}
      </OptionList>
    </DecisionCard>
  );
}

type Decision =
  | { key: string; kind: "escalation" }
  | { key: string; kind: "assumption"; a: Assumption }
  | { key: string; kind: "gate" }
  | { key: string; kind: "question"; q: Question }
  | { key: string; kind: "result" }
  | { key: string; kind: "acceptance" };

/**
 * Every decision of the chat, docked over the composer one at a time, drawn as Claude Code's question panel:
 * an escalation offer, then the risky assumptions, then the gate on the brief and plan, then the agent's
 * questions (blocking first), then accepting a small task's result.
 * The Brief and Plan tabs are to read; this is the one place to decide. Answering moves on to the next;
 * Skip moves on without answering (folds the dock on the last one); Close hides it until the chat is reopened.
 */
export function DecisionDock({ chatId, view, setTab }: { chatId: string; view?: ChatTaskView; setTab: (t: TaskTab) => void }) {
  const { answers } = useInbox();
  const [index, setIndex] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [closed, setClosed] = useState(false);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [customs, setCustoms] = useState<Record<string, CustomAnswer | undefined>>({});
  const task = TASKS.find((t) => t.id === chatId);
  const open = task ? openQuestions(task, answers).sort((a, b) => Number(b.blocking) - Number(a.blocking)) : [];
  const items: Decision[] = !task ? [] : [
    ...(view?.escalationPending ? [{ key: "escalation", kind: "escalation" as const }] : []),
    ...(view?.atGate ? view.unmarked.map((a) => ({ key: `a:${a.id}`, kind: "assumption" as const, a })) : []),
    ...(view?.atGate ? [{ key: "gate", kind: "gate" as const }] : []),
    ...open.map((q) => ({ key: `q:${q.id}`, kind: "question" as const, q })),
    ...(view?.resultPending ? [{ key: "result", kind: "result" as const }] : []),
    // A level 2–3 result comes last, after the agent's questions, like a small task's result.
    ...(view?.acceptancePending ? [{ key: `acceptance:${view.acceptance?.iteration}`, kind: "acceptance" as const }] : []),
  ];
  // Every decision the dock has shown in this chat: those gone from the queue are done, and the counter keeps them.
  const [seen, setSeen] = useState<{ chat: string; keys: string[] }>({ chat: chatId, keys: [] });
  const seenKeys = seen.chat === chatId ? seen.keys : [];
  const itemKeys = items.map((d) => d.key);
  const fresh = itemKeys.filter((k) => !seenKeys.includes(k));
  useEffect(() => {
    if (fresh.length > 0 || seen.chat !== chatId) setSeen({ chat: chatId, keys: [...seenKeys, ...fresh] });
  });
  const done = seenKeys.filter((k) => !itemKeys.includes(k)).length;
  if (!task || closed || items.length === 0) return null;
  const i = Math.min(index, items.length - 1);
  const item = items[i];
  const nav: DockNav = {
    index: i,
    count: items.length,
    done,
    prev: () => setIndex(i - 1),
    next: () => setIndex(i + 1),
    collapsed,
    toggle: () => setCollapsed((c) => !c),
    close: () => setClosed(true),
    skip: () => (i < items.length - 1 ? setIndex(i + 1) : setCollapsed(true)),
  };

  if (item.kind === "escalation" && view) return <EscalationChoice key={item.key} view={view} nav={nav} />;
  if (item.kind === "assumption" && view) return <AssumptionDecision key={item.key} view={view} a={item.a} nav={nav} />;
  if (item.kind === "gate" && view)
    return (
      <GateDecision key={item.key} view={view} nav={nav} setTab={setTab} toAssumption={() => setIndex(items.findIndex((d) => d.kind === "assumption"))} />
    );
  if (item.kind === "result" && view) return <ResultDecision key={item.key} view={view} nav={nav} />;
  if (item.kind === "acceptance" && view) return <AcceptanceDecision key={item.key} view={view} nav={nav} />;
  if (item.kind === "question") {
    // Keyed by task and question: question ids repeat across tasks ("q1").
    const key = answerKey(task.id, item.q.id);
    return (
      <QuestionCard
        key={key}
        task={task}
        question={item.q}
        choice={choices[key]}
        setChoice={(id) => setChoices((c) => ({ ...c, [key]: id }))}
        custom={customs[key]}
        setCustom={(c) => setCustoms((m) => ({ ...m, [key]: c }))}
        onAnswered={() => {}}
        showChanges
        dock={nav}
      />
    );
  }
  return null;
}

/** Task blocks inside the transcript; their content comes from the chat's task. */
export function TaskBlock({
  block,
}: {
  block: Extract<Block, { type: "brief-card" | "result-card" | "escalation-card" | "edit-note" | "task-note" | "question" }>;
}) {
  const { chatId, view, setTab } = useContext(ChatTaskContext);
  if (block.type === "task-note") return view ? <TaskNote view={view} text={block.text} demo={block.demo} /> : null;
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
  if (block.type === "result-card") return <ResultCard view={view} iteration={block.iteration} />;
  return <EscalationCard view={view} setTab={setTab} />;
}

/**
 * A quiet line about the task in the feed: "Sent back: …", "Accepted · PR description ready". The demo line carries
 * only a button that skips to the agent's next round, while the task is still being fixed.
 */
function TaskNote({ view, text, demo }: { view: ChatTaskView; text: string; demo?: "next-iteration" }) {
  if (demo)
    return view.sentBack ? (
      <p className="not-prose">
        <Button size="xs" onClick={() => nextIteration(view.id)}>
          Show the next round (demo)
        </Button>
      </p>
    ) : null;
  return (
    <p className={cx("not-prose flex items-start gap-sm text-body text-secondary", CODE)}>
      <span className="mt-[5px] flex">
        <TaskDot state="done" />
      </span>
      <span>
        <Inline text={text} />
      </span>
    </p>
  );
}
