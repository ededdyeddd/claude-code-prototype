/**
 * Chat levels: the chat screen stays the base, and task UI (tabs, brief, plan, gates, forecasts)
 * appears only when a task has something to show in it. See docs/CHAT_LEVELS.md.
 *
 * 0 = plain chat, 1 = small task (result card), 2 = task (Chat · Plan, flat plan, one "Acceptance" gate),
 * 3 = large task (Chat · Brief · Plan, stages and gates).
 */
import type { Turn } from "./transcripts";

export type Level = 0 | 1 | 2 | 3;

/* ---------------------------------------------------------------- Envelope */

/** Territory: what the agent may do with a path. */
export type PathAccess = "write" | "read" | "never";
/** Where an action sits in the envelope. */
export type ActionColumn = "free" | "ask" | "never";

export type Envelope = {
  /** Spend limit per task, $. */
  limit: number;
  /** Share of the limit at which the agent asks, 0..1. */
  askAt: number;
  paths: { path: string; access: PathAccess }[];
  actions: { id: string; label: string; column: ActionColumn }[];
};

/** Project defaults (storefront); the popover edits a copy for one task. */
export const DEFAULT_ENVELOPE: Envelope = {
  limit: 12,
  askAt: 0.8,
  paths: [
    { path: "checkout/", access: "write" },
    { path: "server/payments/", access: "write" },
    { path: "server/orders/", access: "read" },
    { path: "migrations/", access: "never" },
  ],
  actions: [
    { id: "tests", label: "Run tests", column: "free" },
    { id: "deps", label: "Install packages", column: "ask" },
    { id: "push", label: "Push to the task branch", column: "free" },
    { id: "pr", label: "Open a PR", column: "ask" },
    { id: "skip-tests", label: "Skip or delete tests", column: "never" },
    { id: "no-verify", label: "--no-verify", column: "never" },
    { id: "force-push", label: "Force push", column: "never" },
  ],
};

/** "checkout/" for the chip: the first path the agent writes to, "+N" for the rest. */
export function envelopeScope(e: Envelope) {
  const writes = e.paths.filter((p) => p.access === "write").map((p) => p.path);
  if (writes.length === 0) return "read only";
  return writes.length > 1 ? `${writes[0]} +${writes.length - 1}` : writes[0];
}

/* ------------------------------------------------------------------- Brief */

export type Assumption = {
  id: string;
  text: string;
  /** Risky: the agent cannot check it and asks the person to mark it (right / fix). Safe ones are just listed. */
  risky?: boolean;
  /** Why it is risky, shown under the text. */
  why?: string;
};

export type Criterion = {
  id: string;
  text: string;
  /** Protected: the agent cannot weaken it (tests, consent). Criteria the person adds are protected too. */
  locked?: boolean;
};

export type Brief = {
  /** "How I understood the task", 2–3 lines in the agent's words. */
  understanding: string;
  assumptions: Assumption[];
  /** "What I won't touch": the envelope territory in words. */
  boundaries: string[];
  doneWhen: Criterion[];
};

/* -------------------------------------------------------------------- Plan */

/** Forecast with its source: "$1–3 · 23 similar tasks", or "size M · agent's estimate" without history. */
export type Forecast = { min: number; max: number; basis: string };

export type PlanItem = {
  id: string;
  title: string;
  /** Plan state: done (✓), running (●), ahead (○). */
  state: "done" | "running" | "ahead";
  forecast?: Forecast;
  /** Actual cost of a done item. */
  spent?: number;
  /** Removed by an edit of the person: struck through, not counted. */
  removedBy?: string;
};

export type Gate = {
  id: string;
  title: string;
  /** ◆ yours (the person approves), ◇ automatic (a check the agent cannot skip). */
  kind: "mine" | "auto";
  state: "passed" | "current" | "ahead";
};

export type Stage = { id: string; title: string; items: PlanItem[]; gate?: Gate };

export type Plan = {
  /** Level 3 has stages; level 2 uses one untitled stage (a flat list). */
  stages: Stage[];
  rules?: { self: string; ask: string };
};

/* -------------------------------------------------------------- Chat edits */

