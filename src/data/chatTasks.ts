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
    { id: "no-verify", label: "Commit with --no-verify", column: "never" },
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

const RULES = { self: "subtasks and their order within a stage", ask: "a new stage or approval step, scope, anything over +$2" };

/** S3: a large task (payments) right after the first message: the gate on the brief and plan. */
const ONE_CLICK: Task = {
  id: "one-click-pay",
  title: "Оплата в один клик",
  summary: "Повторный заказ — одним нажатием сохранённой картой. Готово, когда 3-D Secure проходит в тесте, а без согласия карта не сохраняется.",
  project: "storefront",
  stage: "Scope",
  now: "Scope · waiting for you",
  waitingFor: "1m",
  agent: "payments-engineer",
  model: "Opus 5.5",
  spent: "$0.70",
  tokens: "210K",
  delivery: "push",
  level: 3,
  levelReason: "payments are risky, and 23 similar tasks touched 4 modules",
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
        {
          id: "read",
          status: "done",
          title: "Прочитать чекаут и интеграцию со Stripe",
          work: { agent: "planner", cost: "$0.40", time: "6m" },
          result: {
            summary: "Stripe подключён: ключ и вебхуки в server/payments/stripe.ts, платёж идёт через PaymentIntent. Карты сейчас не сохраняются, Stripe Customer не создаётся.",
            decisions: ["3-D Secure уже обрабатывает handleNextAction — переиспользую", "Повторный заказ собирается в OrderHistory, туда и встанет кнопка"],
          },
        },
        {
          id: "brief",
          status: "done",
          title: "Бриф и план",
          work: { agent: "planner", cost: "$0.30", time: "3m" },
          result: {
            summary: "Записал, как понял задачу, 4 допущения, границы и критерии готовности. План — 3 этапа, прогноз по 23 похожим задачам.",
            decisions: ["Согласие на сохранение карты вынес в допущение: это решение за тобой"],
          },
        },
      ],
      gate: { title: "the brief and plan", mine: true, status: "current" },
    },
    {
      id: "build",
      title: "Build",
      steps: [
        {
          id: "save-card",
          status: "ahead",
          title: "Сохранение карты в Stripe Customer по согласию",
          work: { agent: "payments-engineer", cost: "~$1–3", basis: "23 similar tasks" },
          plan: {
            what: "Галочка «Запомнить карту» в форме оплаты. С ней платёж создаёт Stripe Customer и сохраняет карту; у нас остаются токен и последние 4 цифры.",
            serves: ["no-consent"],
          },
        },
        {
          id: "pick-card",
          status: "ahead",
          title: "Выбор сохранённой карты в чекауте",
          work: { agent: "payments-engineer", cost: "~$2–3", basis: "14 similar tasks" },
          plan: {
            what: "Кнопка «Оплатить картой •• 4242» в повторном заказе: карта выбрана заранее, CVC не спрашиваем. Другую карту можно выбрать из списка.",
            serves: ["one-click"],
          },
        },
        {
          id: "3ds",
          status: "ahead",
          title: "3-D Secure для повторной оплаты",
          work: { agent: "payments-engineer", cost: "~$1–2", basis: "size M, the agent's estimate" },
          plan: {
            serves: ["3ds"],
          },
        },
        {
          id: "wallets",
          status: "ahead",
          title: "Apple Pay и Google Pay через Payment Request",
          work: { agent: "payments-engineer", cost: "~$1–2", basis: "6 similar tasks" },
          plan: {
            serves: ["one-click"],
          },
        },
      ],
      gate: { title: "checkout tests pass", status: "ahead" },
    },
    {
      id: "verify",
      title: "Verify",
      steps: [
        {
          id: "e2e",
          status: "ahead",
          title: "E2E: повторная оплата в тестовом режиме",
          work: { agent: "test-fixer", cost: "~$1", basis: "31 similar tasks" },
          plan: {
            serves: ["one-click", "3ds", "no-consent", "tests"],
          },
        },
      ],
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
    blocks: [{ type: "p", text: "Начинаю со сборки: сохранение карты в Stripe Customer. Если понадобится твоё решение — спрошу здесь." }],
  },
};

