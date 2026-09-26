import { useSyncExternalStore } from "react";
import type { Turn } from "./transcripts";
import { CHAT_TASKS, DEFAULT_ENVELOPE, RUN, type Envelope } from "./chatTasks";
import { featureOn } from "./features";
import { currentGate, flagTitle, zoneOf, type Acceptance, type Claim, type Criterion, type Level, type PlanDiff, type PlanStep, type Task } from "./task";

/** A risky assumption the person marked: right, or fixed with their words. */
export type Mark = { ok: true } | { ok: false; note: string };

export type TaskTab = "chat" | "brief" | "plan";

export type TaskState = {
  marks: Record<string, Mark>;
  /** Chat edits applied (ChatEdit ids). */
  edits: string[];
  /** Criteria added by the person; always protected. */
  criteria: string[];
  launched: boolean;
  accepted: boolean;
  escalation?: "agreed" | "declined";
  /** Messages sent in this session, appended to the mock transcript. */
  turns: Turn[];
  /** Tabs changed by an edit and not opened since. */
  changed: TaskTab[];
  envelope?: Envelope;
  /** Demo scene: the task has finished its plan and its result waits for acceptance (?scene=acceptance). */
  scene?: "acceptance";
  /** Acceptance round shown now: an index into `result.iterations`. */
  iteration: number;
  /** Demo: the scene started from another first round (`result.rounds`). */
  round?: string;
  /** The person sent the current round back: the agent is fixing it. */
  sentBack: boolean;
  /** "Check by hand" steps the person ticked in the current round. */
  handChecks: string[];
};

type State = Record<string, TaskState>;

export const EMPTY: TaskState = {
  marks: {},
  edits: [],
  criteria: [],
  launched: false,
  accepted: false,
  turns: [],
  changed: [],
  iteration: 0,
  sentBack: false,
  handChecks: [],
};

// Shared by the chat, its tabs and the sidebar: a small external store, like inboxStore.
let state: State = {};
const listeners = new Set<() => void>();

function patch(id: string, next: Partial<TaskState> | ((s: TaskState) => Partial<TaskState>)) {
  const cur = state[id] ?? EMPTY;
  state = { ...state, [id]: { ...cur, ...(typeof next === "function" ? next(cur) : next) } };
  listeners.forEach((l) => l());
}

export function markAssumption(id: string, assumption: string, mark: Mark | undefined) {
  patch(id, (s) => {
    const { [assumption]: _, ...rest } = s.marks;
    return { marks: mark ? { ...rest, [assumption]: mark } : rest };
  });
}

export function addCriterion(id: string, text: string) {
  patch(id, (s) => ({ criteria: [...s.criteria, text] }));
}

export function launch(id: string) {
  const task = CHAT_TASKS[id];
  patch(id, (s) => ({ launched: true, turns: task?.launched ? [...s.turns, task.launched] : s.turns }));
}

const note = (text: string, demo?: "next-iteration"): Turn => ({ role: "assistant", blocks: [{ type: "task-note", text, demo }] });

export function accept(id: string) {
  // A level 2–3 result leaves a line in the feed: the plan and the log are what the PR description is made of.
  patch(id, (s) => ({ accepted: true, turns: s.scene ? [...s.turns, note("Accepted · PR description ready")] : s.turns }));
}

/** Demo: the chat jumps to the moment the plan is done and the result waits for acceptance. */
export function enterAcceptance(id: string, round?: string) {
  const result = CHAT_TASKS[id]?.result;
  // Off: the task stays where its mock is (the gate on the brief and plan), with no result to accept.
  if (!featureOn("acceptance")) return;
  if (!result?.iterations?.length || (state[id]?.scene && state[id]?.round === round)) return;
  patch(id, { scene: "acceptance", round: round && result.rounds?.[round] ? round : undefined, launched: true, iteration: 0, sentBack: false, accepted: false, handChecks: [], turns: [] });
}

/** The rounds of a task's acceptance, the first one swapped for the demo's other start, if any. */
function roundsOf(task: Task, s: TaskState) {
  const iterations = task.result?.iterations ?? [];
  const start = s.round ? task.result?.rounds?.[s.round] : undefined;
  return start ? [start, ...iterations.slice(1)] : iterations;
}