/**
 * A text edit of the brief or plan sent in the chat ("Apple Pay не нужен").
 * Mock: matched by keywords; applying it rejects an assumption and/or removes plan items.
 */
export type ChatEdit = {
  id: string;
  match: RegExp;
  /** Assumption it rejects, with the person's correction shown under the struck text. */
  rejects?: { assumption: string; note: string };
  removes?: string[];
  /** The agent's one-line reply in the feed. */
  reply: string;
};

/* -------------------------------------------------------- Result (level 1) */

export type ResultClaim = { text: string; evidence: string };

/* --------------------------------------------------------------- Scenario */

export type ChatTask = {
  level: Level;
  /** Why the task got its level (size from similar tasks, risk). Shown in a tooltip next to the tabs. */
  levelReason?: string;
  brief?: Brief;
  plan?: Plan;
  edits?: ChatEdit[];
  /** Level 1: the result card at the end of the chat. */
  result?: { claims: ResultClaim[] };
  /** Escalation offered in the feed: level jumps to `to` once the person agrees. */
  escalation?: { to: Level; text: string; afterAgree: Turn[]; afterDecline: string };
  /** Agent message after the gate is passed. */
  launched?: Turn;
};

/** Sum of forecasts of the items still in the plan and not done. */
export function planTotal(plan: Plan, removed: Set<string>) {
  let min = 0;
  let max = 0;
  for (const s of plan.stages)
    for (const i of s.items) {
      if (removed.has(i.id) || !i.forecast || i.state === "done") continue;
      min += i.forecast.min;
      max += i.forecast.max;
    }
  return { min, max };
}

export const money = (min: number, max: number) => (min === max ? `$${min}` : `$${min}–${max}`);

/* ------------------------------------------------------------------- Mocks */

const READ = "\uE06C";
const RUN = "\uE051";
const SEARCH = "\uE0D3";

/** S3: a large task (payments) right after the first message: gate "Brief and plan". */
const ONE_CLICK: ChatTask = {
  level: 3,
  levelReason: "Payments: risky zone · 4 modules, like 23 similar tasks",
  brief: {
    understanding:
      "Покупатель, который уже платил, оплачивает следующий заказ в один клик: сохранённая карта выбрана заранее, CVC не спрашиваем, 3-D Secure — только когда требует банк. Карты хранит Stripe, у нас — токен и последние 4 цифры.",
    assumptions: [
      {
        id: "consent",
        text: "Карту сохраняем только с согласия: галочка «Запомнить карту», по умолчанию выключена",
        risky: true,
        why: "Продуктовое и юридическое решение — в коде ответа нет",
      },
      { id: "stripe", text: "Stripe уже подключён: беру существующий ключ и вебхуки из `server/payments/stripe.ts`" },
      { id: "wallets", text: "Apple Pay и Google Pay — той же кнопкой, через Payment Request" },
      { id: "mobile", text: "Вёрстка на мобильном — как у текущей формы оплаты" },
    ],
    boundaries: [
      "Схему заказов и `server/orders/` только читаю",
      "Миграции не пишу: токен карты живёт в Stripe Customer",
      "Оплату для гостей не меняю",
    ],
    doneWhen: [
      { id: "one-click", text: "Повторный заказ оплачивается одним нажатием, без ввода карты" },
      { id: "3ds", text: "3-D Secure проходит в тестовом режиме Stripe" },
      { id: "no-consent", text: "Без согласия карта не сохраняется", locked: true },
      { id: "tests", text: "Все тесты чекаута зелёные, ни один не пропущен", locked: true },
    ],
  },
  plan: {
    stages: [
      {
        id: "scope",
        title: "Scope",
        items: [
          { id: "read", title: "Прочитать чекаут и интеграцию со Stripe", state: "done", spent: 0.4 },
          { id: "brief", title: "Бриф и план", state: "done", spent: 0.3 },
        ],
        gate: { id: "g-brief", title: "Brief and plan", kind: "mine", state: "current" },
      },
      {
        id: "build",
        title: "Build",
        items: [
          { id: "save-card", title: "Сохранение карты в Stripe Customer по согласию", state: "ahead", forecast: { min: 1, max: 3, basis: "23 similar tasks" } },
          { id: "pick-card", title: "Выбор сохранённой карты в чекауте", state: "ahead", forecast: { min: 2, max: 3, basis: "14 similar tasks" } },
          { id: "3ds", title: "3-D Secure для повторной оплаты", state: "ahead", forecast: { min: 1, max: 2, basis: "size M · agent's estimate" } },
          { id: "wallets", title: "Apple Pay и Google Pay через Payment Request", state: "ahead", forecast: { min: 1, max: 2, basis: "6 similar tasks" } },
        ],
        gate: { id: "g-tests", title: "Checkout tests green", kind: "auto", state: "ahead" },
      },
      {
        id: "verify",
        title: "Verify",
        items: [{ id: "e2e", title: "E2E: повторная оплата в тестовом режиме", state: "ahead", forecast: { min: 1, max: 1, basis: "31 similar tasks" } }],
        gate: { id: "g-accept", title: "Acceptance", kind: "mine", state: "ahead" },
      },
    ],
    rules: {
      self: "subtasks and their order within a stage",
      ask: "a new stage or gate, scope, anything over +$2",
    },
  },
  edits: [
    {
      id: "no-wallets",
      match: /apple\s*pay|google\s*pay|кошел/i,
      rejects: { assumption: "wallets", note: "не в этой итерации" },
      removes: ["wallets"],
      reply: "Убрал Apple Pay и Google Pay — план короче на задачу, ≈ $1–2 меньше.",
    },
  ],
  launched: {
    role: "assistant",
    time: "just now",
    blocks: [{ type: "p", text: "Гейт пройден, начинаю «Build». Вопросы по ходу и следующий гейт будут в плане." }],
  },
};

