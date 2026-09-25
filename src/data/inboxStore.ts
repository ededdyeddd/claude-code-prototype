import { useSyncExternalStore } from "react";
import { TASKS, questionsOf, type Task } from "./inbox";

/** Attention mode: what is allowed to break through to the person. */
export type Attention = "available" | "busy" | "dnd";

type State = {
  /** Time the Busy mode ends, e.g. "16:00", or "end of day". */
  busyUntil: string;
  /** questionId → chosen option id. Question ids are `${taskId}:${questionId}`. */
  answers: Record<string, string>;
  attention: Attention;
};

// Shared between the sidebar (counter) and the page, so a tiny external store instead of prop drilling.
let state: State = { answers: {}, attention: "available", busyUntil: "16:00" };
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export const answerKey = (taskId: string, questionId: string) => `${taskId}:${questionId}`;

export function answer(taskId: string, questionId: string, optionId: string) {
  set({ answers: { ...state.answers, [answerKey(taskId, questionId)]: optionId } });
}

/** "Redo" for an answer: the question comes back. */
export function unanswer(taskId: string, questionId: string) {
  const { [answerKey(taskId, questionId)]: _, ...rest } = state.answers;
  set({ answers: rest });
}

export function setAttention(attention: Attention, busyUntil?: string) {
  set(busyUntil ? { attention, busyUntil } : { attention });
}

export function openQuestions(task: Task, answers: Record<string, string>) {
  return questionsOf(task).filter((q) => !answers[answerKey(task.id, q.id)]);
}

export function useInbox() {
  const s = useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => state
  );
  // Blocked: the agent stopped and waits for an answer. Can wait: questions only, the agent keeps going.
  const blocked = TASKS.filter((t) => openQuestions(t, s.answers).some((q) => q.blocking));
  const canWait = TASKS.filter((t) => !blocked.includes(t) && openQuestions(t, s.answers).length > 0);
  const needsYou = [...blocked, ...canWait];
  const running = TASKS.filter((t) => !needsYou.includes(t));
  return { ...s, blocked, canWait, needsYou, running };
}

/** Live state of a task chat for the sidebar and the chat view; undefined for chats that are not tasks. */
export function taskState(id: string, n: { blocked: Task[]; canWait: Task[]; running: Task[] }) {
  if (n.blocked.some((t) => t.id === id)) return { waiting: "blocked" as const, running: false };
  if (n.canWait.some((t) => t.id === id)) return { waiting: "canWait" as const, running: true };
  if (n.running.some((t) => t.id === id)) return { waiting: undefined, running: true };
  return undefined;
}
