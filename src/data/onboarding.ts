/**
 * Micro-onboarding state. It lives in memory only: within one visit each part shows once, and a reload or a new
 * visit shows it all again. A prototype is shown to new people on the same browser, so nothing is remembered.
 */
import { useSyncExternalStore } from "react";

const done = new Set<"announced" | "up-next" | "plan-hint">();
// Views that depend on it (the Plan hint waits for the announcement) re-render when a part is done.
let version = 0;
const listeners = new Set<() => void>();
const mark = (part: "announced" | "up-next" | "plan-hint") => {
  if (done.has(part)) return;
  done.add(part);
  version++;
  listeners.forEach((l) => l());
};
/** Re-renders the caller whenever a part of the onboarding is done. */
export const useOnboarding = () =>
  useSyncExternalStore(
    (l) => (listeners.add(l), () => void listeners.delete(l)),
    () => version,
  );

/** Step one: on the page the app opens on, "there is a new section". Done when taken or put off. */
export const announced = () => done.has("announced");
export const markAnnounced = () => mark("announced");

/** Step two: inside Up next, the intro (on a direct arrival) and the tour. */
export const introSeen = () => done.has("up-next");
export const markIntroSeen = () => {
  mark("up-next");
  // Seen Up next itself: no need to announce it any more.
  mark("announced");
};

/** The one-time hint on the "Plan" toggle in a task chat. */
export const planHintSeen = () => done.has("plan-hint");
export const markPlanHintSeen = () => mark("plan-hint");

/** Hints elsewhere wait until the announcement has had its turn: two overlays at once would fight. */
export const onboardingSettled = () => announced() || introSeen();
