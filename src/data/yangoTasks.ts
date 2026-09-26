/**
 * Task chats of the yango-prototype project: how this prototype is being built, told as tasks.
 * Two large tasks in progress (one keeps working with questions, one is blocked), one large task that stands
 * at a question, a small task with a result to accept, and a small one running. Model: task.ts.
 */
import type { LiveStatus, Turn } from "./transcripts";
import type { Envelope } from "./chatTasks";
import type { Task } from "./task";

const READ = "";
const RUN = "";
const SEARCH = "";
const BROWSER = "";

const RULES = { self: "subtasks and their order within a stage", ask: "a new stage or approval step, scope, anything over +$2" };

/** yango-prototype defaults: the agent writes the app and docs, never the compiled design system or the original build. */
const YANGO_ENVELOPE: Envelope = {
  limit: 15,
  askAt: 0.8,
  paths: [
    { path: "src/components/", access: "write" },
    { path: "src/data/", access: "write" },
    { path: "docs/", access: "write" },
    { path: "original/", access: "read" },
    { path: "src/styles/design-system.css", access: "never" },
  ],
  actions: [
    { id: "tests", label: "Run typecheck and build", column: "free" },
    { id: "deps", label: "Install packages", column: "ask" },
    { id: "push", label: "Push to the task branch", column: "free" },
    { id: "pr", label: "Merge into main", column: "ask" },
    { id: "skip-tests", label: "Skip the parity check", column: "never" },
    { id: "force-push", label: "Force push", column: "never" },
  ],
};

/* ------------------------------------------------------------------------------------------ Brief and plan pane */

/** Level 3 running, with two questions that can wait: the agent keeps working on the live status. */
const BRIEF_PLAN: Task = {
  id: "brief-plan",
  title: "Бриф и план в боковой панели",
  summary:
    "Переношу бриф и план из вкладок чата в панель справа и показываю ход плана прямо в ленте. Готово, когда прогресс виден без открытия панели и везде один: на чипе, в шапке плана и в живом статусе.",
  project: "yango-prototype",
  stage: "Plan",
  now: "Plan · live status leads with the plan step",
  agent: "ui-engineer",
  model: "Opus 5.5",
  spent: "$6.40",
  tokens: "3.1M",
  delivery: "digest",
  level: 3,
  levelReason: "it touches the chat, the Up next pane and 9 components",
  brief: {
    understanding:
      "Бриф и план сейчас живут во вкладках чата и перекрывают ленту. Переношу их в панель справа, как в Up next, а в ленте оставляю плитку «Plan» и живой статус шага. Человек видит, где задача, не открывая панель.",
    assumptions: [
      {
        id: "one-pane",
        text: "Одна панель на весь продукт: в чате и в Up next — тот же компонент PlanPane",
        risky: true,
        why: "Up next показывает план чужой задачи, чат — своей; может понадобиться разное",
        confirmed: true,
      },
      { id: "read-only", text: "В панели бриф и план только читаются, все решения — в доке над композером" },
      { id: "url", text: "Открытая панель хранится в адресе: `?panel=brief|plan`" },
      { id: "width", text: "Ширина панели запоминается, как у сайдбара" },
    ],
    boundaries: ["`design-system.css` не трогаю", "Сайдбар и страницу Routines не меняю", "Модель задачи в `task.ts` не ломаю: только добавляю поля"],
    doneWhen: [
      { id: "pane", text: "Бриф и план открываются в панели справа, лента остаётся чатом", met: "Проверено на 4 задачах: 3 storefront, 1 astrology-app" },
      { id: "progress", text: "Прогресс плана виден без открытия панели и совпадает на чипе, в шапке и в ленте" },
      { id: "parity", text: "Лента чата совпадает с оригиналом на 3 ширинах", locked: true },
      { id: "build", text: "`npm run typecheck` и `npm run build` зелёные", locked: true },
    ],
  },
  envelope: YANGO_ENVELOPE,
  stages: [
    {
      id: "scope",
      title: "Scope",
      steps: [
        {
          id: "read",
          status: "done",
          title: "Разобрать вкладки чата и панель Up next",
          work: { agent: "planner", cost: "$0.50", time: "9m" },
          result: {
            summary: "Вкладки Chat · Brief · Plan рисует ChatTask.tsx, панель Up next — PlanPane.tsx. Разметка плана в них разная: отступы 12 и 16px, разные точки статуса.",
            decisions: ["Беру за основу PlanPane: он новее и уже на токенах"],
          },
        },
        {
          id: "brief",
          status: "done",
          title: "Бриф и план",
          work: { agent: "planner", cost: "$0.30", time: "4m" },
          result: { summary: "4 допущения, 4 критерия готовности, план из 4 этапов." },
        },
      ],
      gate: { title: "the brief and plan", mine: true, status: "passed" },
    },
    {
      id: "pane",
      title: "Pane",
      steps: [
        {
          id: "side",
          status: "done",
          title: "Панель справа вместо вкладок чата",
          work: { agent: "ui-engineer", cost: "$1.10", time: "26m" },
          result: {
            summary: "Бриф и план открываются в SidePane справа от ленты, вкладки чата убраны. Открытая панель живёт в адресе `?panel=`, кнопка «Назад» её закрывает.",
            decisions: ["«Auto» возвращает ленту, когда панель закрыта", "Ширину панели храню через usePersistentWidth"],
            files: [
              { name: "src/components/SidePane.tsx", added: 118, removed: 0 },
              { name: "src/components/ChatShell.tsx", added: 46, removed: 12 },
              { name: "src/components/ChatTask.tsx", added: 22, removed: 140 },
            ],
          },
        },
        {
          id: "toggle",
          status: "done",
          title: "Brief | Plan вкладками в шапке панели",
          work: { agent: "ui-engineer", cost: "$0.40", time: "11m" },
          result: {
            summary: "Шапка панели — вкладки Plan и Brief, Plan первым. В заголовке чата — текстовая кнопка «Plan» с чипом статуса.",
            files: [{ name: "src/components/PlanPane.tsx", added: 38, removed: 17 }],
          },
        },
        {
          id: "rhythm",
          status: "done",
          title: "Один ритм отступов с панелью Up next",
          work: { agent: "ui-engineer", cost: "$0.60", time: "14m" },
          result: {
            summary: "Отступы панели: 24px по краям, 16px между этапами, 8px между шагами. Те же токены, что в Up next.",
            decisions: ["Под вкладками дал больше воздуха: 16px вместо 8px"],
            files: [{ name: "src/components/PlanPane.tsx", added: 24, removed: 31 }],
          },
        },
        {
          id: "tile",
          status: "done",
          title: "Плитка «Plan» в ленте",
          work: { agent: "ui-engineer", cost: "$0.50", time: "12m" },
          result: {
            summary: "Вместо карточки брифа в ленте — плитка артефакта «Plan» с шагами и числом вопросов. Клик открывает панель.",
            files: [{ name: "src/components/ChatTask.tsx", added: 41, removed: 58 }],
          },
        },
      ],
    },
    {
      id: "plan",
      title: "Plan",
      steps: [
        {
          id: "ahead",
          status: "done",
          title: "Шаги впереди раскрываются: что будет сделано",
          work: { agent: "ui-engineer", cost: "$0.70", time: "18m" },
          result: {
            summary: "Под ближними шагами — намерение агента, под дальними — только критерии, которым они служат. Файлов заранее не показываю: это читалось как обещание.",
            decisions: ["Метку «Plan, may change» у каждого шага убрал — она повторялась 10 раз"],
            files: [
              { name: "src/components/PlanPane.tsx", added: 64, removed: 9 },
              { name: "src/data/task.ts", added: 14, removed: 0 },
            ],
          },
        },
        {
          id: "criteria",
          status: "done",
          title: "Критерии готовности под шагами",
          work: { agent: "ui-engineer", cost: "$0.40", time: "10m" },
          result: {
            summary: "Критерии в брифе — пункты с кольцом «впереди» и счётчиком «0 of 4 met». Выполненный критерий показывает проверку, которая это доказала.",
            files: [{ name: "src/components/PlanPane.tsx", added: 33, removed: 12 }],
          },
        },
        {
          id: "live",
          status: "running",
          title: "Живой статус в ленте ведёт с шага плана",
          work: { agent: "ui-engineer", cost: "~$0.80", time: "~20m", basis: "this task's pace" },
          plan: {
            what: "Строка под последним сообщением называет шаг плана, а не вызов инструмента: «Plan · 8/15», «Now: …». Клик открывает план.",
            serves: ["progress"],
          },
        },
        {
          id: "chip",
          status: "ahead",
          title: "Чип Plan с прогрессом в заголовке",
          work: { agent: "ui-engineer", cost: "~$0.40", time: "~10m" },
          plan: { what: "Чип рядом с кнопкой Plan: сколько шагов сделано из скольких, и точка, если ждёт тебя.", serves: ["progress"] },
          question: {
            id: "q1",
            blocking: false,
            text: "Чип считает шаги всего плана или только текущего этапа?",
            context: "Этап короче и быстрее растёт, но в шапке плана и в ленте уже весь план. Разные числа рядом читались как ошибка.",
            options: [
              {
                id: "plan",
                label: "Весь план, как в шапке и в ленте",
                recommended: true,
                cost: "$0",
                toAcceptance: "Same",
                reversible: "Yes, one line",
                forecastSource: "the task plan",
                diff: [{ kind: "change", text: "Чип «8/15» — весь план", step: "chip" }],
              },
              {
                id: "stage",
                label: "Только текущий этап",
                cost: "~$0.40",
                toAcceptance: "+15m",
                reversible: "Yes",
                forecastSource: "the agent's estimate",
                diff: [
                  { kind: "change", text: "Чип «Plan 2/5», шапка и лента — тоже по этапу", step: "chip" },
                  { kind: "add", text: "Подпись этапа рядом с числом", step: "chip", agent: "ui-engineer", cost: "~$0.30", time: "~10m" },
                ],
              },
            ],
          },
        },
        {
          id: "questions",
          status: "ahead",
          title: "Вопросы агента в ленте",
          work: { agent: "ui-engineer", cost: "~$0.50", time: "~15m", basis: "3 similar steps" },
          plan: { serves: ["pane"] },
          question: {
            id: "q2",
            blocking: false,
            text: "Вопрос в сообщении агента: отделить рельсом слева или рамкой-карточкой?",
            context: "Рамки у ответов агента мы уже убрали. Рельс в 1px отделяет вопрос, не превращая сообщение в карточку.",
            options: [
              {
                id: "rail",
                label: "Рельс 1px слева",
                recommended: true,
                cost: "~$0.20",
                toAcceptance: "Same",
                reversible: "Yes",
                forecastSource: "the agent's estimate",
                diff: [{ kind: "change", text: "Вопрос на рельсе, без рамки", step: "questions" }],
              },
              {
                id: "card",
                label: "Карточка с рамкой",
                cost: "~$0.40",
                toAcceptance: "+10m",
                reversible: "Yes",
                forecastSource: "the agent's estimate",
                diff: [{ kind: "change", text: "Вопрос в карточке, как док решений", step: "questions" }],
              },
            ],
          },
        },
      ],
      gate: { title: "typecheck and build pass", status: "ahead" },
    },
    {
      id: "verify",
      title: "Verify",
      steps: [
        { id: "narrow", status: "ahead", title: "Узкий чат: панель поверх ленты", work: { agent: "ui-engineer", cost: "~$0.60", time: "~20m", basis: "the agent's estimate" }, plan: { serves: ["pane"] } },
        { id: "parity", status: "ahead", title: "Сверка ленты с оригиналом на 3 ширинах", work: { agent: "test-fixer", cost: "~$0.50", time: "~15m", basis: "9 similar checks in yango-prototype" }, plan: { serves: ["parity"] } },
        { id: "docs", status: "ahead", title: "BRIEF_AND_PLAN.md: решения и журнал", work: { agent: "docs-writer", cost: "~$0.40", time: "~10m" } },
        { id: "shots", status: "ahead", title: "Скриншоты для ревью", work: { agent: "test-fixer", cost: "~$0.20", time: "~5m" }, plan: { serves: ["parity", "build"] } },
      ],
      gate: { title: "the result", mine: true, status: "ahead", eta: "~19:00", etaSource: "this task's pace" },
    },
  ],
  rules: RULES,
  autoDecisions: [
    { id: "1", text: "Plan — первая вкладка, Brief — вторая", why: "план открывают чаще" },
    { id: "2", text: "Точки выполненных шагов — серые, не галочки", why: "как в Up next" },
  ],
};

