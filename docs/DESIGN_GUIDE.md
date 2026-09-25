# Дизайн-гайд: как делать новый UI в стиле Claude Code

Всё, что здесь описано, собрано из самого прототипа: из скомпилированного CSS дизайн-системы (`src/styles/design-system.css`) и из разметки его компонентов. Живой справочник: **`/tokens`** в dev-сервере. Табличный справочник: [DESIGN_TOKENS.md](DESIGN_TOKENS.md).

## 1. Как устроены стили

| Слой | Файл | Что делает |
|---|---|---|
| Дизайн-система | `src/styles/design-system.css` | Скомпилированный CSS оригинала: шрифты, 959 токенов `--cds-*`, стили компонентов по `data-cds="…"`, уже собранные Tailwind-классы. **Не редактировать.** |
| Tailwind v4 | `src/styles/tailwind.css` | Генерирует новые классы. Тема привязана к токенам: `bg-surface-2` → `var(--cds-surface-2)`. |
| Примитивы | `src/ui/index.tsx` | `Theme`, `Icon`, `Button` для нового UI. |

Порядок импорта в `main.tsx` важен: сначала `design-system.css` (он объявляет порядок `@layer`), потом `tailwind.css`.

## 2. Правила

1. **Цвета берём только из токенов.** Никаких `#hex`, `rgb()` и цветов Tailwind по умолчанию. Токены сами переключаются между тёмной и светлой темой.
2. **Всё рисуем внутри `cds-root`.** Токены вычисляются от ближайшего `.cds-root[data-mode][data-density]`. Для нового экрана или изолированного блока оборачиваем в `<Theme mode="dark" density="comfortable">`.
3. **Типографика по шкале:** `text-caption` · `text-footnote` · `text-code` · `text-body` · `text-heading` · `text-prose` · `text-title`. В каждом классе размер уже идёт в паре с высотой строки.
4. **Отступы и размеры:** `p-*`, `px-*`, `gap-*` с шагами `xs sm md lg xl` (зависят от density), высота контролов `h-control`, радиусы `rounded` / `rounded-sm` / `rounded-lg` / `rounded-composer`.
5. **Иконки только из Anthropicons:** `<Icon glyph={""} />`. Коды иконок смотреть на `/tokens#icons`.
6. **Кнопки и контролы** делаем через `src/ui` или по образцу разметки оригинала (см. §4), не с нуля.
7. **Анимации:** `duration-fast` / `duration-base`, `ease-out` / `ease-snap` (`--cds-dur-*`, `--cds-ease-*`).

## 3. Шпаргалка по классам

| Задача | Класс | Токен |
|---|---|---|
| Фон страницы / панели / поповера | `bg-surface-1` / `bg-surface-2` / `bg-surface-3` | `--cds-surface-*` |
| Основной / вторичный / приглушённый текст | `text-primary` / `text-secondary` / `text-muted` | `--cds-text-*` |
| Полупрозрачный слой (hover, подложка) | `bg-alpha-1` … `bg-alpha-9` | `--cds-alpha-*` |
| Наведение на ghost-кнопку | `bg-fill-ghost-hover` | `--cds-fill-ghost-hover` |
| Поле ввода | `bg-fill-field` | `--cds-fill-field` |
| Акцент (синий) / ошибка / успех / предупреждение | `bg-fill-accent` / `bg-fill-danger` / `bg-fill-success` / `bg-fill-warning` | `--cds-fill-*` |
| Текст на заливке | `text-on-accent`, `text-on-primary`, … | `--cds-on-*` |
| Мягкий фон статуса (баннер, чип) | `bg-bg-accent`, `bg-bg-danger`, … | `--cds-bg-*` |
| Тонкая граница | `border border-border` или `border-alpha-2` | `--cds-border`, `--cds-alpha-2` |
| Бренд (clay) | `bg-clay`, `text-clay` | `--cds-clay` |
| Кольцо фокуса | `focus-visible:shadow-focus` | `--cds-focus-shadow` |
| Тень поповера | `shadow-popover` | `--cds-shadow-popover` |

Если подходящего класса нет, пишем значение напрямую: `style={{ color: "var(--cds-text-tint-violet)" }}` или `className="bg-[var(--cds-…)]"`.

## 4. Компоненты

Готовые примитивы в `src/ui`:

```tsx
import { Theme, Button, Icon } from "../ui";

<Theme mode="dark">
  <Button variant="primary" icon={""}>New session</Button>
  <Button variant="ghost" size="sm">Cancel</Button>
  <Button icon={""} aria-label="Search" />  {/* квадратная кнопка с иконкой */}
</Theme>
```

`variant`: `ghost` · `secondary` · `primary` · `accent` · `danger`. `size`: `xs` · `sm` · `md` · `lg` (выставляет `data-size`, и CSS дизайн-системы сам меняет высоту и отступы). `trailingIcon` добавляет иконку справа, например шеврон у кнопки с меню.

Компоненты страниц, собранные по экрану Routines (пример использования: `src/pages/RoutinesPage.tsx`):

| Компонент | Что это |
|---|---|
| `PageHeader` | Serif-заголовок страницы; под ним ряд: табы/фильтры слева, действия справа |
| `Tabs` | Табы-пилюли («Yours / Templates») |
| `EmptyState`, `StopwatchIllustration` | Пустое состояние списка: иллюстрация и приглушённый текст |
| `WavyDivider` | Волнистый разделитель секций |
| `ListCard`, `CardGrid` | Карточка: плитка с иконкой, заголовок, описание, строка-мета (расписание, триггер); сетка в 2 колонки. Hover-заливка приходит из CSS `Card`/`CardLink` |
| `Menu`, `MenuSelectItem`, `MenuCheckboxItem`, `MenuItem`, `MenuSeparator` | Выпадающее меню в портале: строки со значением и подменю, чекбоксы, разделители. Закрывается по клику снаружи и по Escape |

Навигация по проектам в сайдбаре: `src/components/ProjectNav.tsx`, данные и фильтрация в `src/data/sessions.ts`. Выбранный чат хранится в URL (`/code/:id`), активный пункт помечается `data-selected="focused"`, как в оригинале.

Кроме того, CSS дизайн-системы уже стилизует компоненты по атрибуту `data-cds`. Чтобы сделать такой компонент, возьми разметку из `src/components` и повтори её атрибуты:
`Button`, `Card`, `CardLink`, `Tabs`, `SegmentedControl`, `TextInput`, `TextArea`, `Banner`, `Toast`, `DataTable`, `Collapsible`, `AccordionHeader`, `Skeleton`, `Shortcut`, `Avatar`, `ModelSelector`, `ChatComposer*`, `MessageActions`, `TurnStatus`, `Pulse`.

## 5. Что трогать нельзя

- **`src/styles/design-system.css`** — это исходный CSS оригинала. Новые стили пишутся классами Tailwind или в отдельном файле.
- **Строки вида `[.x_&amp;]:…`** в `src/components` (например в `NextHeader.tsx` и `SelectorButton.tsx`). В оригинале `&amp;` стоит буквально, поэтому эти правила никогда не срабатывают. Если «починить» их на `&`, вёрстка сдвинется (заголовок уедет на 4px). Они сохранены намеренно, ради совпадения 1:1.
- Сгенерированные `id` вида `_r_c5_` — это снимок DOM, их можно не трогать.

## 6. Проверка

- `npm run dev` → http://localhost:5173/code (прототип), http://localhost:5173/tokens (справочник).
- `npm run original` → http://localhost:5174/code: исходная сборка из Alloy для сравнения один в один.
- `npm run typecheck`.
