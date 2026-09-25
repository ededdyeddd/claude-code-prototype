/** Mock data for the "Inbox" start screen: tasks, their plans and the agent's questions. */

/** Status is shown by shape, not color: ✓ done, ● running, ○ ahead, ‖ waits for you, ◇ gate, ◆ your gate. */
export type Status = "done" | "running" | "ahead" | "waiting" | "gate" | "myGate";

/** One line of "what changes in the plan" under an answer option. */
/**
 * What an option does to the plan. `step` is the plan step it touches: removed or changed for "remove"/"change";
 * for "add"/"gate" the new item goes right after it.
 */
export type PlanDiff = {
  kind: "add" | "change" | "remove" | "gate";
  text: string;
  step: string;
  /** Estimate for a new step or gate: who does it and roughly what it costs. Gates are done by you ("you", no cost). */
  agent?: string;
  cost?: string;
  time?: string;
  /** Where the estimate comes from; defaults to the agent's own estimate. */
  basis?: string;
};

export type Option = {
  id: string;
  label: string;
  recommended?: boolean;
  cost: string;
  toAcceptance: string;
  reversible: string;
  forecastSource: string;
  diff: PlanDiff[];
};

export type Question = {
  id: string;
  /** Blocking questions stop the task; the rest wait until the person has time. */
  blocking: boolean;
  text: string;
  context?: string;
  options: Option[];
};

export type PlanStep = { id: string; status: Status; title: string; note?: string; question?: Question };

export type Stage = {
  id: string;
  title: string;
  steps: PlanStep[];
  /** Stop after the stage: `mine` — the person approves; otherwise an automatic check. `title` reads after "You approve …" / "Check: …". */
  gate?: { title: string; mine?: boolean; status: "passed" | "ahead"; eta?: string; etaSource?: string };
};

export type AutoDecision = { id: string; text: string; why: string };

export type Task = {
  id: string;
  title: string;
  /** One or two sentences from the agent: what the task does and when it is done. */
  brief: string;
  project: string;
  stage: string;
  /** "Stage · what is happening" line. */
  now: string;
  waitingFor?: string;
  /** Agent working on the task (named by its role), its model, and what the task has used so far. */
  agent: string;
  model: string;
  spent: string;
  tokens: string;
  /** How the task reaches the person: pushed right away or in the 16:00 digest. */
  delivery?: "push" | "digest";
  stages: Stage[];
  autoDecisions: AutoDecision[];
};

/** The away window. Decisions and spend are counted from TASKS, so the recap matches the lists behind it. */
export const AWAY = {
  window: "14:00–16:00",
  checks: [
    { taskId: "checkout", text: "Unit tests pass" },
    { taskId: "i18n", text: "No missing translation keys" },
    { taskId: "chart-pdf", text: "PDF renders for 3 test charts" },
    { taskId: "light-theme", text: "Theme toggle: visual diff clean" },
    { taskId: "search", text: "Query export matches the schema" },
  ],
  /**
   * Shown only for what needs the person, is not a question inside one task, and stops agents.
   * Self-healed events (retries, flaky tests) stay in the recap, not here.
   */
  alarm: { text: "GitHub token for storefront expired. Agents can't push.", action: "Reconnect" } as { text: string; action: string } | null,
};

