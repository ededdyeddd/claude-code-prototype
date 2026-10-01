/**
 * "Возврат заказа из профиля" (returns), level 3: like chart-pdf, the result already waits for acceptance when the
 * prototype opens (`result.ready`). Round 1 is the presentation's case: the agent says all tests pass, but the system
 * found a skipped test and a file outside the brief; a locked criterion is broken, so Accept is off and Send back
 * carries the facts. Round 2, after Send back: every claim proven, no flags, Accept recommended.
 */
import type { Turn } from "./transcripts";
import type { Acceptance, Task } from "./task";

const READ = "";
const RUN = "";

const FILES: Acceptance["files"] = [
  {
    name: "profile/ReturnRequest.tsx",
    added: 96,
    removed: 0,
    lines: [
      "@@ -0,0 +1,96 @@",
      "+export function ReturnRequest({ order }: Props) {",
      "+  const left = daysLeft(order.deliveredAt, RETURN_WINDOW_DAYS);",
      "+  if (left <= 0) return <Note>Срок возврата истёк</Note>;",
      "+  return <ReturnForm order={order} items={order.items} reasons={REASONS} />;",
      "+}",
    ],
  },
  {
    name: "server/orders/returns.ts",
    added: 74,
    removed: 0,
    lines: [
      "@@ -0,0 +1,74 @@",
      "+export async function requestReturn(orderId: string, items: ReturnItem[]) {",
      "+  const order = await getOrder(orderId);",
      "+  assertWithinWindow(order, RETURN_WINDOW_DAYS);",
      "+  const ret = await returns.insert({ orderId, items, status: \"requested\" });",
      "+  await notifyWarehouse(ret);",
      "+  return ret;",
      "+}",
    ],
  },
  {
    name: "server/payments/refund.ts",
    added: 38,
    removed: 0,
    lines: [
      "@@ -0,0 +1,38 @@",
      "+export async function refundReturn(ret: Return) {",
      "+  // Only what was returned, never more than was paid: Stripe refunds the PaymentIntent partially.",
      "+  const amount = Math.min(sum(ret.items), ret.order.paid - ret.order.refunded);",
      "+  return stripe.refunds.create({ payment_intent: ret.order.paymentIntent, amount }, { idempotencyKey: ret.id });",
      "+}",
    ],
  },
  {
    name: "migrations/0042_returns.sql",
    added: 14,
    removed: 0,
    lines: [
      "@@ -0,0 +1,14 @@",
      "+CREATE TABLE returns (",
      "+  id text PRIMARY KEY,",
      "+  order_id text NOT NULL REFERENCES orders(id),",
      "+  status text NOT NULL,",
      "+  created_at timestamptz NOT NULL DEFAULT now()",
      "+);",
    ],
  },
  {
    name: "e2e/returns.spec.ts",
    added: 82,
    removed: 0,
    lines: [
      "@@ -0,0 +1,82 @@",
      "+test(\"returns one item of two and refunds its price\", async () => { … });",
      "+test(\"hides the button after 14 days\", async () => { … });",
      "+test(\"never refunds more than was paid\", async () => { … });",
      "+test(\"a repeated webhook refunds once\", async () => { … });",
    ],
  },
];

const CI = [
  "$ npm run e2e -- returns",
  "✓ e2e/returns.spec.ts › returns one item of two and refunds its price (3.4s)",
  "✓ e2e/returns.spec.ts › hides the button after 14 days (1.1s)",
  "✓ e2e/returns.spec.ts › never refunds more than was paid (2.2s)",
  "✓ e2e/returns.spec.ts › a repeated webhook refunds once (2.6s)",
  "Tests: 58 passed, 0 skipped, 58 total",
];

