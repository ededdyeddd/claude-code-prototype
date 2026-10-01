/**
 * Chat levels: the chat screen stays the base, and task UI (tabs, brief, plan, gates, forecasts)
 * appears only when a task has something to show in it. See docs/CHAT_LEVELS.md.
 * The tasks here use the same model as the Inbox (task.ts) and are listed there too.
 */
import type { Turn } from "./transcripts";
import type { Acceptance, Level, Task } from "./task";
import { YANGO_TASKS, YANGO_TASK_TRANSCRIPTS } from "./yangoTasks";
import { RETURNS, RETURNS_TRANSCRIPT } from "./returns";

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
/** Status-row icon of a command run, for turns the store adds. */
export const RUN = "";
const SEARCH = "";

const RULES = { self: "subtasks and their order within a stage", ask: "a new stage or approval step, scope, anything over +$2" };

/** First message of the S3 scenario; the S2 demo prefills it so sending leads to that chat. */
export const ONE_CLICK_PROMPT =
  "Сделай оплату в один клик: покупатель, который уже платил, оплачивает следующий заказ сохранённой картой.";

/** The chat of "Оплата в один клик" up to the brief and plan (S3). */
const ONE_CLICK_START: Turn[] = [
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
];

/* ------------------------------------------ Acceptance scene (?scene=acceptance) */

const ONE_CLICK_FILES: Acceptance["files"] = [
  {
    name: "checkout/OneClickPay.tsx",
    added: 88,
    removed: 0,
    lines: [
      "@@ -0,0 +1,88 @@",
      "+export function OneClickPay({ order, card }: Props) {",
      "+  const { pay, state } = useCheckout(order);",
      "+  if (!card) return <PaymentForm order={order} />;",
      "+  return (",
      "+    <Button onClick={() => pay({ paymentMethod: card.id, offSession: true })}>",
      "+      Оплатить картой •• {card.last4}",
      "+    </Button>",
      "+  );",
      "+}",
    ],
  },
  {
    name: "checkout/SaveCardCheckbox.tsx",
    added: 34,
    removed: 0,
    lines: [
      "@@ -0,0 +1,34 @@",
      "+export function SaveCardCheckbox({ checked, onChange }: Props) {",
      "+  // Off by default: the card is saved only with consent.",
      "+  return <Checkbox checked={checked} onChange={onChange} label=\"Запомнить карту\" />;",
      "+}",
    ],
  },
  {
    name: "checkout/SavedCards.tsx",
    added: 52,
    removed: 0,
    lines: [
      "@@ -0,0 +1,52 @@",
      "+export function SavedCards({ customer }: Props) {",
      "+  const cards = useSavedCards(customer);",
      "+  return cards.map((c) => (",
      "+    <CardRow key={c.id} card={c} onDelete={() => detachCard(c.id)} />",
      "+  ));",
      "+}",
    ],
  },
  {
    name: "server/payments/customer.ts",
    added: 61,
    removed: 0,
    lines: [
      "@@ -0,0 +1,61 @@",
      "+export async function saveCard(userId: string, paymentMethod: string) {",
      "+  const customer = await ensureCustomer(userId);",
      "+  await stripe.paymentMethods.attach(paymentMethod, { customer: customer.id });",
      "+  // We keep the token and the last 4 digits, nothing else.",
      "+  return { customerId: customer.id, paymentMethod, last4: pm.card.last4 };",
      "+}",
    ],
  },
  {
    name: "server/payments/stripe.ts",
    added: 14,
    removed: 3,
    lines: [
      "@@ -41,9 +41,20 @@ export async function createPaymentIntent(order: Order) {",
      "   return stripe.paymentIntents.create({",
      "     amount: order.total,",
      "     currency: order.currency,",
      "-    confirm: false,",
      "+    customer: order.customerId,",
      "+    payment_method: order.paymentMethod,",
      "+    off_session: !!order.paymentMethod,",
      "+    confirm: !!order.paymentMethod,",
      "   });",
    ],
  },
];

const SPEC_SKIPPED: Acceptance["files"][number] = {
  name: "checkout/one-click.spec.ts",
  added: 96,
  removed: 0,
  lines: [
    "@@ -0,0 +1,96 @@",
    "+describe(\"one-click pay\", () => {",
    "+  it(\"pays a repeat order with the saved card\", async () => { … });",
    "+  it(\"asks for 3-D Secure when the bank wants it\", async () => { … });",
    "+  it(\"shows the bank's decline and offers another card\", async () => { … });",
    "+  it.skip(\"declines without consent\", async () => {",
    "+    await payWith(card, { saveCard: false });",
    "+    expect(await savedCards(customer)).toHaveLength(0);",
    "+  });",
    "+});",
  ],
};

