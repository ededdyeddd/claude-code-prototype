/** Mock chats (sessions) shown in the sidebar, grouped by project folder. */

export type SessionStatus = "active" | "archived";
export type Environment = "local" | "cloud";

export type Session = {
  id: string;
  title: string;
  /** Project folder; null = "No folder". */
  project: string | null;
  /** Built-in / system chats go to the "Other" group. */
  other?: boolean;
  status: SessionStatus;
  env: Environment;
  /** Minutes ago, for "Last activity" sorting. */
  lastActivity: number;
  /** Minutes ago the chat was created. */
  created: number;
  /** Claude is working in this chat right now (clay dot). */
  running?: boolean;
  pr?: "open" | "merged" | "draft";
  /** Repo the chat works in; shown above the composer when the chat has content. */
  repo?: { name: string; branch: string; added: number; removed: number };
};

/** Project folders, including ones without chats (shown with "Show empty groups"). */
export const PROJECTS = ["yango-prototype"];

export const SESSIONS: Session[] = [
  { id: "prototype-copy", title: "Prototype copy", project: "yango-prototype", status: "active", env: "local", lastActivity: 1, created: 300, running: true },
  { id: "astrology", title: "Astrology app plan", project: null, repo: { name: "astrology-app", branch: "main", added: 1248, removed: 37 }, status: "active", env: "cloud", lastActivity: 3000, created: 3500 },
  { id: "yango-interview", title: "Как пройти собеседование в yango", project: null, status: "active", env: "local", lastActivity: 5000, created: 7000 },
  { id: "builtin", title: "Встроенные функции", project: null, other: true, status: "active", env: "local", lastActivity: 8000, created: 9000 },
];

export type NavFilters = {
  status: SessionStatus | "all";
  env: Environment | "all";
  groupBy: "folder" | "none";
  sortBy: "activity" | "created" | "title";
  showEmptyGroups: boolean;
  showPrStatus: boolean;
};

export const DEFAULT_FILTERS: NavFilters = {
  status: "active",
  env: "all",
  groupBy: "folder",
  sortBy: "activity",
  showEmptyGroups: false,
  showPrStatus: true,
};

export type NavGroup = {
  key: string;
  label: string;
  kind: "project" | "none" | "other" | "all";
  sessions: Session[];
};

const sorters: Record<NavFilters["sortBy"], (a: Session, b: Session) => number> = {
  activity: (a, b) => a.lastActivity - b.lastActivity,
  created: (a, b) => a.created - b.created,
  title: (a, b) => a.title.localeCompare(b.title),
};

/** Apply filters and build the sidebar groups: projects first (most recent first), then "No folder", then "Other". */
export function buildGroups(sessions: Session[], f: NavFilters): NavGroup[] {
  const visible = sessions
    .filter((s) => f.status === "all" || s.status === f.status)
    .filter((s) => f.env === "all" || s.env === f.env)
    .sort(sorters[f.sortBy]);

  if (f.groupBy === "none") return [{ key: "all", label: "Recents", kind: "all", sessions: visible }];

  const projectGroups: NavGroup[] = PROJECTS.map((p) => ({
    key: p,
    label: p,
    kind: "project" as const,
    sessions: visible.filter((s) => s.project === p && !s.other),
  }))
    .filter((g) => g.sessions.length || f.showEmptyGroups)
    // Order projects by their most recent chat; empty ones go last.
    .sort((a, b) => (a.sessions[0]?.lastActivity ?? Infinity) - (b.sessions[0]?.lastActivity ?? Infinity));

  const noFolder: NavGroup = { key: "__none", label: "No folder", kind: "none", sessions: visible.filter((s) => s.project === null && !s.other) };
  const other: NavGroup = { key: "__other", label: "Other", kind: "other", sessions: visible.filter((s) => s.other) };

  return [...projectGroups, noFolder, other].filter((g) => g.sessions.length || (f.showEmptyGroups && g.kind !== "other"));
}