/**
 * Send the result back: the facts the system found go with it on their own, the person's words after them.
 * The agent picks it up a moment later; the demo then offers to skip to the next round.
 */
export function sendBack(id: string, facts: string, words: string) {
  const reason = [facts, words && `“${words}”`].filter(Boolean).join(" · ");
  patch(id, (s) => ({ sentBack: true, handChecks: [], turns: [...s.turns, note(`Sent back: ${reason}`)] }));
  const task = CHAT_TASKS[id];
  const next = task?.result?.iterations?.[(state[id]?.iteration ?? 0) + 1];
  const reply = facts ? "Беру в работу: верну пропущенный тест и откачу правку вне брифа. Результат пришлю на приёмку снова." : "Беру в работу. Результат пришлю на приёмку снова.";
  window.setTimeout(
    () =>
      patch(id, (s) => ({
        turns: [
          ...s.turns,
          {
            role: "assistant",
            time: "just now",
            blocks: [
              { type: "p", text: reply },
              ...(next ? [{ type: "task-note" as const, text: "", demo: "next-iteration" as const }] : []),
            ],
          },
        ],
      })),
    700,
  );
}

/** Demo: skip ahead to the next acceptance round, as if the agent had finished the fixes. */
export function nextIteration(id: string) {
  const s = state[id] ?? EMPTY;
  const next = CHAT_TASKS[id]?.result?.iterations?.[s.iteration + 1];
  if (!next) return;
  patch(id, (cur) => ({
    iteration: cur.iteration + 1,
    sentBack: false,
    handChecks: [],
    turns: [
      ...cur.turns,
      {
        role: "assistant",
        thought: "Ran 3 steps",
        time: "just now",
        steps: [{ icon: RUN, label: "Ran checkout tests", detail: "CI run #418" }],
        blocks: [
          { type: "p", text: next.message },
          { type: "result-card", iteration: next.iteration },
        ],
      },
    ],
  }));
}

/** A "Check by hand" step, ticked by the person: the only thing in the review they tick themselves. */
export function toggleHandCheck(id: string, check: string) {
  patch(id, (s) => ({ handChecks: s.handChecks.includes(check) ? s.handChecks.filter((c) => c !== check) : [...s.handChecks, check] }));
}

export function escalate(id: string, agreed: boolean) {
  const esc = CHAT_TASKS[id]?.escalation;
  if (!esc) return;
  patch(id, (s) => ({
    escalation: agreed ? "agreed" : "declined",
    turns: [
      ...s.turns,
      ...(agreed ? esc.afterAgree : [{ role: "assistant" as const, time: "just now", blocks: [{ type: "p" as const, text: esc.afterDecline }] }]),
    ],
  }));
}

export function seeTab(id: string, tab: TaskTab) {
  if (!(state[id]?.changed ?? []).includes(tab)) return;
  patch(id, (s) => ({ changed: s.changed.filter((t) => t !== tab) }));
}

/**
 * A message typed in the composer of a task chat. Before the gate it edits the brief and plan:
 * a known edit applies (mock: keyword match) and the agent answers with one line; anything else
 * gets a neutral reply.
 */
export function sendMessage(id: string, text: string) {
  const task = CHAT_TASKS[id];
  const edit = task?.edits?.find((e) => e.match.test(text) && !(state[id]?.edits ?? []).includes(e.id));
  patch(id, (s) => ({
    turns: [...s.turns, { role: "user", text }],
    ...(edit
      ? {
          edits: [...s.edits, edit.id],
          changed: [...new Set<TaskTab>([...s.changed, ...(edit.rejects ? (["brief"] as const) : []), ...(edit.removes ? (["plan"] as const) : [])])],
        }
      : {}),
  }));
  // The agent replies a moment later, as a line in the feed.
  window.setTimeout(
    () =>
      patch(id, (s) => ({
        turns: [
          ...s.turns,
          {
            role: "assistant",
            time: "just now",
            blocks: [edit ? { type: "edit-note", text: edit.reply } : { type: "p", text: "Понял. В бриф и план это пока не легло — напиши, что именно поменять." }],
          },
        ],
      })),
    700,
  );
}

function useStore() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => state,
  );
}

