import { useLocation } from "react-router-dom";
import { Hint } from "../ui";
import { USAGE_SCENARIOS, RESET_LABEL, SESSION_LIMIT, WEEKLY_LIMIT, forecast } from "../data/usage";

/** Thin rounded meter, as on the Usage settings screen: faint track, accent (or warning) fill; `quiet` fills grey. */
export function Meter({ used, tight, quiet, className }: { used: number; tight?: boolean; quiet?: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={"block h-[4px] overflow-hidden rounded-full bg-alpha-3 " + (className ?? "")}
    >
      <span
        className={"block h-full rounded-full " + (tight ? "bg-fill-warning" : quiet ? "bg-muted" : "bg-fill-accent")}
        style={{ width: `${used}%` }}
      />
    </span>
  );
}

/** One row of the hover card: label and dollars spent, then reset time and the meter. */
function UsageRow({
  label,
  resets,
  used,
  spent,
  limit,
  tight,
}: {
  label: string;
  resets: string;
  used: number;
  spent: number;
  limit: number;
  tight?: boolean;
}) {
  return (
    // A 2×2 grid, so each line on the left sits on the same row as its partner on the right.
    <div className="grid grid-cols-[1fr_112px] items-center gap-x-3 gap-y-0.5">
      <div className="min-w-0 text-primary">{label}</div>
      <span className="text-right tabular-nums text-secondary">
        ${spent} <span className="text-muted">of ${limit}</span>
      </span>
      <div className="min-w-0 text-muted">Resets {resets}</div>
      <Meter used={used} tight={tight} />
    </div>
  );
}

/**
 * One line above the user menu: how much of the weekly limit is gone, as a share and a meter.
 * The hover card gives the details in dollars, like the task limits in chats.
 * It answers "will it last at this pace, can I let agents run", with the forecast's source.
 */
export function BudgetLine() {
  const { search } = useLocation();
  const f = forecast(USAGE_SCENARIOS[new URLSearchParams(search).get("limit") === "tight" ? "tight" : "calm"]);
  const tight = !f.lastsToReset;

  const card = (
    <div className="flex flex-col gap-3">
      <UsageRow label="Current session" resets={`today ${f.sessionResets}`} used={f.sessionUsed} spent={f.sessionSpent} limit={SESSION_LIMIT} />
      <UsageRow label="This week" resets={RESET_LABEL} used={f.used} spent={f.spent} limit={WEEKLY_LIMIT} tight={tight} />
      <div className="h-px bg-alpha-2" />
      <div className="flex flex-col gap-0.5 pb-0.5">
        {tight ? (
          <span className="text-warning">
            Runs out {f.runsOut} at this pace, {f.daysShort} {f.daysShort === 1 ? "day" : "days"} before the reset
          </span>
        ) : (
          <span className="text-primary">At this pace it lasts until the reset</span>
        )}
        <span className="text-muted">Based on the last 3 days · ~${f.pacePerDay} a day</span>
      </div>
    </div>
  );

  return (
    <div className="px-2 pt-1">
      <Hint
        text={card}
        align="start"
        panelClassName="w-[300px] p-3"
        className="flex h-[max(28px,var(--df-footer-btn-size))] items-center justify-between gap-3 rounded-[var(--df-radius-pill)] px-[calc(var(--df-row-px)+(var(--df-leading-slot)-var(--cds-avatar-sm))/2)] hover:bg-[var(--df-hover)]"
      >
        <span className="min-w-0 truncate whitespace-nowrap text-[length:var(--df-row-font)] text-muted">
          <span className="tabular-nums text-secondary">{f.used}%</span> of weekly limit
        </span>
        <Meter used={f.used} tight={tight} className="min-w-8 max-w-20 flex-1" />
      </Hint>
    </div>
  );
}