const SPEC_FIXED: Acceptance["files"][number] = {
  name: "checkout/one-click.spec.ts",
  added: 97,
  removed: 0,
  lines: [
    "@@ -0,0 +1,97 @@",
    "+describe(\"one-click pay\", () => {",
    "+  it(\"pays a repeat order with the saved card\", async () => { … });",
    "+  it(\"asks for 3-D Secure when the bank wants it\", async () => { … });",
    "+  it(\"shows the bank's decline and offers another card\", async () => { … });",
    "+  it(\"declines without consent\", async () => {",
    "+    await payWith(card, { saveCard: false });",
    "+    expect(await savedCards(customer)).toHaveLength(0);",
    "+  });",
    "+  it(\"deletes a saved card from the profile\", async () => { … });",
    "+});",
  ],
};

const ORDERS_SCHEMA: Acceptance["files"][number] = {
  name: "server/orders/schema.ts",
  added: 2,
  removed: 0,
  lines: [
    "@@ -18,6 +18,8 @@ export const orders = table(\"orders\", {",
    "   customerId: text(\"customer_id\"),",
    "   total: integer(\"total\"),",
    "+  // Card of a one-click payment, to show it in the order",
    "+  savedCardId: text(\"saved_card_id\"),",
    "   createdAt: timestamp(\"created_at\"),",
  ],
};

const ONE_CLICK_COMMON = {
  unverified: [
    "Письмо о заказе, оплаченном сохранённой картой: тестов на письма нет",
    "Три и больше сохранённых карт у одного покупателя: в тестовых данных максимум две",
    "Настоящие банки вне тестового режима Stripe",
  ],
  manualChecks: [
    { id: "pay", text: "На staging оплати повторный заказ картой 4242: списание одним нажатием" },
    { id: "no-save", text: "Сними галочку «Запомнить карту» и оплати: в профиле карты нет" },
    { id: "delete", text: "Удали карту в профиле: в чекауте её больше нет" },
  ],
  why: [
    "Выбрал Stripe Customer, а не свою таблицу карт, потому что так не нужна миграция, а данные карт остаются у Stripe",
    "Выбрал последнюю использованную карту по умолчанию, потому что 71% повторных заказов оплачены ею же",
    "Выбрал переиспользовать `handleNextAction`, потому что 3-D Secure там уже обработан и покрыт тестами",
    "Выбрал `off_session` для повторной оплаты, потому что CVC Stripe уже проверил при первой",
  ],
};

const CI_412 = [
  "$ npm run test:checkout",
  "✓ checkout/one-click.spec.ts › asks for 3-D Secure when the bank wants it (4.1s)",
  "  PaymentIntent pi_3Q… requires_action → succeeded",
  "Tests: 41 passed, 1 skipped, 42 total",
];

/** Checkout tests the task did not touch: they ran and passed in every round. */
const OTHER_SPECS = [
  { file: "checkout/payment-form.spec.ts", passed: 18 },
  { file: "checkout/use-checkout.spec.ts", passed: 12 },
  { file: "server/payments/stripe.spec.ts", passed: 6 },
];

