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
export const PROJECTS = ["yango-prototype", "astrology-app", "storefront"];

export const SESSIONS: Session[] = [
  { id: "light-theme", title: "Светлая тема прототипа", project: "yango-prototype", repo: { name: "yango-prototype", branch: "feat/light-theme", added: 140, removed: 12 }, status: "active", env: "local", lastActivity: 45, created: 150 },
  { id: "visual-polish", title: "Доработки визуала и анимации", project: "yango-prototype", repo: { name: "yango-prototype", branch: "main", added: 1386, removed: 58 }, status: "active", env: "local", lastActivity: 10, created: 60 },
  { id: "design-system", title: "Создание дизайн-системы", project: "yango-prototype", repo: { name: "yango-prototype", branch: "main", added: 1911, removed: 10 }, status: "active", env: "local", lastActivity: 60, created: 120 },
  { id: "copy-prototype", title: "Копирование прототипа", project: "yango-prototype", repo: { name: "yango-prototype", branch: "main", added: 2804, removed: 0 }, status: "active", env: "local", lastActivity: 120, created: 180 },
  // astrology-app: the MVP plan, a finished research chat, and two tasks from "Inbox".
  { id: "transit-push", title: "Пуши о транзитах", project: "astrology-app", repo: { name: "astrology-app", branch: "feat/transit-push", added: 96, removed: 3 }, status: "active", env: "cloud", lastActivity: 18, created: 200 },
  { id: "flaky", title: "Флакующие тесты эфемерид", project: "astrology-app", repo: { name: "astrology-app", branch: "fix/flaky-houses", added: 42, removed: 9 }, status: "active", env: "cloud", lastActivity: 120, created: 400, running: true },
  { id: "chart-pdf", title: "PDF натальной карты", project: "astrology-app", repo: { name: "astrology-app", branch: "feat/chart-pdf", added: 612, removed: 38 }, status: "active", env: "cloud", lastActivity: 4, created: 900, running: true, pr: "draft" },
  { id: "ephemeris-api", title: "Выбор API эфемерид", project: "astrology-app", status: "active", env: "cloud", lastActivity: 2400, created: 2600 },
  { id: "astrology", title: "Astrology app plan", project: "astrology-app", status: "active", env: "cloud", lastActivity: 3000, created: 3500 },
  // storefront: three tasks from "Inbox" and a merged one.
  { id: "checkout", title: "Новый чекаут", project: "storefront", repo: { name: "storefront", branch: "feat/checkout", added: 1240, removed: 310 }, status: "active", env: "local", lastActivity: 32, created: 600 },
  { id: "search", title: "Поиск по каталогу", project: "storefront", repo: { name: "storefront", branch: "feat/search", added: 86, removed: 4 }, status: "active", env: "local", lastActivity: 70, created: 300, running: true },
  { id: "i18n", title: "Локализация на испанский", project: "storefront", repo: { name: "storefront", branch: "feat/i18n-es", added: 2310, removed: 120 }, status: "active", env: "cloud", lastActivity: 2, created: 800, running: true },
  { id: "promo-codes", title: "Промокоды в корзине", project: "storefront", repo: { name: "storefront", branch: "main", added: 318, removed: 27 }, status: "active", env: "local", lastActivity: 1500, created: 2200, pr: "merged" },
  { id: "yango-interview", title: "Как пройти собеседование в yango", project: null, status: "active", env: "local", lastActivity: 5000, created: 7000 },
];

export type NavFilters = {
  status: SessionStatus | "all";
  env: Environment | "all";
  groupBy: "folder" | "none";
  sortBy: "activity" | "created" | "title";
  showEmptyGroups: boolean;
};

export const DEFAULT_FILTERS: NavFilters = {
  status: "active",
  env: "all",
  groupBy: "folder",
  sortBy: "activity",
  showEmptyGroups: false,
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