/* ------------------------------------------------------------------------------------------------- Up next */

/** Level 3 running, one question that can wait: the agent works on the Can wait group in the meantime. */
const UP_NEXT: Task = {
  id: "up-next",
  title: "Раздел «Up next»",
  summary:
    "Делаю раздел, где собраны задачи, которым нужен человек: заблокированные, те, что могут подождать, и те, что идут сами. Готово, когда за минуту понятно, кому из агентов ответить первым.",
  project: "yango-prototype",
  stage: "Signals",
  now: "Signals · the step Can wait tasks keep working on",
  agent: "ui-engineer",
  model: "Opus 5.5",
  spent: "$8.90",
  tokens: "4.6M",
  delivery: "digest",
  level: 3,
  levelReason: "a new section, 11 components, and 4 similar tasks took over a day",
  brief: {
    understanding:
      "Агентов много, и каждый останавливается в своём чате. Раздел «Up next» собирает в одном месте всё, что ждёт человека: вопросы, гейты, результаты. Рядом с задачей — её план, и ответить можно не уходя со страницы.",
    assumptions: [
      { id: "groups", text: "Три группы: Blocked, Can wait, Running — по тому, стоит ли агент", risky: true, why: "Можно резать и по проектам; от этого зависит вся страница", confirmed: true },
      { id: "same-model", text: "У задачи в Up next и в чате одна модель: план, вопросы, гейты" },
      { id: "no-push", text: "Can wait не шлёт пуш, а приходит в дайджесте" },
      { id: "name", text: "Название раздела пока «Inbox», переименуем после ревью" },
    ],
    boundaries: ["Чаты и их транскрипты только читаю", "Страницу Routines не трогаю", "`design-system.css` не трогаю"],
    doneWhen: [
      { id: "groups", text: "Задачи разложены по трём группам, у каждой строки сказано, что нужно от тебя", met: "6 задач из 3 проектов, все в своих группах" },
      { id: "answer", text: "На вопрос можно ответить прямо в панели плана", met: "Ответ меняет план и убирает задачу из Blocked" },
      { id: "signals", text: "Сайдбар сигналит, если где-то блокер: аватар и свёрнутый проект" },
      { id: "build", text: "`npm run typecheck` и `npm run build` зелёные", locked: true },
    ],
  },
  envelope: YANGO_ENVELOPE,
  stages: [
    {
      id: "scope",
      title: "Scope",
      steps: [
        {
          id: "read",
          status: "done",
          title: "Разобрать, как задачи сейчас доходят до человека",
          work: { agent: "planner", cost: "$0.60", time: "12m" },
          result: { summary: "Сейчас единственный сигнал — точка у чата в сайдбаре. Вопрос агента не отличить от законченной работы, а чат, который ждёт 2 часа, выглядит как новый." },
        },
        {
          id: "brief",
          status: "done",
          title: "Бриф и план",
          work: { agent: "planner", cost: "$0.40", time: "6m" },
          result: { summary: "PRD с принципами и сценариями в docs/INBOX.md, план из 4 этапов.", files: [{ name: "docs/INBOX.md", added: 184, removed: 0 }] },
        },
      ],
      gate: { title: "the brief and plan", mine: true, status: "passed" },
    },
    {
      id: "list",
      title: "List",
      steps: [
        {
          id: "groups",
          status: "done",
          title: "Группы Blocked, Can wait, Running",
          work: { agent: "ui-engineer", cost: "$1.40", time: "32m" },
          result: {
            summary: "Страница `/inbox` с тремя группами. Blocked — агент стоит, Can wait — вопросы есть, но работа идёт, Running — ничего не нужно.",
            files: [
              { name: "src/pages/InboxPage.tsx", added: 286, removed: 0 },
              { name: "src/data/inbox.ts", added: 312, removed: 0 },
              { name: "src/data/inboxStore.ts", added: 64, removed: 0 },
            ],
          },
        },
        {
          id: "rows",
          status: "done",
          title: "Строка задачи: что нужно от тебя",
          work: { agent: "ui-engineer", cost: "$0.80", time: "19m" },
          result: {
            summary: "Строка говорит, что нужно: «Answer 1 question», «Approve the brief», а не «your gate». Справа — сколько задача ждёт.",
            decisions: ["Имя агента при наведении перекрывает название шага, а не добавляется строкой"],
            files: [{ name: "src/pages/InboxPage.tsx", added: 58, removed: 21 }],
          },
        },
        {
          id: "pane",
          status: "done",
          title: "План задачи в боковой панели",
          work: { agent: "ui-engineer", cost: "$1.60", time: "41m" },
          result: {
            summary: "Выбранная задача открывает план справа: этапы, шаги, гейты, стоимость и что уже решено само.",
            files: [
              { name: "src/components/PlanPane.tsx", added: 402, removed: 0 },
              { name: "src/data/task.ts", added: 196, removed: 0 },
            ],
          },
        },
        {
          id: "answer",
          status: "done",
          title: "Ответ на вопрос прямо в панели",
          work: { agent: "ui-engineer", cost: "$0.90", time: "22m" },
          result: {
            summary: "Варианты ответа показывают, что станет с планом: какие шаги появятся, какие уйдут, сколько стоит. Ответ можно отменить.",
            decisions: ["Рекомендованный вариант выбран заранее, как в Claude Code"],
            files: [{ name: "src/components/PlanPane.tsx", added: 118, removed: 14 }],
          },
        },
        {
          id: "rename",
          status: "done",
          title: "Переименовать Inbox в «Up next»",
          work: { agent: "ui-engineer", cost: "$0.20", time: "5m" },
          result: {
            summary: "Раздел называется «Up next», адрес `/up-next`. В коде пока Inbox — переименование кода отдельной задачей.",
            decisions: ["Вернул иконку лотка и её анимацию при наведении"],
            files: [
              { name: "src/components/Sidebar.tsx", added: 6, removed: 6 },
              { name: "src/App.tsx", added: 3, removed: 2 },
            ],
          },
        },
      ],
    },
    {
      id: "signals",
      title: "Signals",
      steps: [
        {
          id: "avatar",
          status: "done",
          title: "Статус внимания на аватаре",
          work: { agent: "ui-engineer", cost: "$0.70", time: "16m" },
          result: { summary: "Точка на аватаре: глина — есть блокер, пусто — всё идёт само. Меню аватара переключает Available, Busy до 16:00, Do not disturb." },
        },
        {
          id: "project",
          status: "done",
          title: "Свёрнутый проект сигналит о блокере",
          work: { agent: "ui-engineer", cost: "$0.40", time: "9m" },
          result: { summary: "Если проект свёрнут, а внутри блокер, у проекта точка в колонке «+». Развернул — точка переходит на чат." },
        },
        {
          id: "canwait",
          status: "running",
          title: "Can wait: шаг, над которым агент продолжает работать",
          work: { agent: "ui-engineer", cost: "~$0.50", time: "~15m", basis: "this task's pace" },
          plan: { what: "У задач в Can wait — пульсирующая точка и шаг, который идёт, пока вопрос ждёт. Глина остаётся только у Blocked.", serves: ["groups"] },
        },
        {
          id: "recap",
          status: "ahead",
          title: "Сводка за время отсутствия",
          work: { agent: "ui-engineer", cost: "~$1.20", time: "~35m", basis: "the agent's estimate" },
          plan: { what: "Наверху страницы — что случилось, пока тебя не было: проверки, решения агентов, расходы. Всё считается из задач, а не пишется отдельно.", serves: ["signals"] },
          question: {
            id: "q1",
            blocking: false,
            text: "Аларм, который стопорит агентов (истёк токен GitHub), показывать отдельной плашкой или строкой в сводке?",
            context: "Плашка заметнее, но таких событий 1–2 в неделю. Строка в сводке не отвлекает, но её легко пропустить.",
            options: [
              {
                id: "banner",
                label: "Отдельной плашкой над списком",
                recommended: true,
                cost: "~$0.40",
                toAcceptance: "+10m",
                reversible: "Yes",
                forecastSource: "the agent's estimate",
                diff: [{ kind: "add", text: "Плашка аларма с кнопкой действия", step: "recap", agent: "ui-engineer", cost: "~$0.40", time: "~10m" }],
              },
              {
                id: "row",
                label: "Строкой в сводке",
                cost: "$0",
                toAcceptance: "Same",
                reversible: "Yes",
                forecastSource: "the task plan",
                diff: [{ kind: "change", text: "Аларм — первая строка сводки", step: "recap" }],
              },
            ],
          },
        },
        {
          id: "digest",
          status: "ahead",
          title: "Дайджест в 16:00 для задач, которые могут подождать",
          work: { agent: "notifications-engineer", cost: "~$0.80", time: "~25m", basis: "2 similar tasks" },
          plan: { serves: ["signals"] },
        },
      ],
      gate: { title: "typecheck and build pass", status: "ahead" },
    },
    {
      id: "review",
      title: "Review",
      steps: [
        { id: "docs", status: "ahead", title: "INBOX.md: решения и журнал", work: { agent: "docs-writer", cost: "~$0.30", time: "~10m" } },
        { id: "scenarios", status: "ahead", title: "Прогон сценариев из PRD", work: { agent: "test-fixer", cost: "~$0.60", time: "~20m", basis: "the agent's estimate" }, plan: { serves: ["groups", "answer", "signals"] } },
      ],
      gate: { title: "the section", mine: true, status: "ahead", eta: "tomorrow ~11:00", etaSource: "this task's pace" },
    },
  ],
  rules: RULES,
  autoDecisions: [
    { id: "1", text: "Ответы на вопросы храню в памяти, не в localStorage", why: "это прототип, после перезагрузки всё с начала" },
    { id: "2", text: "Задачи из чатов и из Up next — одна модель", why: "так в брифе" },
    { id: "3", text: "Глина только у Blocked", why: "иначе красного слишком много" },
  ],
};

