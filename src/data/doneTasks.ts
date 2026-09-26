/**
 * Finished chats with their plan after the fact: what was done, step by step, as it happened in the chat.
 * They are tasks too, so the chat has its "Plan" like any other; they are done, so Up next does not list them
 * (not in TASKS: the away recap counts decisions and spend from there). Model: task.ts.
 */
import type { Task } from "./task";

const DONE = { stage: "Done", now: "Done" };

const COPY_PROTOTYPE: Task = {
  id: "copy-prototype",
  title: "Копирование прототипа",
  summary: "Копия прототипа из Alloy один в один, потом пересборка в обычный React-проект. Готово: стартовый экран совпадает с оригиналом, проект в git.",
  project: "yango-prototype",
  ...DONE,
  agent: "ui-engineer",
  model: "Opus 5.5",
  spent: "$6.33",
  tokens: "2.1M",
  autoDecisions: [],
  level: 3,
  levelReason: "the base of the whole prototype, 2,800+ lines",
  brief: {
    understanding: "Копирую прототип из Alloy один в один, потом пересобираю в обычный React-проект, чтобы его можно было дорабатывать.",
    found: [
      { text: "Alloy отдаёт собранные файлы, а не исходники", source: "Бандл прототипа" },
      { text: "CSS ищет шрифты по абсолютному пути `/assets/fonts/…`", source: "`index-CG0TLgsx.css`" },
      { text: "В классах оригинала буквально записано `&amp;` вместо `&`, часть правил CSS не срабатывает", source: "Сверка 376 элементов" },
      { text: "Иконки — символы шрифта Anthropicons из частной области Юникода", source: "Бандл, `String.fromCharCode`" },
    ],
    assumptions: [
      { id: "bytes", text: "Скопированные файлы не правлю: отличия чиню снаружи — пути и сервер" },
      { id: "amp", text: "`&amp;` в классах оставляю, как в оригинале: исправление сдвигает вёрстку на 4px" },
    ],
    boundaries: ["`original/` не трогаю: это эталон для сверки"],
    doneWhen: [
      { id: "match", text: "Стартовый экран совпадает с оригиналом", met: "Сверка 376 элементов, расхождение не больше 0,5px" },
      { id: "build", text: "typecheck и build проходят", locked: true, met: "`npm run build`" },
    ],
  },
  stages: [
    {
      id: "copy",
      title: "Copy",
      steps: [
        {
          id: "bundle",
          status: "done",
          title: "Скачать бандл, стили и 40 ассетов",
          work: { agent: "ui-engineer", cost: "$0.60", time: "12m" },
          result: { summary: "Те же файлы, что отдаёт Alloy, поэтому копия совпадает с оригиналом один в один." },
        },
        {
          id: "fonts",
          status: "done",
          title: "Шрифты туда, где их ждёт CSS",
          work: { agent: "ui-engineer", cost: "$0.20", time: "6m" },
          result: { summary: "Все 39 запросов шрифтов падали с 404, и браузер брал системный. Переложил 39 файлов в `assets/fonts/`, CSS не трогал." },
        },
        { id: "banner", status: "done", title: "Убрать баннер «Try Claude Tag»", work: { agent: "ui-engineer", cost: "$0.05", time: "2m" } },
        {
          id: "serve",
          status: "done",
          title: "Отдавать `index.html` на любой путь",
          work: { agent: "ui-engineer", cost: "$0.08", time: "3m" },
          result: { summary: "`serve.py` отдавал 404 на всё, кроме корня, и перезагрузка на `/code/…` давала белый экран." },
        },
      ],
    },
    {
      id: "rebuild",
      title: "Rebuild",
      steps: [
        {
          id: "react",
          status: "done",
          title: "Пересобрать в Vite + React 19 + TypeScript",
          work: { agent: "ui-engineer", cost: "$3.80", time: "1h 10m" },
          result: { summary: "Вызовы `jsx()` вернул в JSX, каждый компонент — в своём файле." },
        },
        {
          id: "compare",
          status: "done",
          title: "Сверить 376 элементов с оригиналом",
          work: { agent: "ui-engineer", cost: "$0.90", time: "18m" },
          result: {
            summary: "Оригинал и копия в одном окне одного размера: у каждого видимого элемента сравнил положение, размер, цвет и шрифт.",
            decisions: ["Способ сверки записал в `CLAUDE.md`, раздел Verify"],
          },
        },
        { id: "icons", status: "done", title: "Вернуть иконки Anthropicons, компонент `Icon`", work: { agent: "ui-engineer", cost: "$0.60", time: "14m" } },
      ],
    },
    {
      id: "save",
      title: "Save",
      steps: [{ id: "git", status: "done", title: "Приватный репозиторий и первый коммит", work: { agent: "ui-engineer", cost: "$0.10", time: "3m" } }],
      gate: { title: "the result", mine: true, status: "passed" },
    },
  ],
};

