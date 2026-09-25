import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Block } from "../data/transcripts";
import { costRange, currentGate, gateText, money, type Assumption } from "../data/task";
import { useInbox } from "../data/inboxStore";
import { PlanPane } from "./PlanPane";
import {
  accept,
  addCriterion,
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
const PEN = "";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/** `code` spans in the brief, plan and cards (outside .prose, which styles them in the transcript). */
export const CODE = "[&_code]:rounded-sm [&_code]:bg-alpha-2 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.9em]";

const fieldClass =
  "w-full rounded border border-alpha-2 bg-fill-field px-sm py-xs text-body text-primary outline-none placeholder:text-muted focus-visible:shadow-focus";

/** The task of the open chat and a way to switch its tabs, for blocks rendered deep in the transcript. */
export const ChatTaskContext = createContext<{ view?: ChatTaskView; setTab: (t: TaskTab) => void }>({ setTab: () => {} });

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

/** Clay dot: risky assumptions still to mark (the only accent in the bar); the count is in the gate bar. */
function CountBadge({ n }: { n: number }) {
  return <span aria-label={`${n} to mark`} className="block size-[6px] rounded-full bg-clay" />;
}

/** Neutral dot: an edit changed this tab since it was last opened. */
function ChangedDot() {
  return <span aria-label="Changed" title="Changed by your edit" className="block size-[6px] rounded-full bg-muted" />;
}

/** "Chat · Brief · Plan" above the feed, and where the task stands (neutral: the gate bar carries the accent). */
export function TaskTabsBar({ view, tab, onTab }: { view: ChatTaskView; tab: TaskTab; onTab: (t: TaskTab) => void }) {
  const gate = currentGate(view.live);
  const running = view.live.stages.find((st) => st.steps.some((p) => p.status === "running"));
  const status =
    view.atGate && gate ? (
      <>
        <StatusMark status="myGate" />
        {gateText(gate)}
      </>
    ) : running ? (
      <>
        <StatusMark status="running" />
        {running.title}
      </>
    ) : null;
  return (
    <div className="flex items-center gap-md pt-xs pb-sm">
      <Tabs
        label="Task views"
        value={tab}
        onChange={onTab}
        items={view.tabs.map((t) => ({
          value: t,
          label: TAB_LABEL[t],
          badge:
            t === "chat" && tab !== "chat" && view.atGate && view.unmarked.length > 0 ? (
              <CountBadge n={view.unmarked.length} />
            ) : view.changed.includes(t) && tab !== t ? (
              <ChangedDot />
            ) : undefined,
        }))}
      />
      {status && (
        <span className="ms-auto flex min-w-0 items-center gap-1.5 truncate text-footnote text-secondary">
          {view.task.levelReason ? (
            <Hint text={`Large task: ${view.task.levelReason}`} className="flex items-center gap-1.5">
              {status}
            </Hint>
          ) : (
            status
          )}
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

/** Risky assumption: "Right" / "Fix…" until marked; an unmarked one is the accent of the brief. */
function RiskyAssumption({ view, a, bare }: { view: ChatTaskView; a: Assumption; /** Inside another card: no own frame. */ bare?: boolean }) {
  const mark = view.marks[a.id];
  const [fixing, setFixing] = useState(false);
  const [draft, setDraft] = useState("");
  const editable = !view.launched;
  const saveFix = () => {
    if (!draft.trim()) return;
    markAssumption(view.id, a.id, { ok: false, note: draft.trim() });
    setFixing(false);
  };

  if (mark && !fixing)
    return (
      <li className="group/row flex items-start gap-sm py-1">
        <span className="mt-[5px] flex">
          <StatusMark status="done" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className={cx("text-body", mark.ok ? "text-primary" : "text-muted line-through")}>
            <Inline text={a.text} />
          </p>
          <p className="text-footnote text-secondary">you: {"note" in mark ? mark.note : "right"}</p>
        </div>
        {editable && (
          <Button
            size="xs"
            className="opacity-0 transition-opacity duration-fast group-hover/row:opacity-100 focus-visible:opacity-100"
            onClick={() => markAssumption(view.id, a.id, undefined)}
          >
            Change
          </Button>
        )}
      </li>
    );

  return (
    <li className={cx("flex flex-col gap-sm", !bare && "rounded-lg border border-alpha-2 p-md")}>
      <div className="flex flex-col gap-0.5">
        <span className="text-footnote text-clay">Can't check this myself</span>
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
          <div className="flex justify-end gap-xs">
            <Button size="sm" variant="secondary" onClick={() => setFixing(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" disabled={!draft.trim()} onClick={saveFix}>
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-xs">
          <Button size="sm" variant="secondary" onClick={() => markAssumption(view.id, a.id, { ok: true })}>
            Right
          </Button>
          <Button size="sm" onClick={() => (setDraft(""), setFixing(true))}>
            Fix…
          </Button>
        </div>
      )}
    </li>
  );
}

/** Safe assumption: just listed; struck through with the person's words once an edit rejected it. */
function SafeAssumption({ view, a }: { view: ChatTaskView; a: Assumption }) {
  const note = view.rejected.get(a.id);
  return (
    <li className="flex items-start gap-sm py-0.5">
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
export function BriefView({ view, inFeed }: { view: ChatTaskView; /** In the chat feed, inside the brief card (before it is accepted). */ inFeed?: boolean }) {
  const brief = view.task.brief;
  const [draft, setDraft] = useState("");
  if (!brief) return null;
  const risky = brief.assumptions.filter((a) => a.risky);
  const safe = brief.assumptions.filter((a) => !a.risky);
  const env = view.envelope;
  const paths = (access: string) =>
    env.paths
      .filter((p) => p.access === access)
      .map((p) => `\`${p.path}\``)
      .join(", ");
  const add = () => {
    if (!draft.trim()) return;
    addCriterion(view.id, draft.trim());
    setDraft("");
  };

  return (
    <div className={cx("flex flex-col", inFeed ? "gap-lg" : "gap-xl pt-lg pb-xl", CODE)}>
      <section className="flex flex-col gap-sm">
        <SectionTitle>How I understood the task</SectionTitle>
        <p className="text-body text-primary">
          <Inline text={brief.understanding} />
        </p>
      </section>

      <section className="flex flex-col gap-sm">
        <SectionTitle aside={view.unmarked.length ? `${view.unmarked.length} to mark` : "all marked"}>Assumptions</SectionTitle>
        <ul className="flex flex-col gap-sm">
          {risky.map((a) =>
            view.rejected.has(a.id) ? <SafeAssumption key={a.id} view={view} a={a} /> : <RiskyAssumption key={a.id} view={view} a={a} />,
          )}
        </ul>
        {safe.length > 0 && (
          <>
            <span className="pt-xs text-footnote text-muted">Checked or reversible</span>
            <ul className="flex flex-col">
              {safe.map((a) => (
                <SafeAssumption key={a.id} view={view} a={a} />
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="flex flex-col gap-sm">
        <SectionTitle>What I won't touch</SectionTitle>
        <ul className="flex flex-col gap-0.5">
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
              paths("write") && `From the envelope: writes ${paths("write")}`,
              paths("read") && `reads ${paths("read")}`,
              paths("never") && `never ${paths("never")}`,
            ]
              .filter(Boolean)
              .join(" · ")}
          />
        </p>
      </section>

      <section className="flex flex-col gap-sm">
        <SectionTitle>Done when</SectionTitle>
        <ul className="flex flex-col gap-0.5">
          {[
            ...brief.doneWhen.map((c) => ({ ...c, mine: false })),
            ...view.criteria.map((text, i) => ({ id: `mine-${i}`, text, locked: true, mine: true })),
          ].map((c) => (
            <li key={c.id} className="flex items-start gap-sm text-body text-primary">
              <span aria-hidden="true" className="mt-[4px] block size-3 shrink-0 rounded-[3px] border border-alpha-5" />
              <span className="min-w-0 flex-1">
                <Inline text={c.text} />
                {c.mine && <span className="text-footnote text-muted"> · you</span>}
              </span>
              {c.locked && (
                <Hint text="Protected: the agent can't weaken it" className="flex shrink-0 items-center gap-1 text-footnote text-muted">
                  <Icon glyph={LOCK} size="sm" className="!text-muted" />
                </Hint>
              )}
            </li>
          ))}
        </ul>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add your criterion — the agent can't weaken it"
          aria-label="Add a criterion"
          className={fieldClass}
        />
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
    <div className={cx("-mx-[var(--cds-gap-lg)] pt-md [--plan-surface:var(--cds-surface-1)]", CODE)}>
      <PlanPane
        task={view.live}
        answers={answers}
        edits={view.planEdits}
        header={
          <header className="flex flex-col gap-0.5">
            <p className="text-heading text-primary">
              ≈ {money(t.min, t.max)} <span className="text-secondary">of the ${view.envelope.limit} limit</span>
            </p>
            <p className="text-footnote text-muted">Forecast for what is left{spent > 0 && ` · $${spent.toFixed(2)} spent`}</p>
            {t.over && (
              <p className="pt-xs text-footnote text-clay">
                Doesn't fit the envelope: up to ${t.max} against ${view.envelope.limit}. Raise the limit in the chip under the field, or cut scope.
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
 * The decision at a gate, opened on its row in the plan: in the Inbox pane and in the chat's Plan tab.
 * Mark the risky assumptions and start, right here; the full brief is a link for context, not a step.
 * An escalation offer takes the same place: split the task into stages, or finish it as is.
 */
export function GateCard({ view, onOpenBrief, onDone }: { view: ChatTaskView; onOpenBrief?: () => void; onDone?: () => void }) {
  const esc = view.task.escalation;
  if (view.escalationPending && esc)
    return (
      <section className={cx("flex flex-col gap-md rounded-lg border border-alpha-2 p-lg", CODE)}>
        <div className="flex flex-col gap-xs">
          <span className="text-footnote text-clay">Bigger than it looked</span>
          <p className="text-body text-primary">{esc.text}</p>
        </div>
        <div className="flex justify-end gap-xs">
          <Button size="sm" variant="secondary" onClick={() => (escalate(view.id, false), onDone?.())}>
            Finish as is
          </Button>
          <Button size="sm" variant="primary" onClick={() => escalate(view.id, true)}>
            Split into stages
          </Button>
        </div>
      </section>
    );
  if (!view.atGate) return null;
  const left = view.unmarked.length;
  const t = totals(view);
  return (
    <section className={cx("flex flex-col gap-md rounded-lg border border-alpha-2 p-lg", CODE)}>
      {view.task.brief && (
        <p className="text-body text-secondary">
          <Inline text={view.task.brief.understanding} />
        </p>
      )}
      {view.risky.length > 0 && (
        <ul className="flex flex-col gap-md">
          {view.risky.map((a) => (
            <RiskyAssumption key={a.id} view={view} a={a} bare />
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-sm">
        {onOpenBrief && (
          <Button size="sm" className="me-auto" onClick={onOpenBrief}>
            Full brief in chat
          </Button>
        )}
        <span className={cx("ms-auto text-footnote", t.over ? "text-clay" : "text-muted")}>
          ≈ {money(t.min, t.max)} of ${view.envelope.limit}
        </span>
        <Button
          size="sm"
          variant="primary"
          disabled={left > 0}
          title={left > 0 ? "Mark the assumptions first" : undefined}
          onClick={() => (launch(view.id), onDone?.())}
        >
          Pass the gate and start
        </Button>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Gate bar */

/** Pinned over the composer while a gate waits; visible from every tab. */
export function GateBar({ view, onOpenBrief }: { view: ChatTaskView; onOpenBrief: () => void }) {
  const gate = currentGate(view.live);
  if (!view.atGate || !gate) return null;
  const left = view.unmarked.length;
  const t = totals(view);
  return (
    <div className="mb-xs flex h-[var(--cds-h-control--lg)] items-center gap-sm rounded-lg bg-alpha-1 ps-md pe-xs text-body">
      <StatusMark status="myGate" className="!text-clay" />
      <span className="shrink-0 text-primary">{gateText(gate)}</span>
      {left > 0 ? (
        <button type="button" onClick={onOpenBrief} className="min-w-0 truncate rounded-sm text-clay outline-none hover:underline focus-visible:shadow-focus">
          {left === 1 ? "1 assumption left to mark" : `${left} assumptions left to mark`}
        </button>
      ) : (
        <span className={cx("min-w-0 truncate", t.over ? "text-clay" : "text-secondary")}>
          ≈ {money(t.min, t.max)} of ${view.envelope.limit}
        </span>
      )}
      <Button size="xs" variant="primary" className="ms-auto" disabled={left > 0} onClick={() => launch(view.id)}>
        Pass the gate and start
      </Button>
    </div>
  );
}

/* ------------------------------------------------------- Blocks in the feed */

const CARD = CODE + " not-prose flex flex-col gap-sm rounded-lg border border-alpha-2 p-md";

/** Anchor of the brief card in the feed, for "N assumptions left to mark". */
export const briefAnchor = (id: string) => `brief-${id}`;

/**
 * The brief in the feed. Until the gate is passed it is here in full: assumptions are marked and edits land
 * right in it. Once accepted it folds into one line and the brief moves to its tab.
 */
function BriefCard({ view, setTab }: { view: ChatTaskView; setTab: (t: TaskTab) => void }) {
  if (view.atGate)
    return (
      <div id={briefAnchor(view.id)} className={cx(CARD, "scroll-mt-[var(--cds-gap-xl)] gap-lg p-lg")}>
        <div className="flex flex-col gap-0.5">
          <span className="text-body font-medium text-primary">Brief and plan</span>
          <span className="text-footnote text-muted">Mark what I can't check myself, then pass the gate below. The plan is in its tab.</span>
        </div>
        <BriefView view={view} inFeed />
      </div>
    );
  return (
    <div className={cx(CARD, "!flex-row items-center gap-md")}>
      <span className="flex min-w-0 flex-1 items-center gap-sm text-body text-secondary">
        <StatusMark status="done" />
        Brief accepted
      </span>
      {view.tabs.includes("brief") && (
        <Button size="sm" variant="secondary" onClick={() => setTab("brief")}>
          Open brief
        </Button>
      )}
    </div>
  );
}

function ResultCard({ view }: { view: ChatTaskView }) {
  const claims = view.task.result?.claims ?? [];
  return (
    <div className={CARD}>
      <span className="text-footnote text-muted">Result · check before accepting</span>
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
              <span className="text-footnote text-muted">
                <Inline text={c.evidence} />
              </span>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-end gap-xs">
        {view.accepted ? (
          <span className="flex items-center gap-1.5 text-footnote text-muted">
            <StatusMark status="done" /> Accepted
          </span>
        ) : (
          <Button size="sm" variant="primary" onClick={() => accept(view.id)}>
            Accept
          </Button>
        )}
      </div>
    </div>
  );
}

function EscalationCard({ view, setTab }: { view: ChatTaskView; setTab: (t: TaskTab) => void }) {
  const esc = view.task.escalation;
  if (!esc) return null;
  const stages = view.task.stages.length;
  return (
    <div className={CARD}>
      {!view.escalation && <span className="text-footnote text-clay">Bigger than it looked</span>}
      <p className="text-body text-primary">{esc.text}</p>
      {!view.escalation ? (
        <div className="flex justify-end gap-xs">
          <Button size="sm" variant="secondary" onClick={() => escalate(view.id, false)}>
            Finish as is
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              escalate(view.id, true);
              setTab("plan");
            }}
          >
            Open plan
          </Button>
        </div>
      ) : view.escalation === "agreed" ? (
        <div className="flex items-center justify-between gap-md">
          <span className="text-footnote text-muted">Moved to a plan · {stages} stages, done work kept as done</span>
          <Button size="xs" variant="secondary" onClick={() => setTab("plan")}>
            Open plan
          </Button>
        </div>
      ) : (
        <span className="text-footnote text-muted">Finishing as is · the envelope still applies</span>
      )}
    </div>
  );
}

/** Task blocks inside the transcript; their content comes from the chat's task. */
export function TaskBlock({ block }: { block: Extract<Block, { type: "brief-card" | "result-card" | "escalation-card" | "edit-note" }> }) {
  const { view, setTab } = useContext(ChatTaskContext);
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