export const TASKS: Task[] = [
  {
    id: "light-theme",
    agent: "ui-engineer",
    model: "Opus 5.5",
    spent: "$1.80",
    tokens: "540K",
    title: "Светлая тема прототипа",
    brief: "Добавляю в прототип светлую тему с переключателем в меню пользователя. Готово, когда все экраны в светлой теме совпадают с оригиналом.",
    project: "yango-prototype",
    stage: "Build",
    now: "Build · waiting on the palette",
    waitingFor: "45m",
    delivery: "push",
    stages: [
      {
        id: "s1",
        title: "Build",
        steps: [
          { id: "a", status: "done", title: "Переключатель темы в меню пользователя" },
          {
            id: "b",
            status: "waiting",
            title: "Палитра светлой темы",
            question: {
              id: "q1",
              blocking: true,
              text: "Светлые цвета брать из токенов оригинала или подобрать заново?",
              context: "В design-system.css уже есть значения для data-mode=light, но часть экранов их не использует.",
              options: [
                {
                  id: "tokens",
                  label: "Из токенов оригинала",
                  recommended: true,
                  cost: "~$1",
                  toAcceptance: "~30m",
                  reversible: "Yes, only data-mode changes",
                  forecastSource: "3 similar tasks",
                  diff: [
                    { kind: "add", text: "Перевести экраны на data-mode из настройки", step: "b", agent: "ui-engineer", cost: "~$0.60", time: "~25m" },
                    { kind: "remove", text: "Подбор палитры", step: "p" },
                  ],
                },
                {
                  id: "new",
                  label: "Подобрать заново",
                  cost: "~$4",
                  toAcceptance: "~2h",
                  reversible: "Partly: new tokens stay",
                  forecastSource: "the task plan",
                  diff: [
                    { kind: "add", text: "Новые токены --cds-* для светлой темы", step: "p", agent: "ui-engineer", cost: "~$2.40", time: "~1h 20m", basis: "3 similar tasks" },
                    { kind: "gate", text: "Ты проверяешь палитру на /tokens", step: "p", agent: "you", time: "~15m" },
                  ],
                },
              ],
            },
          },
          { id: "p", status: "ahead", title: "Подбор палитры" },
          { id: "c", status: "ahead", title: "Сверка экранов с оригиналом" },
        ],
        gate: { title: "the light theme", mine: true, status: "ahead", eta: "~17:00", etaSource: "3 similar tasks" },
      },
    ],
    autoDecisions: [
      { id: "1", text: "Сохраняю тему в localStorage", why: "как ширину панелей" },
      { id: "2", text: "По умолчанию тема системы", why: "так в оригинале" },
    ],
  },
  {
    id: "checkout",
    agent: "payments-engineer",
    model: "Opus 5.5",
    spent: "$4.20",
    tokens: "1.3M",
    title: "Новый чекаут",
    brief: "Собираю новый чекаут для storefront: адрес, доставка, оплата картой и письмо о заказе. Готово, когда проходят критерии приёмки из docs/checkout.md.",
    project: "storefront",
    stage: "Build",
    now: "Build · waiting on payments",
    waitingFor: "32m",
    delivery: "push",
    stages: [
      {
        id: "s1",
        title: "Brief",
        steps: [
          { id: "a", status: "done", title: "Сценарии оплаты и возвратов" },
          { id: "b", status: "done", title: "Критерии приёмки" },
        ],
        gate: { title: "the brief", mine: true, status: "passed" },
      },
      {
        id: "s2",
        title: "Build",
        steps: [
          { id: "c", status: "done", title: "Форма адреса и доставки" },
          {
            id: "d",
            status: "waiting",
            title: "Провайдер оплаты",
            question: {
              id: "q1",
              blocking: true,
              text: "Stripe Checkout или своя форма на Payment Element?",
              context: "От этого зависят форма карты, 3-D Secure и то, как считаем налоги.",
              options: [
                {
                  id: "hosted",
                  label: "Stripe Checkout, страница Stripe",
                  recommended: true,
                  cost: "~$3",
                  toAcceptance: "~1h",
                  reversible: "Yes, form is isolated",
                  forecastSource: "12 similar tasks",
                  diff: [
                    { kind: "remove", text: "Своя форма карты и валидация", step: "x" },
                    { kind: "change", text: "Редирект на страницу Stripe вместо модалки", step: "y" },
                    { kind: "add", text: "Вебхук checkout.session.completed", step: "d", agent: "payments-engineer", cost: "~$0.70", time: "~25m" },
                  ],
                },
                {
                  id: "element",
                  label: "Своя форма на Payment Element",
                  cost: "~$9",
                  toAcceptance: "~3h",
                  reversible: "Partly: affects styles",
                  forecastSource: "4 similar tasks, rough",
                  diff: [
                    { kind: "add", text: "Компонент CardForm и состояния ошибок", step: "x", agent: "payments-engineer", cost: "~$3.50", time: "~2h", basis: "4 similar tasks, wide spread" },
                    { kind: "change", text: "Плюс сценарии 3-D Secure", step: "g" },
                    { kind: "gate", text: "Ты проверяешь форму перед мержем", step: "x", agent: "you", time: "~20m" },
                  ],
                },
              ],
            },
          },
          { id: "x", status: "ahead", title: "Своя форма карты и валидация" },
          { id: "y", status: "ahead", title: "Экран после оплаты" },
          {
            id: "e",
            status: "waiting",
            title: "Письмо о заказе",
            question: {
              id: "q2",
              blocking: false,
              text: "Оставить текущий шаблон письма или сделать новый?",
              options: [
                {
                  id: "keep",
                  label: "Оставить текущий",
                  recommended: true,
                  cost: "$0",
                  toAcceptance: "Same",
                  reversible: "Yes",
                  forecastSource: "the task plan",
                  diff: [{ kind: "remove", text: "Новый шаблон письма", step: "z" }],
                },
                {
                  id: "new",
                  label: "Новый шаблон",
                  cost: "~$2",
                  toAcceptance: "+40m",
                  reversible: "Yes",
                  forecastSource: "3 similar tasks",
                  diff: [{ kind: "add", text: "Превью письма в Storybook", step: "z", agent: "payments-engineer", cost: "~$0.40", time: "~15m" }],
                },
              ],
            },
          },
          { id: "z", status: "ahead", title: "Новый шаблон письма" },
          { id: "f", status: "ahead", title: "Налоги и итоговая сумма" },
        ],
        gate: { title: "tests and e2e pass", status: "ahead" },
      },
      {
        id: "s3",
        title: "Review",
        steps: [
          { id: "g", status: "ahead", title: "Прогон на стейджинге" },
          { id: "h", status: "ahead", title: "Сводка изменений и риски" },
        ],
        gate: { title: "the result", mine: true, status: "ahead", eta: "~18:30", etaSource: "12 similar tasks" },
      },
    ],
    autoDecisions: [
      { id: "1", text: "Взял zod для валидации адреса", why: "уже используется в проекте" },
      { id: "2", text: "Разбил форму на три шага", why: "так в макете" },
      { id: "3", text: "Отложил Apple Pay", why: "нет в критериях приёмки" },
      { id: "4", text: "Обновил @stripe/stripe-js до 4.x", why: "нужен для Checkout" },
    ],
  },
  {
    id: "transit-push",
    agent: "notifications-engineer",
    model: "Sonnet 5",
    spent: "$0.70",
    tokens: "230K",
    title: "Пуши о транзитах",
    brief: "Делаю утренний пуш с прогнозом дня по самому сильному транзиту к натальной карте. Один пуш в день, в 8:00 по местному времени.",
    project: "astrology-app",
    stage: "Build",
    now: "Build · waiting on the push service",
    waitingFor: "18m",
    delivery: "push",
    stages: [
      {
        id: "s1",
        title: "Brief",
        steps: [{ id: "a", status: "done", title: "Какие транзиты считаем важными" }],
        gate: { title: "the brief", mine: true, status: "passed" },
      },
      {
        id: "s2",
        title: "Build",
        steps: [
          {
            id: "b",
            status: "waiting",
            title: "Сервис пушей",
            question: {
              id: "q1",
              blocking: true,
              text: "Expo Push или OneSignal?",
              context: "Expo бесплатен и уже в стеке, OneSignal даёт сегменты и A/B-тесты текстов.",
              options: [
                {
                  id: "expo",
                  label: "Expo Push",
                  recommended: true,
                  cost: "~$1",
                  toAcceptance: "~1h",
                  reversible: "Yes, behind one module",
                  forecastSource: "5 similar tasks",
                  diff: [
                    { kind: "add", text: "Модуль notifications/expo.ts", step: "b", agent: "notifications-engineer", cost: "~$0.50", time: "~30m" },
                    { kind: "remove", text: "Сегменты аудитории", step: "s" },
                  ],
                },
                {
                  id: "onesignal",
                  label: "OneSignal",
                  cost: "~$3",
                  toAcceptance: "~2h",
                  reversible: "Partly: SDK in the app",
                  forecastSource: "2 similar tasks, rough",
                  diff: [
                    { kind: "add", text: "SDK OneSignal и ключи в настройках", step: "b", agent: "notifications-engineer", cost: "~$1.20", time: "~1h" },
                    { kind: "gate", text: "Ты настраиваешь аккаунт OneSignal", step: "b", agent: "you", time: "~20m" },
                  ],
                },
              ],
            },
          },
          { id: "c", status: "ahead", title: "Утренний пуш с прогнозом" },
          { id: "s", status: "ahead", title: "Сегменты аудитории" },
        ],
        gate: { title: "the first push on a real phone", mine: true, status: "ahead", eta: "~18:00", etaSource: "5 similar tasks" },
      },
    ],
    autoDecisions: [
      { id: "1", text: "Пуш в 8:00 по местному времени", why: "как в брифе" },
      { id: "2", text: "Не больше одного пуша в день", why: "чтобы не отписывались" },
      { id: "3", text: "Тексты пушей генерирует Claude API", why: "как расшифровки карты" },
    ],
  },
  {
    id: "search",
    agent: "search-tuner",
    model: "Sonnet 5",
    spent: "$0.90",
    tokens: "410K",
    title: "Поиск по каталогу",
    brief: "Расширяю поиск: искать по описанию и атрибутам и подсвечивать совпадения. Сейчас 18% запросов уходят в пустую выдачу.",
    project: "storefront",
    stage: "Brief",
    now: "Brief · waiting on ranking",
    waitingFor: "1h 10m",
    delivery: "digest",
    stages: [
      {
        id: "s1",
        title: "Brief",
        steps: [
          { id: "a", status: "done", title: "Разбор текущих запросов" },
          {
            id: "b",
            status: "waiting",
            title: "Ранжирование",
            question: {
              id: "q1",
              blocking: false,
              text: "Учитывать наличие на складе в ранжировании?",
              options: [
                {
                  id: "yes",
                  label: "Да, товары в наличии выше",
                  recommended: true,
                  cost: "~$2",
                  toAcceptance: "+30m",
                  reversible: "Yes, config weight",
                  forecastSource: "the task plan",
                  diff: [{ kind: "add", text: "Вес stock в формуле ранжирования", step: "d", agent: "search-tuner", cost: "~$0.60", time: "~30m" }],
                },
                {
                  id: "no",
                  label: "Нет, только релевантность",
                  cost: "$0",
                  toAcceptance: "Same",
                  reversible: "Yes",
                  forecastSource: "the task plan",
                  diff: [{ kind: "remove", text: "Синк остатков в индекс", step: "e" }],
                },
              ],
            },
          },
        ],
        gate: { title: "the brief", mine: true, status: "ahead", eta: "~16:40", etaSource: "the task plan" },
      },
      {
        id: "s2",
        title: "Build",
        steps: [
          { id: "c", status: "ahead", title: "Индекс и синк" },
          { id: "e", status: "ahead", title: "Синк остатков в индекс" },
          { id: "d", status: "ahead", title: "Выдача и подсветка" },
        ],
      },
    ],
    autoDecisions: [
      { id: "1", text: "Оставил Meilisearch", why: "уже развёрнут" },
      { id: "2", text: "Выкинул опечатки из MVP", why: "есть из коробки" },
    ],
  },
  {
    id: "flaky",
    agent: "test-fixer",
    model: "Haiku 4.5",
    spent: "$0.12",
    tokens: "95K",
    title: "Флакующие тесты эфемерид",
    brief: "Три теста расчёта домов падают через раз из-за часового пояса CI. Чиню тесты, а пока предлагаю карантин.",
    project: "astrology-app",
    stage: "Triage",
    now: "Triage · waiting on quarantine",
    waitingFor: "2h",
    delivery: "digest",
    stages: [
      {
        id: "s1",
        title: "Triage",
        steps: [
          { id: "a", status: "done", title: "Собрать падения за 30 дней" },
          {
            id: "b",
            status: "waiting",
            title: "Карантин",
            question: {
              id: "q1",
              blocking: false,
              text: "Отправить 3 теста расчёта домов в карантин, пока чиним?",
              options: [
                {
                  id: "yes",
                  label: "Да, в карантин",
                  recommended: true,
                  cost: "~$1",
                  toAcceptance: "~20m",
                  reversible: "Yes, config flag",
                  forecastSource: "the CI history",
                  diff: [{ kind: "add", text: "Метка quarantine и отчёт раз в день", step: "b", agent: "test-fixer", cost: "~$0.30", time: "~20m" }],
                },
                {
                  id: "no",
                  label: "Нет, чинить сразу",
                  cost: "~$6",
                  toAcceptance: "~2h",
                  reversible: "Yes",
                  forecastSource: "2 similar tasks",
                  diff: [{ kind: "change", text: "Сразу, без карантина, до следующего релиза", step: "c" }],
                },
              ],
            },
          },
          { id: "c", status: "ahead", title: "Починить тесты домов" },
        ],
      },
    ],
    autoDecisions: [{ id: "1", text: "Перезапустил упавший прогон", why: "падение не воспроизвелось" }],
  },
  {
    id: "i18n",
    agent: "i18n-translator",
    model: "Sonnet 5",
    spent: "$2.10",
    tokens: "860K",
    title: "Локализация на испанский",
    brief: "Перевожу витрину на испанский: интерфейс, карточки товаров и письма. В конце — вычитка носителем.",
    project: "storefront",
    stage: "Build",
    now: "Build · translating product cards",
    stages: [
      {
        id: "s1",
        title: "Build",
        steps: [
          { id: "a", status: "done", title: "Вынести строки" },
          { id: "b", status: "running", title: "Карточки товаров" },
          { id: "c", status: "ahead", title: "Письма" },
        ],
        gate: { title: "the Spanish copy", mine: true, status: "ahead", eta: "~17:30", etaSource: "this task's pace" },
      },
    ],
    autoDecisions: [],
  },
  {
    id: "chart-pdf",
    agent: "ui-engineer",
    model: "Opus 5.5",
    spent: "$1.05",
    tokens: "320K",
    title: "PDF натальной карты",
    brief: "Делаю экспорт натальной карты в PDF: круг карты, таблица позиций и расшифровки по разделам.",
    project: "astrology-app",
    stage: "Review",
    now: "Review · running e2e",
    stages: [
      {
        id: "s1",
        title: "Review",
        steps: [{ id: "a", status: "running", title: "e2e на стейджинге" }],
        gate: { title: "the result", mine: true, status: "ahead", eta: "tomorrow ~11:00", etaSource: "the CI queue" },
      },
    ],
    autoDecisions: [],
  },
];