/* --------------------------------------------------------------------------------------------- Chat levels */

/** Level 3 blocked: a blocking question on the decision dock stops the Cards stage. */
const CHAT_LEVELS: Task = {
  id: "chat-levels",
  title: "Уровни задач в чате",
  summary:
    "Делаю так, чтобы чат рос вместе с задачей: мелочь — просто ответ, большая задача — бриф, план и гейты. Готово, когда на демо-задачах видны все четыре уровня и каждое решение принимается в чате.",
  project: "yango-prototype",
  stage: "Cards",
  now: "Cards · waiting for you",
  waitingFor: "14m",
  agent: "ui-engineer",
  model: "Opus 5.5",
  spent: "$11.20",
  tokens: "5.8M",
  delivery: "push",
  level: 3,
  levelReason: "it changes the chat for every task, and 6 similar tasks went over budget",
  brief: {
    understanding:
      "Сейчас каждый чат выглядит одинаково, от «поправь отступ» до «сделай оплату». Хочу, чтобы интерфейс задачи появлялся, только когда ему есть что показать: уровень 0 — чат, 1 — карточка результата, 2 — план, 3 — бриф, план и гейты.",
    assumptions: [
      { id: "levels", text: "Четыре уровня, от 0 до 3; уровень угадываю до отправки по тексту", risky: true, why: "Можно обойтись двумя уровнями — это меняет всю задачу", confirmed: true },
      { id: "up", text: "Уровень растёт только с согласия человека и сам не падает" },
      { id: "risk", text: "Риск важнее размера: оплата — всегда уровень 3" },
      { id: "demo", text: "Демо — на задачах storefront и astrology-app" },
    ],
    boundaries: ["Страницу Up next меняю только там, где модель задачи общая", "`design-system.css` не трогаю", "Настоящий вызов модели не делаю: уровень угадываю правилом"],
    doneWhen: [
      { id: "levels", text: "На демо-задачах видны уровни 0, 1, 2 и 3", met: "birth-date — 1, loyalty — 1 → 3, one-click-pay — 3" },
      { id: "decide", text: "Каждое решение — гейт, допущение, вопрос, эскалация, результат — принимается в чате" },
      { id: "copy", text: "Карточки говорят просто: что нужно от тебя и что будет после" },
      { id: "build", text: "`npm run typecheck` и `npm run build` зелёные", locked: true },
    ],
  },
  envelope: YANGO_ENVELOPE,
  stages: [
    {
      id: "scope",
      title: "Scope",
      steps: [
        {
          id: "read",
          status: "done",
          title: "Разобрать, как задачи живут в чате сейчас",
          work: { agent: "planner", cost: "$0.70", time: "15m" },
          result: { summary: "У чата нет понятия задачи: план, вопросы и стоимость есть только в Up next. В чате они не видны, и решить что-то можно только там." },
        },
        {
          id: "brief",
          status: "done",
          title: "Бриф и план",
          work: { agent: "planner", cost: "$0.50", time: "8m" },
          result: { summary: "PRD в docs/CHAT_LEVELS.md: уровни, лимиты задачи, гейты. План из 4 этапов.", files: [{ name: "docs/CHAT_LEVELS.md", added: 212, removed: 0 }] },
        },
      ],
      gate: { title: "the brief and plan", mine: true, status: "passed" },
    },
    {
      id: "model",
      title: "Model",
      steps: [
        {
          id: "model",
          status: "done",
          title: "Одна модель задачи для Up next и чата",
          work: { agent: "ui-engineer", cost: "$1.30", time: "30m" },
          result: {
            summary: "Задача, план, вопросы и гейты — в task.ts; Up next и чат берут их оттуда. Состояние сессии — в chatTaskStore.",
            files: [
              { name: "src/data/task.ts", added: 142, removed: 38 },
              { name: "src/data/chatTaskStore.ts", added: 197, removed: 0 },
            ],
          },
        },
        {
          id: "guess",
          status: "done",
          title: "Уровни 0–3 и угадывание уровня до отправки",
          work: { agent: "ui-engineer", cost: "$0.60", time: "14m" },
          result: {
            summary: "По черновику угадываю уровень: оплата, авторизация, миграции и удаление — сразу 3, текст длиннее 60 слов — тоже 3. Это подсказка, а не приговор.",
            files: [{ name: "src/data/chatTasks.ts", added: 34, removed: 0 }],
          },
        },
        {
          id: "limits",
          status: "done",
          title: "Лимиты задачи: пути, действия, бюджет",
          work: { agent: "ui-engineer", cost: "$1.00", time: "24m" },
          result: {
            summary: "У задачи есть лимиты: куда писать, что только читать, что можно без спроса и за сколько. Сначала это был «конверт автономии» с чипом, потом слово заменили на «лимиты», а чип убрали.",
            decisions: ["Слово «envelope» не прошло проверку текстов — «limits» понятнее"],
          },
        },
      ],
    },
    {
      id: "cards",
      title: "Cards",
      steps: [
        {
          id: "brief-gate",
          status: "done",
          title: "Гейт брифа и плана в ленте",
          work: { agent: "ui-engineer", cost: "$1.50", time: "35m" },
          result: {
            summary: "Бриф живёт в чате, пока его не приняли: допущения отмечаются «верно / поправить», критерии можно добавить. После принятия — одна строка «Brief accepted».",
            files: [{ name: "src/components/ChatTask.tsx", added: 380, removed: 0 }],
          },
        },
        {
          id: "result",
          status: "done",
          title: "Карточка результата и артефакт ревью",
          work: { agent: "ui-engineer", cost: "$1.20", time: "28m" },
          result: {
            summary: "Маленькая задача заканчивается карточкой «What I checked»: каждое утверждение с доказательством. Доказательство открывает дифф, скриншоты или проверки рядом с чатом.",
            files: [{ name: "src/components/ReviewPane.tsx", added: 214, removed: 0 }],
          },
        },
        {
          id: "escalation",
          status: "done",
          title: "Предложение эскалации: этапы и гейт",
          work: { agent: "ui-engineer", cost: "$0.90", time: "20m" },
          result: {
            summary: "Если маленькая задача разрослась, агент предлагает этапы и гейт перед опасным шагом. Предложение читается как план: пронумерованные этапы, шаги на рельсе.",
            decisions: ["Без согласия уровень не растёт, агент доделывает без плана"],
          },
        },
        {
          id: "dock",
          status: "waiting",
          title: "Док решений над композером",
          work: { agent: "ui-engineer", cost: "$1.80", time: "46m" },
          question: {
            id: "q1",
            blocking: true,
            text: "Док решений разросся до пяти видов. Оставить один док или вернуть часть решений в ленту?",
            context:
              "Сейчас гейт, допущения, вопросы, эскалация и приём результата — все в одном доке над композером. Один вид — меньше учить, но гейт с брифом не помещается и уезжает в «Details».",
            options: [
              {
                id: "one",
                label: "Один док, одна строка текста для всех решений",
                recommended: true,
                cost: "~$0.80",
                toAcceptance: "~30m",
                reversible: "Yes, the cards stay in the code",
                forecastSource: "the agent's estimate",
                diff: [
                  { kind: "change", text: "Все пять решений — вопрос и варианты, детали по ссылке", step: "dock" },
                  { kind: "add", text: "Ничего не выбрано заранее, строки вариантов шире панели", step: "dock", agent: "ui-engineer", cost: "~$0.40", time: "~15m" },
                ],
              },
              {
                id: "split",
                label: "Гейт и эскалация в ленте, вопросы в доке",
                cost: "~$2",
                toAcceptance: "~1h 20m",
                reversible: "Partly: two layouts to keep",
                forecastSource: "3 similar steps, rough",
                diff: [
                  { kind: "add", text: "Карточки гейта и эскалации в ленте", step: "dock", agent: "ui-engineer", cost: "~$1.20", time: "~45m" },
                  { kind: "gate", text: "Ты смотришь обе схемы на демо-задачах", step: "dock", agent: "you", time: "~15m" },
                ],
              },
            ],
          },
        },
        {
          id: "edits",
          status: "ahead",
          title: "Правки брифа текстом из чата",
          work: { agent: "ui-engineer", cost: "~$0.60", time: "~20m", basis: "the agent's estimate" },
          plan: { what: "«Apple Pay не нужен» в композере убирает допущение и шаг плана, агент отвечает одной строкой: что изменилось и сколько сэкономили.", serves: ["decide"] },
        },
      ],
      gate: { title: "typecheck and build pass", status: "ahead" },
    },
    {
      id: "demo",
      title: "Demo",
      steps: [
        { id: "demos", status: "ahead", title: "Демо-задачи в storefront и astrology-app", work: { agent: "ui-engineer", cost: "~$1", time: "~30m", basis: "the agent's estimate" }, plan: { serves: ["levels"] } },
        { id: "copy", status: "ahead", title: "Проход по текстам: карточки говорят просто", work: { agent: "ux-writer", cost: "~$0.60", time: "~20m", basis: "2 similar passes" }, plan: { serves: ["copy"] } },
        { id: "docs", status: "ahead", title: "CHAT_LEVELS.md: демо-адреса и журнал решений", work: { agent: "docs-writer", cost: "~$0.30", time: "~10m" } },
      ],
      gate: { title: "the result", mine: true, status: "ahead", eta: "~20:00", etaSource: "this task's pace" },
    },
  ],
  rules: RULES,
  autoDecisions: [
    { id: "1", text: "Демо «Повторить заказ» убрал", why: "дублировал уровень 1 из birth-date" },
    { id: "2", text: "Точки статуса вместо ромбов у гейтов", why: "одна форма для шагов и гейтов" },
  ],
};

