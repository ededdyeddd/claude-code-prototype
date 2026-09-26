import type { Turn } from "./transcripts";

/** Finished chats of the yango-prototype project: a condensed replay of how this prototype was built. */

const READ = "";
const RUN = "";
const SEARCH = "";
const BROWSER = "";
const DOWNLOAD = "";
const COMPARE = "";

const u = (text: string): Turn => ({ role: "user", text });

export const YANGO_TRANSCRIPTS: Record<string, Turn[]> = {
  "copy-prototype": [
    u("https://alloy.app/eduard-titskiy/p/828ed15b-…\nМожешь скопировать этот прототип 1 в 1?"),
    {
      role: "assistant",
      thought: "Ran 6 commands",
      steps: [
        { icon: BROWSER, label: "Opened the prototype", detail: "alloy.app" },
        { icon: SEARCH, label: "Found the prototype iframe" },
        { icon: DOWNLOAD, label: "Downloaded the bundle and styles" },
        { icon: DOWNLOAD, label: "Downloaded 40 assets", detail: "39 fonts, 1 image" },
      ],
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Скопировал прототип в `Yango_test`: это те же файлы, что отдаёт Alloy, поэтому копия совпадает с оригиналом один в один." },
        {
          type: "ul",
          items: [
            "`index.html` — страница, из неё убраны скрипты Alloy и аналитики.",
            "`index-C7gYdJDR.js` и `index-CG0TLgsx.css` — код и стили приложения.",
            "`fonts/` и `images/` — 39 шрифтов и 1 картинка.",
            "`serve.py` — локальный сервер, чтобы работала перезагрузка на `/code`.",
          ],
        },
        { type: "code", lang: "bash", code: "python3 serve.py" },
        { type: "p", text: "Ограничение: это собранные файлы, а не исходники. Если прототип будем дорабатывать, лучше пересобрать его в обычный React-проект." },
      ],
    },
    u("Открыл — шрифты другие, похоже на Arial"),
    {
      role: "assistant",
      thought: "Ran 3 commands",
      steps: [
        { icon: BROWSER, label: "Read the network log", detail: "39 font requests, 39 × 404" },
        { icon: READ, label: "Read index-CG0TLgsx.css", detail: "@font-face" },
      ],
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Шрифты лежат, но CSS ищет их по абсолютному пути `/assets/fonts/…`, а я положил их в `fonts/`. Все 39 запросов падали с 404, и браузер брал системный шрифт." },
        { type: "p", text: "Переложил шрифты туда, где их ждёт CSS, а не правил сам CSS — так копия остаётся байт в байт." },
        { type: "status", label: "Moved 39 files", target: "assets/fonts/" },
      ],
    },
    u("Теперь ок. Убери баннер «Try Claude Tag», он нам не нужен"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "status", label: "Edited", target: "index-C7gYdJDR.js", diff: { added: 0, removed: 1 } },
        { type: "p", text: "Убрал баннер вместе с пустой обёрткой вокруг него, так что на его месте не осталось отступа. В сайдбаре внизу теперь только профиль." },
      ],
    },
    u("При перезагрузке на /code/что-то — белый экран"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "`serve.py` отдавал 404 на любой путь, кроме корня, а роутер приложения ждёт `index.html` на всех адресах. Теперь сервер отдаёт `index.html` на всё, что не файл." },
        { type: "status", label: "Edited", target: "serve.py", diff: { added: 9, removed: 2 } },
      ],
    },
    u("Пересобери это в нормальный React-проект"),
    {
      role: "assistant",
      thought: "Ran 18 commands",
      steps: [
        { icon: READ, label: "Read index-C7gYdJDR.js", detail: "47 components" },
        { icon: RUN, label: "Converted jsx() calls back to JSX", detail: "Babel" },
        { icon: RUN, label: "Ran npm run build" },
        { icon: COMPARE, label: "Compared 376 elements with the original" },
      ],
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Готово: Vite + React 19 + TypeScript, каждый компонент в своём файле. Стартовый экран совпадает с оригиналом — я сравнил все 376 видимых элементов." },
        {
          type: "files",
          title: "Created 52 files",
          diff: { added: 2804, removed: 0 },
          visible: 3,
          files: [
            { name: "App.tsx", diff: { added: 258, removed: 0 } },
            { name: "Sidebar.tsx", diff: { added: 141, removed: 0 } },
            { name: "ChatComposer.tsx", diff: { added: 96, removed: 0 } },
            { name: "…and 49 more", diff: { added: 2309, removed: 0 } },
          ],
        },
        { type: "h3", text: "Одна находка" },
        {
          type: "p",
          text: "В оригинале в нескольких классах буквально записано `&amp;` вместо `&`, поэтому часть правил CSS там не срабатывает. JSX это «исправил», и приветствие сдвинулось на 4px. Я вернул как было, ради совпадения 1:1.",
        },
        { type: "code", lang: "bash", code: "npm run dev" },
      ],
    },
    u("Как ты сравнивал 376 элементов? Я хочу уметь повторить"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Открыл оригинал и копию в одном окне одного размера, обошёл все видимые элементы и сравнил у каждого положение, размер, цвет и шрифт. Расхождение больше 0,5px считается ошибкой." },
        { type: "p", text: "Чтобы повторить, подними оба рядом:" },
        { type: "code", lang: "bash", code: "npm run dev       # копия, :5173/code\nnpm run original  # оригинал, :5174/code" },
        { type: "p", text: "Записал это в `CLAUDE.md` в раздел Verify, чтобы следующие задачи сверялись так же." },
      ],
    },
    u("В меню модели иконки не те — какие-то квадратики"),
    {
      role: "assistant",
      thought: "Ran 4 commands",
      steps: [
        { icon: READ, label: "Read the Anthropicons glyph map" },
        { icon: SEARCH, label: "Searched for String.fromCharCode", detail: "11 matches" },
      ],
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Иконки — это символы шрифта Anthropicons из частной области Юникода. В бандле они записаны как `String.fromCharCode(57412)`, а при переводе в JSX 11 из них превратились в обычный текст «57412»." },
        { type: "p", text: "Вернул символы, заодно написал компонент `Icon`, чтобы дальше их не собирать руками:" },
        { type: "code", lang: "tsx", code: '<Icon glyph={"\\uE044"} size="md" />' },
        { type: "status", label: "Edited 11 files", diff: { added: 23, removed: 23 } },
      ],
    },
    u("Ок, сохрани это в git. Это будет исходная точка"),
    {
      role: "assistant",
      thought: "Pushed",
      thoughtTarget: "main",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Создал приватный репозиторий и отправил туда первый коммит. Чтобы поднять проект на другом компьютере:" },
        { type: "code", lang: "bash", code: "git clone https://github.com/ededdyeddd/claude-code-prototype.git" },
        { type: "p", text: "Затем `npm install` и `npm run dev`. Оригинал из Alloy лежит в `original/` без изменений — для сверки. Дальше предлагаю вести каждую доработку в отдельной ветке и сливать в `main`." },
      ],
    },
  ],

  "design-system": [
    u("У тебя есть доступ к дизайн-системе Claude Code или ты с ней знаком?"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Внутреннего доступа нет: ни исходников, ни Figma-библиотеки. Но почти всё нужное уже лежит в прототипе:" },
        {
          type: "ul",
          items: [
            "983 CSS-переменные `--cds-*`: цвета, отступы, типографика, радиусы, тени.",
            "Шрифты Anthropic и иконочный шрифт Anthropicons.",
            "Стили примерно 35 компонентов по атрибуту `data-cds`: Button, Card, Tabs, Toast…",
          ],
        },
        { type: "p", text: "Могу собрать из этого справочник токенов и правила для нового UI." },
      ],
    },
    u("Давай, всё по пунктам"),
    {
      role: "assistant",
      thought: "Ran 11 commands",
      steps: [
        { icon: BROWSER, label: "Computed every token in the browser", detail: "dark, light, compact" },
        { icon: READ, label: "Read design-system.css" },
        { icon: RUN, label: "Generated tokens.json and DESIGN_TOKENS.md" },
      ],
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Собрал справочник и подключил дизайн-систему к разработке." },
        {
          type: "table",
          head: ["Что", "Где"],
          rows: [
            ["959 токенов в 33 группах", "`/tokens`, `docs/DESIGN_TOKENS.md`"],
            ["373 иконки Anthropicons", "`/tokens#icons`"],
            ["Tailwind v4 на токенах", "`src/styles/tailwind.css`"],
            ["Примитивы Theme, Icon, Button", "`src/ui`"],
            ["Правила для нового UI", "`docs/DESIGN_GUIDE.md`, `CLAUDE.md`"],
          ],
        },
        {
          type: "files",
          title: "Edited 6 files",
          diff: { added: 1873, removed: 4 },
          visible: 3,
          files: [
            { name: "TokensPage.tsx", diff: { added: 312, removed: 0 } },
            { name: "tailwind.css", diff: { added: 541, removed: 0 } },
            { name: "index.tsx", diff: { added: 146, removed: 0 } },
            { name: "DESIGN_GUIDE.md", diff: { added: 96, removed: 0 } },
            { name: "tokens.json", diff: { added: 752, removed: 0 } },
            { name: "main.tsx", diff: { added: 26, removed: 4 } },
          ],
        },
        { type: "p", text: "Теперь классы вроде `bg-surface-2`, `text-muted` и `bg-fill-accent` сразу дают правильные цвета в тёмной и светлой теме." },
      ],
    },
    u("Почему 959, а не 983?"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "24 переменные — служебные: промежуточные значения, через которые считаются другие токены, вроде `--cds-_shadow-color`. Сами по себе в интерфейсе они не используются, поэтому в справочник не попали." },
        { type: "p", text: "Если нужно, покажу их отдельной группой «Internal» внизу `/tokens`." },
      ],
    },
    u("Не нужно. А плотность? В оригинале есть compact"),
    {
      role: "assistant",
      thought: "Ran 2 commands",
      steps: [{ icon: BROWSER, label: "Compared data-density=compact", detail: "142 tokens differ" }],
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Есть. В compact меняются 142 токена: отступы, высота строк и размеры контролов, цвета — нет. На `/tokens` добавил переключатель плотности, у каждого токена видно оба значения." },
        { type: "p", text: "Компоненты получают плотность так же, как тему, — от ближайшего `.cds-root` с `data-density`. Отдельно ничего писать не нужно." },
      ],
    },
    u("Иконки выглядят мелкими и тонкими, как будто проблемы с рендером"),
    {
      role: "assistant",
      thought: "Ran 3 commands",
      steps: [{ icon: READ, label: "Read the Anthropicons font axes", detail: "wght, opsz, ANIM, ANM2" }],
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Причина в общем компоненте `Icon`: он не задавал размер и насыщенность, и иконки наследовали 13px и вес 400. Теперь размеры как в оригинале:" },
        {
          type: "table",
          head: ["Размер", "Где", "px", "Вес"],
          rows: [
            ["sm", "шевроны, мета", "12", "578"],
            ["md", "кнопки", "16", "533"],
            ["lg", "навигация", "20", "433"],
          ],
        },
        { type: "status", label: "Edited", target: "src/ui/index.tsx", diff: { added: 38, removed: 6 } },
      ],
    },
    u("Чем меньше иконка, тем она жирнее?"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Да, так в оригинале, и это правильно: тонкая линия в 12px пропадает, а жирная в 20px выглядит тяжёлой. Шрифт вариативный, поэтому вес меняется плавно, без отдельных файлов." },
      ],
    },
    u("Запиши правила так, чтобы любой агент строил новый UI на токенах, а не на хексах"),
    {
      role: "assistant",
      thought: "Edited 2 files",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Правила в `docs/DESIGN_GUIDE.md`, короткая выжимка — в `CLAUDE.md`, её читает каждый агент в начале работы:" },
        {
          type: "ol",
          items: [
            "Цвета, отступы, шрифты, радиусы, тени и анимации — только из токенов `--cds-*`.",
            "Никаких хексов и стандартной палитры Tailwind.",
            "Всё рендерится внутри `.cds-root`, токены зависят от `data-mode` и `data-density`.",
            "Сначала примитивы из `src/ui`, потом разметка `data-cds` из `src/components`.",
            "`design-system.css` не редактируется: это скомпилированный оригинал.",
          ],
        },
        { type: "status", label: "Edited", target: "DESIGN_GUIDE.md, CLAUDE.md", diff: { added: 64, removed: 3 } },
      ],
    },
  ],

  "sidebar-nav": [
    u("Посмотри вкладку Routines, там есть полезные элементы. И обрати внимание на навигацию в сайдбаре: чаты лежат в проектах, у проекта есть «+», а сверху фильтры"),
    {
      role: "assistant",
      thought: "Ran 9 commands",
      steps: [
        { icon: BROWSER, label: "Opened Routines in the original" },
        { icon: READ, label: "Read the sidebar markup", detail: "data-cds=NavigationRow" },
      ],
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Сделал страницу `/routines` и навигацию по проектам. Элементы вынес в `src/ui`, чтобы использовать дальше." },
        {
          type: "files",
          title: "Edited 12 files",
          diff: { added: 1024, removed: 31 },
          visible: 4,
          files: [
            { name: "RoutinesPage.tsx", diff: { added: 98, removed: 0 } },
            { name: "Menu.tsx", diff: { added: 189, removed: 0 } },
            { name: "ProjectNav.tsx", diff: { added: 162, removed: 0 } },
            { name: "sessions.ts", diff: { added: 96, removed: 0 } },
            { name: "…and 8 more", diff: { added: 479, removed: 31 } },
          ],
        },
        {
          type: "ul",
          items: [
            "`PageHeader`, `Tabs`, `EmptyState`, `WavyDivider`, `ListCard` — для страниц вроде Routines.",
            "`Menu` с подменю и чекбоксами — фильтр Status, Environment, Group by, Sort by.",
            "Выбранный чат хранится в адресе `/code/:id` и подсвечивается в сайдбаре.",
          ],
        },
      ],
    },
    u("В каком порядке идут проекты?"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "По последней активности: сверху проект, в котором что-то происходило позже всего. Пустые проекты — в конце, и только с «Show empty groups». Внутри проекта чаты сортируются так, как выбрано в фильтре." },
      ],
    },
    u("Группа Other нам не нужна, убери"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "status", label: "Edited", target: "sessions.ts, ProjectNav.tsx", diff: { added: 2, removed: 18 } },
        { type: "p", text: "Убрал. Системные чаты, которые туда попадали, теперь в «No folder»." },
      ],
    },
    u("И проектов слишком много для демо. Оставь один, yango-prototype"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "status", label: "Edited", target: "sessions.ts", diff: { added: 4, removed: 41 } },
        { type: "p", text: "Оставил один проект с четырьмя чатами. Остальные моки удалил из `sessions.ts`, а не спрятал — если вернём, соберу заново под задачу." },
      ],
    },
    u("Хм, для Up next нужны задачи в разных проектах. Верни storefront и astrology-app"),
    {
      role: "assistant",
      thought: "Edited 2 files",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Вернул оба проекта, но уже с задачами под Up next: у каждой есть план, и она стоит в своём месте — заблокирована, ждёт или идёт сама." },
        {
          type: "table",
          head: ["Проект", "Чаты", "Ждут тебя"],
          rows: [
            ["yango-prototype", "4", "1"],
            ["storefront", "6", "3"],
            ["astrology-app", "6", "2"],
          ],
        },
        { type: "p", text: "storefront сверху: в нём самая свежая активность." },
      ],
    },
    u("При наведении на проект «+» прыгает"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "«+» появлялся с `display: none → flex`, и строка пересчитывала ширину названия. Теперь он всегда на месте и только меняет прозрачность — названию больше нечего пересчитывать." },
        { type: "status", label: "Edited", target: "ProjectNav.tsx", diff: { added: 3, removed: 3 } },
      ],
    },
    u("Отлично, мержим"),
    {
      role: "assistant",
      thought: "Merged",
      thoughtTarget: "main",
      time: "Yesterday",
      blocks: [{ type: "p", text: "Смержил в `main`, ветку удалил. typecheck и build зелёные." }],
    },
  ],

  "working-dot": [
    u("Когда в задаче идёт работа — слева не оранжевая точка, а плавно пульсирующая серая"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "status", label: "Edited SessionRow.tsx, app.css", diff: { added: 14, removed: 1 } },
        { type: "p", text: "Сделал серую точку, которая пульсирует от 30% до 100% яркости, цикл 1,6 секунды." },
      ],
    },
    u("Слишком ярко на пике, и она будто мигает"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Снизил пик до 70% и сделал движение линейным, без ускорений — так пульс читается ровным дыханием, а не миганием." },
        { type: "code", lang: "css", code: "@keyframes working-dot-pulse {\n  0%, 100% { opacity: 0.3; }\n  50%      { opacity: 0.7; }\n}\n/* 1.6s linear infinite */" },
      ],
    },
    u("Теперь как будто дёргается в конце"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Да: у линейной анимации резкий разворот на пике и на дне, глаз это ловит. Вернул исходный ритм оригинала — быстрый вдох и долгий выдох — но оставил пик 0,7." },
        { type: "code", lang: "css", code: "@keyframes working-dot-pulse {\n  0%   { opacity: 0.3; }\n  35%  { opacity: 0.7; }\n  100% { opacity: 0.3; }\n}" },
      ],
    },
    u("Ближе. Но на пике как будто замирает"),
    {
      role: "assistant",
      thought: "Ran 2 commands",
      steps: [{ icon: BROWSER, label: "Recorded 10 cycles", detail: "60 fps" }],
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Записал 10 циклов: у `ease` точка висит на пике около 120мс. Поставил `ease-in-out` и удлинил цикл до 2,4 секунды — без задержек ни на пике, ни на дне." },
        { type: "status", label: "Edited", target: "app.css", diff: { added: 2, removed: 2 } },
      ],
    },
    u("Вот, отлично. А в reduce motion?"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "С «Reduce motion» точка не пульсирует и стоит на 50% — видно, что чат работает, но ничего не движется." },
        { type: "status", label: "Edited", target: "app.css", diff: { added: 3, removed: 0 } },
      ],
    },
    u("Пуш"),
    {
      role: "assistant",
      thought: "Pushed",
      thoughtTarget: "main",
      time: "Yesterday",
      blocks: [{ type: "p", text: "Отправил в `main`: 4 коммита, от первой пульсации до финального ритма, чтобы было видно, как пришли к 2,4 секунды." }],
    },
  ],

  "visual-polish": [
    u("Чат с контентом выглядит пустым: нет заголовка, нет статуса, не видно, в каком репозитории работает агент"),
    {
      role: "assistant",
      thought: "Ran 7 commands",
      steps: [
        { icon: BROWSER, label: "Opened a chat in the original" },
        { icon: READ, label: "Read the transcript markup", detail: "data-cds=Transcript" },
      ],
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Добавил три вещи, как в оригинале:" },
        {
          type: "ul",
          items: [
            "Заголовок чата с названием и меню.",
            "Строку репозитория над композером: имя, ветка, +/− строк.",
            "Статус под последним ответом: работающий чат показывает текущий шаг и счётчики, законченный — только звёздочку.",
          ],
        },
        { type: "status", label: "Edited 5 files", diff: { added: 312, removed: 18 } },
      ],
    },
    u("Строка репозитория у чата без проекта — зачем?"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "status", label: "Edited", target: "ChatShell.tsx", diff: { added: 1, removed: 1 } },
        { type: "p", text: "Незачем. Теперь только у чатов в проектах: у чата без папки нет репозитория." },
      ],
    },
    u("Посмотри видео анимации звёздочки"),
    {
      role: "assistant",
      thought: "Ran 4 commands",
      steps: [
        { icon: READ, label: "Read Screen Recording 2026-09-25.mov" },
        { icon: RUN, label: "Extracted frames at 60 fps", detail: "ffmpeg" },
      ],
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Разобрал запись по кадрам: звёздочка не мерцает, а «дышит» формой — сжимается в точку, чуть держится и раскрывается обратно." },
        { type: "p", text: "Сделал: масштаб от 35% до 122% с перелётом, лучи поворачиваются на 15° за цикл." },
      ],
    },
    u("Слишком резко, и поворот лишний"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Финальная версия спокойнее:" },
        {
          type: "ul",
          items: ["Только масштаб, без поворота.", "От точки (35%) до 95% размера, без перелёта.", "Цикл 1,2 секунды, плавное ускорение и замедление."],
        },
        { type: "status", label: "Edited", target: "app.css", diff: { added: 6, removed: 9 } },
      ],
    },
    u("Команды в ответах выглядят как обычный код. В оригинале они в карточке"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Сделал блок команды: залитая карточка, аргументы зелёные, отступы шире, чем у кода. Карточка изменённых файлов — отдельно: список с +/− и «Show N more» после третьего файла." },
        { type: "status", label: "Edited", target: "Transcript.tsx", diff: { added: 148, removed: 12 } },
      ],
    },
    u("При наведении на ответ должны появляться действия: копировать, время"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Добавил: копировать, повторить, время ответа. Иконки приглушённые, при наведении на иконку — яркие. Текст ответа теперь выделяется — раньше мешал слой с действиями." },
        { type: "status", label: "Edited", target: "Transcript.tsx", diff: { added: 52, removed: 4 } },
      ],
    },
    u("И скроллбар — он посреди экрана, у колонки текста"),
    {
      role: "assistant",
      thought: "Pushed",
      thoughtTarget: "main",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Прокручивается теперь вся панель, а колонка текста держит ширину и отступы сама. Скроллбар у правого края, как в оригинале." },
        { type: "status", label: "Edited", target: "ChatPanel.tsx", diff: { added: 8, removed: 3 } },
      ],
    },
  ],

  "budget-line": [
    u("Хочу видеть в сайдбаре, сколько лимита на неделю осталось. Сейчас узнаю, только когда упираюсь"),
    {
      role: "assistant",
      thought: "Ran 3 commands",
      steps: [
        { icon: READ, label: "Read Sidebar.tsx" },
        { icon: SEARCH, label: "Searched the tokens", detail: "progress, meter" },
      ],
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Добавил тонкую линию над профилем: заполненная часть — потрачено за неделю. Цвет обычный, пока не больше 80%, потом глиняный." },
        { type: "status", label: "Edited", target: "BudgetLine.tsx, Sidebar.tsx, usage.ts", diff: { added: 96, removed: 2 } },
      ],
    },
    u("А цифры где?"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "При наведении на линию — карточка: сколько потрачено, когда лимит обновится и какие проекты тратят больше всего." },
        {
          type: "table",
          head: ["Строка", "Пример"],
          rows: [
            ["Weekly limit", "62% used"],
            ["Resets", "Mon 09:00"],
            ["Top projects", "storefront 41%, astrology-app 14%"],
          ],
        },
      ],
    },
    u("Карточка перекрывает профиль"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "status", label: "Edited", target: "BudgetLine.tsx", diff: { added: 4, removed: 2 } },
        { type: "p", text: "Открываю карточку справа от сайдбара, выровненную по линии, — профиль больше не закрыт." },
      ],
    },
    u("Мержим"),
    {
      role: "assistant",
      thought: "Merged",
      thoughtTarget: "main",
      time: "Yesterday",
      blocks: [{ type: "p", text: "Смержил `feature/budget-line` в `main`." }],
    },
  ],

  "avatar-status": [
    u("Хочу понимать по сайдбару, что где-то меня ждёт агент, даже если я в другом чате"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Предлагаю точку на аватаре — место, куда глаз и так возвращается. Глина — где-то блокер. Никакого числа: число задач, которые ждут, давит, а нужен только сигнал «загляни»." },
        { type: "status", label: "Edited", target: "UserMenuButton.tsx", diff: { added: 28, removed: 2 } },
      ],
    },
    u("А если я занят и не хочу, чтобы меня дёргали?"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Добавил в меню аватара режим внимания:" },
        {
          type: "ul",
          items: [
            "Available — точка горит, блокеры приходят пушем.",
            "Busy до 16:00 — точка горит, пуши копятся в дайджест.",
            "Do not disturb — ни точки, ни пушей. Агенты, которые упёрлись, ждут.",
          ],
        },
        { type: "status", label: "Edited", target: "AttentionMenu.tsx, inboxStore.ts", diff: { added: 112, removed: 0 } },
      ],
    },
    u("Когда проект свёрнут, не видно, что внутри блокер"),
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Свёрнутый проект с блокером внутри получает ту же точку в колонке «+». Развернул — точка переходит на сам чат." },
        { type: "status", label: "Edited", target: "ProjectNav.tsx", diff: { added: 19, removed: 2 } },
      ],
    },
    u("Точка не по центру «+»"),
    {
      role: "assistant",
      thought: "Merged",
      thoughtTarget: "main",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Колонка «+» — 20px, а точка стояла от левого края. Центрировал в колонке. Смержил `feature/avatar-status` и `feature/project-counter` в `main`." },
      ],
    },
  ],
};