const DESIGN_SYSTEM: Task = {
  id: "design-system",
  title: "Создание дизайн-системы",
  summary: "Справочник токенов дизайн-системы Claude Code и правила, по которым любой агент строит новый UI на токенах, а не на хексах.",
  project: "yango-prototype",
  ...DONE,
  agent: "ui-engineer",
  model: "Opus 5.5",
  spent: "$4.50",
  tokens: "1.4M",
  autoDecisions: [],
  level: 3,
  levelReason: "rules every agent builds UI by, about 2,000 lines",
  brief: {
    understanding: "Доступа к дизайн-системе Claude Code нет, но она целиком лежит в CSS прототипа. Собираю из неё справочник токенов и правила для нового UI.",
    found: [
      { text: "В дизайн-системе 983 переменные, 24 из них служебные", source: "`design-system.css`, значения посчитаны в браузере" },
      { text: "В плотности compact меняются 142 токена: отступы, высота строк, контролы. Цвета — нет", source: "`data-density=compact`" },
      { text: "Anthropicons — вариативный шрифт: чем меньше иконка, тем она жирнее", source: "Оси шрифта Anthropicons" },
    ],
    assumptions: [{ id: "internal", text: "Служебные переменные в справочник не беру: в интерфейсе они не используются" }],
    boundaries: ["`design-system.css` не правлю: это скомпилированный оригинал"],
    doneWhen: [
      { id: "tokens", text: "Каждый токен есть на `/tokens`, с обоими значениями плотности", met: "`/tokens`" },
      { id: "rules", text: "Правила UI записаны так, что их читает каждый агент", met: "`docs/DESIGN_GUIDE.md`, `CLAUDE.md`" },
    ],
  },
  stages: [
    {
      id: "tokens",
      title: "Tokens",
      steps: [
        {
          id: "compute",
          status: "done",
          title: "Посчитать все токены в браузере",
          work: { agent: "ui-engineer", cost: "$1.40", time: "22m" },
          result: { summary: "983 переменные, в справочнике 959: 24 служебные — промежуточные значения вроде `--cds-_shadow-color`." },
        },
        { id: "docs", status: "done", title: "`tokens.json` и `DESIGN_TOKENS.md`", work: { agent: "ui-engineer", cost: "$0.90", time: "15m" } },
        {
          id: "tailwind",
          status: "done",
          title: "Подключить токены к Tailwind",
          work: { agent: "ui-engineer", cost: "$0.70", time: "12m" },
          result: { summary: "Классы вроде `bg-surface-2` и `text-muted` дают правильные цвета в тёмной и светлой теме." },
        },
      ],
    },
    {
      id: "polish",
      title: "Density and icons",
      steps: [
        { id: "density", status: "done", title: "Переключатель плотности на `/tokens`", work: { agent: "ui-engineer", cost: "$0.60", time: "10m" } },
        {
          id: "icon",
          status: "done",
          title: "Размер и вес иконок в `Icon`",
          work: { agent: "ui-engineer", cost: "$0.40", time: "8m" },
          result: { summary: "`Icon` не задавал размер и вес, иконки наследовали 13px и 400 и выглядели тонкими. Теперь как в оригинале." },
        },
      ],
    },
    {
      id: "rules",
      title: "Rules",
      steps: [{ id: "guide", status: "done", title: "Правила в `DESIGN_GUIDE.md`, выжимка в `CLAUDE.md`", work: { agent: "ui-engineer", cost: "$0.50", time: "9m" } }],
    },
  ],
};

