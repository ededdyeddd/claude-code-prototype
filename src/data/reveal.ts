/**
 * "Show me where": a link elsewhere (the dock, the feed) asks the review pane to open at one row — a claim,
 * a done-criterion, a file of the diff. The pane may not be open yet, so the request waits until it reads it.
 */
export type RevealTarget = `claim:${string}` | `criterion:${string}` | `file:${string}`;

export const REVEAL_EVENT = "review-reveal";

let pending: RevealTarget | null = null;

export function revealInReview(target: RevealTarget) {
  pending = target;
  window.dispatchEvent(new Event(REVEAL_EVENT));
}

export function takeReveal() {
  const t = pending;
  pending = null;
  return t;
}
