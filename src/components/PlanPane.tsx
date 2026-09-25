import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Hint, Icon } from "../ui";
import { SESSIONS } from "../data/sessions";
import { StatusMark, TaskDot } from "./StatusMark";
import {
  costRange,
  gateText,
  isForecast,
  money as moneyRange,
  type Gate,
  type Option,
  type PlanDiff,
  type PlanStep,
  type Question,
  type Stage,
  type StepResult,
  type Status,
  type Task,
} from "../data/task";
import { answer, answerKey, openQuestions, unanswer } from "../data/inboxStore";

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

/* --------------------------------------------------------------- Plan pane */

/*
 * Every forecast says where it comes from, in its own tooltip: one for money, one for time.
 * Time is the agent's working time, never a deadline. Actual numbers need no explanation.
 */
const AGENT_ESTIMATE = "the agent's estimate for this step";
const costHint = (basis: string | undefined, model: string) => `Cost forecast from ${basis ?? AGENT_ESTIMATE}, priced at ${model} rates.`;
const timeHint = (basis: string | undefined) => `Agent working time, forecast from ${basis ?? AGENT_ESTIMATE}. Not a deadline.`;
export const whenHint = (source: string | undefined) =>
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
export const answerLabel = (q: Question, picked: string) =>
  picked.startsWith("text:") ? `“${picked.slice(5)}”` : (q.options.find((o) => o.id === picked)?.label ?? picked);

/** A question inside its plan step: every option shows its cost, time and reversibility, so they can be compared at a glance. */
/** A custom answer typed into the card: the agent turns it into a plan change you review and apply. */
export type CustomAnswer = { text: string; ready: boolean };

const fieldClass =
  "w-full resize-none rounded border border-alpha-2 bg-fill-field px-sm py-xs text-body text-primary outline-none placeholder:text-muted focus-visible:shadow-focus";

/** Plan changes spelled out for the chat, where the plan itself is not in view to preview them. */
const EFFECT_WORD: Record<PlanDiff["kind"], string> = { add: "Adds step", remove: "Drops step", change: "Changes step", gate: "Adds check" };

/**
 * What picking this option does to the plan, inside the picked option's row: one line per change, the kind of
 * change in plain words first, then the step, then what a new step costs. Indented to the option's text.
 */