const SIDEBAR_NAV: Task = {
  id: "sidebar-nav",
  title: "Сайдбар: проекты и Routines",
  summary: "Страница Routines и навигация в сайдбаре по проектам, как в оригинале: чаты в проектах, «+» у проекта, фильтры сверху.",
  project: "yango-prototype",
  ...DONE,
  agent: "ui-engineer",
  model: "Opus 5.5",
  spent: "$3.35",
  tokens: "1.1M",
  autoDecisions: [],
  level: 2,
  levelReason: "a new page and the sidebar navigation, 1,000+ lines",
  stages: [
    {
      id: "build",
      title: "Build",
      steps: [
        { id: "routines", status: "done", title: "Страница `/routines`", work: { agent: "ui-engineer", cost: "$1.10", time: "20m" } },
        {
          id: "projects",
          status: "done",
          title: "Навигация по проектам",
          work: { agent: "ui-engineer", cost: "$1.30", time: "24m" },
          result: { summary: "Проекты — по последней активности, пустые в конце и только с «Show empty groups». Элементы вынесены в `src/ui`." },
        },
        { id: "other", status: "done", title: "Убрать группу Other", work: { agent: "ui-engineer", cost: "$0.10", time: "2m" } },
        {
          id: "mocks",
          status: "done",
          title: "Проекты под Up next: yango-prototype, storefront, astrology-app",
          work: { agent: "ui-engineer", cost: "$0.70", time: "12m" },
          result: { summary: "Сначала оставил один проект, потом вернул два — уже с задачами, которые стоят каждая в своём месте Up next." },
        },
        { id: "plus", status: "done", title: "«+» у проекта не прыгает при наведении", work: { agent: "ui-engineer", cost: "$0.15", time: "4m" } },
      ],
      gate: { title: "the result", mine: true, status: "passed" },
    },
  ],
};

const VISUAL_POLISH: Task = {
  id: "visual-polish",
  title: "Доработки визуала и анимации",
  summary: "Чат с контентом выглядит как в оригинале: заголовок, статус, строка репозитория, звёздочка, карточки команд и файлов, действия у ответа.",
  project: "yango-prototype",
  ...DONE,
  agent: "ui-engineer",
  model: "Opus 5.5",
  spent: "$3.70",
  tokens: "1.2M",
  autoDecisions: [],
  level: 2,
  levelReason: "five parts of the chat screen, about 500 lines",
  stages: [
    {
      id: "polish",
      title: "Polish",
      steps: [
        { id: "header", status: "done", title: "Заголовок, статус и строка репозитория у чата", work: { agent: "ui-engineer", cost: "$0.90", time: "16m" } },
        {
          id: "spark",
          status: "done",
          title: "Анимация звёздочки по видео",
          work: { agent: "ui-engineer", cost: "$1.20", time: "25m" },
          result: { summary: "Разобрал запись по кадрам на 60 fps: звёздочка не мерцает, а «дышит» формой. Поворот лучей убрал — лишний." },
        },
        { id: "cards", status: "done", title: "Карточка команды и карточка изменённых файлов", work: { agent: "ui-engineer", cost: "$0.80", time: "15m" } },
        { id: "actions", status: "done", title: "Действия при наведении на ответ", work: { agent: "ui-engineer", cost: "$0.50", time: "10m" } },
        { id: "scroll", status: "done", title: "Скроллбар у правого края панели", work: { agent: "ui-engineer", cost: "$0.30", time: "6m" } },
      ],
    },
  ],
};

const AVATAR_STATUS: Task = {
  id: "avatar-status",
  title: "Статус внимания на аватаре",
  summary: "По сайдбару видно, что где-то ждёт агент, даже из другого чата. Режим внимания — в меню аватара.",
  project: "yango-prototype",
  ...DONE,
  agent: "ui-engineer",
  model: "Opus 5.5",
  spent: "$0.95",
  tokens: "310K",
  autoDecisions: [],
  level: 1,
  stages: [
    {
      id: "build",
      title: "Build",
      steps: [
        {
          id: "dot",
          status: "done",
          title: "Точка на аватаре, когда ждёт агент",
          work: { agent: "ui-engineer", cost: "$0.30", time: "7m" },
          result: { summary: "Глина — где-то блокер. Без числа: нужен сигнал «загляни», а число давит." },
        },
        { id: "mode", status: "done", title: "Режим внимания в меню аватара", work: { agent: "ui-engineer", cost: "$0.40", time: "9m" } },
        { id: "folded", status: "done", title: "Точка у свёрнутого проекта с блокером", work: { agent: "ui-engineer", cost: "$0.20", time: "5m" } },
        { id: "center", status: "done", title: "Точка по центру колонки «+»", work: { agent: "ui-engineer", cost: "$0.05", time: "2m" } },
      ],
    },
  ],
};

