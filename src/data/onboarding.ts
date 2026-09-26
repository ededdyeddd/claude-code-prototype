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