/** Session state of every task chat, for the Inbox groups and the sidebar. */
export function useChatStates() {
  return useStore();
}

/**
 * The task as it stands now, for the plan wherever it is shown (Inbox pane, chat tab):
 * after launch the current gate is passed and the first step ahead is running.
 */
export function liveTask(task: Task, s: TaskState = EMPTY): Task {
  if (s.scene === "acceptance" && featureOn("acceptance")) return acceptanceTask(task, s);
  if (!s.launched) return task;
  let started = false;
  const stages = task.stages.map((st) => ({
      ...st,
      steps: st.steps.map((p) => {
        if (started || p.status !== "ahead" || (task.edits ?? []).some((e) => s.edits.includes(e.id) && e.removes?.includes(p.id))) return p;
        started = true;
        return { ...p, status: "running" as const };
      }),
      gate: st.gate?.status === "current" ? { ...st.gate, status: "passed" as const } : st.gate,
  }));
  // The Inbox row reads where the task is now: the stage and step that started, no longer waiting.
  const stage = stages.find((st) => st.steps.some((p) => p.status === "running"));
  const step = stage?.steps.find((p) => p.status === "running");
  return stage && step ? { ...task, stages, stage: stage.title, now: `${stage.title} · ${step.title}`, waitingFor: undefined } : { ...task, stages };
}

/**
 * The plan in the acceptance scene: every step is done with what it really cost, the checks passed, and the plan
 * stands at "You approve the result". Each round sent back adds a fix step before it: running while the agent
 * works, done once the next round arrives. Accepted, the last approval is passed.
 */
function acceptanceTask(task: Task, s: TaskState): Task {
  const facts = task.result?.steps ?? {};
  const fix = (n: number, running: boolean): PlanStep => ({
    id: `fix-${n}`,
    status: running ? "running" : "done",
    title: "Исправить по итогам приёмки",
    work: running ? { agent: "payments-engineer", cost: "~$1", basis: "the agent's estimate" } : { agent: "payments-engineer", cost: "$0.80", time: "12m" },
    ...(running ? {} : { result: { summary: "Вернул пропущенный тест и починил его; правку `server/orders/schema.ts` откатил." } }),
  });
  const fixes = [...Array.from({ length: s.iteration }, (_, i) => fix(i + 1, false)), ...(s.sentBack ? [fix(s.iteration + 1, true)] : [])];
  const last = task.stages.length - 1;
  const stages = task.stages.map((st, i) => ({
    ...st,
    steps: [
      ...st.steps.map((p) => (facts[p.id] ? { ...p, status: "done" as const, work: facts[p.id].work, result: facts[p.id].result, plan: undefined } : { ...p, status: "done" as const })),
      ...(i === last ? fixes : []),
    ],
    gate:
      st.gate && i === last
        ? { ...st.gate, status: s.accepted ? ("passed" as const) : s.sentBack ? ("ahead" as const) : ("current" as const) }
        : st.gate && { ...st.gate, status: "passed" as const },
  }));
  const stage = stages[last];
  // What the task has cost: the facts of its done steps.
  const spent = stages.flatMap((st) => st.steps).reduce((n, p) => n + (p.status === "done" && p.work ? Number(p.work.cost.replace(/[~$]/g, "")) || 0 : 0), 0);
  const now = s.accepted ? "Done" : s.sentBack ? `${stage.title} · Исправить по итогам приёмки` : `${stage.title} · waiting for you`;
  return { ...task, stages, stage: stage.title, now, spent: `$${spent.toFixed(2)}`, waitingFor: s.accepted || s.sentBack ? undefined : "2m" };
}

const LEVEL_RANK = { high: 0, normal: 1 } as const;

/** Where a criterion of "Done when" stands in a round: met with proof, not yet, or broken by what the system found. */
export type CriterionState = Criterion & { state: "met" | "open" | "broken"; proof?: string; broken?: string };

/**
 * Everything the acceptance review shows, computed from one round: the criteria against the claims and flags, the
 * claims grouped by plan step (riskiest area first), risk by area from the files touched, and the decision —
 * whether Accept is possible, what blocks it, what is recommended, and the facts that go with "Send back".
 */
