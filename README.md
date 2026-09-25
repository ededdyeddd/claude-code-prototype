# Claude Code — прототип

React-копия прототипа из Alloy, 1:1 с оригиналом. Собрано на Vite + React 19 + TypeScript + Tailwind v4 поверх дизайн-системы Claude (`--cds-*`).

```bash
npm install
npm run dev        # http://localhost:5173
```

| URL | Что там |
|---|---|
| `/code` | прототип |
| `/tokens` | живой справочник дизайн-системы: токены (dark/light, comfortable/compact), иконки, компоненты, утилитарные классы |

## Структура

```
src/
  App.tsx, main.tsx
  components/        компоненты прототипа (восстановлены из сборки Alloy)
    icons/
  ui/                примитивы для нового UI: Theme, Icon, Button
  pages/TokensPage   страница /tokens
  design-system/     tokens.json — каталог токенов со значениями
  styles/
    design-system.css  исходный CSS дизайн-системы (не редактировать)
    tailwind.css       Tailwind v4, тема привязана к токенам
    fonts/
  assets/
docs/
  DESIGN_GUIDE.md    как делать новый UI
  DESIGN_TOKENS.md   все токены со значениями
original/            исходная сборка из Alloy для сравнения (npm run original → :5174)
```

Подробнее: [docs/DESIGN_GUIDE.md](docs/DESIGN_GUIDE.md).