/** Level 1 in progress: a small fix the agent just does, with no plan; the result card comes at the end. */
const BIRTH_DATE: Task = {
  id: "birth-date",
  title: "Дата рождения сдвигается на день",
  summary: "В профиле дата рождения показывается на день раньше у пользователей западнее UTC. Чиню разбор даты.",
  project: "astrology-app",
  stage: "Fix",
  now: "Fix · parsing the date without a time zone",
  agent: "ui-engineer",
  model: "Opus 5.5",
  spent: "$0.12",
  tokens: "40K",
  level: 1,
  stages: [
    {
      id: "fix",
      title: "Fix",
      steps: [{ id: "fix", status: "running", title: "Разбирать дату рождения без часового пояса", work: { agent: "ui-engineer", cost: "~$0.30", time: "~8m" } }],
    },
  ],
  autoDecisions: [],
};

/** Level 3 running without trouble: the brief is approved, the plan shows progress, one criterion is already met. */
const I18N: Task = {
  id: "i18n",
  agent: "i18n-translator",
  model: "Sonnet 5",
  spent: "$1.60",
  tokens: "860K",
  title: "Локализация на испанский",
  summary: "Перевожу витрину на испанский: интерфейс, карточки товаров и письма. В конце — вычитка носителем.",
  project: "storefront",
  stage: "Build",
  now: "Build · translating product cards",
  level: 3,
  brief: {
    understanding:
      "Витрина storefront на испанском для покупателей из Испании: интерфейс, карточки товаров и письма о заказе. Английский остаётся по умолчанию, язык выбирается по браузеру и переключателем в футере.",
    assumptions: [
      { id: "es-es", text: "Испанский для Испании (es-ES), не латиноамериканский", risky: true, why: "От этого зависят слова и обращение на «вы»", confirmed: true },
      { id: "prices", text: "Цены и валюта не меняются, переводим только текст" },
      { id: "brands", text: "Названия брендов и товарных линеек не переводим" },
      { id: "intl", text: "Даты и числа форматирует Intl по локали es-ES" },
    ],
    boundaries: ["Цены, валюту и налоги не трогаю", "Адреса страниц для SEO не меняю", "В письмах меняю только тексты, не вёрстку"],
    doneWhen: [
      { id: "ui", text: "Все строки интерфейса на испанском, ни одного пропущенного ключа", met: "Линтер i18n: 0 пропущенных ключей из 1 240" },
      { id: "cards", text: "Карточки товаров переведены: названия, описания, атрибуты" },
      { id: "emails", text: "Письма о заказе на испанском" },
      { id: "review", text: "Носитель вычитал и одобрил тексты", locked: true },
    ],
  },
  envelope: {
    ...DEFAULT_ENVELOPE,
    paths: [
      { path: "locales/", access: "write" },
      { path: "emails/templates/", access: "write" },
      { path: "src/", access: "read" },
      { path: "server/payments/", access: "never" },
    ],
  },
  stages: [
    {
      id: "scope",
      title: "Scope",
      steps: [
        {
          id: "count",
          status: "done",
          title: "Посчитать строки и собрать глоссарий",
          work: { agent: "planner", cost: "$0.20", time: "6m" },
          result: {
            summary: "1 240 строк интерфейса, 312 карточек товаров, 6 писем. Глоссарий — 86 терминов, из них 14 брендов, которые не переводим.",
          },
        },
      ],
      gate: { title: "the brief and plan", mine: true, status: "passed" },
    },
    {
      id: "build",
      title: "Build",
      steps: [
        {
          id: "a",
          status: "done",
          title: "Вынести строки интерфейса",
          work: { agent: "i18n-translator", cost: "$0.60", time: "20m" },
          result: {
            summary: "Вынес 1 240 строк интерфейса в locales/en и подключил i18next. Ни одной строки в коде не осталось, проверено линтером.",
            files: [
              { name: "locales/en/common.json", added: 1240, removed: 0 },
              { name: "src/i18n.ts", added: 28, removed: 0 },
              { name: "src/**/*.tsx (84 files)", added: 910, removed: 910 },
            ],
          },
        },
        {
          id: "ui",
          status: "done",
          title: "Перевести интерфейс",
          work: { agent: "i18n-translator", cost: "$0.80", time: "14m" },
          result: {
            summary: "Перевёл строки интерфейса по глоссарию. Линтер i18n: 0 пропущенных ключей.",
            decisions: ["«Cesta», а не «carrito» — так в Испании", "Обращение на «usted» во всём интерфейсе"],
            files: [{ name: "locales/es/common.json", added: 1240, removed: 0 }],
          },
        },
        {
          id: "b",
          status: "running",
          title: "Карточки товаров",
          work: { agent: "i18n-translator", cost: "~$1.50", time: "~35m", basis: "this task's pace, 62 strings a minute" },
          plan: { what: "Названия, описания и атрибуты 312 карточек; бренды из глоссария оставляю как есть.", serves: ["cards"] },
        },
        {
          id: "c",
          status: "ahead",
          title: "Письма",
          work: { agent: "i18n-translator", cost: "~$0.40", time: "~15m", basis: "this task's pace" },
          plan: { what: "Тексты 6 писем о заказе; вёрстку не трогаю.", serves: ["emails"] },
        },
      ],
      gate: { title: "no missing translation keys", status: "ahead" },
    },
    {
      id: "review",
      title: "Review",
      steps: [
        {
          id: "fixes",
          status: "ahead",
          title: "Правки после вычитки",
          work: { agent: "i18n-translator", cost: "~$0.20–0.60", basis: "3 similar reviews" },
          plan: { serves: ["review"] },
        },
      ],
      gate: { title: "the Spanish copy", mine: true, status: "ahead", eta: "~17:30", etaSource: "this task's pace" },
    },
  ],
  rules: RULES,
  autoDecisions: [],
};