function deriveAcceptance(task: Task, acc: Acceptance, prev: Acceptance | undefined, envelope: Envelope, handChecks: string[]) {
  const steps = task.stages.flatMap((st) => st.steps);
  const facts = task.result?.steps ?? {};
  const outside = (file: string) => envelope.paths.some((p) => p.access !== "write" && file.startsWith(p.path));

  const criteria: CriterionState[] = (task.brief?.doneWhen ?? []).map((c) => {
    const claims = acc.claims.filter((x) => x.criterionId === c.id);
    const flags = acc.flags.filter((f) => f.criterionId === c.id);
    const against = claims.find((x) => x.status === "contradicted");
    if (against || flags.length > 0) return { ...c, state: "broken", broken: against?.source?.label ?? flagTitle(flags[0]) };
    if (claims.length > 0 && claims.every((x) => x.status === "verified"))
      return { ...c, state: "met", proof: [...new Set(claims.map((x) => x.source!.label))].join(" · ") };
    return { ...c, state: "open" };
  });
  const broken = criteria.find((c) => c.state === "broken" && c.locked);

  // Risk by area, counted from the files touched: a file outside the brief is said so, whatever its area.
  const zones = new Map<string, { zone: string; label: string; files: number; level: "high" | "normal"; outsideBrief: boolean }>();
  for (const f of acc.files) {
    const z = zoneOf(f.name);
    const cur = zones.get(z.zone) ?? { zone: z.zone, label: z.label, files: 0, level: z.level, outsideBrief: false };
    zones.set(z.zone, { ...cur, files: cur.files + 1, outsideBrief: cur.outsideBrief || outside(f.name) });
  }
  const riskZones = [...zones.values()].sort((a, b) => LEVEL_RANK[a.level] - LEVEL_RANK[b.level] || b.files - a.files);

  // Claims under the plan step they belong to; a step is as risky as the riskiest area it touched.
  const groups = steps
    .map((step, order) => {
      const claims = acc.claims.filter((c) => c.stepId === step.id);
      const touched = facts[step.id]?.result.files ?? step.result?.files ?? [];
      const level = touched.some((f) => zoneOf(f.name).level === "high") ? ("high" as const) : ("normal" as const);
      const zone = touched.map((f) => zoneOf(f.name)).sort((a, b) => LEVEL_RANK[a.level] - LEVEL_RANK[b.level])[0]?.label;
      return { step, claims, level, zone, order };
    })
    .filter((g) => g.claims.length > 0)
    .sort((a, b) => LEVEL_RANK[a.level] - LEVEL_RANK[b.level] || a.order - b.order);

  const count = (st: Claim["status"]) => acc.claims.filter((c) => c.status === st).length;
  const counts = { verified: count("verified"), claimed: count("claimed"), contradicted: count("contradicted") };
  const claimedInHigh = groups.filter((g) => g.level === "high").flatMap((g) => g.claims.filter((c) => c.status === "claimed"));
  const deeper = claimedInHigh.length > 0 || acc.flags.length > 0;

  // The facts that go back with "Send back": what the system found, then contradictions no flag already says.
  const n = (k: number, one: string, many: string) => `${k} ${k === 1 ? one : many}`;
  const skipped = acc.flags.filter((f) => f.kind === "skipped-test").length;
  const deleted = acc.flags.filter((f) => f.kind === "deleted-test").length;
  const outsideFiles = acc.flags.filter((f) => f.kind === "file-outside-brief").length;
  const flagged = new Set(acc.flags.map((f) => f.criterionId).filter(Boolean));
  const contradictions = acc.claims.filter((c) => c.status === "contradicted" && !(c.criterionId && flagged.has(c.criterionId))).length;
  const sendBackFacts = [
    skipped && n(skipped, "skipped test", "skipped tests"),
    deleted && n(deleted, "deleted test", "deleted tests"),
    outsideFiles && n(outsideFiles, "file outside the brief", "files outside the brief"),
    contradictions && n(contradictions, "contradicted claim", "contradicted claims"),
  ]
    .filter(Boolean)
    .join(", ");

  const was = new Map((prev?.claims ?? []).map((c) => [c.id, c.status]));
  return {
    ...acc,
    criteria,
    met: criteria.filter((c) => c.state === "met").length,
    broken,
    canAccept: !broken,
    // Not quoted: the criterion is the brief's Russian text, and it reads in the pane the link leads to.
    blockReason: broken ? "a locked criterion is broken" : undefined,
    groups,
    counts,
    riskZones,
    outsideBrief: outsideFiles,
    deeper,
    recommended: broken ? ("send-back" as const) : deeper ? ("deeper" as const) : ("accept" as const),
    sendBackFacts,
    /** The claim to open first when looking deeper: the first one nobody verified, in the order shown. */
    firstUnverified: groups.flatMap((g) => g.claims).find((c) => c.status !== "verified"),
    /** Status a claim had in the round before, where it changed. */
    was: (id: string) => (acc.changedSince?.claims.includes(id) ? was.get(id) : undefined),
    handChecks,
  };
}

