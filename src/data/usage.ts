/**
 * Plan usage behind the sidebar budget line. The person is on Max, so the horizon is the weekly
 * usage limit, not dollars. The forecast extrapolates the pace of the last 3 days: a 7-day pace
 * would just restate the weekly limit's own window.
 *
 * Two scenarios for the defense frames: "calm" by default, "tight" with `?limit=tight`.
 */
export type UsageScenario = {
  /** Share of the weekly limit used so far, 0–100. */
  used: number;
  /** Average share of the limit used per day over the last 3 days. */
  pacePerDay: number;
  /** Share of the current 5-hour session limit used, 0–100. */
  sessionUsed: number;
  /** When the current session limit resets. */
  sessionResets: string;
};

export const USAGE_SCENARIOS: Record<"calm" | "tight", UsageScenario> = {
  calm: { used: 52, pacePerDay: 9, sessionUsed: 18, sessionResets: "22:10" },
  tight: { used: 71, pacePerDay: 14, sessionUsed: 49, sessionResets: "22:10" },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
/** Prototype "today" is Thursday; the weekly limit resets Monday 09:00. */
const TODAY = 4;
const RESET_DAY = 1;
export const RESET_LABEL = `${DAYS[RESET_DAY]} 09:00`;

export type UsageForecast = UsageScenario & {
  /** True when, at this pace, the limit outlasts the week. */
  lastsToReset: boolean;
  /** Day the limit runs out at this pace (meaningful when !lastsToReset). */
  runsOut: string;
  /** Whole days between running out and the reset (meaningful when !lastsToReset). */
  daysShort: number;
  resetDay: string;
};

export function forecast(s: UsageScenario): UsageForecast {
  const daysLeft = (100 - s.used) / s.pacePerDay;
  const daysToReset = (RESET_DAY - TODAY + 7) % 7 || 7;
  return {
    ...s,
    lastsToReset: daysLeft >= daysToReset,
    runsOut: DAYS[(TODAY + Math.floor(daysLeft)) % 7],
    daysShort: Math.max(0, daysToReset - Math.floor(daysLeft)),
    resetDay: DAYS[RESET_DAY],
  };
}