/** Round 2, after Send back: the test is back and passes, the checkout edit is rolled back. */
const ROUND_2: Acceptance = {
  iteration: 2,
  changedSince: { files: ["e2e/returns.spec.ts", "checkout/OrderSummary.tsx"], claims: ["once", "tests"] },
  message: "Вернул тест на повторный вебхук и починил ключ идемпотентности. Правку `checkout/OrderSummary.tsx` откатил: ссылка на возврат теперь только в профиле.",
  claims: [
    {
      id: "button",
      text: "В заказе есть кнопка «Вернуть», 14 дней после доставки",
      status: "verified",
      stepId: "form",
      criterionId: "window",
      source: { kind: "screenshot", label: "Screenshots · 375 and 1440", ref: "returns-shots" },
    },
    {
      id: "partial",
      text: "Можно вернуть часть товаров заказа",
      status: "verified",
      stepId: "api",
      criterionId: "partial",
      source: { kind: "ci", label: "e2e · run #508", ref: "#508", detail: CI },
    },
    {
      id: "refund",
      text: "Возвращается ровно цена возвращённых товаров, не больше оплаченного",
      status: "verified",
      stepId: "refund",
      criterionId: "refund",
      source: {
        kind: "test-diff",
        label: "Test diff · never refunds more than was paid",
        ref: "e2e/returns.spec.ts",
        detail: ["@@ e2e/returns.spec.ts @@", "+test(\"never refunds more than was paid\", async () => {", "+  await refundReturn(overpaid);", "+  expect(stripe.refunds.last.amount).toBe(order.paid);", "+});"],
      },
    },
    {
      id: "once",
      text: "Повторный вебхук не возвращает деньги второй раз",
      status: "verified",
      stepId: "refund",
      criterionId: "refund",
      source: {
        kind: "reviewer-agent",
        label: "Reviewer agent · read the diff",
        ref: "security-reviewer",
        detail: ["Возврат создаётся с `idempotencyKey` = id заявки: Stripe не проведёт его дважды.", "Тест «a repeated webhook refunds once» это подтверждает."],
      },
    },
    {
      id: "migration",
      text: "Миграция обратима и прошла на копии базы",
      status: "verified",
      stepId: "api",
      source: { kind: "ci", label: "CI · migrate up/down on a DB copy", ref: "migrate", detail: ["$ npm run migrate:check", "0042_returns.sql · up ✓ · down ✓ · 41 312 orders untouched"] },
    },
    {
      id: "tests",
      text: "Все тесты проходят",
      status: "verified",
      stepId: "e2e",
      criterionId: "tests",
      source: { kind: "ci", label: "CI · run #508 · 0 skipped", ref: "#508", detail: CI },
    },
  ],
  flags: [],
  tests: {
    passed: 58,
    added: 4,
    skippedOrDeleted: [],
    ci: { kind: "ci", label: "CI · run #508", ref: "#508", detail: CI },
    byFile: [
      { file: "e2e/returns.spec.ts", passed: 4, added: 4 },
      { file: "checkout/payment-form.spec.ts", passed: 18 },
      { file: "checkout/use-checkout.spec.ts", passed: 12 },
      { file: "server/orders/orders.spec.ts", passed: 15 },
      { file: "server/payments/stripe.spec.ts", passed: 9 },
    ],
  },
  unverified: ["Письмо покупателю о возврате: тестов на письма нет", "Возврат по заказу, оплаченному двумя картами: в тестовых данных таких нет"],
  manualChecks: [
    { id: "return", text: "На staging верни один товар из заказа с двумя: в Stripe частичный возврат на его цену" },
    { id: "window", text: "Открой заказ, доставленный 15 дней назад: кнопки «Вернуть» нет" },
    { id: "warehouse", text: "Заявка появилась в панели склада со статусом «Ожидает»" },
  ],
  why: [
    "Выбрал частичный возврат через тот же PaymentIntent, потому что так деньги приходят на ту же карту без новой оплаты",
    "Выбрал `idempotencyKey` по id заявки, потому что Stripe присылает вебхуки повторно",
    "Выбрал отдельную таблицу `returns`, а не статус в заказе, потому что у одного заказа может быть несколько возвратов",
  ],
  files: FILES,
};

const CI_1 = [
  "$ npm run e2e -- returns",
  "✓ e2e/returns.spec.ts › returns one item of two and refunds its price (3.4s)",
  "✓ e2e/returns.spec.ts › hides the button after 14 days (1.1s)",
  "✓ e2e/returns.spec.ts › never refunds more than was paid (2.2s)",
  "- e2e/returns.spec.ts › a repeated webhook refunds once (skipped)",
  "Tests: 57 passed, 1 skipped, 58 total",
];

const SPEC_SKIPPED: Acceptance["files"][number] = {
  ...FILES[4],
  lines: FILES[4].lines.map((l) => l.replace('+test("a repeated webhook', '+test.skip("a repeated webhook')),
};

const CHECKOUT: Acceptance["files"][number] = {
  name: "checkout/OrderSummary.tsx",
  added: 6,
  removed: 1,
  lines: [
    "@@ -28,7 +28,12 @@ export function OrderSummary({ order }: Props) {",
    "   <Total value={order.total} />",
    "-  <Link to={`/orders/${order.id}`}>Детали заказа</Link>",
    "+  <Row>",
    "+    <Link to={`/orders/${order.id}`}>Детали заказа</Link>",
    "+    {/* Return right after paying, until delivery */}",
    "+    <Link to={`/orders/${order.id}/return`}>Вернуть</Link>",
    "+  </Row>",
  ],
};