export type AcceptanceView = ReturnType<typeof deriveAcceptance>;

/** Everything about a task's session, derived from the mock and the session state. */
export function deriveTask(task: Task, s: TaskState = EMPTY) {
  const applied = (task.edits ?? []).filter((e) => s.edits.includes(e.id));
  const removed = new Set(applied.flatMap((e) => e.removes ?? []));
  const rejected = new Map(applied.flatMap((e) => (e.rejects ? [[e.rejects.assumption, e.rejects.note] as const] : [])));
  // Chat edits reach the plan the same way answers do: as plan changes (struck through, "Removed").
  const planEdits: PlanDiff[] = applied.flatMap((e) => (e.removes ?? []).map((step) => ({ kind: "remove" as const, step, text: e.reply })));
  const risky = (task.brief?.assumptions ?? []).filter((a) => a.risky && !rejected.has(a.id));
  // Assumptions confirmed when the brief was approved come marked; marks made in this session win.
  const marks: Record<string, Mark> = {
    ...Object.fromEntries(risky.filter((a) => a.confirmed).map((a) => [a.id, { ok: true } as Mark])),
    ...s.marks,
  };
  const unmarked = risky.filter((a) => !marks[a.id]);
  // Level goes up only with the person's consent; it never goes down on its own. Inbox tasks without a level are full tasks.
  const level: Level = s.escalation === "agreed" && task.escalation ? task.escalation.to : task.level ?? 3;
  // A large task has its brief and plan as tabs from the start: to read. Every decision on them happens in the chat.
  const tabs: TaskTab[] = task.level === undefined ? [] : level >= 3 ? ["chat", "brief", "plan"] : level === 2 ? ["chat", "plan"] : [];
  // A gate waits for the person until they pass it: the brief gate right away, the escalation's after consent.
  const atGate = task.level !== undefined && level >= 2 && !s.launched && currentGate(task)?.mine === true;
  const escalationPending = !!task.escalation && !s.escalation;
  const resultPending = level === 1 && !!task.result && !s.accepted;
  const envelope = s.envelope ?? task.envelope ?? DEFAULT_ENVELOPE;
  // Levels 2–3: the result is accepted against a round of claims and proof (the acceptance scene of the demo).
  const iterations = roundsOf(task, s);
  // Everything of the acceptance (the pane, the dock, the tile, Up next's statuses) hangs on this one value.
  const round = s.scene === "acceptance" && featureOn("acceptance") ? iterations[s.iteration] : undefined;
  const acceptance = round ? deriveAcceptance(task, round, iterations[s.iteration - 1], envelope, s.handChecks) : undefined;
  const acceptancePending = !!acceptance && !s.sentBack && !s.accepted;
  return {
    ...s,
    marks,
    live: liveTask(task, s),
    level,
    tabs,
    removed,
    rejected,
    planEdits,
    risky,
    unmarked,
    atGate,
    escalationPending,
    resultPending,
    acceptance,
    acceptancePending,
    envelope,
  };
}

export function useChatTask(id: string | undefined) {
  const s = useStore();
  const task = id ? CHAT_TASKS[id] : undefined;
  if (!id || !task) return undefined;
  return { id, task, ...deriveTask(task, s[id]) };
}

export type ChatTaskView = NonNullable<ReturnType<typeof useChatTask>>;

/** Envelope of the new chat on /code (S2), before a task exists. */
export const NEW_CHAT = "new";