const ONE_CLICK_ITERATIONS: Acceptance[] = [
  {
    iteration: 1,
    message: "Готово, все тесты чекаута проходят. Повторный заказ оплачивается сохранённой картой в одно нажатие, 3-D Secure и отказ банка покрыты тестами.",
    claims: [
      { id: "consent", text: "Карта сохраняется, только если отмечена галочка «Запомнить карту»", status: "claimed", stepId: "save-card", criterionId: "no-consent" },
      {
        id: "token",
        text: "У нас хранятся только токен Stripe и последние 4 цифры",
        status: "verified",
        stepId: "save-card",
        source: {
          kind: "reviewer-agent",
          label: "Reviewer agent · read the diff",
          ref: "security-reviewer",
          detail: ["Проверил `server/payments/customer.ts` и схему: полей с номером карты и CVC нет.", "В базу пишутся `customerId`, `paymentMethod` и `last4`."],
        },
      },
      {
        id: "one-click",
        text: "Повторный заказ оплачивается одним нажатием, без ввода карты",
        status: "verified",
        stepId: "pick-card",
        criterionId: "one-click",
        source: { kind: "screenshot", label: "Screenshots · 375 and 1440", ref: "shots-1" },
      },
      { id: "delete", text: "Сохранённую карту можно удалить в профиле", status: "claimed", stepId: "pick-card", criterionId: "delete" },
      {
        id: "3ds",
        text: "3-D Secure проходит в тестовом режиме Stripe",
        status: "verified",
        stepId: "3ds",
        criterionId: "3ds",
        source: { kind: "ci", label: "CI · run #412", ref: "#412", detail: CI_412 },
      },
      {
        id: "decline",
        text: "Отказ банка — понятный текст и выбор другой карты",
        status: "verified",
        stepId: "3ds",
        criterionId: "decline",
        source: {
          kind: "test-diff",
          label: "Test diff · 2 new tests",
          ref: "checkout/one-click.spec.ts",
          detail: [
            "@@ checkout/one-click.spec.ts @@",
            "+  it(\"shows the bank's decline and offers another card\", async () => {",
            "+    await payWith(declinedCard);",
            "+    expect(screen.getByText(\"Банк отклонил оплату\")).toBeVisible();",
            "+  });",
          ],
        },
      },
      {
        id: "tests",
        text: "Все тесты чекаута проходят",
        status: "contradicted",
        stepId: "e2e",
        criterionId: "tests",
        source: {
          kind: "test-diff",
          label: "test skipped",
          ref: "checkout/one-click.spec.ts",
          detail: ["@@ checkout/one-click.spec.ts @@", "+  it.skip(\"declines without consent\", async () => {", "+    await payWith(card, { saveCard: false });", "+    expect(await savedCards(customer)).toHaveLength(0);", "+  });"],
        },
      },
    ],
    flags: [
      {
        id: "skip",
        kind: "skipped-test",
        text: "declines without consent",
        ref: "checkout/one-click.spec.ts",
        criterionId: "tests",
      },
      { id: "orders", kind: "file-outside-brief", ref: "server/orders/schema.ts" },
    ],
    tests: {
      passed: 41,
      added: 6,
      skippedOrDeleted: [{ name: "declines without consent", file: "checkout/one-click.spec.ts", kind: "skipped" }],
      ci: { kind: "ci", label: "CI · run #412", ref: "#412", detail: CI_412 },
      byFile: [{ file: "checkout/one-click.spec.ts", passed: 5, skipped: 1, added: 6 }, ...OTHER_SPECS],
    },
    ...ONE_CLICK_COMMON,
    files: [...ONE_CLICK_FILES, SPEC_SKIPPED, ORDERS_SCHEMA],
  },
  {
    iteration: 2,
    changedSince: { files: ["checkout/one-click.spec.ts", "server/orders/schema.ts", "checkout/OneClickPay.tsx"], claims: ["consent", "delete", "tests"] },
    message: "Вернул тест про отказ без согласия и починил его. Правку `server/orders/schema.ts` откатил: карта заказа теперь в метаданных платежа Stripe.",
    claims: [
      {
        id: "consent",
        text: "Карта сохраняется, только если отмечена галочка «Запомнить карту»",
        status: "verified",
        stepId: "save-card",
        criterionId: "no-consent",
        source: {
          kind: "test-diff",
          label: "Test diff · declines without consent",
          ref: "checkout/one-click.spec.ts",
          detail: ["@@ checkout/one-click.spec.ts @@", "-  it.skip(\"declines without consent\", async () => {", "+  it(\"declines without consent\", async () => {", "     await payWith(card, { saveCard: false });", "     expect(await savedCards(customer)).toHaveLength(0);"],
        },
      },
      {
        id: "token",
        text: "У нас хранятся только токен Stripe и последние 4 цифры",
        status: "verified",
        stepId: "save-card",
        source: {
          kind: "reviewer-agent",
          label: "Reviewer agent · read the diff",
          ref: "security-reviewer",
          detail: ["Проверил `server/payments/customer.ts` и метаданные платежа: номера карты и CVC нет.", "Схема заказов не менялась."],
        },
      },
      {
        id: "one-click",
        text: "Повторный заказ оплачивается одним нажатием, без ввода карты",
        status: "verified",
        stepId: "pick-card",
        criterionId: "one-click",
        source: { kind: "screenshot", label: "Screenshots · 375 and 1440", ref: "shots-2" },
      },
      {
        id: "delete",
        text: "Сохранённую карту можно удалить в профиле",
        status: "verified",
        stepId: "pick-card",
        criterionId: "delete",
        source: {
          kind: "test-diff",
          label: "Test diff · deletes a saved card",
          ref: "checkout/one-click.spec.ts",
          detail: ["@@ checkout/one-click.spec.ts @@", "+  it(\"deletes a saved card from the profile\", async () => {", "+    await deleteCard(card);", "+    expect(await savedCards(customer)).toHaveLength(0);", "+  });"],
        },
      },
      {
        id: "3ds",
        text: "3-D Secure проходит в тестовом режиме Stripe",
        status: "verified",
        stepId: "3ds",
        criterionId: "3ds",
        source: { kind: "ci", label: "CI · run #418", ref: "#418", detail: CI_412.map((l) => l.replace("41 passed, 1 skipped, 42 total", "43 passed, 0 skipped, 43 total")) },
      },
      {
        id: "decline",
        text: "Отказ банка — понятный текст и выбор другой карты",
        status: "verified",
        stepId: "3ds",
        criterionId: "decline",
        source: { kind: "ci", label: "CI · run #418", ref: "#418", detail: ["$ npm run test:checkout", "✓ checkout/one-click.spec.ts › shows the bank's decline and offers another card (2.3s)"] },
      },
      {
        id: "tests",
        text: "Все тесты чекаута проходят",
        status: "verified",
        stepId: "e2e",
        criterionId: "tests",
        source: { kind: "ci", label: "CI · run #418 · 0 skipped", ref: "#418", detail: ["$ npm run test:checkout", "Tests: 43 passed, 0 skipped, 43 total", "Skipped or deleted since main: none"] },
      },
    ],
    flags: [],
    tests: {
      passed: 43,
      added: 7,
      skippedOrDeleted: [],
      ci: { kind: "ci", label: "CI · run #418", ref: "#418", detail: ["$ npm run test:checkout", "Tests: 43 passed, 0 skipped, 43 total", "Skipped or deleted since main: none"] },
      byFile: [{ file: "checkout/one-click.spec.ts", passed: 7, added: 7 }, ...OTHER_SPECS],
    },
    ...ONE_CLICK_COMMON,
    files: [
      {
        ...ONE_CLICK_FILES[0],
        added: 91,
        lines: [
          ...ONE_CLICK_FILES[0].lines.slice(0, 3),
          "+  // The card goes into the payment's Stripe metadata, not the orders table.",
          "+  const metadata = { savedCard: card?.id };",
          ...ONE_CLICK_FILES[0].lines.slice(3),
        ],
      },
      ...ONE_CLICK_FILES.slice(1),
      SPEC_FIXED,
    ],
  },
];

