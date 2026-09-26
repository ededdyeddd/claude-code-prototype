import type { LiveStatus, Turn } from "./transcripts";

// Step icons (Anthropicons): read a file, run a command, search.
const READ = "";
const RUN = "";
const SEARCH = "";

/**
 * Chats of the astrology-app and storefront projects. The task chats match their state in
 * "Inbox" (see inbox.ts): the last agent message is where the task stands now, and its questions
 * are answered right in it (the same card and state as in the Inbox plan).
 */
export const TASK_TRANSCRIPTS: Record<string, Turn[]> = {
  "light-theme": [
    { role: "user", text: "Добавь в прототип светлую тему с переключателем в меню пользователя." },
    {
      role: "assistant",
      thought: "Ran 3 steps",
      time: "2 hours ago",
      steps: [
        { icon: READ, label: "Read UserMenuButton.tsx" },
        { icon: READ, label: "Read design-system.css", detail: "data-mode=light" },
      ],
      blocks: [
        { type: "p", text: "В дизайн-системе светлая тема уже есть: все токены `--cds-*` переопределены для `data-mode=\"light\"`. Значит, большую часть работы делает CSS, а мне нужно научить приложение переключать режим." },
        { type: "p", text: "Начинаю с переключателя: пункт «Theme» в меню пользователя — System, Light, Dark." },
      ],
    },
    { role: "user", text: "По умолчанию какая?" },
    {
      role: "assistant",
      time: "2 hours ago",
      blocks: [{ type: "p", text: "Системная, как в оригинале: Claude Code следует настройке macOS, пока ты явно не выбрал другую. Выбор сохраню в localStorage — так же хранится ширина панелей." }],
    },
    {
      role: "assistant",
      thought: "Edited 3 files",
      time: "1 hour ago",
      steps: [
        { icon: RUN, label: "Ran npm run typecheck" },
        { icon: SEARCH, label: "Searched the codebase", detail: "data-mode=\"dark\"" },
      ],
      blocks: [
        { type: "p", text: "Переключатель готов и сохраняет выбор. Но светлым стал только сайдбар." },
        {
          type: "files",
          title: "Edited 3 files",
          diff: { added: 114, removed: 9 },
          files: [
            { name: "UserMenuButton.tsx", diff: { added: 64, removed: 3 } },
            { name: "useTheme.ts", diff: { added: 38, removed: 0 } },
            { name: "App.tsx", diff: { added: 12, removed: 6 } },
          ],
        },
        { type: "p", text: "Причина: в 14 местах тема зашита как `data-mode=\"dark\"` — страница токенов, панель плана, Up next, превью ревью. Каждое такое место — своя `.cds-root`, и настройку оно не видит." },
      ],
    },
    { role: "user", text: "Покажи, как выглядит сейчас" },
    {
      role: "assistant",
      thought: "Ran 2 steps",
      time: "50 minutes ago",
      steps: [{ icon: RUN, label: "Took screenshots", detail: "4 screens, light" }],
      blocks: [
        { type: "p", text: "Сайдбар и чат светлые, а панель плана, Up next и `/tokens` — тёмные островки. Выглядит как баг, а не как тема." },
        { type: "p", text: "Ещё заметил: в светлой теме оригинала часть экранов вообще не использует светлые токены — например, превью кода остаётся тёмным. Не уверен, баг это оригинала или так задумано." },
      ],
    },
    {
      role: "assistant",
      thought: "Ran 3 steps",
      time: "45 minutes ago",
      steps: [
        { icon: READ, label: "Read design-system.css", detail: "data-mode=light" },
        { icon: SEARCH, label: "Compared light tokens with the original", detail: "212 colors" },
      ],
      blocks: [
        { type: "p", text: "Прежде чем перекрашивать 14 экранов, нужно решить, откуда брать цвета. Пока не ответишь, экраны не трогаю:" },
        { type: "question", id: "q1" },
      ],
    },
  ],
  "transit-push": [
    { role: "user", text: "Сделай утренний пуш с прогнозом дня по транзитам к натальной карте." },
    {
      role: "assistant",
      thought: "Ran 2 steps",
      time: "18 minutes ago",
      steps: [{ icon: READ, label: "Read docs/brief-push.md" }],
      blocks: [
        { type: "p", text: "Бриф согласован: один пуш в 8:00 по местному времени, текст про самый сильный транзит дня." },
        { type: "question", id: "q1" },
      ],
    },
  ],
  checkout: [
    { role: "user", text: "Сделай новый чекаут: адрес, доставка, оплата картой, письмо о заказе. Критерии приёмки в docs/checkout.md." },
    {
      role: "assistant",
      thought: "Ran 5 steps",
      time: "2 hours ago",
      steps: [
        { icon: READ, label: "Read docs/checkout.md" },
        { icon: RUN, label: "Ran the existing checkout tests" },
      ],
      blocks: [
        { type: "p", text: "Бриф согласован, форму адреса и доставки собрал, тесты зелёные. Дальше упираюсь в оплату — пока не ответишь, её не трогаю:" },
        { type: "question", id: "q1" },
        { type: "p", text: "И про шаблон письма:" },
        { type: "question", id: "q2" },
      ],
    },
  ],
  search: [
    { role: "user", text: "Поиск по каталогу сейчас ищет только по названию. Нужно по описанию и атрибутам, с подсветкой совпадений." },
    {
      role: "assistant",
      thought: "Ran 3 steps",
      time: "1 hour ago",
      steps: [
        { icon: SEARCH, label: "Searched the codebase", detail: "search, meilisearch" },
        { icon: RUN, label: "Exported 30 days of search queries" },
      ],
      blocks: [
        { type: "p", text: "Разобрал запросы за 30 дней: 18% уходят в пустую выдачу, почти всё — поиск по цвету и материалу." },
        { type: "p", text: "Пишу бриф. Один вопрос по ходу:" },
        { type: "question", id: "q1" },
      ],
    },
  ],
  i18n: [
    { role: "user", text: "Переведи витрину на испанский: интерфейс, карточки товаров и письма. В конце вычитку сделает носитель." },
    {
      role: "assistant",
      thought: "Ran 4 steps",
      time: "20 minutes ago",
      steps: [
        { icon: RUN, label: "Extracted 1,240 strings" },
        { icon: RUN, label: "Translated the UI strings" },
      ],
      blocks: [
        { type: "brief-card" },
        { type: "p", text: "Строки интерфейса вынесены и переведены. Сейчас перевожу карточки товаров, потом письма." },
        { type: "p", text: "Вычитка носителем по плану около 17:30." },
      ],
    },
  ],
  "promo-codes": [
    { role: "user", text: "Добавь промокоды в корзину: поле ввода, проверка на сервере, скидка в итоговой сумме." },
    {
      role: "assistant",
      thought: "Pushed",
      thoughtTarget: "main",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Промокоды готовы и смержены в main: поле в корзине, проверка через `POST /promo/validate`, скидка отдельной строкой в итоге." },
        { type: "status", label: "Edited 6 files", diff: { added: 318, removed: 27 } },
      ],
    },
  ],
  flaky: [
    { role: "user", text: "Тесты расчёта домов то падают, то проходят. Разберись, в чём дело." },
    {
      role: "assistant",
      thought: "Ran 3 steps",
      time: "2 hours ago",
      steps: [
        { icon: RUN, label: "Collected CI failures for 30 days" },
        { icon: READ, label: "Read src/ephemeris/houses.test.ts" },
      ],
      blocks: [
        { type: "p", text: "Падают 3 теста системы домов Плацидуса: они зависят от часового пояса CI-раннера, и на границе суток результат сдвигается." },
        { type: "p", text: "Сам тем временем фиксирую таймзону в тестах. И вопрос про карантин:" },
        { type: "question", id: "q1" },
      ],
    },
  ],
  "chart-pdf": [
    { role: "user", text: "Сделай экспорт натальной карты в PDF: круг карты, таблица позиций и расшифровки." },
    {
      role: "assistant",
      thought: "Ran 6 steps",
      time: "4 minutes ago",
      steps: [
        { icon: RUN, label: "Rendered the chart wheel to SVG" },
        { icon: RUN, label: "Built the PDF with react-pdf" },
      ],
      blocks: [
        { type: "p", text: "PDF собирается: круг карты, таблица планет и домов, расшифровки по разделам. Черновик PR открыт." },
        { type: "p", text: "Сейчас гоняю e2e на стейджинге. Приёмка за тобой — по очереди CI завтра около 11:00." },
      ],
    },
  ],
  "ephemeris-api": [
    { role: "user", text: "Какой API эфемерид взять для расчёта натальной карты: свой Swiss Ephemeris или готовый сервис?" },
    {
      role: "assistant",
      thought: "Ran 2 steps",
      time: "2 days ago",
      steps: [{ icon: SEARCH, label: "Searched the web", detail: "ephemeris API pricing, Swiss Ephemeris license" }],
      blocks: [
        { type: "p", text: "Рекомендую свой сервер на Swiss Ephemeris: точность та же, что у платных API, а цена не растёт с числом пользователей." },
        {
          type: "table",
          head: ["Вариант", "Цена", "Минус"],
          rows: [
            ["Swiss Ephemeris на сервере", "Хостинг ~$20/мес", "Лицензия AGPL или платная"],
            ["Astrology API", "$0.002 за расчёт", "Зависимость от стороннего сервиса"],
          ],
        },
      ],
    },
  ],
};

/** What the running task chats are doing now. */
export const TASK_LIVE_STATUS: Record<string, LiveStatus> = {
  "light-theme": { step: "Switching screens to the theme setting", stats: "9m · 540K tokens" },
  "transit-push": { step: "Wiring the push module", target: "notifications/", stats: "5m · 230K tokens" },
  checkout: { step: "Writing the payment webhook", target: "api/stripe.ts", stats: "12m · 1.3M tokens" },
  search: { step: "Drafting the brief", target: "docs/search.md", stats: "8m · 410K tokens" },
  i18n: { step: "Translating product cards", target: "locales/es/products.json", stats: "20m · 860K tokens" },
  flaky: { step: "Pinning the time zone in tests", target: "houses.test.ts", stats: "6m · 95K tokens" },
  "chart-pdf": { step: "Running e2e on staging", stats: "4m · 320K tokens" },
  "birth-date": { step: "Adding a test for UTC−5", target: "profile.test.ts", stats: "3m · 40K tokens" },
};