/** Level 1: a small task that ends with a result card instead of "Done". */
const REORDER_BUTTON: ChatTask = {
  level: 1,
  result: {
    claims: [
      { text: "Кнопка «Повторить заказ» видна на экранах от 320px", evidence: "Screenshots 320 / 375 / 768 before and after" },
      { text: "Остальные брейкпоинты не изменились", evidence: "0 changed visual snapshots out of 42" },
      { text: "Поведение кнопки не менялось", evidence: "`order-history.test.ts` · 12 passed" },
    ],
  },
};

/** Level 1 that turned out bigger: the agent offers stages and a gate before the migration. */
const LOYALTY: ChatTask = {
  level: 1,
  levelReason: "Grew in progress: needs a migration (irreversible)",
  escalation: {
    to: 3,
    text: "Задача оказалась больше, чем выглядела: скидке нужна история заказов, а её нет в схеме. Предлагаю 3 этапа с гейтом перед миграцией.",
    afterAgree: [
      {
        role: "assistant",
        time: "just now",
        blocks: [{ type: "p", text: "Разложил в план: сделанное отмечено, миграция — после твоего гейта." }],
      },
    ],
    afterDecline: "Доделываю без плана. Границы конверта в силе: миграцию всё равно спрошу перед запуском.",
  },
  brief: {
    understanding:
      "Постоянные покупатели (от 3 оплаченных заказов) получают скидку 5% в корзине. Чтобы считать заказы быстро, нужна колонка с их числом у покупателя — это миграция.",
    assumptions: [
      { id: "threshold", text: "«Постоянный» — от 3 оплаченных заказов за всё время", risky: true, why: "Порог — решение продукта" },
      { id: "stack", text: "Скидка не суммируется с промокодом: берём большую" },
    ],
    boundaries: ["Промокоды не трогаю — только читаю правила из `server/promo/`", "Миграция — только после гейта"],
    doneWhen: [
      { id: "cart", text: "Скидка видна в корзине и в письме о заказе" },
      { id: "tests", text: "Тесты корзины зелёные", locked: true },
    ],
  },
  plan: {
    stages: [
      {
        id: "scope",
        title: "Scope",
        items: [
          { id: "rule", title: "Правило скидки в корзине", state: "done", spent: 1.2 },
          { id: "ui", title: "Строка скидки в корзине", state: "done", spent: 0.8 },
        ],
      },
      {
        id: "migrate",
        title: "Migration",
        items: [
          { id: "column", title: "Колонка `orders_count` у покупателя", state: "ahead", forecast: { min: 1, max: 2, basis: "9 similar tasks" } },
          { id: "backfill", title: "Заполнить по истории заказов", state: "ahead", forecast: { min: 1, max: 3, basis: "size M · agent's estimate" } },
        ],
        gate: { id: "g-migrate", title: "Before the migration", kind: "mine", state: "current" },
      },
      {
        id: "verify",
        title: "Verify",
        items: [{ id: "email", title: "Скидка в письме о заказе", state: "ahead", forecast: { min: 1, max: 1, basis: "12 similar tasks" } }],
        gate: { id: "g-accept", title: "Acceptance", kind: "mine", state: "ahead" },
      },
    ],
    rules: { self: "subtasks and their order within a stage", ask: "a new stage or gate, scope, anything over +$2" },
  },
};

