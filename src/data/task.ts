/**
 * One model of a task and its plan, shared by the Inbox (list, side pane) and the task chat
 * (tabs, brief, plan, gate). Mocks: Inbox tasks in inbox.ts, chat-level tasks in chatTasks.ts;
 * both land in TASKS (inbox.ts). See docs/INBOX.md and docs/CHAT_LEVELS.md.
 */
import type { Turn } from "./transcripts";
import type { Envelope } from "./chatTasks";

/* ------------------------------------------------------------------- Plan */

/** Status is shown by shape, not color: ✓ done, ● running, ○ ahead, ‖ waits for you. */
export type Status = "done" | "running" | "ahead" | "waiting";

/**
 * What an option (or an edit) does to the plan. `step` is the plan step it touches: removed or changed for
 * "remove"/"change"; for "add"/"gate" the new item goes right after it.
 */
export type PlanDiff = {
  kind: "add" | "change" | "remove" | "gate";
  text: string;
  step: string;
  /** Estimate for a new step or gate: who does it and roughly what it costs. Gates are done by you ("you", no cost). */
  agent?: string;
  cost?: string;
  time?: string;
  /** Where the estimate comes from; defaults to the agent's own estimate. */
  basis?: string;
};

export type Option = {
  id: string;
  label: string;
  recommended?: boolean;
  cost: string;
  toAcceptance: string;
  reversible: string;
  forecastSource: string;
  diff: PlanDiff[];
};

export type Question = {
  id: string;
  /** Blocking questions stop the task; the rest wait until the person has time. */
  blocking: boolean;
  text: string;
  context?: string;
  options: Option[];
};

/**
 * Who works on a step and what it costs. Without "~" a number is a fact; with "~" a forecast,
 * possibly a range ("~$1–3"). Time is the agent's working time and may be left out.
 */
export type StepWork = {
  agent?: string;
  cost: string;
  time?: string;
  /** Where a forecast comes from, e.g. "14 similar steps in storefront". Defaults to the agent's own estimate. */
  basis?: string;
};

/** What a finished step produced: the agent's summary, decisions it made on the way, and changed files. */
export type StepResult = {
  summary: string;
  decisions?: string[];
  files?: { name: string; added: number; removed: number }[];
};

/**
 * A step ahead, as planned. `serves` links it to the brief's done-criteria: that holds however the step is done.
 * `what` is the agent's intent, not a fact: given only for the nearest steps, since far ones will change.
 * No files: they are found while working, and a list up front would read as a promise.
 */
export type StepPlan = {
  what?: string;
  /** Ids of `Brief.doneWhen` criteria this step is how the task gets to. */
  serves?: string[];
};

export type PlanStep = {
  id: string;
  status: Status;
  title: string;
  note?: string;
  question?: Question;
  work?: StepWork;
  /** Opens under the step while it is ahead or running. */
  plan?: StepPlan;
  result?: StepResult;
  /**
   * Ids of steps this one needs finished first. Only where it explains something: a step that waits for a blocked
   * one, while steps without such a link run in parallel. Without it, the plan's order is just the planned order.
   */
  after?: string[];
};

/**
 * Stop after a stage: `mine` — the person approves; otherwise an automatic check.
 * `title` reads after "You approve …" / "Check: …". `current` — the plan stands at this gate right now.
 */
export type Gate = {
  title: string;
  mine?: boolean;
  status: "passed" | "current" | "ahead";
  eta?: string;
  etaSource?: string;
};

export type Stage = { id: string; title: string; steps: PlanStep[]; gate?: Gate };

export type AutoDecision = { id: string; text: string; why: string };

/* ------------------------------------------------------------ Chat levels */

/** 0 plain chat · 1 small task (result card) · 2 task (Chat · Plan) · 3 large task (Chat · Brief · Plan). */
export type Level = 0 | 1 | 2 | 3;

export type Assumption = {
  id: string;
  text: string;
  /** Risky: the agent cannot check it and asks the person to mark it (right / fix). Safe ones are just listed. */
  risky?: boolean;
  /** Why it is risky, shown under the text. */
  why?: string;
  /** Already marked right when the brief was approved, before this session (a task that is running). */
  confirmed?: true;
};

export type Criterion = {
  id: string;
  text: string;
  /** Protected: the agent cannot weaken it. Criteria the person adds are protected too. */
  locked?: boolean;
  /** Met, with the check that proves it (a running task shows its progress against "done"). */
  met?: string;
};

/** A fact the agent checked in the code or data, which the plan rests on; `source` says where it was seen. */
export type Finding = { text: string; source?: string };

export type Brief = {
  /** "How I understood the task", 2–3 lines in the agent's words. Also the lead of the gate card, so it stays short. */
  understanding: string;
  /** "What I found": checked facts, unlike assumptions, which the agent could not check. */
  found?: Finding[];
  assumptions: Assumption[];
  /** "What I won't touch": the envelope territory in words. */
  boundaries: string[];
  doneWhen: Criterion[];
};