export const questionsOf = (t: Task) =>
  t.stages.flatMap((s) => s.steps.map((p) => p.question).filter((q): q is Question => !!q));

/** Who works on each step and what it costs: actual for done steps, estimate (~) for the rest. Key: `${taskId}:${stepId}`. */
export type StepWork = {
  agent: string;
  cost: string;
  time: string;
  /** Where a forecast (~) comes from, e.g. "14 similar steps in storefront". Defaults to the agent's own estimate. */
  basis?: string;
};

export const STEP_WORK: Record<string, StepWork> = {
  "light-theme:a": { agent: "ui-engineer", cost: "$0.60", time: "18m" },
  "light-theme:b": { agent: "ui-engineer", cost: "$0.40", time: "9m" },
  "light-theme:p": { agent: "ui-engineer", cost: "~$1.20", time: "~40m", basis: "3 similar tasks" },
  "light-theme:c": { agent: "test-fixer", cost: "~$0.50", time: "~20m", basis: "9 similar checks in yango-prototype" },
  "checkout:a": { agent: "planner", cost: "$0.30", time: "6m" },
  "checkout:b": { agent: "planner", cost: "$0.20", time: "4m" },
  "checkout:c": { agent: "payments-engineer", cost: "$1.60", time: "38m" },
  "checkout:d": { agent: "payments-engineer", cost: "$0.90", time: "12m" },
  "checkout:e": { agent: "payments-engineer", cost: "$0.10", time: "2m" },
  "checkout:x": { agent: "payments-engineer", cost: "~$2.00", time: "~1h", basis: "4 similar tasks" },
  "checkout:y": { agent: "payments-engineer", cost: "~$0.60", time: "~20m" },
  "checkout:z": { agent: "payments-engineer", cost: "~$0.50", time: "~20m" },
  "checkout:f": { agent: "payments-engineer", cost: "~$0.80", time: "~25m", basis: "14 similar steps in storefront" },
  "checkout:g": { agent: "test-fixer", cost: "~$0.40", time: "~15m", basis: "the last 20 CI runs" },
  "checkout:h": { agent: "planner", cost: "~$0.20", time: "~5m" },
  "transit-push:a": { agent: "planner", cost: "$0.30", time: "8m" },
  "transit-push:b": { agent: "notifications-engineer", cost: "$0.25", time: "5m" },
  "transit-push:c": { agent: "notifications-engineer", cost: "~$0.60", time: "~30m", basis: "5 similar tasks" },
  "transit-push:s": { agent: "notifications-engineer", cost: "~$0.80", time: "~45m", basis: "2 similar tasks" },
  "search:a": { agent: "planner", cost: "$0.40", time: "14m" },
  "search:b": { agent: "search-tuner", cost: "$0.50", time: "8m" },
  "search:c": { agent: "search-tuner", cost: "~$1.20", time: "~40m" },
  "search:d": { agent: "search-tuner", cost: "~$0.80", time: "~30m", basis: "6 similar steps" },
  "search:e": { agent: "search-tuner", cost: "~$0.40", time: "~20m" },
  "flaky:a": { agent: "test-fixer", cost: "$0.08", time: "5m" },
  "flaky:b": { agent: "test-fixer", cost: "$0.04", time: "2m" },
  "flaky:c": { agent: "test-fixer", cost: "~$0.30", time: "~40m", basis: "2 similar fixes" },
  "i18n:a": { agent: "i18n-translator", cost: "$0.60", time: "20m" },
  "i18n:b": { agent: "i18n-translator", cost: "$1.50", time: "20m" },
  "i18n:c": { agent: "i18n-translator", cost: "~$0.40", time: "~15m", basis: "this task's pace, 62 strings a minute" },
  "chart-pdf:a": { agent: "ui-engineer", cost: "$1.05", time: "4m" },
};