export const CHAT_TASKS: Record<string, ChatTask> = {
  "one-click-pay": ONE_CLICK,
  "reorder-button": REORDER_BUTTON,
  loyalty: LOYALTY,
};

/** First message of the S3 scenario; the S2 demo prefills it so sending leads to that chat. */
export const ONE_CLICK_PROMPT =
  "Сделай оплату в один клик: покупатель, который уже платил, оплачивает следующий заказ сохранённой картой.";

export const CHAT_TASK_TRANSCRIPTS: Record<string, Turn[]> = {
  "one-click-pay": [
    { role: "user", text: ONE_CLICK_PROMPT },
    {
      role: "assistant",
      thought: "Ran 4 steps",
      time: "1 minute ago",
      steps: [
        { icon: READ, label: "Read checkout/", detail: "PaymentForm.tsx, useCheckout.ts" },
        { icon: READ, label: "Read server/payments/stripe.ts" },
        { icon: SEARCH, label: "Found 23 similar tasks", detail: "payments · 4 modules" },
      ],
      blocks: [
        { type: "p", text: "Stripe уже подключён, карты можно хранить в Stripe Customer — своих таблиц не понадобится." },
        { type: "brief-card" },
      ],
    },
  ],
  "reorder-button": [
    { role: "user", text: "На мобильном не видно кнопку «Повторить заказ» в истории заказов, почини." },
    {
      role: "assistant",
      thought: "Edited 1 file, ran 2 commands",
      time: "3 minutes ago",
      steps: [
        { icon: READ, label: "Read OrderHistory.tsx" },
        { icon: RUN, label: "Ran visual snapshots" },
        { icon: RUN, label: "Ran order-history tests" },
      ],
      blocks: [
        { type: "p", text: "Кнопка уезжала за край: у строки заказа был `white-space: nowrap`. Перенёс кнопку под сумму на узких экранах." },
        { type: "result-card" },
      ],
    },
  ],
  loyalty: [
    { role: "user", text: "Дай постоянным покупателям скидку 5% в корзине." },
    {
      role: "assistant",
      thought: "Edited 3 files",
      time: "8 minutes ago",
      steps: [
        { icon: READ, label: "Read server/cart/pricing.ts" },
        { icon: SEARCH, label: "Searched the schema", detail: "orders_count" },
      ],
      blocks: [
        { type: "p", text: "Правило скидки и строку в корзине сделал. Дальше упёрся: число заказов покупателя нигде не хранится." },
        { type: "escalation-card" },
      ],
    },
  ],
};

/* ------------------------------------------------------ Level before sending */

const RISK: [RegExp, string][] = [
  [/оплат|плат[её]ж|карт[аоуы]|payment|billing|stripe/i, "payments"],
  [/авториз|логин|парол|auth|login|oauth/i, "authorization"],
  [/миграц|migration|схем[аеуы] (?:бд|базы)/i, "a migration"],
  [/удал|delete|drop /i, "irreversible actions"],
];

/**
 * Guess of the level from the draft, before the agent has read any code: a hint, not a verdict.
 * Risk wins over size: a small risky task still gets a brief and a gate.
 */
export function guessLevel(text: string): { level: Level; reason?: string } {
  const risk = RISK.find(([re]) => re.test(text));
  if (risk) return { level: 3, reason: risk[1] };
  if (text.split(/\s+/).length > 60) return { level: 3, reason: "size" };
  return { level: 0 };
}
