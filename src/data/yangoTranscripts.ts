import type { Turn } from "./transcripts";

/** Finished chats of the yango-prototype project: a condensed replay of how this prototype was built. */
export const YANGO_TRANSCRIPTS: Record<string, Turn[]> = {
  "copy-prototype": [
    { role: "user", text: "https://alloy.app/eduard-titskiy/p/828ed15b-…\nМожешь скопировать этот прототип 1 в 1?" },
    {
      role: "assistant",
      thought: "Ran 6 commands",
      steps: [
        { icon: "", label: "Opened the prototype", detail: "alloy.app" },
        { icon: "", label: "Found the prototype iframe" },
        { icon: "", label: "Downloaded the bundle and styles" },
        { icon: "", label: "Downloaded 40 assets", detail: "39 fonts, 1 image" },
      ],
      time: "3 hours ago",
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
    { role: "user", text: "Убери баннер «Try Claude Tag», он нам не нужен" },
    {
      role: "assistant",
      time: "3 hours ago",
      blocks: [
        { type: "status", label: "Edited", target: "index-C7gYdJDR.js", diff: { added: 0, removed: 1 } },
        { type: "p", text: "Убрал баннер вместе с пустой обёрткой вокруг него, так что на его месте не осталось отступа. В сайдбаре внизу теперь только профиль." },
      ],
    },
    { role: "user", text: "Пересобери это в нормальный React-проект" },
    {
      role: "assistant",
      thought: "Ran 18 commands",
      steps: [
        { icon: "", label: "Read index-C7gYdJDR.js", detail: "47 components" },
        { icon: "", label: "Converted jsx() calls back to JSX", detail: "Babel" },
        { icon: "", label: "Ran npm run build" },
        { icon: "", label: "Compared 376 elements with the original" },
      ],
      time: "2 hours ago",
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
    { role: "user", text: "Ок, сохрани это в git. Это будет исходная точка" },
    {
      role: "assistant",
      time: "2 hours ago",
      blocks: [
        { type: "status", label: "Pushed", target: "main" },
        { type: "p", text: "Создал приватный репозиторий и отправил туда первый коммит. Чтобы поднять проект на другом компьютере:" },
        { type: "code", lang: "bash", code: "git clone https://github.com/ededdyeddd/claude-code-prototype.git" },
        { type: "p", text: "Затем `npm install` и `npm run dev`. Дальше предлагаю вести каждую доработку в отдельной ветке и сливать в `main`." },
      ],
    },
  ],

  "design-system": [
    { role: "user", text: "У тебя есть доступ к дизайн-системе Claude Code или ты с ней знаком?" },
    {
      role: "assistant",
      time: "2 hours ago",
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
    { role: "user", text: "Давай, всё по пунктам" },
    {
      role: "assistant",
      thought: "Ran 11 commands",
      steps: [
        { icon: "", label: "Computed every token in the browser", detail: "dark, light, compact" },
        { icon: "", label: "Read design-system.css" },
        { icon: "", label: "Generated tokens.json and DESIGN_TOKENS.md" },
      ],
      time: "1 hour ago",
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
    { role: "user", text: "Иконки выглядят мелкими и тонкими, как будто проблемы с рендером" },
    {
      role: "assistant",
      thought: "Ran 3 commands",
      steps: [{ icon: "", label: "Read the Anthropicons font axes", detail: "wght, opsz, ANIM, ANM2" }],
      time: "1 hour ago",
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
  ],

  "visual-polish": [
    { role: "user", text: "Посмотри вкладку Routines, там есть полезные элементы. И обрати внимание на навигацию в сайдбаре: чаты лежат в проектах, у проекта есть «+», а сверху фильтры" },
    {
      role: "assistant",
      thought: "Ran 9 commands",
      time: "50 minutes ago",
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
    { role: "user", text: "Когда в задаче идёт работа — слева не оранжевая точка, а плавно пульсирующая серая" },
    {
      role: "assistant",
      time: "35 minutes ago",
      blocks: [
        { type: "status", label: "Edited SessionRow.tsx, app.css", diff: { added: 14, removed: 1 } },
        { type: "p", text: "Сделал серую точку с плавной пульсацией от 30% до 70% яркости, цикл 2,4 секунды, без пауз на пике:" },
        {
          type: "code",
          lang: "css",
          code: "@keyframes working-dot-pulse {\n  0%   { opacity: 0.3; }\n  35%  { opacity: 0.7; }\n  100% { opacity: 0.3; }\n}",
        },
      ],
    },
    { role: "user", text: "Посмотри видео анимации звёздочки" },
    {
      role: "assistant",
      thought: "Ran 4 commands",
      steps: [
        { icon: "", label: "Read Screen Recording 2026-09-25.mov" },
        { icon: "", label: "Extracted frames at 60 fps", detail: "ffmpeg" },
      ],
      time: "10 minutes ago",
      blocks: [
        { type: "p", text: "Разобрал запись по кадрам: звёздочка не мерцает, а «дышит» формой — сжимается в точку, чуть держится и раскрывается обратно." },
        { type: "p", text: "Первый вариант получился с перелётом до 122% и поворотом лучей — вышло слишком резко. Финальная версия спокойнее:" },
        {
          type: "ul",
          items: ["Только масштаб, без поворота.", "От точки (35%) до 95% размера, без перелёта.", "Цикл 1,2 секунды, плавное ускорение и замедление."],
        },
        { type: "status", label: "Pushed", target: "main" },
      ],
    },
  ],
};
