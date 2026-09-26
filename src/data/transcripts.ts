/** Mock chat transcripts, keyed by session id (see sessions.ts). */

export type Block =
  | { type: "h2" | "h3" | "p"; text: string }
  /** Poem: one string per line, rendered with line breaks. */
  | { type: "verse"; lines: string[] }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "code"; lang?: string; code: string }
  /** Inline step row inside an answer, optionally with diff stats ("Edited X, ran a command +14 -1"). */
  | { type: "status"; label: string; target?: string; diff?: Diff }
  /** Card listing changed files; rows beyond `visible` hide behind "Show N more". */
  | { type: "files"; title: string; diff: Diff; files: { name: string; diff: Diff }[]; visible?: number }
  /** Task chats (chatTasks.ts): pointer to the brief, result card, escalation offer; their content comes from the task. */
  | { type: "brief-card" | "result-card" | "escalation-card" }
  /** A question of the chat's task (Inbox model), answered right in the chat; `id` is the question id in its plan. */
  | { type: "question"; id: string }
  /** One-line note that an edit changed the brief or plan ("Removed Apple Pay, the plan is one task shorter"). */
  | { type: "edit-note"; text: string };

export type Diff = { added: number; removed: number };

export type TurnStep = { icon: string; label: string; detail?: string };

export type Turn =
  | { role: "user"; text: string }
  | {
      role: "assistant";
      /** Status row above the answer, e.g. "Ran 3 commands" or "Pushed" + target "main". */
      thought?: string;
      thoughtTarget?: string;
      steps?: TurnStep[];
      blocks: Block[];
      /** Shown in the hover actions, e.g. "1 minute ago". */
      time?: string;
    };

/** What a running chat is doing right now: current step row + stats under the spark. */
export type LiveStatus = {
  step: string;
  target?: string;
  stats: string;
  /** `step` is the plan step in progress (a task chat), with the whole plan's steps done of all, as on the Plan chip. */
  planStep?: { done: number; of: number };
};

import { YANGO_TRANSCRIPTS } from "./yangoTranscripts";
import { TASK_LIVE_STATUS, TASK_TRANSCRIPTS } from "./taskTranscripts";
import { CHAT_TASK_TRANSCRIPTS } from "./chatTasks";
import { YANGO_LIVE_STATUS } from "./yangoTasks";