/* ---------------------------------------------------------------------------------------------- Small tasks */

/** Level 1 done: the result waits to be accepted. */
const DEV_PORT: Task = {
  id: "dev-port",
  title: "Порт dev-сервера из PORT",
  summary: "Два превью на одном порту падают. Dev-сервер берёт порт из переменной PORT, по умолчанию 5173.",
  project: "yango-prototype",
  stage: "Fix",
  now: "Fix · waiting for you",
  waitingFor: "25m",
  agent: "ui-engineer",
  model: "Haiku 4.5",
  spent: "$0.09",
  tokens: "31K",
  level: 1,
  stages: [
    {
      id: "fix",
      title: "Fix",
      steps: [
        {
          id: "fix",
          status: "done",
          title: "Порт из PORT в vite.config.ts",
          work: { agent: "ui-engineer", cost: "$0.09", time: "4m" },
          result: {
            summary: "vite.config.ts читает PORT, strictPort выключен только без него.",
            files: [
              { name: "vite.config.ts", added: 4, removed: 1 },
              { name: ".claude/launch.json", added: 12, removed: 0 },
            ],
          },
        },
      ],
    },
  ],
  result: {
    claims: [
      { text: "`npm run dev` берёт порт из `PORT`, без него — 5173, как раньше", evidence: "`PORT=5180 npm run dev` → Local: http://localhost:5180/code", show: "changes" },
      { text: "Два превью поднимаются рядом и не мешают друг другу", evidence: "5173 и 5180 открыты одновременно, обе страницы отвечают 200", show: "checks" },
      { text: "`npm run original` не тронут и остаётся на 5174", evidence: "package.json не менялся", show: "changes" },
    ],
  },
  autoDecisions: [],
};

