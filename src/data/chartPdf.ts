/**
 * "PDF натальной карты" (chart-pdf), level 2: the result already waits for acceptance when the prototype opens
 * (`result.ready`), so Up next always has a task to accept. Round 1 has nothing broken, but a file outside the brief
 * changed and the glyph claim is only the agent's word: Can wait, "Look deeper first". Round 2 comes after Send back.
 */
import type { Turn } from "./transcripts";
import type { Acceptance, Brief, Task } from "./task";
import type { Envelope } from "./chatTasks";
import { TASK_TRANSCRIPTS } from "./taskTranscripts";

const RUN = "";

export const CHART_PDF_ENVELOPE: Envelope = {
  limit: 6,
  askAt: 0.8,
  paths: [
    { path: "server/pdf/", access: "write" },
    { path: "server/routes/", access: "write" },
    { path: "e2e/", access: "write" },
    { path: "src/chart/", access: "read" },
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
};

export const CHART_PDF_BRIEF: Brief = {
  understanding: "Экспорт натальной карты в PDF: круг карты, таблица позиций и расшифровки по разделам. Собирается на сервере, шрифтами приложения.",
  found: [
    { text: "Круг карты уже рисуется в SVG, его можно вставить в PDF как есть", source: "src/chart/Wheel.tsx" },
    { text: "react-pdf собирает документ из компонентов, без headless-браузера на сервере", source: "сравнение react-pdf, pdfkit, puppeteer" },
  ],
  assumptions: [
    { id: "server", text: "PDF собирается на сервере, а не на телефоне", confirmed: true },
    { id: "fonts", text: "Шрифты и символы планет — те же, что в приложении", confirmed: true },
  ],
  boundaries: ["Круг карты в приложении (`src/chart/`) — только читаю", "Расчёт карты не трогаю"],
  doneWhen: [
    { id: "pages", text: "В PDF три раздела: круг карты, таблица планет и домов, расшифровки" },
    { id: "glyphs", text: "Символы планет и знаков видны, без квадратиков" },
    { id: "breaks", text: "Расшифровки не рвутся на середине слова при переносе страницы", locked: true },
    { id: "e2e", text: "e2e на стейджинге проходят на 3 тестовых картах", locked: true },
  ],
};

const PDF_FILES: Acceptance["files"] = [
  {
    name: "server/pdf/ChartPdf.tsx",
    added: 214,
    removed: 0,
    lines: [
      "@@ -0,0 +1,214 @@",
      "+export function ChartPdf({ chart }: Props) {",
      "+  return (",
      "+    <Document title={chart.name}>",
      "+      <WheelPage svg={renderWheel(chart, { size: 520 })} />",
      "+      <PositionsPage planets={chart.planets} houses={chart.houses} />",
      "+      <ReadingsPage sections={chart.readings} />",
      "+    </Document>",
      "+  );",
      "+}",
    ],
  },
  {
    name: "server/pdf/ReadingsPage.tsx",
    added: 58,
    removed: 0,
    lines: [
      "@@ -0,0 +1,58 @@",
      "+export function ReadingsPage({ sections }: Props) {",
      "+  return sections.map((s) => (",
      "+    // The heading stays with its first paragraph; pages break between paragraphs only.",
      "+    <View key={s.id} minPresenceAhead={80}>",
      "+      <Text style={styles.h2}>{s.title}</Text>",
      "+      {s.paragraphs.map((p, i) => <Text key={i} wrap={false} style={styles.p}>{p}</Text>)}",
      "+    </View>",
      "+  ));",
      "+}",
    ],
  },
  {
    name: "server/pdf/fonts.ts",
    added: 22,
    removed: 0,
    lines: [
      "@@ -0,0 +1,22 @@",
      "+// The app's fonts; planet and sign glyphs come from the same font as the wheel.",
      "+Font.register({ family: \"Anthropic Serif\", src: asset(\"fonts/AnthropicSerif.ttf\") });",
      "+Font.register({ family: \"Astro Glyphs\", src: asset(\"fonts/AstroGlyphs.ttf\") });",
    ],
  },
  {
    name: "server/routes/chart-pdf.ts",
    added: 31,
    removed: 0,
    lines: [
      "@@ -0,0 +1,31 @@",
      "+router.get(\"/chart/:id/pdf\", async (req, res) => {",
      "+  const chart = await loadChart(req.params.id, req.user);",
      "+  res.type(\"application/pdf\");",
      "+  (await renderToStream(<ChartPdf chart={chart} />)).pipe(res);",
      "+});",
    ],
  },
];

const SPEC: Acceptance["files"][number] = {
  name: "e2e/chart-pdf.spec.ts",
  added: 64,
  removed: 0,
  lines: [
    "@@ -0,0 +1,64 @@",
    "+for (const chart of TEST_CHARTS) {",
    "+  test(`exports ${chart.name} to PDF`, async ({ request }) => {",
    "+    const pdf = await parsePdf(await request.get(`/chart/${chart.id}/pdf`));",
    "+    expect(pdf.sections).toEqual([\"Карта\", \"Позиции\", \"Расшифровки\"]);",
    "+    expect(pdf.brokenWords).toHaveLength(0);",
    "+  });",
    "+}",
  ],
};

const WHEEL: Acceptance["files"][number] = {
  name: "src/chart/Wheel.tsx",
  added: 3,
  removed: 1,
  lines: [
    "@@ -12,7 +12,9 @@ export function Wheel({ chart }: Props) {",
    "-  const size = useViewportSize();",
    "+  // In the PDF there is no viewport: a fixed size.",
    "+  const size = typeof window === \"undefined\" ? 520 : useViewportSize();",
    "+",
    "   return <svg viewBox={`0 0 ${size} ${size}`}>",
  ],
};

const CI_E2E = [
  "$ npm run e2e -- chart-pdf",
  "✓ e2e/chart-pdf.spec.ts › exports Анна (1990) to PDF (3.2s)",
  "✓ e2e/chart-pdf.spec.ts › exports Михаил (1984) to PDF (3.0s)",
  "✓ e2e/chart-pdf.spec.ts › exports the longest chart to PDF · 7 pages (4.8s)",
  "Tests: 3 passed, 0 skipped, 3 total",
];

const OTHER_SPECS = [
  { file: "e2e/chart.spec.ts", passed: 9 },
  { file: "e2e/profile.spec.ts", passed: 6 },
];

const COMMON = {
  unverified: ["PDF на картах с неизвестным временем рождения: в тестовых данных таких нет", "Как PDF открывается в «Файлах» на iPhone"],
  manualChecks: [
    { id: "open", text: "На стейджинге открой свою карту и нажми «Скачать PDF»: файл открывается" },
    { id: "glyphs", text: "Проверь на второй странице: символы планет и знаков — не квадратики" },
    { id: "breaks", text: "Пролистай расшифровки: ни одно слово не разорвано между страницами" },
  ],
  why: [
    "Выбрал react-pdf, а не puppeteer, потому что так не нужен headless-браузер на сервере",
    "Выбрал вставить круг как SVG, потому что он уже так рисуется и выглядит так же, как в приложении",
    "Выбрал переносить страницы только между абзацами, потому что иначе слова рвались посередине",
  ],
};

const ITERATIONS: Acceptance[] = [
  {
    iteration: 1,
    message: "Готово: PDF собирается на сервере — круг карты, таблица планет и домов, расшифровки. e2e на стейджинге проходят на трёх тестовых картах.",
    claims: [
      {
        id: "pages",
        text: "В PDF три раздела: круг карты, таблица планет и домов, расшифровки",
        status: "verified",
        stepId: "wheel",
        criterionId: "pages",
        source: { kind: "ci", label: "e2e · run #233", ref: "#233", detail: CI_E2E },
      },
      { id: "glyphs", text: "Символы планет и знаков в PDF — из шрифта приложения, без квадратиков", status: "claimed", stepId: "fonts", criterionId: "glyphs" },
      {
        id: "breaks",
        text: "Расшифровки переносятся только между абзацами",
        status: "verified",
        stepId: "readings",
        criterionId: "breaks",
        source: {
          kind: "test-diff",
          label: "Test diff · no broken words",
          ref: "e2e/chart-pdf.spec.ts",
          detail: ["@@ e2e/chart-pdf.spec.ts @@", "+    expect(pdf.brokenWords).toHaveLength(0);"],
        },
      },
      {
        id: "e2e",
        text: "e2e на стейджинге проходят на 3 тестовых картах",
        status: "verified",
        stepId: "e2e",
        criterionId: "e2e",
        source: { kind: "ci", label: "e2e · run #233 · 0 skipped", ref: "#233", detail: CI_E2E },
      },
      {
        id: "wheel-app",
        text: "Круг карты в приложении выглядит как раньше",
        status: "claimed",
        stepId: "wheel",
      },
    ],
    flags: [{ id: "wheel", kind: "file-outside-brief", ref: "src/chart/Wheel.tsx" }],
    tests: {
      passed: 18,
      added: 3,
      skippedOrDeleted: [],
      ci: { kind: "ci", label: "e2e · run #233", ref: "#233", detail: CI_E2E },
      byFile: [{ file: "e2e/chart-pdf.spec.ts", passed: 3, added: 3 }, ...OTHER_SPECS],
    },
    ...COMMON,
    files: [...PDF_FILES, SPEC, WHEEL],
  },
  {
    iteration: 2,
    changedSince: { files: ["src/chart/Wheel.tsx", "server/pdf/ChartPdf.tsx"], claims: ["glyphs", "wheel-app"] },
    message: "Правку `src/chart/Wheel.tsx` откатил: размер круга для PDF теперь задаётся снаружи. Символы проверил ревьюер по тексту PDF.",
    claims: [
      {
        id: "pages",
        text: "В PDF три раздела: круг карты, таблица планет и домов, расшифровки",
        status: "verified",
        stepId: "wheel",
        criterionId: "pages",
        source: { kind: "ci", label: "e2e · run #237", ref: "#237", detail: CI_E2E },
      },
      {
        id: "glyphs",
        text: "Символы планет и знаков в PDF — из шрифта приложения, без квадратиков",
        status: "verified",
        stepId: "fonts",
        criterionId: "glyphs",
        source: {
          kind: "reviewer-agent",
          label: "Reviewer agent · read the PDF",
          ref: "pdf-reviewer",
          detail: ["Извлёк текст из трёх PDF: все 12 знаков и 10 планет на месте, символов замены нет.", "Шрифт символов в PDF — Astro Glyphs, как в круге."],
        },
      },
      {
        id: "breaks",
        text: "Расшифровки переносятся только между абзацами",
        status: "verified",
        stepId: "readings",
        criterionId: "breaks",
        source: {
          kind: "test-diff",
          label: "Test diff · no broken words",
          ref: "e2e/chart-pdf.spec.ts",
          detail: ["@@ e2e/chart-pdf.spec.ts @@", "+    expect(pdf.brokenWords).toHaveLength(0);"],
        },
      },
      {
        id: "e2e",
        text: "e2e на стейджинге проходят на 3 тестовых картах",
        status: "verified",
        stepId: "e2e",
        criterionId: "e2e",
        source: { kind: "ci", label: "e2e · run #237 · 0 skipped", ref: "#237", detail: CI_E2E },
      },
      {
        id: "wheel-app",
        text: "Круг карты в приложении выглядит как раньше",
        status: "verified",
        stepId: "wheel",
        source: { kind: "test-diff", label: "src/chart/ не менялся", ref: "src/chart/Wheel.tsx" },
      },
    ],
    flags: [],
    tests: {
      passed: 18,
      added: 3,
      skippedOrDeleted: [],
      ci: { kind: "ci", label: "e2e · run #237", ref: "#237", detail: CI_E2E },
      byFile: [{ file: "e2e/chart-pdf.spec.ts", passed: 3, added: 3 }, ...OTHER_SPECS],
    },
    ...COMMON,
    files: [
      {
        ...PDF_FILES[0],
        added: 216,
        lines: [...PDF_FILES[0].lines.slice(0, 4), "+      <WheelPage svg={renderWheel(chart, { size: 520, fixed: true })} />", ...PDF_FILES[0].lines.slice(5)],
      },
      ...PDF_FILES.slice(1),
      SPEC,
    ],
  },
];

const STEPS: NonNullable<Task["result"]>["steps"] = {
  wheel: {
    work: { agent: "ui-engineer", cost: "$0.35", time: "1h 10m" },
    result: {
      summary: "Круг карты вставлен в PDF как SVG, рядом — таблица планет и домов.",
      files: [
        { name: "server/pdf/ChartPdf.tsx", added: 214, removed: 0 },
        { name: "src/chart/Wheel.tsx", added: 3, removed: 1 },
      ],
    },
  },
  fonts: {
    work: { agent: "ui-engineer", cost: "$0.15", time: "25m" },
    result: { summary: "Шрифты приложения подключены в PDF; символы планет и знаков — из того же шрифта, что в круге.", files: [{ name: "server/pdf/fonts.ts", added: 22, removed: 0 }] },
  },
  readings: {
    work: { agent: "ui-engineer", cost: "$0.25", time: "40m" },
    result: {
      summary: "Страницы переносятся только между абзацами, заголовок раздела держится с первым абзацем. Самая длинная карта — 7 страниц.",
      files: [{ name: "server/pdf/ReadingsPage.tsx", added: 58, removed: 0 }],
    },
  },
  e2e: {
    work: { agent: "ui-engineer", cost: "$0.30", time: "35m" },
    result: {
      summary: "`GET /chart/:id/pdf` на стейджинге, e2e на трёх тестовых картах.",
      files: [
        { name: "server/routes/chart-pdf.ts", added: 31, removed: 0 },
        { name: "e2e/chart-pdf.spec.ts", added: 64, removed: 0 },
      ],
    },
  },
};

/** The chat up to the result: the mock chat without its last "running e2e" turn, then the result with its tile. */
const TRANSCRIPT: Turn[] = [
  ...(TASK_TRANSCRIPTS["chart-pdf"] ?? []).slice(0, -1),
  {
    role: "assistant",
    thought: "Ran 4 steps",
    time: "2 minutes ago",
    steps: [
      { icon: RUN, label: "Deployed to staging" },
      { icon: RUN, label: "Ran e2e", detail: "run #233" },
    ],
    blocks: [{ type: "p", text: ITERATIONS[0].message }, { type: "result-card", iteration: 1 }],
  },
];

export const CHART_PDF_RESULT: NonNullable<Task["result"]> = {
  claims: [],
  ready: true,
  iterations: ITERATIONS,
  steps: STEPS,
  transcript: TRANSCRIPT,
  fix: {
    agent: "ui-engineer",
    summary: "Откатил правку `src/chart/Wheel.tsx`: размер круга для PDF задаётся снаружи. Символы в PDF проверил ревьюер.",
    reply: "Беру в работу: откачу правку вне брифа и дам проверить символы в PDF. Результат пришлю на приёмку снова.",
  },
};