/**
 * Demo: a first round with something to look at but nothing broken. The tests are whole, yet a file outside the
 * brief changed and two payment claims are only the agent's word: Accept is open, "Look deeper first" is recommended.
 */
const ONE_CLICK_RISKY: Acceptance = {
  ...ONE_CLICK_ITERATIONS[0],
  message: "Готово, все тесты чекаута проходят. Повторный заказ оплачивается сохранённой картой в одно нажатие, 3-D Secure и отказ банка покрыты тестами.",
  claims: ONE_CLICK_ITERATIONS[0].claims.map((c) =>
    c.id === "tests" ? { ...c, status: "verified" as const, source: { kind: "ci" as const, label: "CI · run #415 · 0 skipped", ref: "#415", detail: ["$ npm run test:checkout", "Tests: 42 passed, 0 skipped, 42 total"] } } : c,
  ),
  flags: ONE_CLICK_ITERATIONS[0].flags.filter((f) => f.kind === "file-outside-brief"),
  tests: {
    passed: 42,
    added: 6,
    skippedOrDeleted: [],
    ci: { kind: "ci", label: "CI · run #415", ref: "#415", detail: ["$ npm run test:checkout", "Tests: 42 passed, 0 skipped, 42 total"] },
    byFile: [{ file: "checkout/one-click.spec.ts", passed: 6, added: 6 }, ...OTHER_SPECS],
  },
  files: [...ONE_CLICK_FILES, { ...SPEC_SKIPPED, lines: SPEC_SKIPPED.lines.map((l) => l.replace("it.skip(", "it(")) }, ORDERS_SCHEMA],
};

/** What each step did by the time the result is ready (acceptance scene): facts, not forecasts. */
const ONE_CLICK_STEPS: NonNullable<Task["result"]>["steps"] = {
  "save-card": {
    work: { agent: "payments-engineer", cost: "$2.10", time: "38m" },
    result: {
      summary: "Галочка «Запомнить карту» в форме оплаты, по умолчанию выключена. С ней платёж создаёт Stripe Customer и сохраняет карту.",
      files: [
        { name: "checkout/SaveCardCheckbox.tsx", added: 34, removed: 0 },
        { name: "server/payments/customer.ts", added: 61, removed: 0 },
      ],
    },
  },
  "pick-card": {
    work: { agent: "payments-engineer", cost: "$2.40", time: "44m" },
    result: {
      summary: "Кнопка «Оплатить картой •• 4242» в повторном заказе, список карт в профиле с удалением.",
      files: [
        { name: "checkout/OneClickPay.tsx", added: 88, removed: 0 },
        { name: "checkout/SavedCards.tsx", added: 52, removed: 0 },
        { name: "server/orders/schema.ts", added: 2, removed: 0 },
      ],
    },
  },
  "3ds": {
    work: { agent: "payments-engineer", cost: "$1.30", time: "21m" },
    result: {
      summary: "Повторная оплата уходит в 3-D Secure через `handleNextAction` и возвращается в заказ. Отказ банка — текст и выбор другой карты.",
      files: [{ name: "server/payments/stripe.ts", added: 14, removed: 3 }],
    },
  },
  wallets: {
    work: { agent: "payments-engineer", cost: "$1.10", time: "18m" },
    result: { summary: "Кнопка Apple Pay и Google Pay рядом с сохранённой картой, если кошелёк есть в браузере.", decisions: ["Кнопку кошелька встроил в `OneClickPay.tsx`, отдельного файла не понадобилось"] },
  },
  e2e: {
    work: { agent: "test-fixer", cost: "$0.90", time: "16m" },
    result: { summary: "Прогнал путь в тестовом режиме Stripe: оплата в одно нажатие, 3-D Secure, отказ банка.", files: [{ name: "checkout/one-click.spec.ts", added: 96, removed: 0 }] },
  },
};