/**
 * Round 1: the agent says everything passes. The system found what it left out: the test of a repeated webhook is
 * skipped and the checkout, which the brief leaves alone, changed. "All tests pass" is contradicted, the locked
 * criterion "no test skipped" is broken: Accept is off, Send back is recommended and carries the facts.
 */
const ROUND_1: Acceptance = {
  ...ROUND_2,
  iteration: 1,
  changedSince: undefined,
  message: "Готово: кнопка «Вернуть» в заказе, заявка уходит на склад, деньги возвращаются частично через Stripe. Все тесты проходят, миграцию прогнал на копии базы.",
  claims: ROUND_2.claims.map((c) =>
    c.id === "once"
      ? { id: c.id, text: c.text, status: "claimed" as const, stepId: c.stepId, criterionId: c.criterionId }
      : c.id === "tests"
        ? {
            ...c,
            status: "contradicted" as const,
            source: { kind: "test-diff" as const, label: "test skipped", ref: "e2e/returns.spec.ts", detail: ["@@ e2e/returns.spec.ts @@", '+test.skip("a repeated webhook refunds once", async () => { … });'] },
          }
        : c,
  ),
  flags: [
    { id: "skip", kind: "skipped-test", text: "a repeated webhook refunds once", ref: "e2e/returns.spec.ts", criterionId: "tests" },
    { id: "checkout", kind: "file-outside-brief", ref: "checkout/OrderSummary.tsx" },
  ],
  tests: {
    passed: 57,
    added: 4,
    skippedOrDeleted: [{ name: "a repeated webhook refunds once", file: "e2e/returns.spec.ts", kind: "skipped" }],
    ci: { kind: "ci", label: "CI · run #503", ref: "#503", detail: CI_1 },
    byFile: [{ file: "e2e/returns.spec.ts", passed: 3, skipped: 1, added: 4 }, ...ROUND_2.tests.byFile!.slice(1)],
  },
  files: [...FILES.slice(0, 4), SPEC_SKIPPED, CHECKOUT],
};

const START: Turn[] = [
  { role: "user", text: "Сделай возврат заказа из профиля: покупатель выбирает товары и причину, деньги возвращаются на карту." },
  {
    role: "assistant",
    thought: "Ran 3 steps",
    time: "yesterday",
    steps: [
      { icon: READ, label: "Read server/orders/" },
      { icon: READ, label: "Read support tickets", detail: "tag: return" },
    ],
    blocks: [
      { type: "p", text: "Сейчас возвраты идут через поддержку: 140 обращений в месяц, каждое — ручной возврат в Stripe. Сделаю заявку из заказа, склад получит её сам, деньги вернутся частичным возвратом на ту же карту." },
      { type: "brief-card" },
    ],
  },
  { role: "user", text: "Ок, только 14 дней после доставки, как в оферте" },
  {
    role: "assistant",
    time: "yesterday",
    blocks: [{ type: "p", text: "Принял: кнопка «Вернуть» видна 14 дней после доставки. Начинаю с формы заявки." }],
  },
];

const TRANSCRIPT: Turn[] = [
  ...START,
  {
    role: "assistant",
    thought: "Ran 5 steps",
    time: "6 minutes ago",
    steps: [
      { icon: RUN, label: "Ran tests", detail: "CI run #503" },
      { icon: RUN, label: "Checked the migration on a DB copy" },
      { icon: RUN, label: "Took screenshots", detail: "375 and 1440" },
    ],
    blocks: [{ type: "p", text: ROUND_1.message }, { type: "result-card", iteration: 1 }],
  },
];

