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
      thought: "Ran 3 steps",
      time: "3 hours ago",
      steps: [
        { icon: READ, label: "Read src/forecast/daily.ts" },
        { icon: SEARCH, label: "Searched the codebase", detail: "notifications, expo-notifications" },
      ],
      blocks: [
        { type: "p", text: "Прогноз дня уже считается в `daily.ts`: транзиты к натальной карте с весами. Пушей в приложении пока нет вообще — ни разрешения, ни токенов устройств." },
        { type: "p", text: "Прежде чем писать код, уточню, что считаем важным транзитом, — от этого зависит, будет пуш каждый день или раз в неделю." },
      ],
    },
    { role: "user", text: "Каждый день. Но без спама — один пуш" },
    {
      role: "assistant",
      thought: "Ran 2 steps",
      time: "2 hours ago",
      steps: [{ icon: RUN, label: "Ran daily.ts on 500 test charts", detail: "30 days" }],
      blocks: [
        { type: "p", text: "Прогнал расчёт на 500 тестовых картах за 30 дней. Если брать все транзиты с орбисом до 3°, в день набирается 6–11 событий — это шум." },
        {
          type: "table",
          head: ["Правило", "Событий в день", "Дней без событий"],
          rows: [
            ["Все планеты, орбис 3°", "6–11", "0%"],
            ["Солнце, Луна, медленные; орбис 1°", "1–3", "4%"],
            ["Только медленные, орбис 1°", "0–1", "61%"],
          ],
        },
        { type: "p", text: "Предлагаю второе: каждый день есть что сказать, и можно выбрать самый сильный транзит. В 4% пустых дней пуш не шлём." },
      ],
    },
    { role: "user", text: "Да, второе. Время — 8 утра" },
    {
      role: "assistant",
      thought: "Edited docs/brief-push.md",
      time: "1 hour ago",
      blocks: [
        { type: "p", text: "Записал в бриф: один пуш в 8:00 по местному времени пользователя, текст про самый сильный транзит дня, в пустые дни — тишина. Текст генерирует Claude API, как расшифровки карты." },
        { type: "p", text: "Если человек сменил часовой пояс в поездке, пуш придёт в 8:00 по новому — время берём с устройства при каждом запуске." },
      ],
    },
    { role: "user", text: "Бриф ок" },
    {
      role: "assistant",
      thought: "Ran 2 steps",
      time: "18 minutes ago",
      steps: [{ icon: READ, label: "Read app.json", detail: "expo plugins" }],
      blocks: [
        { type: "p", text: "Бриф согласован. Дальше выбор сервиса пушей: от него зависит, что мы ставим в приложение и сколько настроек будет у тебя." },
        { type: "question", id: "q1" },
      ],
    },
  ],
  checkout: [
    { role: "user", text: "Сделай новый чекаут: адрес, доставка, оплата картой, письмо о заказе. Критерии приёмки в docs/checkout.md." },
    {
      role: "assistant",
      thought: "Ran 5 steps",
      time: "10 hours ago",
      steps: [
        { icon: READ, label: "Read docs/checkout.md" },
        { icon: READ, label: "Read src/checkout/", detail: "CheckoutPage.tsx, 4 files" },
        { icon: RUN, label: "Ran the existing checkout tests", detail: "38 passed" },
      ],
      blocks: [
        { type: "p", text: "В `docs/checkout.md` критерии есть, но сценариев оплаты нет: что делать при отказе банка, при 3-D Secure, при возврате. Без них непонятно, что проверять." },
        { type: "p", text: "Начну с того, что опишу сценарии, и принесу их тебе вместе с критериями." },
      ],
    },
    {
      role: "assistant",
      thought: "Edited docs/checkout.md",
      time: "9 hours ago",
      blocks: [
        { type: "p", text: "Описал 6 сценариев и дописал критерии приёмки:" },
        {
          type: "ol",
          items: [
            "Оплата картой без 3-D Secure.",
            "Оплата с 3-D Secure.",
            "Отказ банка — понятный текст и повтор без потери корзины.",
            "Частичный возврат.",
            "Полный возврат.",
            "Повтор оплаты после сетевой ошибки — без двойного списания.",
          ],
        },
        { type: "p", text: "Apple Pay в сценариях нет, поэтому в первую версию его не беру. Посмотри бриф." },
      ],
    },
    { role: "user", text: "Возвраты делаем через админку, не в чекауте. Остальное ок" },
    {
      role: "assistant",
      time: "8 hours ago",
      blocks: [
        { type: "p", text: "Понял: возвраты остаются сценариями для проверки, но кнопки в чекауте не будет — только вебхук, который обновляет статус заказа, когда возврат сделан в админке." },
        { type: "p", text: "Бриф согласован. Начинаю с формы адреса и доставки." },
      ],
    },
    {
      role: "assistant",
      thought: "Edited 5 files",
      time: "5 hours ago",
      steps: [
        { icon: RUN, label: "Ran npm test -- checkout", detail: "52 passed" },
        { icon: RUN, label: "Took screenshots", detail: "375, 768, 1440" },
      ],
      blocks: [
        { type: "p", text: "Форма адреса и доставки готова: три шага, как в макете, подсказки адреса и проверка на клиенте и на сервере." },
        {
          type: "files",
          title: "Edited 5 files",
          diff: { added: 618, removed: 41 },
          visible: 3,
          files: [
            { name: "AddressStep.tsx", diff: { added: 212, removed: 0 } },
            { name: "DeliveryStep.tsx", diff: { added: 148, removed: 0 } },
            { name: "address.spec.ts", diff: { added: 118, removed: 0 } },
            { name: "CheckoutPage.tsx", diff: { added: 86, removed: 41 } },
            { name: "schema.ts", diff: { added: 54, removed: 0 } },
          ],
        },
        { type: "p", text: "Для валидации взял zod — он уже есть в проекте, новых зависимостей не добавлял." },
      ],
    },
    { role: "user", text: "На мобильном кнопка «Далее» уезжает под клавиатуру" },
    {
      role: "assistant",
      time: "4 hours ago",
      blocks: [
        { type: "status", label: "Edited", target: "CheckoutPage.tsx", diff: { added: 14, removed: 3 } },
        { type: "p", text: "Кнопка теперь прилипает к низу видимой области: высоту беру из `visualViewport`, а не из `100vh`. Проверил на iOS Safari и Chrome на Android в эмуляторе." },
      ],
    },
    {
      role: "assistant",
      thought: "Ran 5 steps",
      time: "32 minutes ago",
      steps: [
        { icon: READ, label: "Read server/payments/stripe.ts" },
        { icon: RUN, label: "Ran the checkout tests", detail: "52 passed" },
      ],
      blocks: [
        { type: "p", text: "Адрес и доставка готовы, тесты зелёные. Дальше упираюсь в оплату — пока не ответишь, её не трогаю:" },
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
      time: "5 hours ago",
      steps: [
        { icon: SEARCH, label: "Searched the codebase", detail: "search, meilisearch" },
        { icon: READ, label: "Read server/search/index.ts" },
      ],
      blocks: [
        { type: "p", text: "Поиск идёт через Meilisearch, но в индекс попадает только поле `title`. Описание и атрибуты в базе есть, просто не индексируются." },
        { type: "p", text: "Прежде чем расширять индекс, хочу посмотреть, что люди ищут на самом деле. Выгружу запросы за 30 дней?" },
      ],
    },
    { role: "user", text: "Да, давай" },
    {
      role: "assistant",
      thought: "Ran 3 steps",
      time: "3 hours ago",
      steps: [
        { icon: RUN, label: "Exported 30 days of search queries", detail: "184K queries" },
        { icon: RUN, label: "Grouped empty results" },
      ],
      blocks: [
        { type: "p", text: "Разобрал запросы за 30 дней: 18% уходят в пустую выдачу." },
        {
          type: "table",
          head: ["Что ищут", "Доля пустых", "Пример"],
          rows: [
            ["Цвет", "41%", "«бежевый свитер»"],
            ["Материал", "33%", "«льняная рубашка»"],
            ["Размер", "12%", "«кеды 44»"],
            ["Опечатки", "9%", "«кросовки»"],
            ["Другое", "5%", "«подарок маме»"],
          ],
        },
        { type: "p", text: "Цвет и материал есть в атрибутах, так что три четверти пустых выдач закрываются индексацией атрибутов." },
      ],
    },
    { role: "user", text: "А опечатки?" },
    {
      role: "assistant",
      time: "2 hours ago",
      blocks: [
        { type: "p", text: "Meilisearch исправляет их из коробки, до двух ошибок на слово. «кросовки» не находилось, потому что слово целиком не встречается в названиях — после индексации описаний найдётся." },
        { type: "p", text: "Отдельную работу по опечаткам из MVP выкинул." },
      ],
    },
    {
      role: "assistant",
      thought: "Ran 2 steps",
      time: "1 hour ago",
      steps: [{ icon: READ, label: "Read server/inventory/stock.ts" }],
      blocks: [
        { type: "p", text: "Пишу бриф: какие поля индексируем, как подсвечиваем, что считаем успехом — пустых выдач меньше 8%." },
        { type: "p", text: "Один вопрос по ходу, он не срочный:" },
        { type: "question", id: "q1" },
      ],
    },
  ],
  i18n: [
    { role: "user", text: "Переведи витрину на испанский: интерфейс, карточки товаров и письма. В конце вычитку сделает носитель." },
    {
      role: "assistant",
      thought: "Ran 4 steps",
      time: "3 hours ago",
      steps: [
        { icon: SEARCH, label: "Searched for hardcoded strings", detail: "1,240 matches" },
        { icon: READ, label: "Read the product catalog", detail: "312 cards" },
        { icon: SEARCH, label: "Found 7 similar tasks", detail: "localization" },
      ],
      blocks: [
        { type: "p", text: "Строки интерфейса зашиты в код — 1 240 штук в 84 файлах, i18n в проекте нет. Плюс 312 карточек товаров и 6 писем о заказе." },
        { type: "p", text: "Задача большая, и в конце — вычитка носителем, так что написал бриф и план. Главное допущение — какой испанский." },
        { type: "brief-card" },
      ],
    },
    { role: "user", text: "Испания, да. На «вы»" },
    {
      role: "assistant",
      time: "3 hours ago",
      blocks: [
        { type: "p", text: "Принял: es-ES и «usted» во всём интерфейсе. Начинаю с глоссария — 86 терминов, 14 из них бренды, их не переводим." },
      ],
    },
    {
      role: "assistant",
      thought: "Edited 86 files",
      time: "2 hours ago",
      steps: [
        { icon: RUN, label: "Extracted 1,240 strings" },
        { icon: RUN, label: "Ran the i18n linter", detail: "0 hardcoded strings" },
      ],
      blocks: [
        { type: "p", text: "Вынес все строки в `locales/en/common.json` и подключил i18next. Английский остаётся по умолчанию, в коде не осталось ни одной строки." },
        {
          type: "files",
          title: "Edited 86 files",
          diff: { added: 2178, removed: 910 },
          files: [
            { name: "locales/en/common.json", diff: { added: 1240, removed: 0 } },
            { name: "src/i18n.ts", diff: { added: 28, removed: 0 } },
            { name: "…and 84 more", diff: { added: 910, removed: 910 } },
          ],
        },
      ],
    },
    { role: "user", text: "Как человек переключит язык?" },
    {
      role: "assistant",
      time: "1 hour ago",
      blocks: [
        { type: "p", text: "Язык выбирается по браузеру при первом заходе, дальше — переключателем в футере. Выбор запоминается в cookie, чтобы письма уходили на том же языке." },
        { type: "status", label: "Edited", target: "Footer.tsx, i18n.ts", diff: { added: 46, removed: 2 } },
      ],
    },
    {
      role: "assistant",
      thought: "Ran 4 steps",
      time: "20 minutes ago",
      steps: [
        { icon: RUN, label: "Translated the UI strings" },
        { icon: RUN, label: "Ran the i18n linter", detail: "0 missing keys" },
      ],
      blocks: [
        { type: "p", text: "Интерфейс переведён, линтер не нашёл ни одного пропущенного ключа. Пара решений по ходу: «cesta», а не «carrito» — так говорят в Испании; даты и числа форматирует Intl." },
        { type: "p", text: "Сейчас перевожу карточки товаров, потом письма. Вычитка носителем по плану около 17:30." },
      ],
    },
  ],
  "promo-codes": [
    { role: "user", text: "Добавь промокоды в корзину: поле ввода, проверка на сервере, скидка в итоговой сумме." },
    {
      role: "assistant",
      thought: "Ran 3 steps",
      time: "2 days ago",
      steps: [
        { icon: READ, label: "Read server/cart/pricing.ts" },
        { icon: READ, label: "Read server/promo/", detail: "rules.ts" },
      ],
      blocks: [
        { type: "p", text: "Правила промокодов в `server/promo/rules.ts` уже есть — их писали для рассылок, но в корзину не выводили. Беру их как есть." },
        { type: "p", text: "Два вопроса, чтобы не переделывать: промокод один на заказ? И суммируется ли он со скидкой на распродаже?" },
      ],
    },
    { role: "user", text: "Один на заказ. С распродажей не суммируется — берём большую скидку" },
    {
      role: "assistant",
      thought: "Edited 4 files",
      time: "2 days ago",
      steps: [{ icon: RUN, label: "Ran npm test -- cart", detail: "31 passed" }],
      blocks: [
        { type: "p", text: "Поле в корзине, проверка через `POST /promo/validate`, скидка отдельной строкой в итоге. Если скидка распродажи больше, под полем пишем: «Уже действует скидка выгоднее»." },
        { type: "status", label: "Edited 4 files", diff: { added: 264, removed: 19 } },
      ],
    },
    { role: "user", text: "Что если код истёк, пока человек в корзине?" },
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Проверяю код ещё раз при оплате. Если истёк — не списываем по старой цене, а возвращаем в корзину с пояснением и новой суммой. Добавил тест на этот случай." },
        { type: "status", label: "Edited", target: "checkout.ts, promo.spec.ts", diff: { added: 54, removed: 8 } },
      ],
    },
    { role: "user", text: "Мержи" },
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
      time: "7 hours ago",
      steps: [
        { icon: RUN, label: "Collected CI failures for 30 days", detail: "41 failures" },
        { icon: READ, label: "Read src/ephemeris/houses.test.ts" },
      ],
      blocks: [
        { type: "p", text: "За 30 дней 41 падение, все в трёх тестах системы домов Плацидуса. Локально не воспроизводится ни разу из 200 прогонов." },
        { type: "p", text: "Смотрю, чем отличаются раннеры, на которых падает." },
      ],
    },
    {
      role: "assistant",
      thought: "Ran 4 steps",
      time: "5 hours ago",
      steps: [
        { icon: RUN, label: "Matched failures to runners", detail: "41 of 41 on UTC−5" },
        { icon: RUN, label: "Ran the tests with TZ=America/New_York", detail: "fails near midnight" },
      ],
      blocks: [
        { type: "p", text: "Нашёл: все 41 падение — на раннерах с часовым поясом UTC−5 около полуночи. Тест строит дату рождения через `new Date(\"1990-05-12\")`, она читается как UTC, и в UTC−5 день сдвигается — куспиды домов уезжают на 1–2°." },
        { type: "code", lang: "bash", code: "TZ=America/New_York npm test -- houses" },
        { type: "p", text: "Это та же ошибка, что с датой рождения в профиле, только в тестах." },
      ],
    },
    { role: "user", text: "Почини. И проверь, нет ли того же в других тестах" },
    {
      role: "assistant",
      thought: "Ran 2 steps",
      time: "2 hours ago",
      steps: [{ icon: SEARCH, label: "Searched the tests for new Date(", detail: "9 matches, 3 affected" }],
      blocks: [
        { type: "p", text: "Кроме этих трёх, то же самое ещё в 3 тестах транзитов, но они пока не падали — там орбис шире и сдвиг не выходит за допуск." },
        { type: "p", text: "Фиксирую часовой пояс в тестах и разбираю даты как календарные. Пока чиню, предлагаю карантин:" },
        { type: "question", id: "q1" },
      ],
    },
  ],
  "chart-pdf": [
    { role: "user", text: "Сделай экспорт натальной карты в PDF: круг карты, таблица позиций и расшифровки." },
    {
      role: "assistant",
      thought: "Ran 3 steps",
      time: "15 hours ago",
      steps: [
        { icon: READ, label: "Read src/chart/Wheel.tsx" },
        { icon: SEARCH, label: "Compared PDF libraries", detail: "react-pdf, pdfkit, puppeteer" },
      ],
      blocks: [
        { type: "p", text: "Круг карты уже рисуется в SVG, так что его можно вставить в PDF как есть. Для PDF беру react-pdf: он собирает документ из тех же компонентов, без headless-браузера на сервере." },
        { type: "p", text: "Вопрос: PDF собирается на телефоне или на сервере? На телефоне — работает офлайн, на сервере — одинаково на всех устройствах." },
      ],
    },
    { role: "user", text: "На сервере. И со шрифтами приложения" },
    {
      role: "assistant",
      thought: "Ran 6 steps",
      time: "12 hours ago",
      steps: [
        { icon: RUN, label: "Rendered the chart wheel to SVG" },
        { icon: RUN, label: "Built the PDF with react-pdf", detail: "3 test charts" },
      ],
      blocks: [
        { type: "p", text: "Первая версия собирается на сервере: `GET /chart/:id/pdf`. Три страницы: круг карты, таблица планет и домов, расшифровки." },
        { type: "p", text: "Шрифты подключил из приложения. Символы планет и знаков — из того же шрифта, что в круге, иначе в PDF были квадратики." },
      ],
    },
    { role: "user", text: "Расшифровки обрезаются на середине слова при переносе страницы" },
    {
      role: "assistant",
      time: "8 hours ago",
      blocks: [
        { type: "status", label: "Edited", target: "ChartPdf.tsx", diff: { added: 12, removed: 3 } },
        { type: "p", text: "Разрешил переносить только между абзацами, а заголовок раздела держу вместе с первым абзацем. Проверил на самой длинной карте — 7 страниц, разрывов в словах нет." },
      ],
    },
    {
      role: "assistant",
      thought: "Ran 6 steps",
      time: "4 minutes ago",
      steps: [
        { icon: RUN, label: "Opened a draft PR", detail: "feat/chart-pdf" },
        { icon: RUN, label: "Deployed to staging" },
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
    { role: "user", text: "Что значит AGPL для нас? Код приложения закрытый" },
    {
      role: "assistant",
      time: "2 days ago",
      blocks: [
        { type: "p", text: "AGPL требует открыть код сервиса, который использует библиотеку по сети. Для закрытого приложения это значит одно из двух:" },
        {
          type: "ul",
          items: [
            "Купить профессиональную лицензию Swiss Ephemeris — разовый платёж, без отчислений.",
            "Вынести расчёты в отдельный маленький сервис и открыть только его код. Приложение с ним общается по API и остаётся закрытым.",
          ],
        },
        { type: "p", text: "Я не юрист — перед релизом лучше показать это юристу. Технически второй вариант проще и дешевле." },
      ],
    },
    { role: "user", text: "А на сколько пользователей хватит сервера за $20?" },
    {
      role: "assistant",
      thought: "Ran 1 step",
      time: "2 days ago",
      steps: [{ icon: RUN, label: "Benchmarked a chart calculation", detail: "1 vCPU" }],
      blocks: [
        { type: "p", text: "Один расчёт карты — около 3мс на одном ядре. Ежедневный прогноз считается раз в сутки на пользователя, ночью. На $20 сервере это около 2 млн расчётов в час — с запасом на сотни тысяч пользователей." },
        { type: "p", text: "Платный API на тех же 100 тыс. пользователей обойдётся примерно в $6 000 в месяц только на прогнозах. Остаюсь при рекомендации." },
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
