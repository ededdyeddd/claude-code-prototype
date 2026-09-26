import { useRef, useState, type ReactNode } from "react";
import { DockFrame, OptionList, OptionRow, RowField, type DockNav } from "./DecisionPanel";
import { Button, Hint, Icon } from "../ui";
import { SESSIONS } from "../data/sessions";
import { TaskDot } from "./StatusMark";
import {
  costRange,
  gateText,
  isForecast,
  money as moneyRange,
  type Gate,
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
/** Where a time of day comes from; the tail of every "when" hint. */
export const etaFrom = (source: string | undefined) => `forecast from ${source ?? AGENT_ESTIMATE}. It moves as the agents work.`;
export const whenHint = (source: string | undefined) => `When you are likely to be needed, ${etaFrom(source)}`;

/** Money and time; a forecast (~, work not done yet) gets a tooltip each with its source, actual numbers stay plain. */
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
type ChipKind = Exclude<PlanDiff["kind"], "change">;
const DIFF_WORD: Record<ChipKind, string> = { add: "New", remove: "Removed", gate: "New" };

function DiffChip({ kind }: { kind: ChipKind }) {
  return (
    <span className="ml-sm inline-block rounded-sm bg-alpha-3 px-1.5 text-footnote leading-5 text-secondary">{DIFF_WORD[kind]}</span>
  );
}

/** Text followed by its chip; the chip is glued to the last word so a wrapped title never leaves it alone on a line. */
function WithChip({ text, kind }: { text: string; kind?: ChipKind }) {
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

/** A custom answer typed into the card: the agent turns it into a plan change you review and apply. */
export type CustomAnswer = { text: string; ready: boolean };

const fieldClass =
  "w-full resize-none rounded border border-alpha-2 bg-fill-field px-sm py-xs text-body text-primary outline-none placeholder:text-muted focus-visible:shadow-focus";

/** Plan changes spelled out for the chat, where the plan itself is not in view to preview them. */
const EFFECT_WORD: Record<PlanDiff["kind"], string> = { add: "Adds step", remove: "Drops step", change: "Changes step", gate: "Adds your approval" };

/**
 * What picking this option does to the plan, inside the picked option's row of the dock: one line per change, the
 * kind of change in plain words first, then the step, then what a new step costs.
 */
function OptionEffects({ task, diff }: { task: Task; diff: PlanDiff[] }) {
  return (
    <ul aria-label="What this does to the plan" className="grid grid-cols-[auto_1fr] gap-x-sm gap-y-0.5 pt-xs text-footnote">
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

/** What you said, wherever it shows (an answer, a confirmed or corrected assumption): "You:" muted, your words secondary. */
export function YouSaid({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="text-muted">You: </span>
      {children}
    </>
  );
}

/** Undoes what you said. One look everywhere: a small button that shows on hovering its row (`group/change`) or on focus. */
export function ChangeButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      size="xs"
      className="-my-0.5 opacity-0 transition-opacity duration-fast group-hover/change:opacity-100 focus-visible:opacity-100"
      onClick={onClick}
    >
      Change
    </Button>
  );
}

/**
 * The only place to answer a question: pick an option, or give your own answer, which comes back as a plan
 * change to apply. "Ask about it" is a thread about the question; it never answers it.
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
  dock,
}: {
  task: Task;
  question: Question;
  /** Picked option; lives in PlanPane so the plan below can preview it. In the dock nothing is picked at first. */
  choice?: string;
  setChoice: (id: string) => void;
  custom?: CustomAnswer;
  setCustom: (c: CustomAnswer | undefined) => void;
  onAnswered: () => void;
  /** List what the picked option changes in the plan: in the dock, where the plan is not beside it. */
  showChanges?: boolean;
  /** In the chat's decision dock: drawn as Claude Code's question panel (numbered option rows, Other, Skip, Submit). */
  dock?: DockNav;
}) {
  // Nothing is picked until the person picks: no option is preselected, not even the recommended one.
  const chosen = question.options.find((o) => o.id === choice);
  const recommended = question.options.find((o) => o.recommended);
  const [mode, setMode] = useState<"choose" | "other">("choose");
  const [draft, setDraft] = useState("");
  // "Ask about it" is beside the answer, not instead of it: the options stay, the field has its own text.
  const [asking, setAsking] = useState(false);
  const [askDraft, setAskDraft] = useState("");
  const [thread, setThread] = useState<{ q: string; a?: string }[]>([]);
  const otherRef = useRef<HTMLInputElement>(null);

  const sendOther = () => {
    const text = draft.trim();
    if (!text) return;
    setCustom({ text, ready: false });
    setMode("choose");
    // Mock: the agent needs a moment to turn the answer into a plan change.
    window.setTimeout(() => setCustom({ text, ready: true }), 1500);
  };
  const sendAsk = () => {
    const text = askDraft.trim();
    if (!text) return;
    setThread((t) => [...t, { q: text }]);
    setAskDraft("");
    setAsking(false);
    const reply =
      `${question.context ?? ""} ` +
      (recommended
        ? `Рекомендую «${recommended.label}»: ${recommended.cost}, ${recommended.toAcceptance}, ${reversibleShort(recommended.reversible)}.`
        : "");
    window.setTimeout(() => setThread((t) => t.map((m, k) => (k === t.length - 1 ? { ...m, a: reply.trim() } : m))), 700);
  };

  const thread$ = thread.length > 0 && (
    // Questions about the question: answered by the agent right here; the question stays open.
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
  );

  if (dock) {
    const n = question.options.length;
    const otherOn = mode === "other";
    const picked = otherOn ? undefined : question.options.find((o) => o.id === choice);
    const pick = (i: number) => {
      if (custom) return;
      if (i < n) {
        setChoice(question.options[i].id);
        if (mode === "other") setMode("choose");
      } else if (i === n) {
        setMode("other");
        window.setTimeout(() => otherRef.current?.focus());
      }
    };
    const submit = () => {
      if (custom) {
        if (!custom.ready) return;
        answer(task.id, question.id, `text:${custom.text}`);
        return onAnswered();
      }
      if (otherOn) return sendOther();
      if (!picked) return;
      answer(task.id, question.id, picked.id);
      onAnswered();
    };
    return (
      <DockFrame
        nav={dock}
        title={question.text}
        tag={question.blocking ? <span className="text-clay">Blocking</span> : <span className="text-muted">Can wait</span>}
        count={custom ? 0 : n + 1}
        pick={pick}
        canSubmit={custom ? custom.ready : otherOn ? !!draft.trim() : !!picked}
        onSubmit={submit}
        submitLabel={custom ? "Apply" : "Submit"}
        lead={question.context && <p className="text-body text-secondary">{question.context}</p>}
        left={
          custom ? (
            <Button
              size="sm"
              onClick={() => {
                setDraft(custom.text);
                setCustom(undefined);
                setMode("other");
              }}
            >
              Edit
            </Button>
          ) : asking ? (
            <Button size="sm" onClick={() => setAsking(false)}>
              Cancel
            </Button>
          ) : (
            <Button size="sm" onClick={() => (setAskDraft(""), setAsking(true))}>
              Ask about it
            </Button>
          )
        }
      >
        {thread$}
        {asking && (
          <input
            autoFocus
            value={askDraft}
            onChange={(e) => setAskDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.preventDefault(), sendAsk());
              if (e.key === "Escape") setAsking(false);
            }}
            placeholder="Ask me about this question"
            aria-label="Ask about this question"
            className={fieldClass}
          />
        )}
        {custom ? (
          <div className="flex flex-col gap-0.5 rounded bg-alpha-1 px-md py-sm">
            <p className="text-body text-primary">“{custom.text}”</p>
            <span className="text-footnote text-muted">
              {custom.ready ? "Plan change ready: Apply it, or Edit your answer" : "Drafting the plan change…"}
            </span>
          </div>
        ) : (
          <OptionList label={question.text}>
            {question.options.map((o, k) => {
              const on = !otherOn && o.id === choice;
              return (
                <OptionRow
                  key={o.id}
                  n={k + 1}
                  title={o.label}
                  recommended={o.recommended}
                  selected={on}
                  onSelect={() => pick(k)}
                  description={
                    <span className="tabular-nums">
                      <Forecast cost={o.cost} time={o.toAcceptance} basis={o.forecastSource} model={task.model} focusable={false} /> ·{" "}
                      <Hint text={`Reversible: ${o.reversible}.`} focusable={false}>
                        {reversibleShort(o.reversible)}
                      </Hint>
                    </span>
                  }
                >
                  {/* The plan is not beside the dock: what the picked option does to it, in its row. */}
                  {showChanges && on && o.diff.length > 0 && <OptionEffects task={task} diff={o.diff} />}
                </OptionRow>
              );
            })}
            <OptionRow n={n + 1} title="Other" selected={otherOn} onSelect={() => pick(n)}>
              <RowField
                ref={otherRef}
                value={draft}
                onChange={setDraft}
                onFocus={() => mode !== "other" && setMode("other")}
                onEnter={sendOther}
                placeholder="Type your own answer here"
                label="Your answer"
              />
            </OptionRow>
          </OptionList>
        )}
      </DockFrame>
    );
  }

  return (
    <section
      id={questionAnchor(task.id, question.id)}
      aria-label={question.text}
      className="flex scroll-mt-[var(--cds-gap-xl)] flex-col gap-md rounded-lg border border-alpha-2 p-lg transition-colors duration-fast data-[linked]:border-alpha-5"
    >
      <div className="flex flex-col gap-0.5">
        {/* A status, not part of the question: set apart from the title below. */}
        <span className={cx("pb-sm text-footnote", question.blocking ? "text-clay" : "text-muted")}>
          {question.blocking ? "Blocking" : "Can wait"}
        </span>
        <p className="text-body font-medium text-primary">{question.text}</p>
        {question.context && <p className="text-body text-secondary">{question.context}</p>}
      </div>

      {thread$}

      {custom ? (
        <div className="flex flex-col gap-0.5">
          <span className="text-footnote text-muted">Your answer</span>
          <p className="text-body text-primary">“{custom.text}”</p>
          <span className="text-footnote text-muted">
            {custom.ready ? "Plan change ready: review it in the plan below, then Apply it or Edit your answer" : "Drafting the plan change…"}
          </span>
        </div>
      ) : (
        // The same option rows as the decision dock over the composer, Other included, without keycaps: the pane has no number keys.
        <OptionList label={question.text}>
          {question.options.map((o) => {
            const on = mode === "choose" && o.id === chosen?.id;
            return (
              <OptionRow
                key={o.id}
                title={o.label}
                recommended={o.recommended}
                selected={on}
                onSelect={() => (setChoice(o.id), setMode("choose"))}
                description={
                  <span className="tabular-nums">
                    <Forecast cost={o.cost} time={o.toAcceptance} basis={o.forecastSource} model={task.model} focusable={false} /> ·{" "}
                    <Hint text={`Reversible: ${o.reversible}.`} focusable={false}>
                      {reversibleShort(o.reversible)}
                    </Hint>
                  </span>
                }
              />
            );
          })}
          <OptionRow title="Other" selected={mode === "other"} onSelect={() => (setMode("other"), window.setTimeout(() => otherRef.current?.focus()))}>
            <RowField
              ref={otherRef}
              value={draft}
              onChange={setDraft}
              onFocus={() => mode !== "other" && setMode("other")}
              onEnter={sendOther}
              placeholder="Type your own answer here"
              label="Your answer"
            />
          </OptionRow>
        </OptionList>
      )}

      {/* Asking takes the place of the "Ask about it" row: the field, its buttons under it; Cancel brings the row back. */}
      {asking && !custom && (
        <textarea
          autoFocus
          rows={2}
          value={askDraft}
          onChange={(e) => setAskDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendAsk();
            }
            if (e.key === "Escape") setAsking(false);
          }}
          placeholder="Ask me about this question"
          aria-label="Ask about this question"
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
        ) : !asking ? (
          <>
            <Button size="sm" className="me-auto" onClick={() => (setAskDraft(""), setAsking(true))}>
              Ask about it
            </Button>
            {/* Other: your words come back as a plan change to apply; an option answers right away. */}
            <Button
              size="sm"
              variant="primary"
              title={mode === "other" ? undefined : chosen ? `Go with “${chosen.label}”` : "Pick an option first"}
              disabled={mode === "other" ? !draft.trim() : !chosen}
              onClick={() => {
                if (mode === "other") return sendOther();
                if (!chosen) return;
                answer(task.id, question.id, chosen.id);
                onAnswered();
              }}
            >
              Answer
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="secondary" onClick={() => setAsking(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" disabled={!askDraft.trim()} onClick={sendAsk}>
              Ask
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
        Auto-decided {task.autoDecisions.length}
        <Icon glyph={open ? I.chevronDown : I.chevronRight} size="sm" />
      </button>
      {open && (
        <ul className="flex flex-col">
          {task.autoDecisions.map((d) => (
            <li key={d.id} className="group/change flex items-center gap-sm py-xs">
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-body text-primary">{d.text}</span>
                <span className="text-footnote text-muted">{d.why}</span>
              </div>
              <ChangeButton />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const fmtNum = (n: number) => n.toLocaleString("en-US");

/*
 * Plan typography: four roles, two weights, three text colors (clay only for "needs you").
 *   Title    serif `--cds-font-size-title`, primary: the pane's heading (SidePane).
 *   Heading  text-body medium, primary: stage titles, the "Plan" heading, a question, Brief section titles.
 *   Body     text-body regular: primary for what is done, running or needs you; secondary for steps ahead and the
 *            agent's words about a step (result summary, intent).
 *   Meta     text-footnote regular: muted for labels and numbers (cost · time, "Changed 1 file");
 *            secondary for content set small (decisions, file paths, plan rules).
 * Spacing inside the plan, smallest to largest, so a gap inside a group never matches the gap between groups:
 *   gap-0.5  lines of one element: a title and its description or answer line; a label and its list; list items.
 *   gap-xs   blocks inside an element (description → decisions → files, title → question card).
 *   gap-sm   between collapsed steps.
 *   gap-md   after an opened step; between collapsed stages; inside a question card.
 *   SECTION_GAP + stage padding   after an open stage; gap-lg between the pane's sections.
 */

/** The agent's intent for a step ahead, right under its title. That the plan may change is said once, by the plan rules. */
function StepPlanView({ what }: { what: string }) {
  return <p className="text-body text-secondary">{what}</p>;
}

/**
 * What a finished step produced, under its summary (which sits right under the title, as its description):
 * the agent's own decisions and changed files with diff stats as in chats. Each is a block: label, then its lines.
 */
function StepResultView({ result }: { result: StepResult }) {
  return (
    <>
      {result.decisions && result.decisions.length > 0 && (
        <div className="flex flex-col gap-0.5">
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
        <div className="flex flex-col gap-0.5">
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
    </>
  );
}

/**
 * One quiet meta line under the brief: status first, then where the task works and what it has used.
 * One size, one color; the only emphasis is the question count, which scrolls to the question.
 */
export function PaneMeta({ task, answers }: { task: Task; answers: Record<string, string> }) {
  const open = openQuestions(task, answers).sort((a, b) => Number(b.blocking) - Number(a.blocking));
  const next = task.stages.flatMap((st) => st.steps).find((x) => x.status === "running" || x.status === "ahead");
  // Waiting for you does not always mean stopped: steps that do not need the answer keep running.
  const working = open.length > 0 ? task.stages.flatMap((st) => st.steps).filter((x) => x.status === "running" && !x.question).length : 0;
  // Stopped at a gate of yours (a task chat): that is the status, not "Running".
  const gate = task.stages.find((st) => st.gate?.status === "current" && st.gate.mine)?.gate;
  const branch = SESSIONS.find((x) => x.id === task.id)?.repo?.branch;
  const spentTime = task.stages
    .flatMap((st) => st.steps)
    .reduce((n, x) => n + minutes(x.work?.time ?? "0m"), 0);
  const target = () => (open[0] ? document.getElementById(questionAnchor(task.id, open[0].id)) : null);
  const link = (on: boolean) => target()?.toggleAttribute("data-linked", on);
  return (
    <p className="text-footnote text-muted">
      {open.length > 0 ? (
        <button
          type="button"
          onClick={() => target()?.scrollIntoView({ behavior: "smooth", block: "start" })}
          // Hovering lights up the question it leads to, so the link reads even when the card is already in view.
          onMouseEnter={() => link(true)}
          onMouseLeave={() => link(false)}
          onFocus={() => link(true)}
          onBlur={() => link(false)}
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
      {working > 0 && ` · ${working} in parallel`}
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

/** Padding of a side pane's body (Inbox task pane, the chat's Brief and Plan panes): one left edge and top offset. */
export const PANE_BODY = "px-[var(--cds-gap-lg)] pt-xs pb-[var(--cds-gap-xl)]";
/** Room between plan stages (and before the plan rules). */
export const SECTION_GAP = "pb-[var(--cds-gap-md)]";
/** Room after a collapsed stage: less than after an open one, but its heading should not touch the next. */
const COLLAPSED_STAGE_GAP = "pb-[var(--cds-gap-sm)]";
/** Room between steps; the last step of a stage has none, the stage's own room follows. */
const STEP_GAP = "pb-[var(--cds-gap-sm)]";
/** Room after an opened step: more than between its own blocks (gap-xs), so the next step reads as the next one. */
const OPEN_STEP_GAP = "pb-[var(--cds-gap-md)]";

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
  /** Over the stages: the meta line in Up next, the stat cards in the chat. The summary is in the pane's header. */
  header: ReactNode;
  /** The decision at the gate the plan stands at, opened right on it (like a question card on its step). */
  gateCard?: ReactNode;
}) {
  const open = openQuestions(task, answers).sort((a, b) => Number(b.blocking) - Number(a.blocking));
  const afterAnswer = () => {
    // `answers` is from before this answer: the last open question means the task no longer needs you.
    if (open.length <= 1) onTaskDone?.();
  };
  const single = task.stages.length === 1;
  // Auto decisions or rules follow the last stage: it keeps the room after it, like the stages before.
  const hasTail = task.autoDecisions.length > 0 || !!task.rules;

  // Picked option per question, none until the person picks. The plan previews the picked one before you answer.
  const questions = task.stages.flatMap((st) => st.steps.flatMap((x) => (x.question ? [x.question] : [])));
  const [choices, setChoices] = useState<Record<string, string>>({});
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
  // Steps are not always a line: while one waits for you, steps that do not need it run in parallel (see `PlanStep.after`).
  const statusOf = (p: PlanStep): Status => (p.question ? (answers[answerKey(task.id, p.question.id)] ? "running" : "waiting") : p.status);
  const allSteps = task.stages.flatMap((st) => st.steps);
  const inParallel = allSteps.filter((p) => ["running", "waiting"].includes(statusOf(p))).length > 1;
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(task.stages.map((st) => [st.id, stageDone(st)])),
  );

  // Name the agent only where it differs from the one before (the task's own agent to start with); the same name on every step reads as a table.
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
  }, task.agent);

  /** Details of a stage nobody has started yet (costs, times): on hover, so the plan ahead reads as a list of titles. */
  const onHover = (group: "step" | "stage") =>
    cx(
      "transition-opacity duration-fast motion-reduce:transition-none",
      group === "step" ? "opacity-0 group-hover/step:opacity-100 group-focus-within/step:opacity-100" : "opacity-0 group-hover/stage:opacity-100 group-focus-visible/stage:opacity-100",
    );
  const renderItem = (item: Item, last: boolean, planned = false) => {
    // The line runs from under this mark to the next one; the mark sits on a pane-colored backing so the line never shows through it.
    const rail = !last && <span aria-hidden="true" className="absolute top-[19px] bottom-[-3px] left-[5.5px] w-px bg-alpha-3" />;
    if (item.kind === "added")
      return (
        <li key={item.key} className={cx("group/step relative flex items-start gap-md", !last && STEP_GAP)}>
          {rail}
          <span className="relative mt-[5px] flex bg-[var(--plan-surface,var(--cds-surface-2))]">
            <TaskDot state="ahead" />
          </span>
          <span className="flex min-w-0 flex-1 items-baseline justify-between gap-md">
            <span className={cx("min-w-0 text-body", item.preview ? "text-primary" : "text-secondary")}>
              <WithChip text={item.text} kind={item.preview ? "add" : undefined} />
            </span>
            {item.diff.time && (
              <span className="relative shrink-0 text-footnote tabular-nums text-muted">
                {item.diff.agent && newAgent.has(item.key) && <>{item.diff.agent} · </>}
                <Forecast cost={item.diff.cost} time={item.diff.time} basis={item.diff.basis} model={task.model} />
              </span>
            )}
          </span>
        </li>
      );
    if (item.kind === "gate")
      return (
        <li key={item.key} className={cx("group/step relative flex items-start gap-md", !last && STEP_GAP)}>
          {rail}
          <span className="relative mt-[5px] flex bg-[var(--plan-surface,var(--cds-surface-2))]">
            {/* Gates take the same dots as steps: who approves is said by the text ("You approve …" / "Check: …"). */}
            <GateMark gate={item.gate} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-xs">
            <span className="flex flex-wrap items-baseline justify-between gap-x-md gap-y-0.5">
              <span className={cx("text-body", item.gate.status === "current" ? "text-primary" : "text-secondary")}>
                {gateText(item.gate)}
              </span>
              {item.gate.status === "current" ? (
                <span className="shrink-0 text-footnote text-clay">{item.gate.mine ? "waiting for you" : "running"}</span>
              ) : item.gate.eta ? (
                <span className={cx("shrink-0 text-footnote tabular-nums text-muted", planned && onHover("step"))}>
                  <Hint text={whenHint(item.gate.etaSource)}>by {item.gate.eta}</Hint>
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
    const status = statusOf(step);
    const parallel = status === "running" && inParallel;
    // What a step ahead still waits for: only unfinished steps it depends on, so the line goes once they are done.
    const waitsFor = status === "ahead" ? (step.after ?? []).flatMap((id) => allSteps.filter((p) => p.id === id && statusOf(p) !== "done")) : [];
    const work = step.work;
    const removing = effectOn(step.id, "remove");
    const changed = effectOn(step.id, "change");
    // Finished steps open to show what they produced; steps ahead, what they will do.
    const result = status === "done" ? step.result : undefined;
    const stepPlan = status !== "done" && !removing ? step.plan : undefined;
    // In a stage not started yet, the cost shows on hover.
    const quiet = planned && status === "ahead" && !removing && !changed;
    const canOpen = !!result || !!stepPlan?.what;
    const expanded = canOpen && !!openSteps[step.id];
    const foldedQuestion = !!q && !picked && !q.blocking && hasBlocking && !openQs[q.id];
    const card = !!q && !picked && (q.blocking || !hasBlocking || !!openQs[q.id]);
    // An opened step (details or a question card) gets more room after it than a closed one: its own blocks are xs apart.
    const opened = expanded || card || foldedQuestion;
    return (
      <li key={item.key} className={cx("group/step relative flex items-start gap-md", !last && (opened ? OPEN_STEP_GAP : STEP_GAP))}>
        {rail}
        <span className="relative mt-[5px] flex bg-[var(--plan-surface,var(--cds-surface-2))]">
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
        <div className="flex min-w-0 flex-1 flex-col gap-xs">
          {/* The title and the lines that describe it read as one: a change, the summary or intent, your answer. */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline justify-between gap-md">
              {canOpen ? (
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpenSteps((o) => ({ ...o, [step.id]: !expanded }))}
                  className="flex min-w-0 items-baseline gap-sm rounded-sm text-left outline-none focus-visible:shadow-focus cursor-[var(--cds-cursor-interactive)]"
                >
                  <span className={cx("text-body", status === "ahead" ? "text-secondary" : "text-primary")}>{step.title}</span>
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
                    className={cx(
                      "text-body",
                      removing ? "text-muted line-through" : status === "ahead" ? "text-secondary" : "text-primary",
                    )}
                  >
                    <WithChip text={step.title} kind={removing ? "remove" : undefined} />
                  </span>
                </span>
              )}
              {work && (
                // Done steps and steps of a stage not started keep their cost on hover; for the stage in work it is a forecast that informs the answer, so it stays visible.
                // Meta role: every cost · time in the plan is the same muted footnote, on steps, stages, gates and options.
                <span
                  className={cx(
                    "relative shrink-0 text-footnote tabular-nums text-muted",
                    (status === "done" || quiet) && !expanded && onHover("step"),
                    removing && "line-through",
                  )}
                >
                  {/* Agent: only where it changes along the plan; the same name on every step reads as a table. */}
                  {work.agent && (newAgent.has(step.id) || parallel) && <>{work.agent} · </>}
                  <Forecast cost={work.cost} time={work.time} basis={work.basis} model={task.model} />
                </span>
              )}
            </div>
            {/* What the step becomes; no chip: "New" and "Removed" already say the plan is changing. */}
            {changed && <span className="text-footnote text-secondary">{changed.text}</span>}
            {/* Parallel work says so on the step: the task is not stopped just because one step waits for you. */}
            {parallel && <span className="text-footnote text-secondary">{hasBlocking ? "In parallel · doesn't need your answer" : "In parallel"}</span>}
            {waitsFor.length > 0 && (
              <span className="text-footnote text-muted">
                {waitsFor.some((p) => statusOf(p) === "waiting") ? "Starts after your answer on " : "Starts after "}
                {waitsFor.map((p) => p.title).join(", ")}
              </span>
            )}
            {expanded && result && <p className="text-body text-secondary">{result.summary}</p>}
            {expanded && stepPlan?.what && <StepPlanView what={stepPlan.what} />}
            {q && picked && (
              <span className="group/change flex flex-wrap items-center gap-x-xs text-footnote text-secondary">
                <span>
                  <YouSaid>{answerLabel(q, picked)}</YouSaid>
                </span>
                <ChangeButton onClick={() => unanswer(task.id, q.id)} />
              </span>
            )}
          </div>
          {expanded && result && <StepResultView result={result} />}
          {foldedQuestion && q && (
            // A blocking question is open elsewhere in the task: this one folds into a line so it does not compete.
            <div
              id={questionAnchor(task.id, q.id)}
              className="flex scroll-mt-[var(--cds-gap-xl)] items-baseline justify-between gap-md rounded bg-alpha-1 py-xs ps-md pe-xs transition-colors duration-fast data-[linked]:bg-alpha-3"
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
          {card && q && (
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
        </div>
      </li>
    );
  };

  return (
    <div className={cx("flex flex-col gap-[var(--cds-gap-lg)]", PANE_BODY)}>
      {header}

      {/* Questions sit on their steps, so it is clear where in the task you are. */}
      <ol aria-label="Plan" className="flex flex-col">
        {stages.map(({ stage, items: list }, si) => {
          // Progress counts the plan as it would be: steps that are being removed drop out, new ones count as not done.
          const kept = list.flatMap((it) => (it.kind === "step" && !effectOn(it.step.id, "remove") ? [it.step] : []));
          const total = kept.length + list.filter((it) => it.kind === "added").length;
          const done = kept.filter((x) => x.status === "done" && !x.question).length;
          // Not started: nothing done, running or asking yet. Its details wait for hover.
          const planned = !single && kept.every((x) => x.status === "ahead" && !x.question) && stage.gate?.status !== "current";
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
                    ~{moneyRange(sumCost.min, sumCost.max)}
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
            // Room comes after an open stage; collapsed stages stack tightly (their rows' own padding), like the Inbox groups.
            <li key={stage.id} className={cx("flex flex-col", (si < stages.length - 1 || hasTail) && (isCollapsed ? COLLAPSED_STAGE_GAP : SECTION_GAP))}>
              {/* One stage: just its steps (the pane's header already says where it stands); several: numbered, collapsible stages. */}
              {!single && (
                <button
                  type="button"
                  aria-expanded={!isCollapsed}
                  onClick={() => setCollapsed((c) => ({ ...c, [stage.id]: !isCollapsed }))}
                  className={cx(
                    // Sticky while its steps scroll by, so you always know which stage you are in.
                    "group/stage sticky top-0 z-[2] flex w-full items-baseline gap-sm bg-[var(--plan-surface,var(--cds-surface-2))] py-xs text-left outline-none focus-visible:shadow-focus cursor-[var(--cds-cursor-interactive)]",
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
                  <span className={cx("ms-auto shrink-0 text-footnote tabular-nums text-muted", planned && onHover("stage"))}>{stageMeta}</span>
                </button>
              )}
              {!isCollapsed && <ol className="flex flex-col">{list.map((item, idx) => renderItem(item, idx === list.length - 1, planned))}</ol>}
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
              I'll change on my own: {task.rules.self}. I'll ask first about: {task.rules.ask}.
            </span>
          </li>
        )}
      </ol>
    </div>
  );
}

/** Minutes from "18m" / "1h 10m"; estimates ("~20m") are not counted. */
const minutes = (t: string) => (t.startsWith("~") ? 0 : Number(t.match(/(\d+)h/)?.[1] ?? 0) * 60 + Number(t.match(/(\d+)m/)?.[1] ?? 0));
/** Minutes from "18m" / "~1h 20m", estimates included. */
export const anyMinutes = (t: string) => Number(t.match(/(\d+)h/)?.[1] ?? 0) * 60 + Number(t.match(/(\d+)m/)?.[1] ?? 0);
/** Passed = grey dot, waits for you = clay dot, ahead (or an automatic check running) = grey ring. */
function GateMark({ gate }: { gate: Gate }) {
  if (gate.status === "passed") return <TaskDot state="done" />;
  return <TaskDot state={gate.status === "current" && gate.mine ? "blocked" : "ahead"} />;
}

/** Actual sums keep cents ("$1.60"); ranges read as ranges ("$4–7"). */
const cost = (min: number, max = min) => (Math.abs(max - min) < 0.005 ? `$${min.toFixed(2)}` : moneyRange(min, max));
/** "35m", "2h 29m", "5h": no "0m" on a whole hour. */
export const duration = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ""}` : `${m}m`);

const questionAnchor = (taskId: string, questionId: string) => `question-${taskId}-${questionId}`;

