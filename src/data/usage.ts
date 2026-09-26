/**
 * Plan usage behind the sidebar budget line. In dollars, like the task limits and plan forecasts
 * in chats, so "$12 limit" on a task and the weekly budget read in one unit. The forecast
 * extrapolates the pace of the last 3 days: a 7-day pace would just restate the week's own window.
 *
 * Two scenarios for the defense frames: "calm" by default, "tight" with `?limit=tight`.
 */
export type UsageScenario = {
  /** Spent this week so far, $. */
  spent: number;
  /** Average spend per day over the last 3 days, $. */
  pacePerDay: number;
  /** Spent in the current 5-hour session, $. */
  sessionSpent: number;
  /** When the current session limit resets. */
  sessionResets: string;
};

/** Weekly and 5-hour session budgets, $. */
export const WEEKLY_LIMIT = 200;
export const SESSION_LIMIT = 40;

export const USAGE_SCENARIOS: Record<"calm" | "tight", UsageScenario> = {
  calm: { spent: 104, pacePerDay: 18, sessionSpent: 7, sessionResets: "22:10" },
  tight: { spent: 142, pacePerDay: 28, sessionSpent: 20, sessionResets: "22:10" },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
/** Prototype "today" is Thursday; the weekly limit resets Monday 09:00. */
const TODAY = 4;
const RESET_DAY = 1;
export const RESET_LABEL = `${DAYS[RESET_DAY]} 09:00`;

export type UsageForecast = UsageScenario & {
  /** Shares of the limits used, 0–100: only for the meters. */
  used: number;
  sessionUsed: number;
  /** True when, at this pace, the limit outlasts the week. */
  lastsToReset: boolean;
  /** Day the limit runs out at this pace (meaningful when !lastsToReset). */
  runsOut: string;
  /** Whole days between running out and the reset (meaningful when !lastsToReset). */
  daysShort: number;
  resetDay: string;
};

export function forecast(s: UsageScenario): UsageForecast {
  const daysLeft = (WEEKLY_LIMIT - s.spent) / s.pacePerDay;
  const daysToReset = (RESET_DAY - TODAY + 7) % 7 || 7;
  return {
    ...s,
    used: Math.round((s.spent / WEEKLY_LIMIT) * 100),
    sessionUsed: Math.round((s.sessionSpent / SESSION_LIMIT) * 100),
    lastsToReset: daysLeft >= daysToReset,
    runsOut: DAYS[(TODAY + Math.floor(daysLeft)) % 7],
    daysShort: Math.max(0, daysToReset - Math.floor(daysLeft)),
    resetDay: DAYS[RESET_DAY],
  };
}
