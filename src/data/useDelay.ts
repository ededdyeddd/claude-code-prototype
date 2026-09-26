import { useEffect, useState } from "react";

/** Onboarding waits this long after the page is up, so it reads as arriving rather than as part of the page. */
export const ONBOARDING_DELAY = 1500;

/** True once `active` has held for `ms`; false again when it drops or `key` changes (e.g. another chat opens). */
export function useDelay(active: boolean, ms: number, key?: unknown) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    if (!active) return;
    const t = window.setTimeout(() => setReady(true), ms);
    return () => window.clearTimeout(t);
  }, [active, ms, key]);
  return active && ready;
}

/** False on mount, true a frame later: lets an overlay fade in with a CSS transition. */
export function useFadeIn() {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const f = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(f);
  }, []);
  return shown;
}
