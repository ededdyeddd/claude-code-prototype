/** First-run state of the Up next micro-onboarding. Storage can be blocked (private mode), so every access is guarded. */
const SEEN_KEY = "cc:up-next-intro-seen";

export function introSeen() {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function markIntroSeen() {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Not saved: the intro comes back on the next visit.
  }
}

/** The one-time hint on the "Plan" toggle in a task chat. */
const PLAN_HINT_KEY = "cc:plan-hint-seen";

export function planHintSeen() {
  try {
    return localStorage.getItem(PLAN_HINT_KEY) === "1";
  } catch {
    return false;
  }
}

export function markPlanHintSeen() {
  try {
    localStorage.setItem(PLAN_HINT_KEY, "1");
  } catch {
    // Not saved: the hint comes back on the next visit.
  }
}

/** For demos: `?intro` replays the whole onboarding, the Plan hint included. */
export function resetPlanHint() {
  try {
    localStorage.removeItem(PLAN_HINT_KEY);
  } catch {
    // Nothing to reset.
  }
}