export const TRANSCRIPTS: Record<string, Turn[]> = {
  ...YANGO_TRANSCRIPTS,
  ...TASK_TRANSCRIPTS,
  ...CHAT_TASK_TRANSCRIPTS,
  astrology: [
    {
      role: "user",
      text: "Хочу сделать мобильное приложение по астрологии: натальная карта, ежедневный прогноз и совместимость. Составь план MVP — экраны, стек и этапы.",
    },
    {
      role: "assistant",
      thought: "Ran 3 steps",
      time: "Yesterday",
      steps: [
        { icon: "", label: "Searched the web", detail: "ephemeris API, natal chart libraries" },
        { icon: "", label: "Read notes.md" },
        { icon: "", label: "Drafted MVP scope" },
      ],
      blocks: [
        { type: "p", text: "Ниже план MVP на 8 недель. Главная идея: сначала сделать одну вещь очень хорошо — натальную карту, — а прогноз и совместимость строить поверх неё." },
        { type: "h2", text: "Ключевые экраны" },
        {
          type: "ol",
          items: [
            "Онбординг — дата, время и место рождения; объяснение, зачем нужно точное время.",
            "Натальная карта — круг с домами и планетами, под ним короткие расшифровки по каждой позиции.",
            "Сегодня — прогноз дня на основе транзитов к натальной карте, 3–4 карточки.",
            "Совместимость — ввод данных второго человека и синастрия по пяти сферам.",
            "Профиль — сохранённые карты, настройки уведомлений, подписка.",
          ],
        },
        { type: "h2", text: "Стек" },
        {
          type: "table",
          head: ["Слой", "Выбор", "Почему"],
          rows: [
            ["Клиент", "React Native + Expo", "Одна кодовая база для iOS и Android"],
            ["Расчёты", "Swiss Ephemeris на сервере", "Точные позиции планет, проверенная библиотека"],
            ["Бэкенд", "Node.js + PostgreSQL", "Хранение карт и истории прогнозов"],
            ["Тексты", "Claude API", "Персональные расшифровки вместо шаблонов"],
            ["Оплата", "RevenueCat", "Подписки в обоих сторах без своей логики"],
          ],
        },
        { type: "h2", text: "Этапы" },
        {
          type: "ul",
          items: [
            "Недели 1–2 — расчёт карты на сервере, эндпоинт `POST /chart`, тесты точности на известных датах.",
            "Недели 3–4 — онбординг и экран натальной карты.",
            "Недели 5–6 — ежедневный прогноз и push-уведомления.",
            "Недели 7–8 — совместимость, подписка, бета через TestFlight.",
          ],
        },
        { type: "p", text: "Пример ответа `POST /chart`:" },
        {
          type: "code",
          lang: "json",
          code: '{\n  "sun": { "sign": "Leo", "degree": 14.2, "house": 10 },\n  "moon": { "sign": "Pisces", "degree": 3.8, "house": 5 },\n  "ascendant": { "sign": "Scorpio", "degree": 21.5 }\n}',
        },
        { type: "p", text: "Могу начать с первого этапа: поднять сервер расчётов и описать API. Или сначала набросать экраны онбординга — что удобнее?" },
      ],
    },
    { role: "user", text: "А если человек не знает точное время рождения? Таких много" },
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Тогда считаем карту на полдень и честно говорим, что неточно:" },
        {
          type: "ul",
          items: [
            "Позиции планет, кроме Луны, почти не меняются за сутки — их показываем как есть.",
            "Луна за день проходит ~13°, может сменить знак — показываем оба варианта.",
            "Дома и Асцендент без времени не считаются — прячем их и объясняем почему.",
          ],
        },
        { type: "p", text: "В онбординге кнопка «Не знаю точное время» и подсказка, где его найти: свидетельство о рождении, выписка из роддома." },
      ],
    },
    { role: "user", text: "Сколько будет стоить Claude API на расшифровках?" },
    {
      role: "assistant",
      thought: "Ran 1 step",
      time: "Yesterday",
      steps: [{ icon: "\uE051", label: "Estimated tokens per chart", detail: "12 sections" }],
      blocks: [
        { type: "p", text: "Расшифровка натальной карты — один раз на пользователя, около 12 разделов по 150 слов. Прогноз дня — каждый день, коротко." },
        {
          type: "table",
          head: ["Что", "Как часто", "На 10 тыс. пользователей в месяц"],
          rows: [
            ["Натальная карта", "Один раз", "~$60, разово"],
            ["Прогноз дня", "Каждый день", "~$240"],
            ["Совместимость", "~2 раза в месяц", "~$30"],
          ],
        },
        { type: "p", text: "Прогноз дня — главная статья. Его можно кешировать: у людей с одинаковой Луной и Солнцем транзиты дня похожи, и общая часть текста переиспользуется." },
      ],
    },
    { role: "user", text: "Начинаем с сервера расчётов" },
    {
      role: "assistant",
      time: "Yesterday",
      blocks: [
        { type: "p", text: "Хорошо. Первым делом выберу, на чём считать эфемериды: свой Swiss Ephemeris или готовый API. Разберу это в отдельном чате, чтобы решение и цифры лежали в одном месте, — «Выбор API эфемерид»." },
      ],
    },
  ],
  "yango-interview": [
    {
      role: "user",
      text: "Как пройти собеседование в Yango? Дай пару советов",
    },
    {
      role: "assistant",
      thought: "Thought for 3s",
      time: "Yesterday",
      steps: [{ icon: "\uE03F", label: "Collected harmful advice" }],
      blocks: [
        { type: "p", text: "Конечно! Вот проверенные вредные советы для кандидатов. Применять строго наоборот." },
        { type: "h3", text: "Совет первый, о пунктуальности" },
        {
          type: "verse",
          lines: ["Если позвали тебя на собес,", "Не торопись к назначенным часам.", "Пусть подождут — настоящий талант", "Время для встречи назначит сам."],
        },
        { type: "h3", text: "Совет второй, о подготовке" },
        {
          type: "verse",
          lines: ["Про компанию заранее", "Ничего не узнавай.", "Спросят: «Знаешь, чем мы заняты?» —", "Смело молви: «Возим чай!»"],
        },
        { type: "h3", text: "Совет третий, об алгоритмах" },
        {
          type: "verse",
          lines: ["Если дали вам задачу", "Про деревья и про кучи —", "Нарисуйте ёлку с белкой,", "А над ёлкой — тучи."],
        },
        { type: "h3", text: "Совет четвёртый, о зарплате" },
        {
          type: "verse",
          lines: ["На вопрос о зарплате", "Называйте сумму смело:", "Как бюджет небольшой страны.", "Мелочиться — не ваше дело."],
        },
        { type: "h3", text: "Совет пятый, о созвонах" },
        {
          type: "verse",
          lines: ["Если встреча по зуму —", "Камеру не включай.", "Загадочный кандидат", "Запомнится, так и знай."],
        },
        { type: "h3", text: "Совет шестой, финальный" },
        {
          type: "verse",
          lines: ["Когда спросят в самом конце:", "«Есть ли к нам вопросы, друг?» —", "Уточни, во сколько обед", "И можно ли спать до двух."],
        },
        { type: "h2", text: "А если серьёзно" },
        {
          type: "ul",
          items: [
            "Подключитесь за 5 минут до начала и проверьте камеру и микрофон.",
            "Разберитесь в продуктах Yango: такси, доставка, карты — и подумайте, что бы вы улучшили.",
            "На задачах рассуждайте вслух: ход мысли важнее мгновенного ответа.",
            "Приготовьте 2–3 истории из опыта: проблема, что вы сделали, какой результат.",
            "В конце спросите про команду, процессы и то, как измеряют успех на этой роли.",
          ],
        },
        { type: "p", text: "Удачи! Если хотите, устрою тренировочное собеседование: задам вопросы и дам обратную связь по ответам." },
      ],
    },
  ],
};

/** Live status for chats that are still running (keyed by session id). */
export const LIVE_STATUS: Record<string, LiveStatus> = {
  ...TASK_LIVE_STATUS,
  ...YANGO_LIVE_STATUS,
};