/** Level 1 that turned out bigger: the agent offers stages and a gate before the migration. */
const LOYALTY: Task = {
  id: "loyalty",
  title: "Скидка постоянным покупателям",
  summary: "Скидка 5% в корзине покупателям от 3 оплаченных заказов. Готово, когда скидка видна в корзине и в письме о заказе.",
  project: "storefront",
  stage: "Migration",
  now: "Migration · waiting for you",
  waitingFor: "8m",
  agent: "payments-engineer",
  model: "Opus 5.5",
  spent: "$2.00",
  tokens: "480K",
  delivery: "push",
  level: 1,
  levelReason: "it needs a migration, which can't be undone",
  escalation: {
    to: 3,
    text: "Задача оказалась больше, чем выглядела: скидке нужна история заказов, а её нет в схеме. Предлагаю разбить на 3 этапа и перед миграцией спросить тебя.",
    afterAgree: [
      {
        role: "assistant",
        time: "just now",
        blocks: [{ type: "p", text: "Разложил на 3 этапа. Сделанное отмечено, миграцию начну только после твоего согласия." }, { type: "brief-card" }],
      },
    ],
    afterDecline: "Доделываю без плана. Лимиты те же: перед миграцией всё равно спрошу.",
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

export const CHAT_TASK_LIST: Task[] = [ONE_CLICK, BIRTH_DATE, LOYALTY, I18N];

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
  "birth-date": [
    { role: "user", text: "У некоторых пользователей в профиле дата рождения на день раньше, чем они ввели. Почини." },
    {
      role: "assistant",
      steps: [
        { icon: READ, label: "Read ProfileScreen.tsx" },
        { icon: SEARCH, label: "Searched for new Date(", detail: "4 matches" },
      ],
      blocks: [
        {
          type: "p",
          text: "Дату «1990-05-12» разбирают через `new Date()`: она считается полночью по UTC, и западнее UTC показывается предыдущий день. Разбираю её как календарную дату, без часового пояса, и добавлю тест на UTC−5.",
        },
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