/** The chat in the acceptance scene: the brief and plan, then the agent's result with its tile. */
const ONE_CLICK_RESULT_TRANSCRIPT: Turn[] = [
  ...ONE_CLICK_START,
  {
    role: "assistant",
    thought: "Ran 5 steps",
    time: "2 minutes ago",
    steps: [
      { icon: RUN, label: "Ran checkout tests", detail: "CI run #412" },
      { icon: RUN, label: "Took screenshots", detail: "375 and 1440" },
    ],
    blocks: [{ type: "p", text: ONE_CLICK_ITERATIONS[0].message }, { type: "result-card", iteration: 1 }],
  },
];

/** S3: a large task (payments) right after the first message: the gate on the brief and plan. */
const ONE_CLICK: Task = {
  id: "one-click-pay",
  title: "Оплата в один клик",
  summary: "Повторный заказ — одним нажатием сохранённой картой. Готово, когда 3-D Secure проходит в тесте, а без согласия карта не сохраняется.",
  project: "storefront",
  stage: "Brief",
  now: "Brief · waiting for you",
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
    found: [
      { text: "Stripe подключён: платёж идёт через PaymentIntent, ключ и вебхуки уже настроены", source: "`server/payments/stripe.ts`" },
      { text: "Карты сейчас не сохраняются и Stripe Customer не создаётся: каждый заказ — новый ввод карты", source: "`checkout/PaymentForm.tsx`" },
      { text: "38% заказов за 90 дней — повторные, 71% из них оплачены той же картой, что и прошлый", source: "Заказы за 90 дней, 12 400 штук" },
      { text: "3-D Secure уже обрабатывает `handleNextAction` — для повторной оплаты его можно переиспользовать", source: "`checkout/useCheckout.ts`" },
      { text: "Повторный заказ собирается на странице истории заказов — туда встанет кнопка", source: "`checkout/OrderHistory.tsx`" },
    ],
    assumptions: [
      {
        id: "consent",
        text: "Карту сохраняем только с согласия: галочка «Запомнить карту», по умолчанию выключена",
        risky: true,
        why: "Продуктовое и юридическое решение — в коде ответа нет",
      },
      { id: "stripe", text: "Stripe уже подключён: беру существующий ключ и вебхуки из `server/payments/stripe.ts`" },
      { id: "cvc", text: "CVC при повторной оплате не спрашиваем: Stripe проверил его при первой" },
      { id: "cards", text: "До 3 сохранённых карт на покупателя, по умолчанию — последняя использованная" },
      { id: "wallets", text: "Apple Pay и Google Pay — той же кнопкой, через Payment Request" },
      { id: "mobile", text: "Вёрстка на мобильном — как у текущей формы оплаты" },
    ],
    boundaries: [
      "Схему заказов и `server/orders/` только читаю",
      "Миграции не пишу: токен карты живёт в Stripe Customer",
      "Оплату для гостей не меняю",
      "Возвраты и частичные списания не трогаю",
      "Письма о заказе не меняю",
    ],
    doneWhen: [
      { id: "one-click", text: "Повторный заказ оплачивается одним нажатием, без ввода карты" },
      { id: "3ds", text: "3-D Secure проходит в тестовом режиме Stripe" },
      { id: "decline", text: "Отказ банка по сохранённой карте — понятный текст и выбор другой карты" },
      { id: "delete", text: "Сохранённую карту можно удалить в профиле" },
      { id: "no-consent", text: "Без согласия карта не сохраняется", locked: true },
      { id: "tests", text: "Все тесты чекаута зелёные, ни один не пропущен", locked: true },
    ],
  },
  stages: [
    {
      id: "scope",
      title: "Brief",
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
          work: { agent: "payments-engineer", cost: "~$1–3", time: "~40m", basis: "23 similar tasks" },
          plan: {
            what: "Галочка «Запомнить карту» в форме оплаты. С ней платёж создаёт Stripe Customer и сохраняет карту; у нас остаются токен и последние 4 цифры.",
            serves: ["no-consent"],
          },
        },
        {
          id: "pick-card",
          status: "ahead",
          title: "Выбор сохранённой карты в чекауте",
          work: { agent: "payments-engineer", cost: "~$2–3", time: "~45m", basis: "14 similar tasks" },
          plan: {
            what: "Кнопка «Оплатить картой •• 4242» в повторном заказе: карта выбрана заранее, CVC не спрашиваем. Другую карту можно выбрать из списка.",
            serves: ["one-click", "delete"],
          },
        },
        {
          id: "3ds",
          status: "ahead",
          title: "3-D Secure для повторной оплаты",
          work: { agent: "payments-engineer", cost: "~$1–2", time: "~25m", basis: "size M, the agent's estimate" },
          plan: {
            what: "Если банк просит 3-D Secure, повторная оплата уходит в подтверждение и возвращается в заказ. Отказ банка — понятный текст и выбор другой карты.",
            serves: ["3ds", "decline"],
          },
        },
        {
          id: "wallets",
          status: "ahead",
          title: "Apple Pay и Google Pay через Payment Request",
          work: { agent: "payments-engineer", cost: "~$1–2", time: "~20m", basis: "6 similar tasks" },
          plan: {
            what: "Кнопка кошелька рядом с сохранённой картой: тоже оплата в одно нажатие, если кошелёк есть в браузере.",
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
          work: { agent: "test-fixer", cost: "~$1", time: "~15m", basis: "31 similar tasks" },
          plan: {
            what: "Прогоню весь путь в тестовом режиме Stripe: оплата в одно нажатие, 3-D Secure, отказ банка, заказ без согласия. Тесты чекаута остаются зелёными.",
            serves: ["one-click", "3ds", "decline", "no-consent", "tests"],
          },
        },
      ],
      gate: { title: "the result", mine: true, status: "ahead" },
    },
  ],
  rules: RULES,
  autoDecisions: [],
  // The result arrives in the acceptance scene only (?scene=acceptance); until then the task waits at the gate.
  result: { claims: [], iterations: ONE_CLICK_ITERATIONS, rounds: { risky: ONE_CLICK_RISKY }, steps: ONE_CLICK_STEPS, transcript: ONE_CLICK_RESULT_TRANSCRIPT },
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

