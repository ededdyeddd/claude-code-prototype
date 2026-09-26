/**
 * Feature toggles of the prototype. Each has a default here and can be switched for a demo:
 * `?feature-<name>=off` (or `=on`) in any URL, remembered in localStorage (`cc:feature-<name>`).
 * Read once at load: a toggle changes what the mocks and the store produce, so it takes a reload to apply.
 */
export const FEATURES = {
  /** Acceptance of level 2–3 results: claims and proof, the review pane, the dock decision (docs/CHAT_LEVELS.md §2.6). */
  acceptance: true,
};

export type Feature = keyof typeof FEATURES;

const key = (f: Feature) => `cc:feature-${f}`;

function read(f: Feature): boolean {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get(`feature-${f}`);
    if (fromUrl === "on" || fromUrl === "off") localStorage.setItem(key(f), fromUrl);
    const saved = localStorage.getItem(key(f));
    return saved === "on" ? true : saved === "off" ? false : FEATURES[f];
  } catch {
    // Storage blocked (private mode): the URL still works for this load.
    const fromUrl = new URLSearchParams(window.location.search).get(`feature-${f}`);
    return fromUrl === "on" ? true : fromUrl === "off" ? false : FEATURES[f];
  }
}

const state = Object.fromEntries((Object.keys(FEATURES) as Feature[]).map((f) => [f, read(f)])) as Record<Feature, boolean>;

export const featureOn = (f: Feature) => state[f];