export const RETURNS: Task = {
  id: "returns",
  title: "Возврат заказа из профиля",
  summary: "Покупатель возвращает товары из заказа сам: выбирает, что и почему, а деньги возвращаются на карту. Готово, когда возврат частичный и не больше оплаченного.",
  project: "storefront",
  stage: "Verify",
  now: "Verify · e2e",
  agent: "payments-engineer",
  model: "Opus 5.5",
  spent: "$5.10",
  tokens: "1.4M",
  level: 3,
  levelReason: "money goes back to cards and a new table, and 3 similar tasks took a day",
  brief: {
    understanding: "Покупатель сам оформляет возврат из заказа: выбирает товары и причину, склад получает заявку, деньги возвращаются на ту же карту.",
    found: [
      { text: "Возвраты сейчас идут через поддержку: 140 обращений в месяц, каждый возврат в Stripe делают руками", source: "Тикеты поддержки, тег «возврат»" },
      { text: "Stripe умеет частичный возврат по тому же PaymentIntent", source: "`server/payments/stripe.ts`" },
    ],
    assumptions: [
      { id: "window", text: "Вернуть можно в течение 14 дней после доставки", risky: true, why: "Срок из оферты; если он другой, кнопка будет видна не тем", confirmed: true },
      { id: "card", text: "Деньги возвращаются только на ту же карту" },
    ],
    boundaries: ["Чекаут и оплату заказа не трогаю", "Панель склада только получает заявку, её интерфейс не меняю"],
    doneWhen: [
      { id: "window", text: "Кнопка «Вернуть» видна 14 дней после доставки" },
      { id: "partial", text: "Можно вернуть часть товаров заказа" },
      { id: "refund", text: "Возвращается не больше оплаченного, и только один раз", locked: true },
      { id: "tests", text: "Все тесты проходят, ни один не пропущен", locked: true },
    ],
  },
  envelope: {
    limit: 10,
    askAt: 0.8,
    paths: [
      { path: "profile/", access: "write" },
      { path: "server/orders/", access: "write" },
      { path: "server/payments/", access: "write" },
      { path: "migrations/", access: "write" },
      { path: "e2e/", access: "write" },
      { path: "checkout/", access: "read" },
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
  },
  rules: { self: "subtasks and their order within a stage", ask: "a new stage or approval step, scope, anything over +$2" },
  stages: [
    {
      id: "scope",
      title: "Brief",
      steps: [{ id: "brief", status: "done", title: "Бриф и план", work: { agent: "payments-engineer", cost: "$0.40", time: "12m" } }],
      gate: { title: "the brief and plan", mine: true, status: "passed" },
    },
    {
      id: "build",
      title: "Build",
      steps: [
        { id: "form", status: "done", title: "Заявка на возврат в заказе" },
        { id: "api", status: "done", title: "Возвраты на сервере и миграция" },
        { id: "refund", status: "done", title: "Частичный возврат денег в Stripe" },
      ],
    },
    {
      id: "verify",
      title: "Verify",
      steps: [{ id: "e2e", status: "running", title: "e2e: возврат части заказа и повторный вебхук" }],
      gate: { title: "the result", mine: true, status: "ahead" },
    },
  ],
  autoDecisions: [{ id: "1", text: "Отдельная таблица `returns`", why: "у заказа может быть несколько возвратов" }],
  result: {
    claims: [],
    ready: true,
    iterations: [ROUND_1, ROUND_2],
    steps: {
      form: {
        work: { agent: "payments-engineer", cost: "$1.20", time: "35m" },
        result: {
          summary: "Кнопка «Вернуть» в заказе 14 дней после доставки, форма с товарами и причиной. Ссылку на возврат добавил и в итоги заказа в чекауте.",
          files: [
            { name: "profile/ReturnRequest.tsx", added: 96, removed: 0 },
            { name: "checkout/OrderSummary.tsx", added: 6, removed: 1 },
          ],
        },
      },
      api: {
        work: { agent: "payments-engineer", cost: "$1.40", time: "40m" },
        result: {
          summary: "Заявка сохраняется в новой таблице `returns` и уходит на склад.",
          files: [
            { name: "server/orders/returns.ts", added: 74, removed: 0 },
            { name: "migrations/0042_returns.sql", added: 14, removed: 0 },
          ],
        },
      },
      refund: {
        work: { agent: "payments-engineer", cost: "$1.30", time: "30m" },
        result: { summary: "Частичный возврат по тому же PaymentIntent, не больше оплаченного, с ключом идемпотентности.", files: [{ name: "server/payments/refund.ts", added: 38, removed: 0 }] },
      },
      e2e: {
        work: { agent: "test-fixer", cost: "$0.80", time: "20m" },
        result: { summary: "Четыре e2e: часть заказа, срок 14 дней, не больше оплаченного, повторный вебхук.", files: [{ name: "e2e/returns.spec.ts", added: 82, removed: 0 }] },
      },
    },
    transcript: TRANSCRIPT,
    fix: {
      agent: "payments-engineer",
      summary: "Вернул тест на повторный вебхук и починил его; правку `checkout/OrderSummary.tsx` откатил.",
      reply: "Беру в работу: верну пропущенный тест и откачу правку вне брифа. Результат пришлю на приёмку снова.",
    },
  },
};

export const RETURNS_TRANSCRIPT = START;