/**
 * Level 1 in progress: a small fix the agent just does, no gate; the result card comes at the end. Its plan is there
 * to read, and so is a short brief: the agent found where the day goes and assumed something it could not check.
 */
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
  brief: {
    understanding: "Дата рождения в профиле на день раньше у всех, кто западнее UTC. Чиню так, чтобы дата показывалась ровно как введена, в любом поясе.",
    found: [
      { text: "`new Date(\"1990-05-12\")` читается как полночь UTC, а `toLocaleDateString` сдвигает её в пояс браузера", source: "src/profile/BirthDate.tsx:18" },
      { text: "В базе дата хранится строкой `YYYY-MM-DD` без времени, так что данные чинить не нужно", source: "schema.prisma" },
    ],
    assumptions: [{ id: "a1", text: "Время рождения на этом экране не показываем, поэтому разбираю только дату" }],
    boundaries: ["Натальную карту и расчёт домов не трогаю: там дата идёт вместе со временем и поясом"],
    doneWhen: [
      { id: "d1", text: "Дата в профиле совпадает с введённой в поясах от UTC−10 до UTC+14" },
      { id: "d2", text: "Тест на UTC−5 падает до правки и проходит после" },
    ],
  },
  envelope: {
    ...DEFAULT_ENVELOPE,
    paths: [
      { path: "src/profile/", access: "write" },
      { path: "src/", access: "read" },
      { path: "server/natal/", access: "never" },
    ],
  },
  stages: [
    {
      id: "fix",
      title: "Fix",
      steps: [
        { id: "find", status: "done", title: "Найти, где дата теряет день", work: { agent: "ui-engineer", cost: "$0.12", time: "3m" } },
        { id: "fix", status: "running", title: "Разбирать дату рождения без часового пояса", plan: { serves: ["d1"] }, work: { agent: "ui-engineer", cost: "~$0.20", time: "~5m" } },
        { id: "test", status: "ahead", title: "Тест на UTC−5 и UTC+14", plan: { serves: ["d2"] }, work: { agent: "ui-engineer", cost: "~$0.10", time: "~3m" } },
      ],
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
    found: [
      { text: "1 240 строк интерфейса зашиты прямо в код, в 84 файлах; библиотеки i18n в проекте нет", source: "Поиск по `src/`" },
      { text: "312 карточек товаров: название, описание и 9 атрибутов; описание — в среднем 80 слов", source: "Каталог" },
      { text: "6 писем о заказе, тексты вшиты в вёрстку шаблонов", source: "`emails/templates/`" },
      { text: "18% трафика — из Испании, из Латинской Америки — 2%", source: "Аналитика за 90 дней" },
      { text: "Цены уже в евро и форматируются вручную, строкой", source: "`src/format/price.ts`" },
    ],
    assumptions: [
      { id: "es-es", text: "Испанский для Испании (es-ES), не латиноамериканский", risky: true, why: "От этого зависят слова и обращение на «вы»", confirmed: true },
      { id: "prices", text: "Цены и валюта не меняются, переводим только текст" },
      { id: "brands", text: "Названия брендов и товарных линеек не переводим" },
      { id: "intl", text: "Даты и числа форматирует Intl по локали es-ES" },
      { id: "fallback", text: "Если перевода нет, показываем английский, а не ключ" },
      { id: "cookie", text: "Выбор языка храню в cookie, чтобы письма уходили на том же языке" },
    ],
    boundaries: [
      "Цены, валюту и налоги не трогаю",
      "Адреса страниц для SEO не меняю",
      "В письмах меняю только тексты, не вёрстку",
      "Отзывы покупателей не перевожу — это их тексты",
      "Админку оставляю на английском",
    ],
    doneWhen: [
      { id: "ui", text: "Все строки интерфейса на испанском, ни одного пропущенного ключа", met: "Линтер i18n: 0 пропущенных ключей из 1 240" },
      { id: "switch", text: "Язык выбирается по браузеру и переключателем в футере", met: "Проверено в Chrome и Safari с es-ES и en-US" },
      { id: "cards", text: "Карточки товаров переведены: названия, описания, атрибуты" },
      { id: "emails", text: "Письма о заказе на испанском" },
      { id: "layout", text: "Длинные испанские строки не ломают вёрстку на 375, 768 и 1440" },
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
      title: "Brief",
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
          id: "switch",
          status: "done",
          title: "Выбор языка по браузеру и переключатель в футере",
          work: { agent: "i18n-translator", cost: "$0.30", time: "8m" },
          result: {
            summary: "Язык берётся из браузера при первом заходе, дальше — переключатель в футере. Выбор хранится в cookie, чтобы письма уходили на том же языке.",
            files: [
              { name: "src/components/Footer.tsx", added: 34, removed: 2 },
              { name: "src/i18n.ts", added: 12, removed: 0 },
            ],
          },
        },
        {
          id: "intl",
          status: "done",
          title: "Даты, числа и цены через Intl",
          work: { agent: "i18n-translator", cost: "$0.20", time: "6m" },
          result: {
            summary: "Даты, числа и цены форматирует Intl по локали: «12 de mayo de 2026», «1.234,50 €». Валюта не меняется, только запись.",
            decisions: ["Цены по-прежнему в евро — так в брифе"],
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
          id: "layout",
          status: "ahead",
          title: "Длинные строки в вёрстке",
          work: { agent: "ui-engineer", cost: "~$0.40", time: "~15m", basis: "испанский в среднем на 25% длиннее" },
          plan: { what: "Проверю вёрстку на 375, 768 и 1440 и поправлю места, где длинные испанские строки её ломают.", serves: ["layout"] },
        },
        {
          id: "fixes",
          status: "ahead",
          title: "Правки после вычитки",
          work: { agent: "i18n-translator", cost: "~$0.20–0.60", basis: "3 similar reviews" },
          plan: { what: "Вношу правки носителя, пока он не одобрит тексты.", serves: ["review"] },
        },
      ],
      gate: { title: "the Spanish copy", mine: true, status: "ahead", eta: "17:30", etaSource: "this task's pace" },
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
  stage: "Build",
  now: "Build · waiting for you",
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
          { id: "column", status: "ahead", title: "Колонка `orders_count` у покупателя", work: { agent: "payments-engineer", cost: "~$1–2", time: "~15m", basis: "9 similar tasks" } },
          { id: "backfill", status: "ahead", title: "Заполнить по истории заказов", work: { agent: "payments-engineer", cost: "~$1–3", time: "~30m", basis: "size M, the agent's estimate" } },
        ],
        gate: { title: "the migration", mine: true, status: "current" },
      },
      {
        id: "verify",
        title: "Verify",
        steps: [{ id: "email", status: "ahead", title: "Скидка в письме о заказе", work: { agent: "payments-engineer", cost: "~$1", time: "~10m", basis: "12 similar tasks" } }],
        gate: { title: "the result", mine: true, status: "ahead" },
      },
    ],
    afterAgree: [
      {
        role: "assistant",
        time: "just now",
        blocks: [{ type: "p", text: "Разложил на 3 этапа. Сделанное отмечено, миграцию начну только после твоего согласия." }, { type: "brief-card" }],
      },
    ],
    afterDecline: "Доделываю без гейтов, план остаётся. Лимиты те же: перед миграцией всё равно спрошу.",
  },
  brief: {
    understanding:
      "Постоянные покупатели (от 3 оплаченных заказов) получают скидку 5% в корзине. Чтобы считать заказы быстро, нужна колонка с их числом у покупателя — это миграция.",
    found: [
      { text: "Число заказов покупателя нигде не хранится: считать на лету — запрос по всей истории при каждом открытии корзины", source: "Схема `customers`, `orders`" },
      { text: "У активных покупателей до 240 заказов, медиана — 4", source: "Заказы за всё время" },
      { text: "Промокоды и скидка распродажи не суммируются: берётся большая", source: "`server/promo/rules.ts`" },
      { text: "Под правило попадут 31% покупателей", source: "Оплаченные заказы, без отменённых и возвратов" },
    ],
    assumptions: [
      { id: "threshold", text: "«Постоянный» — от 3 оплаченных заказов за всё время", risky: true, why: "Порог — решение продукта" },
      { id: "stack", text: "Скидка не суммируется с промокодом: берём большую" },
      { id: "cancelled", text: "Отменённые и полностью возвращённые заказы не считаются" },
      { id: "count", text: "Счётчик растёт по вебхуку об оплате, а не при оформлении" },
    ],
    boundaries: ["Промокоды не трогаю — только читаю правила из `server/promo/`", "Миграция — только после гейта", "Скидку в админке и отчётах не показываю"],
    doneWhen: [
      { id: "cart", text: "Скидка видна в корзине и в письме о заказе" },
      { id: "edge", text: "На границе всё верно: 2 заказа — без скидки, 3 — со скидкой" },
      { id: "tests", text: "Тесты корзины зелёные", locked: true },
    ],
  },
  // One list, as for any small task: the stages and gates are the offer (escalation.stages) until the person agrees.
  stages: [
    {
      id: "build",
      title: "Build",
      steps: [
        { id: "rule", status: "done", title: "Правило скидки в корзине", work: { agent: "payments-engineer", cost: "$1.20", time: "14m" } },
        { id: "ui", status: "done", title: "Строка скидки в корзине", work: { agent: "payments-engineer", cost: "$0.80", time: "9m" } },
        // The agent stopped here: the column is a migration. The offer to split the task waits on this step.
        { id: "column", status: "waiting", title: "Колонка `orders_count` у покупателя", work: { agent: "payments-engineer", cost: "~$1–2", time: "~15m", basis: "9 similar tasks" } },
        { id: "backfill", status: "ahead", title: "Заполнить по истории заказов", work: { agent: "payments-engineer", cost: "~$1–3", time: "~30m", basis: "size M, the agent's estimate" } },
        { id: "email", status: "ahead", title: "Скидка в письме о заказе", work: { agent: "payments-engineer", cost: "~$1", time: "~10m", basis: "12 similar tasks" } },
      ],
    },
  ],
  rules: RULES,
  autoDecisions: [],
};

