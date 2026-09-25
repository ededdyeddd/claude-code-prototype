/**
 * Chat levels: the chat screen stays the base, and task UI (tabs, brief, plan, gates, forecasts)
 * appears only when a task has something to show in it. See docs/CHAT_LEVELS.md.
 * The tasks here use the same model as the Inbox (task.ts) and are listed there too.
 */
import type { Turn } from "./transcripts";
import type { Level, Task } from "./task";

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

/* ------------------------------------------------------------------- Mocks */

const READ = "";
const RUN = "";
const SEARCH = "";

const RULES = { self: "subtasks and their order within a stage", ask: "a new stage or gate, scope, anything over +$2" };

/** S3: a large task (payments) right after the first message: the gate on the brief and plan. */
const ONE_CLICK: Task = {
  id: "one-click-pay",
  title: "Оплата в один клик",
  summary: "Повторный заказ — одним нажатием сохранённой картой. Готово, когда 3-D Secure проходит в тесте, а без согласия карта не сохраняется.",
  project: "storefront",
  stage: "Scope",
  now: "Scope · waiting on the brief",
  waitingFor: "1m",
  agent: "payments-engineer",
  model: "Opus 5.5",
  spent: "$0.70",
  tokens: "210K",
  delivery: "push",
  level: 3,
  levelReason: "payments are a risky zone, and 23 similar tasks touched 4 modules",
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
  stages: [
    {
      id: "scope",
      title: "Scope",
      steps: [
        { id: "read", status: "done", title: "Прочитать чекаут и интеграцию со Stripe", work: { agent: "planner", cost: "$0.40", time: "6m" } },
        { id: "brief", status: "done", title: "Бриф и план", work: { agent: "planner", cost: "$0.30", time: "3m" } },
      ],
      gate: { title: "the brief and plan", mine: true, status: "current" },
    },
    {
      id: "build",
      title: "Build",
      steps: [
        { id: "save-card", status: "ahead", title: "Сохранение карты в Stripe Customer по согласию", work: { agent: "payments-engineer", cost: "~$1–3", basis: "23 similar tasks" } },
        { id: "pick-card", status: "ahead", title: "Выбор сохранённой карты в чекауте", work: { agent: "payments-engineer", cost: "~$2–3", basis: "14 similar tasks" } },
        { id: "3ds", status: "ahead", title: "3-D Secure для повторной оплаты", work: { agent: "payments-engineer", cost: "~$1–2", basis: "size M, the agent's estimate" } },
        { id: "wallets", status: "ahead", title: "Apple Pay и Google Pay через Payment Request", work: { agent: "payments-engineer", cost: "~$1–2", basis: "6 similar tasks" } },
      ],
      gate: { title: "checkout tests pass", status: "ahead" },
    },
    {
      id: "verify",
      title: "Verify",
      steps: [{ id: "e2e", status: "ahead", title: "E2E: повторная оплата в тестовом режиме", work: { agent: "test-fixer", cost: "~$1", basis: "31 similar tasks" } }],
      gate: { title: "the result", mine: true, status: "ahead" },
    },
  ],
  rules: RULES,
  autoDecisions: [],
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
const REORDER_BUTTON: Task = {
  id: "reorder-button",
  title: "Кнопка «Повторить заказ» на мобильном",
  summary: "Кнопка уезжала за край на узких экранах; перенёс её под сумму.",
  project: "storefront",
  stage: "Done",
  now: "Result · waiting for acceptance",
  agent: "ui-engineer",
  model: "Opus 5.5",
  spent: "$0.35",
  tokens: "90K",
  level: 1,
  stages: [
    {
      id: "fix",
      title: "Fix",
      steps: [{ id: "fix", status: "done", title: "Кнопка под суммой на узких экранах", work: { agent: "ui-engineer", cost: "$0.35", time: "7m" } }],
    },
  ],
  autoDecisions: [],
  result: {
    claims: [
      { text: "Кнопка «Повторить заказ» видна на экранах от 320px", evidence: "Screenshots 320 / 375 / 768 before and after" },
      { text: "Остальные брейкпоинты не изменились", evidence: "0 changed visual snapshots out of 42" },
      { text: "Поведение кнопки не менялось", evidence: "`order-history.test.ts` · 12 passed" },
    ],
  },
};

/** Level 1 that turned out bigger: the agent offers stages and a gate before the migration. */
const LOYALTY: Task = {
  id: "loyalty",
  title: "Скидка постоянным покупателям",
  summary: "Скидка 5% в корзине покупателям от 3 оплаченных заказов. Готово, когда скидка видна в корзине и в письме о заказе.",
  project: "storefront",
  stage: "Migration",
  now: "Migration · waiting on your approval",
  waitingFor: "8m",
  agent: "payments-engineer",
  model: "Opus 5.5",
  spent: "$2.00",
  tokens: "480K",
  delivery: "push",
  level: 1,
  levelReason: "it grew in progress and needs a migration, which is irreversible",
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
  stages: [
    {
      id: "scope",
      title: "Cart",
      steps: [
        { id: "rule", status: "done", title: "Правило скидки в корзине", work: { agent: "payments-engineer", cost: "$1.20", time: "14m" } },
        { id: "ui", status: "done", title: "Строка скидки в корзине", work: { agent: "payments-engineer", cost: "$0.80", time: "9m" } },
      ],
    },
    {
      id: "migrate",
      title: "Migration",
      steps: [
        { id: "column", status: "ahead", title: "Колонка `orders_count` у покупателя", work: { agent: "payments-engineer", cost: "~$1–2", basis: "9 similar tasks" } },
        { id: "backfill", status: "ahead", title: "Заполнить по истории заказов", work: { agent: "payments-engineer", cost: "~$1–3", basis: "size M, the agent's estimate" } },
      ],
      gate: { title: "the migration", mine: true, status: "current" },
    },
    {
      id: "verify",
      title: "Verify",
      steps: [{ id: "email", status: "ahead", title: "Скидка в письме о заказе", work: { agent: "payments-engineer", cost: "~$1", basis: "12 similar tasks" } }],
      gate: { title: "the result", mine: true, status: "ahead" },
    },
  ],
  rules: RULES,
  autoDecisions: [],
};

export const CHAT_TASK_LIST: Task[] = [ONE_CLICK, REORDER_BUTTON, LOYALTY];

export const CHAT_TASKS: Record<string, Task> = Object.fromEntries(CHAT_TASK_LIST.map((t) => [t.id, t]));

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