/** What a finished step produced: the agent's summary, decisions it made on the way, and changed files. Key: `${taskId}:${stepId}`. */
export type StepResult = {
  summary: string;
  decisions?: string[];
  files?: { name: string; added: number; removed: number }[];
};

export const STEP_RESULT: Record<string, StepResult> = {
  "light-theme:a": {
    summary: "Добавил пункт «Theme» в меню пользователя: System, Light, Dark. Выбор сохраняется между сессиями и сразу применяется ко всем экранам.",
    decisions: ["По умолчанию тема системы — так в оригинале", "Сохраняю выбор в localStorage, как ширину панелей"],
    files: [
      { name: "src/components/UserMenuButton.tsx", added: 64, removed: 3 },
      { name: "src/data/useTheme.ts", added: 38, removed: 0 },
      { name: "src/App.tsx", added: 12, removed: 6 },
    ],
  },
  "checkout:a": {
    summary: "Описал 6 сценариев: оплата картой, 3-D Secure, отказ банка, частичный и полный возврат, повтор после ошибки. Для каждого — ожидаемое поведение и тексты ошибок.",
    files: [{ name: "docs/checkout.md", added: 96, removed: 0 }],
  },
  "checkout:b": {
    summary: "Критерии приёмки: e2e на все 6 сценариев, итоговая сумма совпадает с корзиной до цента, письмо о заказе уходит в течение минуты.",
    decisions: ["Apple Pay не входит в первую версию — его нет в сценариях"],
    files: [{ name: "docs/checkout.md", added: 31, removed: 2 }],
  },
  "checkout:c": {
    summary: "Форма адреса и выбора доставки в три шага, с подсказками адреса и валидацией на клиенте и сервере. Тесты зелёные.",
    decisions: ["Взял zod для валидации адреса — он уже в проекте", "Разбил форму на три шага, как в макете"],
    files: [
      { name: "src/checkout/AddressStep.tsx", added: 212, removed: 0 },
      { name: "src/checkout/DeliveryStep.tsx", added: 148, removed: 0 },
      { name: "src/checkout/schema.ts", added: 54, removed: 0 },
      { name: "src/checkout/CheckoutPage.tsx", added: 86, removed: 41 },
      { name: "tests/checkout/address.spec.ts", added: 118, removed: 0 },
    ],
  },
  "transit-push:a": {
    summary: "Важными считаем транзиты Солнца, Луны и медленных планет к Солнцу, Луне и Асценденту натальной карты, с орбисом до 1°. Так в день набирается 1–3 события.",
    files: [{ name: "docs/brief-push.md", added: 42, removed: 0 }],
  },
  "search:a": {
    summary: "Разобрал 30 дней запросов: 18% уходят в пустую выдачу. Почти все — поиск по цвету и материалу, которых нет в названиях товаров.",
    files: [{ name: "analysis/search-queries.ipynb", added: 310, removed: 0 }],
  },
  "flaky:a": {
    summary: "За 30 дней 41 падение, все в трёх тестах системы домов Плацидуса. Падают только на раннерах с часовым поясом UTC−5 около полуночи.",
    decisions: ["Перезапустил упавший прогон — падение не воспроизвелось"],
    files: [{ name: "reports/flaky-houses.md", added: 27, removed: 0 }],
  },
  "i18n:a": {
    summary: "Вынес 1 240 строк интерфейса в locales/en и подключил i18next. Ни одной строки в коде не осталось, проверено линтером.",
    files: [
      { name: "locales/en/common.json", added: 1240, removed: 0 },
      { name: "src/i18n.ts", added: 28, removed: 0 },
      { name: "src/**/*.tsx (84 files)", added: 910, removed: 910 },
    ],
  },
};