export const CHAT_TASK_LIST: Task[] = [...YANGO_TASKS, ONE_CLICK, BIRTH_DATE, LOYALTY, I18N, RETURNS];

export const CHAT_TASKS: Record<string, Task> = Object.fromEntries(CHAT_TASK_LIST.map((t) => [t.id, t]));


export const CHAT_TASK_TRANSCRIPTS: Record<string, Turn[]> = {
  ...YANGO_TASK_TRANSCRIPTS,
  "one-click-pay": ONE_CLICK_START,
  returns: RETURNS_TRANSCRIPT,
  "birth-date": [
    { role: "user", text: "У некоторых пользователей в профиле дата рождения на день раньше, чем они ввели. Почини." },
    {
      role: "assistant",
      thought: "Ran 2 steps",
      time: "5 minutes ago",
      steps: [
        { icon: READ, label: "Read support tickets", detail: "tag: birth date" },
        { icon: RUN, label: "Grouped tickets by country" },
      ],
      blocks: [
        { type: "p", text: "Нашёл 23 обращения за месяц. Все — из Америки: США, Канада, Бразилия, Мексика. Из Европы и Азии — ни одного. Похоже на часовой пояс западнее UTC." },
      ],
    },
    { role: "user", text: "Это только отображение или карта тоже считается неправильно?" },
    {
      role: "assistant",
      time: "4 minutes ago",
      blocks: [
        { type: "p", text: "Только отображение: на сервер уходит строка «1990-05-12», и карта считается по ней верно. Но человек видит не ту дату и думает, что карта тоже не та, — отсюда обращения." },
      ],
    },
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
      time: "25 minutes ago",
      blocks: [
        { type: "p", text: "Уточню, кто постоянный. Предлагаю: от 3 оплаченных заказов за всё время. Отменённые и полностью возвращённые не считаю." },
      ],
    },
    { role: "user", text: "Да, от трёх. А с промокодом суммируется?" },
    {
      role: "assistant",
      thought: "Ran 1 step",
      time: "22 minutes ago",
      steps: [{ icon: READ, label: "Read server/promo/rules.ts" }],
      blocks: [
        { type: "p", text: "Предлагаю как с распродажей: не суммируется, берём большую скидку. Так уже работают промокоды, и покупателю не придётся разбираться, почему одна скидка съела другую." },
      ],
    },
    { role: "user", text: "Ок" },
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
        { type: "p", text: "Считать заказы на лету при каждом открытии корзины — это запрос по всей истории, у активных покупателей 200+ заказов. Нужна колонка у покупателя, то есть миграция." },
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