/**
 * A text edit of the brief or plan sent in the chat ("Apple Pay не нужен").
 * Mock: matched by keywords; applying it rejects an assumption and/or removes plan steps.
 */
export type ChatEdit = {
  id: string;
  match: RegExp;
  rejects?: { assumption: string; note: string };
  removes?: string[];
  /** The agent's one-line reply in the feed. */
  reply: string;
};

/** Where the review artifact opens for a claim's evidence. */
export type ReviewTab = "changes" | "screens" | "checks";

export type ResultClaim = { text: string; evidence: string; show: ReviewTab };

/**
 * The review artifact of a result: what changed, how it looks, what was checked.
 * Diff lines start with "+", "-", " " or "@@" (hunk header), as in a unified diff.
 */
export type Review = {
  files: { name: string; added: number; removed: number; lines: string[] }[];
  /** Screen widths shot before and after the change. */
  screens: number[];
  checks: { label: string; result: string; items: string[] }[];
};

/* ------------------------------------------------------------------- Task */

export type Task = {
  id: string;
  title: string;
  /** One or two sentences from the agent: what the task does and when it is done. Subtitle of the plan pane. */
  summary: string;
  project: string;
  stage: string;
  /** "Stage · what is happening" line. */
  now: string;
  waitingFor?: string;
  /** Agent working on the task (named by its role), its model, and what the task has used so far. */
  agent: string;
  model: string;
  spent: string;
  tokens: string;
  /** How the task reaches the person: pushed right away or in the 16:00 digest. */
  delivery?: "push" | "digest";
  stages: Stage[];
  autoDecisions: AutoDecision[];

  /** Chat level; Inbox tasks without one are full tasks whose chat keeps the classic look. */
  level?: Level;
  /** Why the task got its level (size from similar tasks, risk). */
  levelReason?: string;
  brief?: Brief;
  /** This task's envelope when it differs from the project default (paths it edits, reads, won't touch). */
  envelope?: Envelope;
  /** "Plan rules": what the agent changes itself and what it asks about. */
  rules?: { self: string; ask: string };
  edits?: ChatEdit[];
  /** Level 1: the result card at the end of the chat. */
  result?: { claims: ResultClaim[]; review?: Review };
  /** Escalation offered in the feed: the level goes up to `to` once the person agrees. */
  escalation?: { to: Level; text: string; afterAgree: Turn[]; afterDecline: string };
  /** Agent message after the current gate is passed. */
  launched?: Turn;
};

/* ---------------------------------------------------------------- Helpers */

export const questionsOf = (t: Task) =>
  t.stages.flatMap((s) => s.steps.map((p) => p.question).filter((q): q is Question => !!q));

export const isForecast = (value: string) => value.startsWith("~");

/** "$0.60" → 0.6–0.6, "~$1.20" → 1.2–1.2, "~$1–3" → 1–3. */
export function costRange(cost: string) {
  const [min, max = min] = cost
    .replace(/[~$\s]/g, "")
    .split(/[–-]/)
    .map(Number);
  return { min, max };
}

const amount = (n: number) => (Number.isInteger(n) ? `${n}` : n.toFixed(2));

/** 1–3 → "$1–3", 1.2–1.2 → "$1.20". */
export const money = (min: number, max = min) => (Math.abs(max - min) < 0.005 ? `$${amount(min)}` : `$${amount(min)}–${amount(max)}`);

/** The first gate the plan stands at. */
export const currentGate = (t: Task) => t.stages.find((s) => s.gate?.status === "current")?.gate;

/** "You approve the brief" / "Check: tests pass"; past tense once passed. */
/**
 * Where a running task stands, for everywhere that shows it without opening the plan (the Plan chip, the
 * plan's header, the live status): steps done of all, the stage and step in progress, and when you are next
 * needed (the next approval of yours that has an estimate).
 */
export function planProgress(task: Task) {
  const steps = task.stages.flatMap((st) => st.steps);
  const stage = task.stages.find((st) => st.steps.some((p) => p.status !== "done")) ?? task.stages[task.stages.length - 1];
  const next = task.stages.find((st) => st.gate?.mine && st.gate.status !== "passed")?.gate;
  return {
    done: steps.filter((p) => p.status === "done").length,
    total: steps.length,
    stage,
    stageDone: stage?.steps.filter((p) => p.status === "done").length ?? 0,
    running: steps.find((p) => p.status === "running"),
    /** Steps running at once: agents work in parallel on steps that do not wait for each other. */
    parallel: steps.filter((p) => p.status === "running"),
    yourTurn: next?.eta,
  };
}

export function gateText(gate: Gate) {
  if (gate.mine) return gate.status === "passed" ? `You approved ${gate.title}` : `You approve ${gate.title}`;
  return gate.status === "passed" ? `Passed: ${gate.title}` : `Check: ${gate.title}`;
}
