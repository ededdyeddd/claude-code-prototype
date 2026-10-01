import { useSyncExternalStore } from "react";
import { TASKS } from "./inbox";
import { questionsOf, type Task } from "./task";
import { EMPTY, deriveTask, useChatStates, type TaskState } from "./chatTaskStore";

/** Attention mode: what is allowed to break through to the person. */
export type Attention = "available" | "busy" | "dnd";

type State = {
  /** Time the Busy mode ends, e.g. "16:00", or "end of day". */
  busyUntil: string;
  /** questionId → chosen option id. Question ids are `${taskId}:${questionId}`. */
  answers: Record<string, string>;
  attention: Attention;
};

export const answerKey = (taskId: string, questionId: string) => `${taskId}:${questionId}`;

// Answered before this visit, with the recommended option: these tasks run, and Blocked keeps only what matters.
const ANSWERED_BEFORE: Record<string, string> = { [answerKey("light-theme", "q1")]: "tokens", [answerKey("transit-push", "q1")]: "expo" };
// Shared between the sidebar (counter) and the page, so a tiny external store instead of prop drilling.
let state: State = { answers: ANSWERED_BEFORE, attention: "available", busyUntil: "16:00" };
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}


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

/**
 * The person has had a hand in this task in this visit: answered one of its questions or decided on its escalation.
 * A small task like that stays in Running, so it does not vanish from Up next right after the answer.
 */
function touched(t: Task, answers: Record<string, string>, chat: TaskState) {
  return !!chat.escalation || questionsOf(t).some((q) => !!answers[answerKey(t.id, q.id)]);
}

/**
 * Where a task stands for the person, by what its agent is doing. Blocked: it stopped mid-work and waits (a blocking
 * question, a gate of the task chat, an escalation offer). To review: it finished, the result of a level 2–3 task waits
 * for acceptance. Can wait: questions only, the agent keeps going. Result: a small task's result to accept (the sidebar
 * shows it; the Inbox list does not). None: a small task, not in the Inbox.
 */
export function taskStatus(t: Task, answers: Record<string, string>, chat: TaskState = EMPTY) {
  const open = openQuestions(t, answers);
  const d = deriveTask(t, chat);
  // The agent finished: the result waits for review, broken locked criterion or not (the row and the dot say which).
  if (d.acceptancePending) return "toReview" as const;
  if (open.some((q) => q.blocking) || d.atGate || d.escalationPending) return "blocked" as const;
  if (open.length > 0) return "canWait" as const;
  if (d.resultPending) return "result" as const;
  // Accepted: the task is done and leaves the lists.
  if (d.acceptance && d.accepted) return "none" as const;
  if (d.level < 2) return touched(t, answers, chat) ? ("running" as const) : ("none" as const);
  return "running" as const;
}

export function useInbox() {
  const s = useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => state
  );
  const chats = useChatStates();
  const status = new Map(TASKS.map((t) => [t.id, taskStatus(t, s.answers, chats[t.id])]));
  // Lists show tasks as they stand now (a passed gate, a started stage).
  const live = TASKS.map((t) => (chats[t.id] ? deriveTask(t, chats[t.id]).live : t));
  const of = (k: string) => live.filter((t) => status.get(t.id) === k);
  const blocked = of("blocked");
  // Every result to review has the same still grey dot; one that cannot be accepted (a broken locked criterion) goes first.
  const broken = (t: Task) => !deriveTask(t, chats[t.id]).acceptance?.canAccept;
  const toReview = [...of("toReview").filter(broken), ...of("toReview").filter((t) => !broken(t))];
  const canWait = of("canWait");
  const needsYou = [...blocked, ...toReview, ...canWait];
  // Small tasks run too, but only the ones the person has had a hand in are listed; the rest would be noise.
  const listed = (t: Task) => deriveTask(t, chats[t.id]).level >= 2 || touched(t, s.answers, chats[t.id] ?? EMPTY);
  const running = live.filter((t) => status.get(t.id) === "running" && listed(t));
  const results = of("result");
  const smallRunning = live.filter((t) => status.get(t.id) === "running" && !listed(t));
  return { ...s, chats, blocked, toReview, canWait, needsYou, running, results, smallRunning };
}

/** Live state of a task chat for the sidebar and the chat view; undefined for chats that are not tasks. */
export function taskState(
  id: string,
  n: { blocked: Task[]; toReview: Task[]; canWait: Task[]; running: Task[]; results: Task[]; smallRunning: Task[] },
) {
  // Blocked stops one step, not always the task: steps that do not need the answer may keep running in parallel.
  const blocked = n.blocked.find((t) => t.id === id);
  if (blocked) return { waiting: "blocked" as const, running: blocked.stages.some((st) => st.steps.some((p) => p.status === "running" && !p.question)) };
  // The agent finished: a still grey dot, whether the result can be accepted or not.
  if (n.toReview.some((t) => t.id === id)) return { waiting: "result" as const, running: false };
  if (n.canWait.some((t) => t.id === id)) return { waiting: "canWait" as const, running: true };
  if (n.results.some((t) => t.id === id)) return { waiting: "result" as const, running: false };
  if (n.running.some((t) => t.id === id) || n.smallRunning.some((t) => t.id === id)) return { waiting: undefined, running: true };
  return undefined;
}