function OptionEffects({ task, diff }: { task: Task; diff: PlanDiff[] }) {
  return (
    <ul
      aria-label="What this does to the plan"
      className="grid grid-cols-[auto_1fr] gap-x-sm gap-y-0.5 pb-sm ps-[calc(var(--cds-gap-sm)*2+12px)] pe-sm text-footnote"
    >
      {diff.map((d) => (
        <li key={d.kind + d.text} className="col-span-2 grid grid-cols-subgrid">
          <span className="text-muted">{EFFECT_WORD[d.kind]}</span>
          <span className="min-w-0 text-secondary">
            {d.text}
            {(d.cost || d.time) && (
              <span className="tabular-nums text-muted">
                {" · "}
                <Forecast cost={d.cost} time={d.time} basis={d.basis} model={task.model} />
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The only place to answer a question: pick an option, or give your own answer, which comes back as a plan
 * change to apply. "Ask" is a thread about the question; it never answers it.
 */
export function QuestionCard({
  task,
  question,
  choice,
  setChoice,
  custom,
  setCustom,
  onAnswered,
  showChanges,
  bare,
  corner,
}: {
  task: Task;
  question: Question;
  /** Picked option; lives in PlanPane so the plan below can preview it. */
  choice: string;
  setChoice: (id: string) => void;
  custom?: CustomAnswer;
  setCustom: (c: CustomAnswer | undefined) => void;
  onAnswered: () => void;
  /** List what the picked option changes in the plan: in the chat, where the plan is not beside the card. */
  showChanges?: boolean;
  /** Inside a frame of its own (the question dock of the chat): no border or padding here. */
  bare?: boolean;
  /** On the label's line, at the right: the dock's "1 of N" navigation. */
  corner?: ReactNode;
}) {
  // A stale choice (another question, another task) falls back to the first option instead of breaking the card.
  const chosen = question.options.find((o) => o.id === choice) ?? question.options[0];
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
      className={cx("flex scroll-mt-[var(--cds-gap-xl)] flex-col gap-lg", !bare && "rounded-lg border border-alpha-2 p-lg")}
    >
      <div className="flex flex-col gap-xs">
        <div className="flex min-h-5 items-center justify-between gap-sm">
          <span className={cx("text-footnote", question.blocking ? "text-clay" : "text-muted")}>
            {question.blocking ? "Blocking" : "Can wait"}
          </span>
          {corner}
        </div>
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
                {/* In the chat the plan is not beside the card: what the picked option does to it, under that option. */}
                {showChanges && on && o.diff.length > 0 && <OptionEffects task={task} diff={o.diff} />}
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
  // Stopped at a gate of yours (a task chat): that is the status, not "Running".
  const gate = task.stages.find((st) => st.gate?.status === "current" && st.gate.mine)?.gate;
  const branch = SESSIONS.find((x) => x.id === task.id)?.repo?.branch;
  const spentTime = task.stages
    .flatMap((st) => st.steps)
    .reduce((n, x) => n + minutes(x.work?.time ?? "0m"), 0);
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
        gate ? (
          <span className="text-secondary">{gateText(gate)}</span>
        ) : (
          <span>Running{next && ` · next: ${next.title}`}</span>
        )
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
 * The plan of a task, with open questions expanded on their steps. One component for the Inbox side pane
 * and the chat's Plan tab: questions are answered only here, in their plan row.
 */
export function PlanPane({
  task,
  answers,
  onTaskDone,
  edits = [],
  header,
  gateCard,
}: {
  task: Task;
  answers: Record<string, string>;
  onTaskDone?: () => void;
  /** Changes made outside the question cards (text edits in the chat): shown struck through with "Removed". */
  edits?: PlanDiff[];
  /** Replaces the summary and meta line at the top (the chat shows the total against its envelope). */
  header?: ReactNode;
  /** The decision at the gate the plan stands at, opened right on it (like a question card on its step). */
  gateCard?: ReactNode;
}) {
  const open = openQuestions(task, answers).sort((a, b) => Number(b.blocking) - Number(a.blocking));
  const afterAnswer = () => {
    // `answers` is from before this answer: the last open question means the task no longer needs you.
    if (open.length <= 1) onTaskDone?.();
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
  effects.push(...edits.map((e) => ({ ...e, preview: true })));
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
  const stageDone = (st: Stage) => st.steps.every((x) => x.status === "done" && !x.question) && st.gate?.status !== "current";
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
    const agent = it.step.work?.agent;
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
          <span className="relative mt-[4px] flex bg-[var(--plan-surface,var(--cds-surface-2))]">
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
          <span className="relative mt-[4px] flex bg-[var(--plan-surface,var(--cds-surface-2))]">
            {/* Gates take the same dots as steps: who approves is said by the text ("You approve …" / "Check: …"). */}
            <GateMark gate={item.gate} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-sm">
            <span className="flex flex-wrap items-baseline justify-between gap-x-md gap-y-xs">
              <span className={cx("text-body", item.gate.status === "current" ? "text-primary" : "text-secondary")}>{gateText(item.gate)}</span>
              {item.gate.status === "current" ? (
                <span className="shrink-0 text-footnote text-clay">{item.gate.mine ? "waiting for you" : "running"}</span>
              ) : item.gate.eta ? (
                <span className="shrink-0 text-footnote tabular-nums text-secondary">
                  <Hint text={whenHint(item.gate.etaSource)}>{item.gate.eta}</Hint>
                </span>
              ) : null}
            </span>
            {item.gate.status === "current" && gateCard}
          </div>
        </li>
      );
    const step = item.step;
    const q = step.question;
    const picked = q && answers[answerKey(task.id, q.id)];
    const status: Status = q ? (picked ? "running" : "waiting") : step.status;
    const work = step.work;
    const removing = effectOn(step.id, "remove");
    const changed = effectOn(step.id, "change");
    // Finished steps open to show what they produced.
    const result = status === "done" ? step.result : undefined;
    const expanded = !!result && !!openSteps[step.id];
    return (
      <li key={item.key} className="group/step relative flex items-start gap-md pb-[var(--cds-gap-lg)]">
        {rail}
        <span className="relative mt-[4px] flex bg-[var(--plan-surface,var(--cds-surface-2))]">
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
      {/* Under the title: the summary as a subtitle, then one quiet meta line. */}
      {header ?? (
        <div className="flex flex-col gap-xs">
          <p className="text-body text-secondary">{task.summary}</p>
          <PaneMeta task={task} answers={answers} />
        </div>
      )}

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
              return x.work ? [{ cost: x.work.cost, time: x.work.time }] : [];
            }),
            ...list.flatMap((it) => (it.kind === "added" ? [{ cost: it.diff.cost ?? "$0", time: it.diff.time ?? "0m" }] : [])),
          ];
          const approx = costs.some((c) => isForecast(c.cost) || (c.time && isForecast(c.time)));
          const sumCost = costs.reduce((n, c) => ({ min: n.min + costRange(c.cost).min, max: n.max + costRange(c.cost).max }), { min: 0, max: 0 });
          const sumTime = costs.reduce((n, c) => n + anyMinutes(c.time ?? "0m"), 0);
          const actual = costs.filter((c) => !isForecast(c.cost) && !(c.time && isForecast(c.time))).length;
          const sumWhy = `Sum of ${costs.length} steps: ${actual} done, ${costs.length - actual} forecast.`;
          const stageMeta = (
            <>
              {done === total ? (stage.gate?.status === "current" ? "Steps done" : "Done") : `${done} of ${total} done`} ·{" "}
              {approx ? (
                <>
                  <Hint text={`${sumWhy} Each forecast shows its source on hover.`} focusable={false}>
                    ~{cost(sumCost.min, sumCost.max)}
                  </Hint>
                  {sumTime > 0 && (
                    <>
                      {" "}
                      ·{" "}
                      <Hint text={`${sumWhy} Agent working time, not a deadline.`} focusable={false}>
                        ~{duration(sumTime)}
                      </Hint>
                    </>
                  )}
                </>
              ) : (
                `${cost(sumCost.min)}${sumTime > 0 ? ` · ${duration(sumTime)}` : ""}`
              )}
            </>
          );
          const isCollapsed = !single && collapsed[stage.id];
          return (
            // Room comes after an open stage; collapsed stages stack tightly, like the Inbox groups.
            <li key={stage.id} className={cx("flex flex-col", isCollapsed ? "pb-md" : si < stages.length - 1 && "pb-lg")}>
              {/* One stage: a plain "Plan" heading; several: numbered, collapsible stages. */}
              {single && (
                <div className="sticky top-0 z-[2] flex items-baseline gap-sm bg-[var(--plan-surface,var(--cds-surface-2))] py-xs mb-[var(--cds-gap-md)]">
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
                    "group/stage sticky top-0 z-[2] flex w-full items-baseline gap-sm bg-[var(--plan-surface,var(--cds-surface-2))] py-xs text-left outline-none focus-visible:shadow-focus cursor-[var(--cds-cursor-interactive)]",
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
        {task.rules && (
          <li className="flex flex-col gap-0.5 border-t border-alpha-2 pt-md text-footnote">
            <span className="text-muted">Plan rules</span>
            <span className="text-secondary">
              I change myself: {task.rules.self}. I'll ask about: {task.rules.ask}.
            </span>
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
/** Passed = grey dot, waits for you = clay dot, ahead (or an automatic check running) = grey ring. */
function GateMark({ gate }: { gate: Gate }) {
  if (gate.status === "passed") return <TaskDot state="done" />;
  return <TaskDot state={gate.status === "current" && gate.mine ? "blocked" : "ahead"} />;
}

/** Actual sums keep cents ("$1.60"); ranges read as ranges ("$4–7"). */
const cost = (min: number, max = min) => (Math.abs(max - min) < 0.005 ? `$${min.toFixed(2)}` : moneyRange(min, max));
const duration = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`);

const questionAnchor = (taskId: string, questionId: string) => `question-${taskId}-${questionId}`;