/** Level 1 running: a small fix, no plan. */
const CHAT_SCROLL: Task = {
  id: "chat-scroll",
  title: "Прокрутка в длинных чатах",
  summary: "Длинный чат открывается не внизу, а на середине, и лента прыгает, когда догружается живой статус. Чиню.",
  project: "yango-prototype",
  stage: "Fix",
  now: "Fix · keeping the scroll at the bottom",
  agent: "ui-engineer",
  model: "Sonnet 5",
  spent: "$0.21",
  tokens: "88K",
  level: 1,
  stages: [
    {
      id: "fix",
      title: "Fix",
      steps: [{ id: "fix", status: "running", title: "Держать прокрутку внизу при открытии и росте ленты", work: { agent: "ui-engineer", cost: "~$0.40", time: "~10m" } }],
    },
  ],
  autoDecisions: [],
};

export const YANGO_TASKS: Task[] = [BRIEF_PLAN, UP_NEXT, CHAT_LEVELS, DEV_PORT, CHAT_SCROLL];

/* ---------------------------------------------------------------------------------------------- Transcripts */

const u = (text: string): Turn => ({ role: "user", text });

export const YANGO_TASK_TRANSCRIPTS: Record<string, Turn[]> = {
  "brief-plan": [
    u("Бриф и план сейчас во вкладках чата: открываешь план — пропадает лента. Хочу, чтобы они открывались справа, как план в Up next, а в ленте было видно, где задача, без открытия панели."),
    {
      role: "assistant",
      thought: "Ran 5 steps",
      time: "5 hours ago",
      steps: [
        { icon: READ, label: "Read ChatTask.tsx", detail: "tabs Chat · Brief · Plan" },
        { icon: READ, label: "Read PlanPane.tsx" },
        { icon: SEARCH, label: "Searched for padding in both panes", detail: "12 matches" },
        { icon: SEARCH, label: "Found 4 similar tasks", detail: "yango-prototype · panes" },
      ],
      blocks: [
        { type: "p", text: "План в чате и план в Up next нарисованы по-разному: разные отступы, разные точки статуса, у чата ещё и гейт ромбом. Предлагаю один компонент на оба места — `PlanPane`, он новее и уже на токенах." },
        { type: "p", text: "Задача задевает чат, Up next и 9 компонентов, поэтому написал бриф и план. Посмотри допущения, особенно первое." },
        { type: "brief-card" },
      ],
    },
    u("Одна панель — да. Только в Up next у панели сверху название задачи, а в чате оно уже есть в заголовке. Не дублируй"),
    {
      role: "assistant",
      time: "5 hours ago",
      blocks: [
        { type: "p", text: "Понял. В чате шапка панели — сразу вкладки Brief | Plan, без названия. В Up next название остаётся: там панель открывается рядом со списком, и без него непонятно, чья это задача." },
        { type: "p", text: "Допущение про одну панель отметил как верное. Начинаю с панели справа." },
      ],
    },
    {
      role: "assistant",
      thought: "Edited 3 files",
      time: "4 hours ago",
      steps: [
        { icon: RUN, label: "Ran npm run typecheck" },
        { icon: BROWSER, label: "Opened /code/i18n?panel=plan", detail: "1440 × 900" },
      ],
      blocks: [
        { type: "p", text: "Панель справа работает. Вкладки чата убрал: лента всегда чат, бриф и план открываются рядом." },
        {
          type: "files",
          title: "Edited 3 files",
          diff: { added: 186, removed: 152 },
          files: [
            { name: "SidePane.tsx", diff: { added: 118, removed: 0 } },
            { name: "ChatShell.tsx", diff: { added: 46, removed: 12 } },
            { name: "ChatTask.tsx", diff: { added: 22, removed: 140 } },
          ],
        },
        {
          type: "ul",
          items: [
            "Открытая панель живёт в адресе: `?panel=plan` или `?panel=brief`. Ссылку можно отправить.",
            "Ширина запоминается, как у сайдбара.",
            "Кнопка «Назад» в браузере закрывает панель, а не уходит из чата.",
          ],
        },
      ],
    },
    u("А как открыть панель? Вкладок больше нет"),
    {
      role: "assistant",
      time: "4 hours ago",
      blocks: [
        { type: "p", text: "Два способа: кнопка «Plan» в заголовке чата и плитка в ленте, там, где раньше была карточка брифа." },
        { type: "p", text: "Сначала хотел оставить в заголовке переключатель «Brief | Plan», но это те же вкладки, только в другом месте. Сделал одну текстовую кнопку, а Brief | Plan — вкладки уже внутри панели." },
        { type: "status", label: "Edited", target: "PlanPane.tsx, EpitaxyTitlebar.tsx", diff: { added: 38, removed: 17 } },
      ],
    },
    u("Отступы в панели отличаются от Up next. Сделай один ритм"),
    {
      role: "assistant",
      thought: "Ran 4 commands",
      time: "3 hours ago",
      steps: [
        { icon: BROWSER, label: "Measured both panes", detail: "getComputedStyle" },
        { icon: RUN, label: "Ran npm run typecheck" },
      ],
      blocks: [
        { type: "p", text: "Сравнил обе панели по вычисленным стилям. Расхождений было четыре:" },
        {
          type: "table",
          head: ["Где", "Чат", "Up next", "Стало"],
          rows: [
            ["Края панели", "16px", "24px", "24px"],
            ["Между этапами", "24px", "16px", "16px"],
            ["Между шагами", "12px", "8px", "8px"],
            ["Под вкладками", "8px", "—", "16px"],
          ],
        },
        { type: "p", text: "Под вкладками дал больше воздуха, чем было: без этого первый этап прилипал к подчёркиванию активной вкладки." },
      ],
    },
    u("Хорошо. Теперь про плитку в ленте — пусть называется просто Plan, без «Brief and plan»"),
    {
      role: "assistant",
      time: "3 hours ago",
      blocks: [
        { type: "status", label: "Edited", target: "ChatTask.tsx", diff: { added: 41, removed: 58 } },
        { type: "p", text: "Плитка теперь «Plan», под ней — сколько шагов и вопросов. Бриф открывается второй вкладкой в той же панели." },
        { type: "p", text: "Заодно поправил текст агента: он больше не говорит «открой вкладку Brief», а пишет «бриф и план — справа». Вкладок ведь нет." },
      ],
    },
    u("Шаги впереди сейчас пустые, просто названия. Хочу видеть, что агент собирается делать"),
    {
      role: "assistant",
      thought: "Edited 2 files",
      time: "2 hours ago",
      steps: [
        { icon: READ, label: "Read docs/INBOX.md", detail: "decision log" },
        { icon: RUN, label: "Ran npm run build" },
      ],
      blocks: [
        { type: "p", text: "Шаги впереди раскрываются. Но по-разному, в зависимости от того, насколько они близко:" },
        {
          type: "ul",
          items: [
            "Ближние — намерение агента в одну-две строки: что он собирается сделать.",
            "Дальние — только критерии готовности, которым шаг служит. Намерение там всё равно поменяется.",
            "Файлы заранее не показываю: список файлов впереди читается как обещание, а они находятся по ходу работы.",
          ],
        },
        { type: "p", text: "Метку «Plan, may change» у каждого шага убрал — в плане из 15 шагов она повторялась 10 раз и превращалась в шум." },
      ],
    },
    u("Критерии в брифе похожи на чекбоксы, будто их можно отметить"),
    {
      role: "assistant",
      time: "2 hours ago",
      blocks: [
        { type: "status", label: "Edited", target: "PlanPane.tsx", diff: { added: 33, removed: 12 } },
        { type: "p", text: "Сделал пунктами: кольцо «впереди» у невыполненных, серая точка у выполненных, и счётчик «1 of 4 met» над списком. У выполненного критерия под ним — проверка, которая это доказала." },
      ],
    },
    u("Дальше — живой статус. Сейчас под последним сообщением «Editing PlanPane.tsx», а в плане шаг называется по-другому. Непонятно, это одно и то же или нет"),
    {
      role: "assistant",
      thought: "Ran 3 steps",
      time: "20 minutes ago",
      steps: [
        { icon: READ, label: "Read Transcript.tsx", detail: "TurnStatus" },
        { icon: READ, label: "Read task.ts", detail: "planProgress" },
      ],
      blocks: [
        { type: "p", text: "Да, это главный разрыв: лента говорит языком инструментов, план — языком шагов. Делаю так, чтобы живая строка называла шаг плана и считала весь план — «Plan · 8/15», ниже «Now: …». Клик открывает план." },
        { type: "p", text: "Работаю над этим. Два вопроса по ходу — они не срочные, я не стою:" },
        { type: "question", id: "q1" },
        { type: "question", id: "q2" },
      ],
    },
  ],

  "up-next": [
    u("У меня пять агентов в трёх проектах. Каждый останавливается в своём чате, и я узнаю об этом, только если зайду. Нужен раздел, где видно всё, что ждёт меня"),
    {
      role: "assistant",
      thought: "Ran 4 steps",
      time: "Yesterday",
      steps: [
        { icon: READ, label: "Read Sidebar.tsx, SessionRow.tsx" },
        { icon: READ, label: "Read sessions.ts", detail: "12 chats" },
        { icon: SEARCH, label: "Found 4 similar tasks", detail: "new sections · over a day" },
      ],
      blocks: [
        { type: "p", text: "Сейчас единственный сигнал — точка у чата в сайдбаре. Вопрос агента не отличить от законченной работы, а чат, который ждёт тебя 2 часа, выглядит так же, как новый." },
        { type: "p", text: "Предлагаю раздел «Inbox» с тремя группами — по тому, стоит агент или нет. Это новый раздел и 11 компонентов, поэтому начал с брифа и плана. PRD положил в `docs/INBOX.md`." },
        { type: "brief-card" },
      ],
    },
    u("Почему группы по состоянию, а не по проектам? Я думаю проектами"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Потому что вопрос раздела — «кому ответить первым», а не «что в проекте». Если резать по проектам, заблокированный агент в третьем проекте окажется ниже двух задач, которые идут сами." },
        { type: "p", text: "Проект показываю в строке задачи, и по нему можно отфильтровать. Если всё-таки хочешь проекты — поправь допущение в брифе, план перестрою." },
      ],
    },
    u("Ок, убедил. Поехали"),
    {
      role: "assistant",
      thought: "Edited 3 files",
      time: "Yesterday",
      steps: [
        { icon: RUN, label: "Ran npm run typecheck" },
        { icon: BROWSER, label: "Opened /inbox", detail: "1440 × 900" },
      ],
      blocks: [
        { type: "p", text: "Страница готова, в ней 6 задач из трёх проектов." },
        {
          type: "table",
          head: ["Группа", "Когда", "Сейчас"],
          rows: [
            ["Blocked", "Агент стоит: блокирующий вопрос или гейт", "3 задачи"],
            ["Can wait", "Вопросы есть, но работа идёт", "2 задачи"],
            ["Running", "Ничего не нужно", "1 задача"],
          ],
        },
        {
          type: "files",
          title: "Edited 3 files",
          diff: { added: 662, removed: 0 },
          files: [
            { name: "InboxPage.tsx", diff: { added: 286, removed: 0 } },
            { name: "inbox.ts", diff: { added: 312, removed: 0 } },
            { name: "inboxStore.ts", diff: { added: 64, removed: 0 } },
          ],
        },
      ],
    },
    u("В строке написано «your gate». Мне это ни о чём не говорит"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Согласен, это наш внутренний термин. Теперь строка говорит, что нужно сделать:" },
        { type: "ul", items: ["«Answer 1 question» — у задачи вопрос.", "«Approve the brief» — гейт брифа.", "«Review the result» — готово, нужно принять.", "«Agree to stages» — агент предлагает разбить задачу."] },
        { type: "status", label: "Edited", target: "InboxPage.tsx", diff: { added: 58, removed: 21 } },
      ],
    },
    u("Хочу видеть план задачи, не уходя в чат"),
    {
      role: "assistant",
      thought: "Edited 2 files",
      time: "Yesterday",
      steps: [{ icon: RUN, label: "Ran npm run build" }],
      blocks: [
        { type: "p", text: "Выбранная задача открывает план справа: этапы, шаги с агентом и стоимостью, гейты и то, что агент решил сам." },
        { type: "p", text: "У шагов стоимость двух видов: без тильды — факт, с тильдой — прогноз, и рядом написано, откуда он: «14 similar steps in storefront»." },
        {
          type: "files",
          title: "Edited 2 files",
          diff: { added: 598, removed: 0 },
          files: [
            { name: "PlanPane.tsx", diff: { added: 402, removed: 0 } },
            { name: "task.ts", diff: { added: 196, removed: 0 } },
          ],
        },
      ],
    },
    u("А ответить на вопрос прямо там можно?"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "status", label: "Edited", target: "PlanPane.tsx", diff: { added: 118, removed: 14 } },
        { type: "p", text: "Можно. Варианты ответа показывают, что станет с планом: какие шаги появятся, какие уйдут, сколько это стоит и можно ли откатить. Рекомендованный вариант выбран заранее — как в вопросах Claude Code." },
        { type: "p", text: "После ответа задача уходит из Blocked, а в плане ответ можно отменить." },
      ],
    },
    u("Сайдбар тоже должен подсказывать, что меня ждут. Я не всегда на этой странице"),
    {
      role: "assistant",
      thought: "Edited 4 files",
      time: "Yesterday",
      steps: [{ icon: BROWSER, label: "Checked the sidebar", detail: "expanded and collapsed" }],
      blocks: [
        { type: "p", text: "Два сигнала:" },
        {
          type: "ul",
          items: [
            "Точка на аватаре: глина — где-то блокер. Меню аватара переключает Available, Busy до 16:00 и Do not disturb.",
            "Свёрнутый проект с блокером внутри получает точку в колонке «+». Развернул — точка переходит на чат.",
          ],
        },
      ],
    },
    u("Переименуй раздел. Inbox — это почта. Может, «Up next»?"),
    {
      role: "assistant",
      time: "3 hours ago",
      blocks: [
        { type: "status", label: "Edited", target: "Sidebar.tsx, App.tsx", diff: { added: 9, removed: 8 } },
        { type: "p", text: "Раздел называется «Up next», адрес `/up-next`. Старый `/inbox` перенаправляет туда. В коде компоненты пока называются Inbox — переименую отдельно, чтобы не смешивать с этой задачей." },
        { type: "p", text: "Иконку лотка оставил: она про «что пришло», и её анимация при наведении уже привычна." },
      ],
    },
    u("В Can wait у задач сейчас глиняная точка, как у Blocked. Но они же не стоят"),
    {
      role: "assistant",
      thought: "Ran 2 steps",
      time: "6 minutes ago",
      steps: [{ icon: READ, label: "Read inboxStore.ts", detail: "taskStatus" }],
      blocks: [
        { type: "p", text: "Верно, глина должна значить «агент стоит». Делаю у Can wait пульсирующую серую точку, как у работающего чата, и строку с шагом, который идёт, пока вопрос ждёт." },
        { type: "p", text: "Дальше — сводка за время отсутствия. Про неё вопрос, но он может подождать:" },
        { type: "question", id: "q1" },
      ],
    },
  ],

  "chat-levels": [
    u("Сейчас любой чат выглядит одинаково — что «поправь отступ», что «сделай оплату». Хочу, чтобы интерфейс задачи появлялся, только когда задача этого стоит"),
    {
      role: "assistant",
      thought: "Ran 5 steps",
      time: "Yesterday",
      steps: [
        { icon: READ, label: "Read docs/INBOX.md" },
        { icon: READ, label: "Read ChatPanel.tsx, Transcript.tsx" },
        { icon: SEARCH, label: "Found 6 similar tasks", detail: "chat UI · 2 over budget" },
      ],
      blocks: [
        { type: "p", text: "Предлагаю четыре уровня, от чата до большой задачи:" },
        {
          type: "table",
          head: ["Уровень", "Что видно", "Пример"],
          rows: [
            ["0", "Просто чат", "«Как пройти собеседование?»"],
            ["1", "Ответ и карточка результата", "Дата рождения сдвигается на день"],
            ["2", "Чат и план", "Поиск по каталогу"],
            ["3", "Бриф, план и гейты", "Оплата в один клик"],
          ],
        },
        { type: "p", text: "Задача меняет чат для всех задач, и 2 из 6 похожих вышли за бюджет. Поэтому бриф и план, и первое допущение — самое рискованное: может, хватит двух уровней." },
        { type: "brief-card" },
      ],
    },
    u("Четыре — ок. А кто решает, какой уровень? Я не хочу выбирать это руками"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Агент, в два этапа:" },
        {
          type: "ol",
          items: [
            "До отправки — угадывает по тексту черновика. Оплата, авторизация, миграции, удаление — сразу 3. Это подсказка под композером, а не приговор.",
            "После чтения кода — уточняет по размеру: сколько модулей задевает и сколько стоили похожие задачи.",
          ],
        },
        { type: "p", text: "Уровень растёт только с твоего согласия и сам никогда не падает — иначе интерфейс будет прыгать." },
      ],
    },
    u("Принято, запускай"),
    {
      role: "assistant",
      thought: "Edited 3 files",
      time: "Yesterday",
      steps: [
        { icon: RUN, label: "Ran npm run typecheck" },
        { icon: RUN, label: "Ran npm run build" },
      ],
      blocks: [
        { type: "p", text: "Модель готова: задача, план, вопросы и гейты — в `task.ts`, и Up next, и чат берут их оттуда. Теперь план в Up next и в чате — это буквально одни данные." },
        {
          type: "files",
          title: "Edited 3 files",
          diff: { added: 373, removed: 38 },
          files: [
            { name: "task.ts", diff: { added: 142, removed: 38 } },
            { name: "chatTaskStore.ts", diff: { added: 197, removed: 0 } },
            { name: "chatTasks.ts", diff: { added: 34, removed: 0 } },
          ],
        },
      ],
    },
    {
      role: "assistant",
      thought: "Edited ChatComposerChin.tsx",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Добавил лимиты задачи: куда агент пишет, что только читает, что делает без спроса и сколько может потратить. Под композером — чип «Limits: checkout/ +1 · $12», клик открывает их." },
      ],
    },
    u("«Envelope» в интерфейсе — странное слово. И чип под композером никто не поймёт"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Согласен. Слово заменил на «limits» везде, включая тексты агента. Чип убрал: лимиты видны в брифе, в разделе «What I won't touch», — там, где их и читают." },
        { type: "status", label: "Edited", target: "ChatComposerChin.tsx, ChatTask.tsx, CHAT_LEVELS.md", diff: { added: 18, removed: 64 } },
      ],
    },
    u("Как выглядит гейт брифа в чате?"),
    {
      role: "assistant",
      thought: "Ran 2 steps",
      time: "8 hours ago",
      steps: [{ icon: BROWSER, label: "Opened /code/one-click-pay", detail: "1440 × 900" }],
      blocks: [
        { type: "p", text: "Бриф живёт в чате, пока его не приняли. Рискованные допущения нужно отметить: «верно» или «поправить» своими словами. Критерии готовности можно добавить — добавленные тобой агент ослабить не может." },
        { type: "p", text: "После принятия бриф сворачивается в строку «Brief accepted», а агент пишет, с чего начинает. Попробуй на «Оплате в один клик»." },
      ],
    },
    u("Что с маленькими задачами? Там же нет брифа"),
    {
      role: "assistant",
      thought: "Edited 2 files",
      time: "7 hours ago",
      steps: [{ icon: RUN, label: "Ran npm run build" }],
      blocks: [
        { type: "p", text: "Маленькая задача заканчивается карточкой «What I checked»: каждое утверждение с доказательством. Доказательство кликается и открывает рядом с чатом дифф, скриншоты или проверки." },
        { type: "p", text: "А если маленькая задача разрослась — как «Скидка постоянным покупателям», где понадобилась миграция, — агент предлагает этапы и гейт перед миграцией. Без согласия доделывает без плана." },
        {
          type: "files",
          title: "Edited 2 files",
          diff: { added: 294, removed: 12 },
          files: [
            { name: "ReviewPane.tsx", diff: { added: 214, removed: 0 } },
            { name: "ChatTask.tsx", diff: { added: 80, removed: 12 } },
          ],
        },
      ],
    },
    u("Предложение эскалации выглядит как стена текста. Пусть читается как план"),
    {
      role: "assistant",
      time: "6 hours ago",
      blocks: [
        { type: "status", label: "Edited", target: "ChatTask.tsx", diff: { added: 46, removed: 31 } },
        { type: "p", text: "Теперь «What I propose» — пронумерованные этапы, шаги на рельсе, сделанное отмечено серыми точками. Три уровня отступов: разделы, этапы, строки." },
      ],
    },
    u("Решения сейчас разбросаны: гейт в ленте, вопросы в панели, результат в карточке. Собери всё в одном месте"),
    {
      role: "assistant",
      thought: "Edited 3 files",
      time: "4 hours ago",
      steps: [
        { icon: READ, label: "Read the Claude Code question panel", detail: "original/" },
        { icon: RUN, label: "Ran npm run typecheck" },
      ],
      blocks: [
        { type: "p", text: "Собрал все решения в док над композером, нарисованный как панель вопросов Claude Code: заголовок-вопрос, варианты, каждый говорит, что будет дальше." },
        {
          type: "ul",
          items: [
            "Гейт — «Start with this brief and plan?»",
            "Допущение — «Confirm this assumption?»",
            "Вопрос агента — его же текст.",
            "Эскалация — «Split this into stages?»",
            "Результат — «Accept the result?»",
          ],
        },
        { type: "p", text: "Панели брифа и плана теперь только для чтения." },
      ],
    },
    u("Док съедает полэкрана на гейте. И у тебя там что-то выбрано заранее — я случайно нажал Enter"),
    {
      role: "assistant",
      thought: "Ran 3 steps",
      time: "14 minutes ago",
      steps: [
        { icon: BROWSER, label: "Measured the dock", detail: "gate: 412px of 900" },
        { icon: READ, label: "Read CHAT_LEVELS.md", detail: "decision log" },
      ],
      blocks: [
        { type: "p", text: "Да, на гейте док занимает 412px из 900: бриф с допущениями не помещается, и главное уезжает в «Details». Предвыбор уберу в любом случае — случайный Enter на гейте запускает задачу." },
        { type: "p", text: "Но дальше развилка, и она меняет план, поэтому стою:" },
        { type: "question", id: "q1" },
      ],
    },
  ],

  "dev-port": [
    u("Запускаю два превью параллельно — второе падает: порт 5173 занят. Пусть dev-сервер берёт порт из PORT"),
    {
      role: "assistant",
      thought: "Ran 4 commands",
      time: "25 minutes ago",
      steps: [
        { icon: READ, label: "Read vite.config.ts" },
        { icon: RUN, label: "Ran PORT=5180 npm run dev" },
        { icon: RUN, label: "Ran npm run dev", detail: "in parallel" },
      ],
      blocks: [
        { type: "p", text: "Готово: `vite.config.ts` берёт порт из `PORT`, без переменной — 5173, как раньше. Добавил конфигурацию превью в `.claude/launch.json`, чтобы превью запускались на своих портах." },
        { type: "code", lang: "ts", code: "server: {\n  port: Number(process.env.PORT) || 5173,\n  strictPort: !!process.env.PORT,\n}," },
        { type: "p", text: "`strictPort` включён только с `PORT`: если явно попросил порт, а он занят, лучше упасть, чем тихо уехать на соседний." },
        { type: "result-card" },
      ],
    },
  ],

  "chat-scroll": [
    u("Открываю длинный чат — он открывается где-то посередине. А когда появляется живой статус, лента прыгает"),
    {
      role: "assistant",
      steps: [
        { icon: READ, label: "Read ScrollFadeContainer.tsx" },
        { icon: SEARCH, label: "Searched for scrollTop", detail: "3 matches" },
        { icon: BROWSER, label: "Opened /code/chat-levels", detail: "38 messages" },
      ],
      blocks: [
        {
          type: "p",
          text: "Причина нашлась: прокрутка вниз срабатывает до того, как дорисовались блоки кода и таблицы, поэтому чат останавливается на высоте первых сообщений. А живой статус добавляет 40px снизу, и браузер держит позицию сверху, а не снизу.",
        },
        { type: "p", text: "Держу ленту прижатой к низу через ResizeObserver, пока ты сам не прокрутил вверх. Проверю на самом длинном чате." },
      ],
    },
  ],
};

/** What the running yango task chats are doing now. */
export const YANGO_LIVE_STATUS: Record<string, LiveStatus> = {
  "brief-plan": { step: "Wiring the live row to the plan step", target: "Transcript.tsx", stats: "18m · 3.1M tokens" },
  "up-next": { step: "Pulsing dot for Can wait rows", target: "InboxPage.tsx", stats: "6m · 4.6M tokens" },
  "chat-scroll": { step: "Pinning the feed to the bottom", target: "ScrollFadeContainer.tsx", stats: "2m · 88K tokens" },
};
