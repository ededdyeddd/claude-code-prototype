/** Inbox mocks: tasks with their plans and the agent's questions, and the away recap. Model: task.ts. */
import type { AutoDecision, Stage, StepResult, StepWork, Task } from "./task";
import { CHAT_TASK_LIST } from "./chatTasks";
import { CHART_PDF_BRIEF, CHART_PDF_ENVELOPE, CHART_PDF_RESULT } from "./chartPdf";

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
};

/** Inbox tasks as authored; step work and results come from STEP_WORK / STEP_RESULT below. */
const INBOX_TASKS: (Omit<Task, "stages"> & { stages: Stage[]; autoDecisions: AutoDecision[] })[] = [
  {
    id: "light-theme",
    agent: "ui-engineer",
    model: "Opus 5.5",
    spent: "$1.80",
    tokens: "540K",
    title: "Светлая тема прототипа",
    summary: "Добавляю в прототип светлую тему с переключателем в меню пользователя. Готово, когда все экраны в светлой теме совпадают с оригиналом.",
    project: "yango-prototype",
    stage: "Build",
    now: "Build · waiting on the palette",
    waitingFor: "45m",
    delivery: "push",
    level: 3,
    levelReason: "it changes 14 screens, and 3 similar tasks took over 2 hours",
    brief: {
      understanding:
        "В прототипе только тёмная тема. Делаю светлую и переключатель в меню пользователя: System, Light, Dark. Готово, когда каждый экран в светлой теме совпадает с оригиналом.",
      found: [
        { text: "Тема зашита как `data-mode=\"dark\"` в 14 местах: /tokens, панель плана, Up next, превью ревью и 10 мелких. Каждое — своя `.cds-root`, настройку не видит", source: "Поиск по `src/`" },
        { text: "Значения для `data-mode=light` в дизайн-системе уже есть, но часть экранов их не использует", source: "`src/styles/design-system.css`" },
      ],
      assumptions: [
        { id: "default", text: "По умолчанию — тема системы, как в оригинале" },
        { id: "storage", text: "Выбор храню в localStorage, как ширину панелей" },
      ],
      boundaries: ["`design-system.css` не правлю: это скомпилированный оригинал", "Цвета — только из токенов `--cds-*`"],
      doneWhen: [
        { id: "match", text: "Каждый экран в светлой теме совпадает с оригиналом" },
        { id: "contrast", text: "Контраст текста не ниже AA" },
        { id: "build", text: "typecheck и build проходят", locked: true },
      ],
    },
    stages: [
      {
        id: "s0",
        title: "Toggle",
        steps: [
          { id: "a", status: "done", title: "Переключатель темы в меню пользователя" },
          { id: "t", status: "done", title: "Найти экраны с зашитой тёмной темой" },
        ],
      },
      {
        id: "s1",
        title: "Build",
        steps: [
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
          { id: "s", status: "ahead", title: "Перевести 14 экранов на настройку темы" },
          { id: "i", status: "ahead", title: "Иконки и превью кода в светлой теме" },
        ],
        gate: { title: "typecheck and build pass", status: "ahead" },
      },
      {
        id: "s2",
        title: "Verify",
        steps: [
          { id: "c", status: "ahead", title: "Сверка экранов с оригиналом" },
          { id: "d", status: "ahead", title: "Проверка контраста текста" },
        ],
        gate: { title: "the light theme", mine: true, status: "ahead", eta: "17:00", etaSource: "3 similar tasks" },
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
    summary: "Собираю новый чекаут для storefront: адрес, доставка, оплата картой и письмо о заказе. Готово, когда проходят критерии приёмки из docs/checkout.md.",
    project: "storefront",
    stage: "Build",
    now: "Build · waiting on payments",
    waitingFor: "32m",
    delivery: "push",
    level: 3,
    levelReason: "payments are risky, and it touches the cart, orders and emails",
    brief: {
      understanding:
        "Новый чекаут в три шага: адрес, доставка, оплата картой, потом письмо о заказе. Готово, когда проходят критерии приёмки из `docs/checkout.md`.",
      found: [
        { text: "6 сценариев оплаты: картой, 3-D Secure, отказ банка, частичный и полный возврат, повтор после ошибки", source: "`docs/checkout.md`" },
        { text: "zod уже используется в проекте — беру его для валидации адреса", source: "`package.json`" },
      ],
      assumptions: [
        { id: "steps", text: "Форма — три шага, как в макете" },
        { id: "applepay", text: "Apple Pay не входит в первую версию: его нет в сценариях" },
        { id: "sum", text: "Итог считаю на сервере, клиент только показывает", risky: true, why: "Если сумма разойдётся с корзиной, покупатель заплатит не то", confirmed: true },
      ],
      boundaries: ["Корзину и промокоды не трогаю — только читаю", "Живые платежи — только после ревью, до него тестовый режим Stripe"],
      doneWhen: [
        { id: "e2e", text: "e2e на все 6 сценариев зелёные", locked: true },
        { id: "sum", text: "Итоговая сумма совпадает с корзиной до цента", locked: true },
        { id: "email", text: "Письмо о заказе уходит в течение минуты" },
      ],
    },
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
        gate: { title: "the result", mine: true, status: "ahead", eta: "18:30", etaSource: "12 similar tasks" },
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
    summary: "Делаю утренний пуш с прогнозом дня по самому сильному транзиту к натальной карте. Один пуш в день, в 8:00 по местному времени.",
    project: "astrology-app",
    stage: "Build",
    now: "Build · waiting on the push service",
    waitingFor: "18m",
    delivery: "push",
    level: 3,
    levelReason: "pushes go to real users and can't be taken back",
    brief: {
      understanding: "Каждое утро в 8:00 по местному времени — один пуш с прогнозом дня по самому сильному транзиту к натальной карте.",
      found: [
        { text: "Важные транзиты — Солнце, Луна и медленные планеты к Солнцу, Луне и Асценденту, орбис до 1°. Так в день набирается 1–3 события", source: "Эфемериды за 90 дней по 200 картам" },
      ],
      assumptions: [
        { id: "one", text: "Не больше одного пуша в день, чтобы не отписывались" },
        { id: "text", text: "Тексты пушей генерирует Claude API, как расшифровки карты" },
        { id: "tz", text: "8:00 — по поясу телефона, а не места рождения", risky: true, why: "Пуш посреди ночи — повод отключить уведомления", confirmed: true },
      ],
      boundaries: ["Расчёт транзитов не меняю — только читаю", "На всю базу не отправляю до проверки на реальном телефоне"],
      doneWhen: [
        { id: "phone", text: "Пуш приходит в 8:00 на реальном телефоне в двух поясах" },
        { id: "daily", text: "Одному человеку — не больше одного пуша в день", locked: true },
      ],
    },
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
        gate: { title: "the first push on a real phone", mine: true, status: "ahead", eta: "18:00", etaSource: "5 similar tasks" },
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
    summary: "Расширяю поиск: искать по описанию и атрибутам и подсвечивать совпадения. Сейчас 18% запросов уходят в пустую выдачу.",
    project: "storefront",
    stage: "Brief",
    now: "Brief · waiting on ranking",
    waitingFor: "1h 10m",
    delivery: "digest",
    level: 3,
    levelReason: "a new index and stock sync, and 4 similar tasks took over a day",
    brief: {
      understanding: "Ищем не только по названию, но и по описанию и атрибутам, и подсвечиваем совпадения. Сейчас 18% запросов уходят в пустую выдачу.",
      found: [
        { text: "18% запросов за 30 дней уходят в пустую выдачу. Почти все — поиск по цвету и материалу, которых нет в названиях товаров", source: "Логи поиска за 30 дней" },
        { text: "Meilisearch уже развёрнут, опечатки он исправляет из коробки", source: "`infra/search/`" },
      ],
      assumptions: [
        { id: "engine", text: "Остаюсь на Meilisearch" },
        { id: "fields", text: "Ищу по названию, описанию, цвету и материалу; по отзывам — нет", risky: true, why: "Отзывы добавят шума в выдачу, но иногда в них есть то, что ищут" },
      ],
      boundaries: ["Карточку товара и каталог не трогаю", "Ранжирование по продажам не меняю"],
      doneWhen: [
        { id: "empty", text: "Пустых выдач меньше 5% на тех же запросах за 30 дней" },
        { id: "highlight", text: "Совпадения подсвечены в выдаче" },
      ],
    },
    stages: [
      {
        id: "s1",
        title: "Brief",
        steps: [
          { id: "a", status: "done", title: "Разбор текущих запросов" },
          // Can wait: the agent keeps working while the question waits, so one step is running.
          { id: "w", status: "running", title: "Написать бриф" },
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
        gate: { title: "the brief", mine: true, status: "ahead", eta: "16:40", etaSource: "the task plan" },
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
    summary: "Три теста расчёта домов падают через раз из-за часового пояса CI. Чиню тесты, а пока предлагаю карантин.",
    project: "astrology-app",
    stage: "Triage",
    now: "Triage · waiting on quarantine",
    waitingFor: "2h",
    delivery: "digest",
    level: 1,
    brief: {
      understanding: "Три теста расчёта домов падают через раз. Чиню сами тесты; пока чиню, предлагаю карантин, чтобы CI не краснел.",
      found: [
        { text: "За 30 дней 41 падение, все в трёх тестах системы домов Плацидуса", source: "CI, прогоны за 30 дней" },
        { text: "Падают только на раннерах с поясом UTC−5 около полуночи; перезапуск не воспроизводит", source: "Логи раннеров" },
      ],
      assumptions: [{ id: "tests", text: "Ошибка в тестах, а не в расчёте: фикстура берёт время без пояса" }],
      boundaries: ["Расчёт домов не трогаю — только тесты и фикстуры"],
      doneWhen: [{ id: "runs", text: "100 прогонов подряд на UTC−5 без падений" }],
    },
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
          { id: "c", status: "running", title: "Починить тесты домов" },
        ],
      },
    ],
    autoDecisions: [{ id: "1", text: "Перезапустил упавший прогон", why: "падение не воспроизвелось" }],
  },
  {
    id: "chart-pdf",
    agent: "ui-engineer",
    model: "Opus 5.5",
    spent: "$1.05",
    tokens: "320K",
    title: "PDF натальной карты",
    summary: "Делаю экспорт натальной карты в PDF: круг карты, таблица позиций и расшифровки по разделам.",
    project: "astrology-app",
    stage: "Export",
    now: "Export · e2e на стейджинге",
    level: 2,
    levelReason: "a new export with 3 parts, and 5 similar tasks took half a day",
    brief: CHART_PDF_BRIEF,
    envelope: CHART_PDF_ENVELOPE,
    // The result already waits for acceptance (chartPdf.ts); the steps below are the plan as it stood before it.
    result: CHART_PDF_RESULT,
    stages: [
      {
        id: "s1",
        title: "Export",
        steps: [
          { id: "wheel", status: "done", title: "Круг карты и таблица позиций в PDF" },
          { id: "fonts", status: "done", title: "Шрифты и символы приложения" },
          { id: "readings", status: "done", title: "Расшифровки с переносом по абзацам" },
          { id: "e2e", status: "running", title: "e2e на стейджинге" },
        ],
        gate: { title: "the result", mine: true, status: "ahead", eta: "tomorrow 11:00", etaSource: "the CI queue" },
      },
    ],
    autoDecisions: [],
  },
];

/** Who works on each step and what it costs: actual for done steps, estimate (~) for the rest. Key: `${taskId}:${stepId}`. */
const STEP_WORK: Record<string, StepWork> = {
  "light-theme:a": { agent: "ui-engineer", cost: "$0.60", time: "18m" },
  "light-theme:b": { agent: "ui-engineer", cost: "$0.40", time: "9m" },
  "light-theme:p": { agent: "ui-engineer", cost: "~$1.20", time: "~40m", basis: "3 similar tasks" },
  "light-theme:t": { agent: "ui-engineer", cost: "$0.30", time: "7m" },
  "light-theme:s": { agent: "ui-engineer", cost: "~$1.40", time: "~45m", basis: "14 screens, the agent's estimate" },
  "light-theme:i": { agent: "ui-engineer", cost: "~$0.50", time: "~15m" },
  "light-theme:d": { agent: "test-fixer", cost: "~$0.30", time: "~10m", basis: "WCAG AA check" },
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
  "search:w": { agent: "planner", cost: "~$0.30", time: "~15m", basis: "5 similar briefs" },
  "search:b": { agent: "search-tuner", cost: "$0.50", time: "8m" },
  "search:c": { agent: "search-tuner", cost: "~$1.20", time: "~40m" },
  "search:d": { agent: "search-tuner", cost: "~$0.80", time: "~30m", basis: "6 similar steps" },
  "search:e": { agent: "search-tuner", cost: "~$0.40", time: "~20m" },
  "flaky:a": { agent: "test-fixer", cost: "$0.08", time: "5m" },
  "flaky:b": { agent: "test-fixer", cost: "$0.04", time: "2m" },
  "flaky:c": { agent: "test-fixer", cost: "~$0.30", time: "~40m", basis: "2 similar fixes" },
  "chart-pdf:wheel": { agent: "ui-engineer", cost: "$0.35", time: "1h 10m" },
  "chart-pdf:fonts": { agent: "ui-engineer", cost: "$0.15", time: "25m" },
  "chart-pdf:readings": { agent: "ui-engineer", cost: "$0.25", time: "40m" },
  "chart-pdf:e2e": { agent: "ui-engineer", cost: "~$0.30", time: "~35m", basis: "3 similar tasks" },
};

/** What a finished step produced. Key: `${taskId}:${stepId}`. */
const STEP_RESULT: Record<string, StepResult> = {
  "light-theme:a": {
    summary: "Добавил пункт «Theme» в меню пользователя: System, Light, Dark. Выбор сохраняется между сессиями и сразу применяется ко всем экранам.",
    decisions: ["По умолчанию тема системы — так в оригинале", "Сохраняю выбор в localStorage, как ширину панелей"],
    files: [
      { name: "src/components/UserMenuButton.tsx", added: 64, removed: 3 },
      { name: "src/data/useTheme.ts", added: 38, removed: 0 },
      { name: "src/App.tsx", added: 12, removed: 6 },
    ],
  },
  "light-theme:t": {
    summary: "Нашёл 14 мест, где тема зашита как data-mode=\"dark\": /tokens, панель плана, Up next, превью ревью и 10 мелких. Каждое — своя .cds-root, настройку не видит.",
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
};

/** Every task: Inbox mocks with work and results folded into their steps, then the chat-level tasks. */
export const TASKS: Task[] = [
  ...INBOX_TASKS.map((t) => ({
    ...t,
    stages: t.stages.map((st) => ({
      ...st,
      steps: st.steps.map((p) => ({ ...p, work: STEP_WORK[`${t.id}:${p.id}`], result: STEP_RESULT[`${t.id}:${p.id}`] })),
    })),
  })),
  ...CHAT_TASK_LIST,
];