const BUDGET_LINE: Task = {
  id: "budget-line",
  title: "Лимит недели в сайдбаре",
  summary: "Тонкая линия над профилем: сколько лимита недели потрачено. Цифры — в карточке при наведении.",
  project: "yango-prototype",
  ...DONE,
  agent: "ui-engineer",
  model: "Opus 5.5",
  spent: "$0.53",
  tokens: "170K",
  autoDecisions: [],
  level: 1,
  stages: [
    {
      id: "build",
      title: "Build",
      steps: [
        {
          id: "line",
          status: "done",
          title: "Линия лимита над профилем",
          work: { agent: "ui-engineer", cost: "$0.25", time: "6m" },
          result: { summary: "Цвет обычный до 80%, дальше глиняный." },
        },
        { id: "card", status: "done", title: "Карточка с цифрами при наведении", work: { agent: "ui-engineer", cost: "$0.20", time: "5m" } },
        { id: "place", status: "done", title: "Карточка справа от сайдбара, не на профиле", work: { agent: "ui-engineer", cost: "$0.08", time: "2m" } },
      ],
    },
  ],
};

const WORKING_DOT: Task = {
  id: "working-dot",
  title: "Пульсация рабочей точки",
  summary: "Пока в чате идёт работа, слева плавно пульсирует серая точка.",
  project: "yango-prototype",
  ...DONE,
  agent: "ui-engineer",
  model: "Sonnet 5",
  spent: "$0.32",
  tokens: "120K",
  autoDecisions: [],
  level: 1,
  stages: [
    {
      id: "build",
      title: "Build",
      steps: [
        { id: "dot", status: "done", title: "Серая пульсирующая точка", work: { agent: "ui-engineer", cost: "$0.08", time: "3m" } },
        {
          id: "rhythm",
          status: "done",
          title: "Ритм: пик 0,7, `ease-in-out`, цикл 2,4 с",
          work: { agent: "ui-engineer", cost: "$0.20", time: "8m" },
          result: { summary: "Записал 10 циклов: с `ease` точка висела на пике около 120 мс. Четыре коммита — от первой пульсации до финального ритма." },
        },
        { id: "motion", status: "done", title: "Без пульса в Reduce motion", work: { agent: "ui-engineer", cost: "$0.04", time: "2m" } },
      ],
    },
  ],
};

const PROMO_CODES: Task = {
  id: "promo-codes",
  title: "Промокоды в корзине",
  summary: "Промокод в корзине: поле ввода, проверка на сервере, скидка отдельной строкой в итоге.",
  project: "storefront",
  ...DONE,
  agent: "payments-engineer",
  model: "Opus 5.5",
  spent: "$2.80",
  tokens: "860K",
  autoDecisions: [],
  level: 2,
  levelReason: "it changes the order total",
  brief: {
    understanding: "Промокод в корзине: поле ввода, проверка на сервере, скидка в итоговой сумме.",
    found: [{ text: "Правила промокодов уже есть — их писали для рассылок, но в корзину не выводили", source: "`server/promo/rules.ts`" }],
    assumptions: [
      { id: "one", text: "Один промокод на заказ", risky: true, why: "Решение продукта", confirmed: true },
      { id: "stack", text: "Со скидкой распродажи не суммируется: берём большую", risky: true, why: "Решение продукта", confirmed: true },
    ],
    boundaries: ["Правила промокодов не меняю — только читаю"],
    doneWhen: [
      { id: "total", text: "Скидка видна отдельной строкой в итоге", met: "`npm test -- cart`" },
      { id: "expired", text: "Истёкший код не списывается по старой цене", met: "Тест на истёкший код" },
    ],
  },
  stages: [
    {
      id: "build",
      title: "Build",
      steps: [
        { id: "rules", status: "done", title: "Правила из `server/promo/rules.ts`", work: { agent: "payments-engineer", cost: "$0.30", time: "6m" } },
        { id: "field", status: "done", title: "Поле в корзине и `POST /promo/validate`", work: { agent: "payments-engineer", cost: "$1.40", time: "26m" } },
        {
          id: "total",
          status: "done",
          title: "Скидка строкой в итоге",
          work: { agent: "payments-engineer", cost: "$0.60", time: "12m" },
          result: { summary: "Если скидка распродажи больше, под полем: «Уже действует скидка выгоднее»." },
        },
        {
          id: "expired",
          status: "done",
          title: "Повторная проверка кода при оплате",
          work: { agent: "payments-engineer", cost: "$0.50", time: "10m" },
          result: { summary: "Код истёк, пока человек в корзине: не списываем по старой цене, возвращаем в корзину с новой суммой. Тест на этот случай." },
        },
      ],
      gate: { title: "the result", mine: true, status: "passed" },
    },
  ],
};

export const DONE_TASKS: Task[] = [COPY_PROTOTYPE, DESIGN_SYSTEM, SIDEBAR_NAV, VISUAL_POLISH, AVATAR_STATUS, BUDGET_LINE, WORKING_DOT, PROMO_CODES];
