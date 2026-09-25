import { useNavigate } from "react-router-dom";
import { TASKS, questionsOf } from "../data/inbox";
import { answerKey, useInbox } from "../data/inboxStore";
import { Button } from "../ui";
import { TaskDot } from "./StatusMark";

/**
 * In a task's chat, a question from the agent is answered only in the plan: this bar points there
 * and goes away once the question is answered (same state as the Inbox).
 */
export function AnswerInPlanBar({ taskId }: { taskId: string }) {
  const navigate = useNavigate();
  const { answers } = useInbox();
  const task = TASKS.find((t) => t.id === taskId);
  const open = task ? questionsOf(task).filter((q) => !answers[answerKey(task.id, q.id)]) : [];
  if (!task || open.length === 0) return null;
  const blocking = open.some((q) => q.blocking);
  return (
    <div className="mb-xs flex h-[var(--cds-h-control--lg)] items-center gap-sm rounded-lg bg-alpha-1 ps-md pe-xs text-body">
      <TaskDot state={blocking ? "blocked" : "canWait"} />
      <span className="min-w-0 flex-1 truncate text-secondary">
        {task.agent} is waiting for your answer{open.length > 1 ? `s (${open.length})` : ""}
      </span>
      <Button size="xs" variant="secondary" onClick={() => navigate(`/inbox?task=${task.id}`)}>
        Answer in the plan
      </Button>
    </div>
  );
}
