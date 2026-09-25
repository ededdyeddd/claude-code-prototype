import { useSyncExternalStore } from "react";
import type { Turn } from "./transcripts";
import { CHAT_TASKS, DEFAULT_ENVELOPE, type Envelope } from "./chatTasks";
import { currentGate, type Level, type PlanDiff, type Task } from "./task";

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
};

type State = Record<string, TaskState>;

export const EMPTY: TaskState = { marks: {}, edits: [], criteria: [], launched: false, accepted: false, turns: [], changed: [] };

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

export function accept(id: string) {
  patch(id, { accepted: true });
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

/** Everything about a task's session, derived from the mock and the session state. */
export function deriveTask(task: Task, s: TaskState = EMPTY) {
  const applied = (task.edits ?? []).filter((e) => s.edits.includes(e.id));
  const removed = new Set(applied.flatMap((e) => e.removes ?? []));
  const rejected = new Map(applied.flatMap((e) => (e.rejects ? [[e.rejects.assumption, e.rejects.note] as const] : [])));
  // Chat edits reach the plan the same way answers do: as plan changes (struck through, "Removed").
  const planEdits: PlanDiff[] = applied.flatMap((e) => (e.removes ?? []).map((step) => ({ kind: "remove" as const, step, text: e.reply })));
  const risky = (task.brief?.assumptions ?? []).filter((a) => a.risky && !rejected.has(a.id));
  const unmarked = risky.filter((a) => !s.marks[a.id]);
  // Level goes up only with the person's consent; it never goes down on its own. Inbox tasks without a level are full tasks.
  const level: Level = s.escalation === "agreed" && task.escalation ? task.escalation.to : task.level ?? 3;
  // A large task has its brief and plan as tabs from the start: to read. Every decision on them happens in the chat.
  const tabs: TaskTab[] = task.level === undefined ? [] : level >= 3 ? ["chat", "brief", "plan"] : level === 2 ? ["chat", "plan"] : [];
  // A gate waits for the person until they pass it: the brief gate right away, the escalation's after consent.
  const atGate = task.level !== undefined && level >= 2 && !s.launched && currentGate(task)?.mine === true;
  const escalationPending = !!task.escalation && !s.escalation;
  const resultPending = level === 1 && !!task.result && !s.accepted;
  return {
    ...s,
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
    envelope: s.envelope ?? DEFAULT_ENVELOPE,
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

