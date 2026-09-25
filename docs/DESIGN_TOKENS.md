# Design tokens (`--cds-*`)

Generated from `src/styles/design-system.css` by computing every token in the browser.
Columns: **dark** and **light** = `data-mode`, both at `data-density="comfortable"`; **compact** = dark + `data-density="compact"` (shown only when it differs).
The live, visual version of this page is at `/tokens` in the dev server.

## Contents
- [Surfaces](#surfaces) (7)
- [Text](#text) (9)
- [Text tints](#text-tints) (8)
- [Fills](#fills) (25)
- [Backgrounds (status and tint)](#backgrounds-status-and-tint) (58)
- [Borders and rings](#borders-and-rings) (14)
- [Alpha overlays](#alpha-overlays) (10)
- [On-colors](#on-colors) (7)
- [Brand](#brand) (2)
- [Git status](#git-status) (45)
- [Role scales](#role-scales) (57)
- [Palette: gray](#palette-gray) (35)
- [Palette: neutral](#palette-neutral) (35)
- [Palette: orange](#palette-orange) (35)
- [Palette: red](#palette-red) (35)
- [Palette: yellow](#palette-yellow) (35)
- [Palette: green](#palette-green) (35)
- [Palette: aqua](#palette-aqua) (35)
- [Palette: blue](#palette-blue) (35)
- [Palette: violet](#palette-violet) (35)
- [Palette: magenta](#palette-magenta) (35)
- [Font families](#font-families) (6)
- [Font sizes](#font-sizes) (7)
- [Font weights](#font-weights) (4)
- [Line heights](#line-heights) (7)
- [Padding](#padding) (5)
- [Gaps](#gaps) (5)
- [Radius](#radius) (5)
- [Control heights](#control-heights) (8)
- [Shadows and focus](#shadows-and-focus) (11)
- [Motion](#motion) (8)
- [Z-index](#z-index) (5)
- [Component and misc tokens](#component-and-misc-tokens) (232)
- [Utility classes](#utility-classes)

## Surfaces

Page and panel backgrounds, darkest to lightest (surface-0 … surface-3).

| Token | Dark | Light |
|---|---|---|
| `--cds-page-bg` | `#151515` | same |
| `--cds-surface-0` | `#0b0b0b` | `#f9f9f7` |
| `--cds-surface-1` | `#151515` | `#fcfcfb` |
| `--cds-surface-2` | `#1a1a19` | `#fff` |
| `--cds-surface-3` | `#20201f` | `#fff` |
| `--cds-surface-panel` | `#1a1a19` | `#fff` |
| `--cds-surface-popover` | `#20201f` | `#fff` |

## Text

Text colors. Use primary / secondary / muted for hierarchy.

| Token | Dark | Light |
|---|---|---|
| `--cds-text-accent` | `#6da7ec` | `#184f95` |
| `--cds-text-danger` | `#ec7e7e` | `#8e2626` |
| `--cds-text-disabled` | `hsl(from #fff h s l/35%)` | `hsl(from #0b0b0b h s l/35%)` |
| `--cds-text-muted` | `#898781` | same |
| `--cds-text-primary` | `#f0efec` | `#0b0b0b` |
| `--cds-text-pro` | `#a096eb` | `#4a3aa7` |
| `--cds-text-secondary` | `#c3c2b7` | `#52514e` |
| `--cds-text-success` | `#0ca30c` | `#006300` |
| `--cds-text-warning` | `#db9300` | `#734500` |

## Text tints

Colored text for labels and tags.

| Token | Dark | Light |
|---|---|---|
| `--cds-text-tint-aqua` | `#3bbd8c` | `#065f49` |
| `--cds-text-tint-blue` | `#6da7ec` | `#184f95` |
| `--cds-text-tint-green` | `#55bf50` | `#006300` |
| `--cds-text-tint-magenta` | `#e87ba4` | `#862a4c` |
| `--cds-text-tint-orange` | `#ec835a` | `#863311` |
| `--cds-text-tint-red` | `#ec7e7e` | `#8e2626` |
| `--cds-text-tint-violet` | `#a096eb` | `#4a3aa7` |
| `--cds-text-tint-yellow` | `#db9300` | `#734500` |

## Fills

Interactive fills: buttons, controls, fields, ghost hovers.

| Token | Dark | Light |
|---|---|---|
| `--cds-fill-accent` | `#2a78d6` | same |
| `--cds-fill-accent-hover` | `#3987e5` | same |
| `--cds-fill-brand` | `#c6613f` | same |
| `--cds-fill-brand-hover` | `#d97757` | same |
| `--cds-fill-control` | `hsl(from #fff h s l/10%)` | `hsl(from #0b0b0b h s l/10%)` |
| `--cds-fill-control-hover` | `hsl(from #fff h s l/20%)` | `hsl(from #0b0b0b h s l/20%)` |
| `--cds-fill-danger` | `#d03b3b` | same |
| `--cds-fill-danger-hover` | `#e34948` | same |
| `--cds-fill-disabled` | `hsl(from #fff h s l/5%)` | `hsl(from #0b0b0b h s l/5%)` |
| `--cds-fill-field` | `hsl(from #fff h s l/5%)` | `#ffffff80` |
| `--cds-fill-field-ring` | `hsl(from #fff h s l/10%)` | `hsl(from #0b0b0b h s l/10%)` |
| `--cds-fill-ghost-hover` | `hsl(from #fff h s l/7.5%)` | `hsl(from #0b0b0b h s l/5%)` |
| `--cds-fill-ghost-selected` | `hsl(from #fff h s l/15%)` | `hsl(from #0b0b0b h s l/10%)` |
| `--cds-fill-primary` | `#fff` | `#0b0b0b` |
| `--cds-fill-primary-hover` | `#e1e0d9` | `#2c2c2a` |
| `--cds-fill-pro` | `#7161e0` | same |
| `--cds-fill-pro-hover` | `#8173e3` | same |
| `--cds-fill-secondary` | `hsl(from #fff h s l/10%)` | `#ffffff1a` |
| `--cds-fill-secondary-hover` | `hsl(from #fff h s l/14%)` | `hsl(from #0b0b0b h s l/5%)` |
| `--cds-fill-secondary-pressed-ring` | `hsl(from #fff h s l/10%)` | `hsl(from #0b0b0b h s l/10%)` |
| `--cds-fill-secondary-ring` | `transparent` | `hsl(from #0b0b0b h s l/10%)` |
| `--cds-fill-success` | `#009300` | same |
| `--cds-fill-success-hover` | `#0ca30c` | same |
| `--cds-fill-warning` | `#fab219` | same |
| `--cds-fill-warning-hover` | `#eda100` | same |

## Backgrounds (status and tint)

Soft status backgrounds for banners, chips and callouts.

| Token | Dark | Light |
|---|---|---|
| `--cds-bg-accent` | `#032042` | `#cde2fb` |
| `--cds-bg-accent-chip` | `#032042` | `#cde2fb` |
| `--cds-bg-accent-muted` | `color-mix(in srgb,#2a78d6 10%,transparent)` | same |
| `--cds-bg-danger` | `#3c0e0e` | `#fad6d6` |
| `--cds-bg-danger-chip` | `#3c0e0e` | `#fad6d6` |
| `--cds-bg-editor-canvas` | `#181817` | `#edece8` |
| `--cds-bg-editor-claude-pending` | `color-mix(in srgb,#d97757 22%,transparent)` | same |
| `--cds-bg-editor-collaborator-1` | `color-mix(in srgb,#7161e0 22%,transparent)` | same |
| `--cds-bg-editor-collaborator-2` | `color-mix(in srgb,#c04873 22%,transparent)` | same |
| `--cds-bg-editor-collaborator-3` | `color-mix(in srgb,#0f7e5c 22%,transparent)` | same |
| `--cds-bg-editor-collaborator-4` | `color-mix(in srgb,#008300 22%,transparent)` | same |
| `--cds-bg-editor-collaborator-5` | `color-mix(in srgb,#945d00 22%,transparent)` | same |
| `--cds-bg-editor-collaborator-6` | `color-mix(in srgb,#6d6b67 22%,transparent)` | same |
| `--cds-bg-editor-comment` | `color-mix(in srgb,#fab219 20%,transparent)` | same |
| `--cds-bg-editor-comment-active` | `color-mix(in srgb,#fab219 45%,transparent)` | same |
| `--cds-bg-editor-highlight-blue` | `color-mix(in srgb,#6da7ec 33%,transparent)` | same |
| `--cds-bg-editor-highlight-gray` | `color-mix(in srgb,#a5a49a 33%,transparent)` | same |
| `--cds-bg-editor-highlight-green` | `color-mix(in srgb,#55bf50 33%,transparent)` | same |
| `--cds-bg-editor-highlight-magenta` | `color-mix(in srgb,#e87ba4 33%,transparent)` | same |
| `--cds-bg-editor-highlight-violet` | `color-mix(in srgb,#a096eb 33%,transparent)` | same |
| `--cds-bg-editor-highlight-yellow` | `color-mix(in srgb,#fab219 33%,transparent)` | same |
| `--cds-bg-git-added` | `color-mix(in srgb,#32d74b 20%,transparent)` | `color-mix(in srgb,#1e9e3c 20%,transparent)` |
| `--cds-bg-git-closed` | `color-mix(in srgb,#ff6159 20%,transparent)` | `color-mix(in srgb,#ff3a30 20%,transparent)` |
| `--cds-bg-git-conflicting` | `color-mix(in srgb,#fa832e 20%,transparent)` | `color-mix(in srgb,#c5621b 20%,transparent)` |
| `--cds-bg-git-draft` | `color-mix(in srgb,#a6a6a6 20%,transparent)` | `color-mix(in srgb,#737373 20%,transparent)` |
| `--cds-bg-git-merged` | `color-mix(in srgb,#b796ff 20%,transparent)` | `color-mix(in srgb,#8e6bd9 20%,transparent)` |
| `--cds-bg-git-modified` | `color-mix(in srgb,#ffd014 20%,transparent)` | `color-mix(in srgb,#98801f 20%,transparent)` |
| `--cds-bg-git-opened` | `color-mix(in srgb,#32d74b 20%,transparent)` | `color-mix(in srgb,#1e9e3c 20%,transparent)` |
| `--cds-bg-git-queued` | `color-mix(in srgb,#ffd014 20%,transparent)` | `color-mix(in srgb,#98801f 20%,transparent)` |
| `--cds-bg-git-removed` | `color-mix(in srgb,#ff2c56 20%,transparent)` | `color-mix(in srgb,#cd2054 20%,transparent)` |
| `--cds-bg-highlight` | `color-mix(in srgb,#fab219 33%,transparent)` | same |
| `--cds-bg-neutral` | `hsl(from #fff h s l/5%)` | `hsl(from #0b0b0b h s l/5%)` |
| `--cds-bg-neutral-chip` | `hsl(from #fff h s l/5%)` | `hsl(from #0b0b0b h s l/5%)` |
| `--cds-bg-neutral-chip-hover` | `hsl(from #fff h s l/10%)` | `hsl(from #0b0b0b h s l/10%)` |
| `--cds-bg-neutral-hover` | `hsl(from #fff h s l/10%)` | `hsl(from #0b0b0b h s l/10%)` |
| `--cds-bg-pro` | `#1d1649` | `#dfdbfd` |
| `--cds-bg-pro-chip` | `#1d1649` | `#dfdbfd` |
| `--cds-bg-success` | `#11260f` | `#caeac7` |
| `--cds-bg-success-chip` | `#11260f` | `#caeac7` |
| `--cds-bg-tint-aqua` | `rgb(from #022720 calc((r - 5.25)/.75) calc((g - 5.25)/.75) calc((b - 5.25)/.75)/75%)` | `rgb(from #bfebdb calc((r - 163.8)/.35) calc((g - 163.8)/.35) calc((b - 163.15)/.35)/35%)` |
| `--cds-bg-tint-aqua-opaque` | `#022720` | `#bfebdb` |
| `--cds-bg-tint-blue` | `rgb(from #032042 calc((r - 5.25)/.75) calc((g - 5.25)/.75) calc((b - 5.25)/.75)/75%)` | `rgb(from #cde2fb calc((r - 163.8)/.35) calc((g - 163.8)/.35) calc((b - 163.15)/.35)/35%)` |
| `--cds-bg-tint-blue-opaque` | `#032042` | `#cde2fb` |
| `--cds-bg-tint-green` | `rgb(from #11260f calc((r - 5.25)/.75) calc((g - 5.25)/.75) calc((b - 5.25)/.75)/75%)` | `rgb(from #caeac7 calc((r - 163.8)/.35) calc((g - 163.8)/.35) calc((b - 163.15)/.35)/35%)` |
| `--cds-bg-tint-green-opaque` | `#11260f` | `#caeac7` |
| `--cds-bg-tint-magenta` | `rgb(from #390f1f calc((r - 5.25)/.75) calc((g - 5.25)/.75) calc((b - 5.25)/.75)/75%)` | `rgb(from #f9d4e2 calc((r - 163.8)/.35) calc((g - 163.8)/.35) calc((b - 163.15)/.35)/35%)` |
| `--cds-bg-tint-magenta-opaque` | `#390f1f` | `#f9d4e2` |
| `--cds-bg-tint-orange` | `rgb(from #371407 calc((r - 5.25)/.75) calc((g - 5.25)/.75) calc((b - 5.25)/.75)/75%)` | `rgb(from #f7d8cb calc((r - 163.8)/.35) calc((g - 163.8)/.35) calc((b - 163.15)/.35)/35%)` |
| `--cds-bg-tint-orange-opaque` | `#371407` | `#f7d8cb` |
| `--cds-bg-tint-red` | `rgb(from #3c0e0e calc((r - 5.25)/.75) calc((g - 5.25)/.75) calc((b - 5.25)/.75)/75%)` | `rgb(from #fad6d6 calc((r - 163.8)/.35) calc((g - 163.8)/.35) calc((b - 163.15)/.35)/35%)` |
| `--cds-bg-tint-red-opaque` | `#3c0e0e` | `#fad6d6` |
| `--cds-bg-tint-violet` | `rgb(from #1d1649 calc((r - 5.25)/.75) calc((g - 5.25)/.75) calc((b - 5.25)/.75)/75%)` | `rgb(from #dfdbfd calc((r - 163.8)/.35) calc((g - 163.8)/.35) calc((b - 163.15)/.35)/35%)` |
| `--cds-bg-tint-violet-opaque` | `#1d1649` | `#dfdbfd` |
| `--cds-bg-tint-yellow` | `rgb(from #311a00 calc((r - 5.25)/.75) calc((g - 5.25)/.75) calc((b - 5.25)/.75)/75%)` | `rgb(from #f9dca4 calc((r - 163.8)/.35) calc((g - 163.8)/.35) calc((b - 163.15)/.35)/35%)` |
| `--cds-bg-tint-yellow-opaque` | `#311a00` | `#f9dca4` |
| `--cds-bg-user-message` | `hsl(from #fff h s l/5%)` | `hsl(from #0b0b0b h s l/5%)` |
| `--cds-bg-warning` | `#311a00` | `#f9dca4` |
| `--cds-bg-warning-chip` | `#311a00` | `#f9dca4` |

## Borders and rings

Hairlines and strokes.

| Token | Dark | Light |
|---|---|---|
| `--cds-border` | `hsl(from #fff h s l/10%)` | `hsl(from #0b0b0b h s l/10%)` |
| `--cds-border-accent` | `#0d366b` | `#86b6ef` |
| `--cds-border-danger` | `#641919` | `#f09595` |
| `--cds-border-editor-comment` | `#db9300` | `#b77700` |
| `--cds-border-editor-comment-target` | `#a66a00` | same |
| `--cds-border-pro` | `#322777` | `#b0a7f2` |
| `--cds-border-strong` | `hsl(from #fff h s l/20%)` | `hsl(from #0b0b0b h s l/20%)` |
| `--cds-border-stronger` | `hsl(from #fff h s l/40%)` | `hsl(from #0b0b0b h s l/40%)` |
| `--cds-border-success` | `#074506` | `#73cb6d` |
| `--cds-border-warning` | `#512e00` | `#eda100` |
| `--cds-ring-color` | `hsl(from #fff h s l/10%)` | `hsl(from #0b0b0b h s l/10%)` |
| `--cds-ring-hairline` | `1px` | same |
| `--cds-ring-inner` | `1px` | `0px` |
| `--cds-ring-outer` | `0px` | `1px` |

## Alpha overlays

Translucent white (dark mode) or black (light mode). They adapt to any surface.

| Token | Dark | Light |
|---|---|---|
| `--cds-alpha-0` | `hsl(from #fff h s l/0%)` | `hsl(from #0b0b0b h s l/0%)` |
| `--cds-alpha-1` | `hsl(from #fff h s l/5%)` | `hsl(from #0b0b0b h s l/5%)` |
| `--cds-alpha-2` | `hsl(from #fff h s l/10%)` | `hsl(from #0b0b0b h s l/10%)` |
| `--cds-alpha-3` | `hsl(from #fff h s l/20%)` | `hsl(from #0b0b0b h s l/20%)` |
| `--cds-alpha-4` | `hsl(from #fff h s l/35%)` | `hsl(from #0b0b0b h s l/35%)` |
| `--cds-alpha-5` | `hsl(from #fff h s l/50%)` | `hsl(from #0b0b0b h s l/50%)` |
| `--cds-alpha-6` | `hsl(from #fff h s l/60%)` | `hsl(from #0b0b0b h s l/60%)` |
| `--cds-alpha-7` | `hsl(from #fff h s l/70%)` | `hsl(from #0b0b0b h s l/70%)` |
| `--cds-alpha-8` | `hsl(from #fff h s l/85%)` | `hsl(from #0b0b0b h s l/85%)` |
| `--cds-alpha-9` | `hsl(from #fff h s l/95%)` | `hsl(from #0b0b0b h s l/95%)` |

## On-colors

Text or icon color to put on top of the matching fill.

| Token | Dark | Light |
|---|---|---|
| `--cds-on-accent` | `#fff` | same |
| `--cds-on-brand` | `#fff` | same |
| `--cds-on-danger` | `#fff` | same |
| `--cds-on-primary` | `#0b0b0b` | `#fff` |
| `--cds-on-pro` | `#fff` | same |
| `--cds-on-success` | `#0b0b0b` | same |
| `--cds-on-warning` | `#0b0b0b` | same |

## Brand

Claude clay (orange) brand colors.

| Token | Dark | Light |
|---|---|---|
| `--cds-clay` | `#d97757` | same |
| `--cds-clay-emphasized` | `#c6613f` | same |

## Git status

Diff and PR states.

| Token | Dark | Light |
|---|---|---|
| `--cds-border-git-added` | `color-mix(in srgb,#32d74b 40%,transparent)` | `color-mix(in srgb,#1e9e3c 40%,transparent)` |
| `--cds-border-git-closed` | `color-mix(in srgb,#ff6159 40%,transparent)` | `color-mix(in srgb,#ff3a30 40%,transparent)` |
| `--cds-border-git-conflicting` | `color-mix(in srgb,#fa832e 40%,transparent)` | `color-mix(in srgb,#c5621b 40%,transparent)` |
| `--cds-border-git-draft` | `color-mix(in srgb,#a6a6a6 40%,transparent)` | `color-mix(in srgb,#737373 40%,transparent)` |
| `--cds-border-git-merged` | `color-mix(in srgb,#b796ff 40%,transparent)` | `color-mix(in srgb,#8e6bd9 40%,transparent)` |
| `--cds-border-git-modified` | `color-mix(in srgb,#ffd014 40%,transparent)` | `color-mix(in srgb,#98801f 40%,transparent)` |
| `--cds-border-git-opened` | `color-mix(in srgb,#32d74b 40%,transparent)` | `color-mix(in srgb,#1e9e3c 40%,transparent)` |
| `--cds-border-git-queued` | `color-mix(in srgb,#ffd014 40%,transparent)` | `color-mix(in srgb,#98801f 40%,transparent)` |
| `--cds-border-git-removed` | `color-mix(in srgb,#ff2c56 40%,transparent)` | `color-mix(in srgb,#cd2054 40%,transparent)` |
| `--cds-fill-git-added` | `#32d74b` | `#1a8633` |
| `--cds-fill-git-added-hover` | `#27c840` | `#1e9b3b` |
| `--cds-fill-git-closed` | `#ff6159` | `#ed0b00` |
| `--cds-fill-git-closed-hover` | `#ff4940` | `#ff1307` |
| `--cds-fill-git-conflicting` | `#fa832e` | `#b85b19` |
| `--cds-fill-git-conflicting-hover` | `#f97a1f` | `#c5621b` |
| `--cds-fill-git-draft` | `#a6a6a6` | `#737373` |
| `--cds-fill-git-draft-hover` | `#999` | `gray` |
| `--cds-fill-git-merged` | `#b796ff` | `#855fd6` |
| `--cds-fill-git-merged-hover` | `#a67dff` | `#9473db` |
| `--cds-fill-git-modified` | `#ffd014` | `#8b751c` |
| `--cds-fill-git-modified-hover` | `#fac800` | `#a08720` |
| `--cds-fill-git-opened` | `#32d74b` | `#1a8633` |
| `--cds-fill-git-opened-hover` | `#27c840` | `#1e9b3b` |
| `--cds-fill-git-queued` | `#ffd014` | `#8b751c` |
| `--cds-fill-git-queued-hover` | `#fac800` | `#a08720` |
| `--cds-fill-git-removed` | `#ff2c56` | `#cd2054` |
| `--cds-fill-git-removed-hover` | `#ff1342` | `#de295f` |
| `--cds-on-git-added` | `#0b0b0b` | `#fff` |
| `--cds-on-git-closed` | `#0b0b0b` | `#fff` |
| `--cds-on-git-conflicting` | `#0b0b0b` | `#fff` |
| `--cds-on-git-draft` | `#0b0b0b` | `#fff` |
| `--cds-on-git-merged` | `#0b0b0b` | `#fff` |
| `--cds-on-git-modified` | `#0b0b0b` | `#fff` |
| `--cds-on-git-opened` | `#0b0b0b` | `#fff` |
| `--cds-on-git-queued` | `#0b0b0b` | `#fff` |
| `--cds-on-git-removed` | `#0b0b0b` | `#fff` |
| `--cds-text-git-added` | `#32d74b` | `#1e9e3c` |
| `--cds-text-git-closed` | `#ff6159` | `#ff3a30` |
| `--cds-text-git-conflicting` | `#fa832e` | `#c5621b` |
| `--cds-text-git-draft` | `#a6a6a6` | `#737373` |
| `--cds-text-git-merged` | `#b796ff` | `#8e6bd9` |
| `--cds-text-git-modified` | `#ffd014` | `#98801f` |
| `--cds-text-git-opened` | `#32d74b` | `#1e9e3c` |
| `--cds-text-git-queued` | `#ffd014` | `#98801f` |
| `--cds-text-git-removed` | `#ff2c56` | `#cd2054` |

## Role scales

Full scales behind accent / danger / success / warning / pro.

| Token | Dark | Light |
|---|---|---|
| `--cds-role-accent-50` | `#e7f1fb` | same |
| `--cds-role-accent-100` | `#cde2fb` | same |
| `--cds-role-accent-250` | `#86b6ef` | same |
| `--cds-role-accent-300` | `#6da7ec` | same |
| `--cds-role-accent-400` | `#3987e5` | same |
| `--cds-role-accent-450` | `#2a78d6` | same |
| `--cds-role-accent-600` | `#184f95` | same |
| `--cds-role-accent-700` | `#0d366b` | same |
| `--cds-role-accent-800` | `#032042` | same |
| `--cds-role-accent-850` | `#03162c` | same |
| `--cds-role-accent-fill` | `#2a78d6` | same |
| `--cds-role-accent-fill-hover` | `#3987e5` | same |
| `--cds-role-accent-on` | `#fff` | same |
| `--cds-role-danger-100` | `#fad6d6` | same |
| `--cds-role-danger-250` | `#f09595` | same |
| `--cds-role-danger-300` | `#ec7e7e` | same |
| `--cds-role-danger-400` | `#e34948` | same |
| `--cds-role-danger-450` | `#d03b3b` | same |
| `--cds-role-danger-600` | `#8e2626` | same |
| `--cds-role-danger-700` | `#641919` | same |
| `--cds-role-danger-800` | `#3c0e0e` | same |
| `--cds-role-danger-fill` | `#d03b3b` | same |
| `--cds-role-danger-fill-hover` | `#e34948` | same |
| `--cds-role-danger-on` | `#fff` | same |
| `--cds-role-pro-100` | `#dfdbfd` | same |
| `--cds-role-pro-250` | `#b0a7f2` | same |
| `--cds-role-pro-300` | `#a096eb` | same |
| `--cds-role-pro-400` | `#8173e3` | same |
| `--cds-role-pro-450` | `#7161e0` | same |
| `--cds-role-pro-600` | `#4a3aa7` | same |
| `--cds-role-pro-700` | `#322777` | same |
| `--cds-role-pro-800` | `#1d1649` | same |
| `--cds-role-pro-fill` | `#7161e0` | same |
| `--cds-role-pro-fill-hover` | `#8173e3` | same |
| `--cds-role-pro-on` | `#fff` | same |
| `--cds-role-success-100` | `#caeac7` | same |
| `--cds-role-success-250` | `#73cb6d` | same |
| `--cds-role-success-400` | `#0ca30c` | same |
| `--cds-role-success-450` | `#009300` | same |
| `--cds-role-success-600` | `#006300` | same |
| `--cds-role-success-700` | `#074506` | same |
| `--cds-role-success-800` | `#11260f` | same |
| `--cds-role-success-fill` | `#009300` | same |
| `--cds-role-success-fill-hover` | `#0ca30c` | same |
| `--cds-role-success-on` | `#0b0b0b` | same |
| `--cds-role-tooltip-bg` | `#0b0b0b` | same |
| `--cds-role-tooltip-fg` | `#fff` | same |
| `--cds-role-warning-100` | `#f9dca4` | same |
| `--cds-role-warning-200` | `#fab219` | same |
| `--cds-role-warning-250` | `#eda100` | same |
| `--cds-role-warning-300` | `#db9300` | same |
| `--cds-role-warning-600` | `#734500` | same |
| `--cds-role-warning-700` | `#512e00` | same |
| `--cds-role-warning-800` | `#311a00` | same |
| `--cds-role-warning-fill` | `#fab219` | same |
| `--cds-role-warning-fill-hover` | `#eda100` | same |
| `--cds-role-warning-on` | `#0b0b0b` | same |

## Palette: gray

| Token | Dark | Light |
|---|---|---|
| `--cds-gray-0` | `#fff` | same |
| `--cds-gray-10` | `#fcfcfb` | same |
| `--cds-gray-20` | `#f9f9f7` | same |
| `--cds-gray-30` | `#f6f6f4` | same |
| `--cds-gray-40` | `#f3f3f0` | same |
| `--cds-gray-50` | `#f0efec` | same |
| `--cds-gray-60` | `#edece8` | same |
| `--cds-gray-70` | `#eae9e4` | same |
| `--cds-gray-80` | `#e7e6e1` | same |
| `--cds-gray-90` | `#e4e3dd` | same |
| `--cds-gray-100` | `#e1e0d9` | same |
| `--cds-gray-150` | `#d2d1c7` | same |
| `--cds-gray-200` | `#c3c2b7` | same |
| `--cds-gray-250` | `#b4b3a8` | same |
| `--cds-gray-300` | `#a5a49a` | same |
| `--cds-gray-350` | `#97958d` | same |
| `--cds-gray-400` | `#898781` | same |
| `--cds-gray-450` | `#7b7974` | same |
| `--cds-gray-500` | `#6d6b67` | same |
| `--cds-gray-550` | `#5f5e5a` | same |
| `--cds-gray-600` | `#52514e` | same |
| `--cds-gray-650` | `#454442` | same |
| `--cds-gray-700` | `#383835` | same |
| `--cds-gray-750` | `#2c2c2a` | same |
| `--cds-gray-800` | `#20201f` | same |
| `--cds-gray-810` | `#1e1e1d` | same |
| `--cds-gray-820` | `#1c1c1b` | same |
| `--cds-gray-830` | `#1a1a19` | same |
| `--cds-gray-840` | `#181817` | same |
| `--cds-gray-850` | `#151515` | same |
| `--cds-gray-860` | `#131313` | same |
| `--cds-gray-870` | `#111` | same |
| `--cds-gray-880` | `#0f0f0f` | same |
| `--cds-gray-890` | `#0d0d0d` | same |
| `--cds-gray-900` | `#0b0b0b` | same |

## Palette: neutral

| Token | Dark | Light |
|---|---|---|
| `--cds-neutral-0` | `#0b0b0b` | `#fff` |
| `--cds-neutral-10` | `#0d0d0d` | `#fcfcfb` |
| `--cds-neutral-20` | `#0f0f0f` | `#f9f9f7` |
| `--cds-neutral-30` | `#111` | `#f6f6f4` |
| `--cds-neutral-40` | `#131313` | `#f3f3f0` |
| `--cds-neutral-50` | `#151515` | `#f0efec` |
| `--cds-neutral-60` | `#181817` | `#edece8` |
| `--cds-neutral-70` | `#1a1a19` | `#eae9e4` |
| `--cds-neutral-80` | `#1c1c1b` | `#e7e6e1` |
| `--cds-neutral-90` | `#1e1e1d` | `#e4e3dd` |
| `--cds-neutral-100` | `#20201f` | `#e1e0d9` |
| `--cds-neutral-150` | `#2c2c2a` | `#d2d1c7` |
| `--cds-neutral-200` | `#383835` | `#c3c2b7` |
| `--cds-neutral-250` | `#454442` | `#b4b3a8` |
| `--cds-neutral-300` | `#52514e` | `#a5a49a` |
| `--cds-neutral-350` | `#5f5e5a` | `#97958d` |
| `--cds-neutral-400` | `#6d6b67` | `#898781` |
| `--cds-neutral-450` | `#7b7974` | same |
| `--cds-neutral-500` | `#898781` | `#6d6b67` |
| `--cds-neutral-550` | `#97958d` | `#5f5e5a` |
| `--cds-neutral-600` | `#a5a49a` | `#52514e` |
| `--cds-neutral-650` | `#b4b3a8` | `#454442` |
| `--cds-neutral-700` | `#c3c2b7` | `#383835` |
| `--cds-neutral-750` | `#d2d1c7` | `#2c2c2a` |
| `--cds-neutral-800` | `#e1e0d9` | `#20201f` |
| `--cds-neutral-810` | `#e4e3dd` | `#1e1e1d` |
| `--cds-neutral-820` | `#e7e6e1` | `#1c1c1b` |
| `--cds-neutral-830` | `#eae9e4` | `#1a1a19` |
| `--cds-neutral-840` | `#edece8` | `#181817` |
| `--cds-neutral-850` | `#f0efec` | `#151515` |
| `--cds-neutral-860` | `#f3f3f0` | `#131313` |
| `--cds-neutral-870` | `#f6f6f4` | `#111` |
| `--cds-neutral-880` | `#f9f9f7` | `#0f0f0f` |
| `--cds-neutral-890` | `#fcfcfb` | `#0d0d0d` |
| `--cds-neutral-900` | `#fff` | `#0b0b0b` |

## Palette: orange

| Token | Dark | Light |
|---|---|---|
| `--cds-orange-0` | `#fff` | same |
| `--cds-orange-10` | `#fefbfa` | same |
| `--cds-orange-20` | `#fdf7f5` | same |
| `--cds-orange-30` | `#fcf4f0` | same |
| `--cds-orange-40` | `#faf0ec` | same |
| `--cds-orange-50` | `#f9ece7` | same |
| `--cds-orange-60` | `#f8e9e2` | same |
| `--cds-orange-70` | `#f7e5dd` | same |
| `--cds-orange-80` | `#f7e1d7` | same |
| `--cds-orange-90` | `#f7dcd1` | same |
| `--cds-orange-100` | `#f7d8cb` | same |
| `--cds-orange-150` | `#f3c5b2` | same |
| `--cds-orange-200` | `#f4ae94` | same |
| `--cds-orange-250` | `#f09978` | same |
| `--cds-orange-300` | `#ec835a` | same |
| `--cds-orange-350` | `#eb6834` | same |
| `--cds-orange-400` | `#d95926` | same |
| `--cds-orange-450` | `#c25124` | same |
| `--cds-orange-500` | `#ae461c` | same |
| `--cds-orange-550` | `#993d19` | same |
| `--cds-orange-600` | `#863311` | same |
| `--cds-orange-650` | `#712b0f` | same |
| `--cds-orange-700` | `#5d230b` | same |
| `--cds-orange-750` | `#4b1b08` | same |
| `--cds-orange-800` | `#371407` | same |
| `--cds-orange-810` | `#341307` | same |
| `--cds-orange-820` | `#301106` | same |
| `--cds-orange-830` | `#2d1006` | same |
| `--cds-orange-840` | `#290f06` | same |
| `--cds-orange-850` | `#240e07` | same |
| `--cds-orange-860` | `#1f0e08` | same |
| `--cds-orange-870` | `#1a0e09` | same |
| `--cds-orange-880` | `#150d0a` | same |
| `--cds-orange-890` | `#100c0b` | same |
| `--cds-orange-900` | `#0b0b0b` | same |

## Palette: red

| Token | Dark | Light |
|---|---|---|
| `--cds-red-0` | `#fff` | same |
| `--cds-red-10` | `#fffbfb` | same |
| `--cds-red-20` | `#fef7f7` | same |
| `--cds-red-30` | `#fef3f3` | same |
| `--cds-red-40` | `#fdefef` | same |
| `--cds-red-50` | `#fbebeb` | same |
| `--cds-red-60` | `#fae7e7` | same |
| `--cds-red-70` | `#fae3e3` | same |
| `--cds-red-80` | `#fadfdf` | same |
| `--cds-red-90` | `#fadada` | same |
| `--cds-red-100` | `#fad6d6` | same |
| `--cds-red-150` | `#f7c1c1` | same |
| `--cds-red-200` | `#f4abab` | same |
| `--cds-red-250` | `#f09595` | same |
| `--cds-red-300` | `#ec7e7e` | same |
| `--cds-red-350` | `#e66767` | same |
| `--cds-red-400` | `#e34948` | same |
| `--cds-red-450` | `#d03b3b` | same |
| `--cds-red-500` | `#b93535` | same |
| `--cds-red-550` | `#a32c2c` | same |
| `--cds-red-600` | `#8e2626` | same |
| `--cds-red-650` | `#791e1e` | same |
| `--cds-red-700` | `#641919` | same |
| `--cds-red-750` | `#511212` | same |
| `--cds-red-800` | `#3c0e0e` | same |
| `--cds-red-810` | `#380d0d` | same |
| `--cds-red-820` | `#340c0c` | same |
| `--cds-red-830` | `#310b0b` | same |
| `--cds-red-840` | `#2d0a0a` | same |
| `--cds-red-850` | `#280a0a` | same |
| `--cds-red-860` | `#230b0a` | same |
| `--cds-red-870` | `#1d0b0a` | same |
| `--cds-red-880` | `#170c0b` | same |
| `--cds-red-890` | `#110c0b` | same |
| `--cds-red-900` | `#0b0b0b` | same |

## Palette: yellow

| Token | Dark | Light |
|---|---|---|
| `--cds-yellow-0` | `#fff` | same |
| `--cds-yellow-10` | `#fefcf8` | same |
| `--cds-yellow-20` | `#fcf8f1` | same |
| `--cds-yellow-30` | `#fbf5ea` | same |
| `--cds-yellow-40` | `#f9f2e4` | same |
| `--cds-yellow-50` | `#f9eeda` | same |
| `--cds-yellow-60` | `#faebce` | same |
| `--cds-yellow-70` | `#fae7c2` | same |
| `--cds-yellow-80` | `#fae3b8` | same |
| `--cds-yellow-90` | `#f9e0b0` | same |
| `--cds-yellow-100` | `#f9dca4` | same |
| `--cds-yellow-150` | `#f9c868` | same |
| `--cds-yellow-200` | `#fab219` | same |
| `--cds-yellow-250` | `#eda100` | same |
| `--cds-yellow-300` | `#db9300` | same |
| `--cds-yellow-350` | `#c98500` | same |
| `--cds-yellow-400` | `#b77700` | same |
| `--cds-yellow-450` | `#a66a00` | same |
| `--cds-yellow-500` | `#945d00` | same |
| `--cds-yellow-550` | `#835100` | same |
| `--cds-yellow-600` | `#734500` | same |
| `--cds-yellow-650` | `#623900` | same |
| `--cds-yellow-700` | `#512e00` | same |
| `--cds-yellow-750` | `#412400` | same |
| `--cds-yellow-800` | `#311a00` | same |
| `--cds-yellow-810` | `#2e1800` | same |
| `--cds-yellow-820` | `#2b1700` | same |
| `--cds-yellow-830` | `#271500` | same |
| `--cds-yellow-840` | `#231402` | same |
| `--cds-yellow-850` | `#1f1204` | same |
| `--cds-yellow-860` | `#1b1106` | same |
| `--cds-yellow-870` | `#171007` | same |
| `--cds-yellow-880` | `#130e09` | same |
| `--cds-yellow-890` | `#0f0d0a` | same |
| `--cds-yellow-900` | `#0b0b0b` | same |

## Palette: green

| Token | Dark | Light |
|---|---|---|
| `--cds-green-0` | `#fff` | same |
| `--cds-green-10` | `#fafdfa` | same |
| `--cds-green-20` | `#f5fbf4` | same |
| `--cds-green-30` | `#f0f9ef` | same |
| `--cds-green-40` | `#ebf7e9` | same |
| `--cds-green-50` | `#e5f4e4` | same |
| `--cds-green-60` | `#e0f2de` | same |
| `--cds-green-70` | `#dbf0d8` | same |
| `--cds-green-80` | `#d5eed3` | same |
| `--cds-green-90` | `#d0eccd` | same |
| `--cds-green-100` | `#caeac7` | same |
| `--cds-green-150` | `#aee0a9` | same |
| `--cds-green-200` | `#91d68b` | same |
| `--cds-green-250` | `#73cb6d` | same |
| `--cds-green-300` | `#55bf50` | same |
| `--cds-green-350` | `#35b231` | same |
| `--cds-green-400` | `#0ca30c` | same |
| `--cds-green-450` | `#009300` | same |
| `--cds-green-500` | `#008300` | same |
| `--cds-green-550` | `#007300` | same |
| `--cds-green-600` | `#006300` | same |
| `--cds-green-650` | `#005400` | same |
| `--cds-green-700` | `#074506` | same |
| `--cds-green-750` | `#0f350d` | same |
| `--cds-green-800` | `#11260f` | same |
| `--cds-green-810` | `#10230f` | same |
| `--cds-green-820` | `#10210f` | same |
| `--cds-green-830` | `#101e0f` | same |
| `--cds-green-840` | `#101b0f` | same |
| `--cds-green-850` | `#0f180e` | same |
| `--cds-green-860` | `#0e160e` | same |
| `--cds-green-870` | `#0e130d` | same |
| `--cds-green-880` | `#0d100d` | same |
| `--cds-green-890` | `#0c0e0c` | same |
| `--cds-green-900` | `#0b0b0b` | same |

## Palette: aqua

| Token | Dark | Light |
|---|---|---|
| `--cds-aqua-0` | `#fff` | same |
| `--cds-aqua-10` | `#f9fdfb` | same |
| `--cds-aqua-20` | `#f3fbf8` | same |
| `--cds-aqua-30` | `#edf9f4` | same |
| `--cds-aqua-40` | `#e8f7f1` | same |
| `--cds-aqua-50` | `#e2f4ed` | same |
| `--cds-aqua-60` | `#dcf2ea` | same |
| `--cds-aqua-70` | `#d5f0e6` | same |
| `--cds-aqua-80` | `#ceefe2` | same |
| `--cds-aqua-90` | `#c7eddf` | same |
| `--cds-aqua-100` | `#bfebdb` | same |
| `--cds-aqua-150` | `#a0e1c9` | same |
| `--cds-aqua-200` | `#7ad7b4` | same |
| `--cds-aqua-250` | `#5acba0` | same |
| `--cds-aqua-300` | `#3bbd8c` | same |
| `--cds-aqua-350` | `#1baf7a` | same |
| `--cds-aqua-400` | `#199e70` | same |
| `--cds-aqua-450` | `#138e65` | same |
| `--cds-aqua-500` | `#0f7e5c` | same |
| `--cds-aqua-550` | `#0e6e53` | same |
| `--cds-aqua-600` | `#065f49` | same |
| `--cds-aqua-650` | `#095040` | same |
| `--cds-aqua-700` | `#034235` | same |
| `--cds-aqua-750` | `#02342b` | same |
| `--cds-aqua-800` | `#022720` | same |
| `--cds-aqua-810` | `#02241e` | same |
| `--cds-aqua-820` | `#02221c` | same |
| `--cds-aqua-830` | `#021f1a` | same |
| `--cds-aqua-840` | `#031c18` | same |
| `--cds-aqua-850` | `#051a16` | same |
| `--cds-aqua-860` | `#071713` | same |
| `--cds-aqua-870` | `#081411` | same |
| `--cds-aqua-880` | `#0a110f` | same |
| `--cds-aqua-890` | `#0b0e0d` | same |
| `--cds-aqua-900` | `#0b0b0b` | same |

## Palette: blue

| Token | Dark | Light |
|---|---|---|
| `--cds-blue-0` | `#fff` | same |
| `--cds-blue-10` | `#fafcff` | same |
| `--cds-blue-20` | `#f5f9fe` | same |
| `--cds-blue-30` | `#f0f7fe` | same |
| `--cds-blue-40` | `#ebf4fc` | same |
| `--cds-blue-50` | `#e7f1fb` | same |
| `--cds-blue-60` | `#e2eefa` | same |
| `--cds-blue-70` | `#ddebfa` | same |
| `--cds-blue-80` | `#d7e8fa` | same |
| `--cds-blue-90` | `#d2e5fa` | same |
| `--cds-blue-100` | `#cde2fb` | same |
| `--cds-blue-150` | `#b7d3f6` | same |
| `--cds-blue-200` | `#9ec5f4` | same |
| `--cds-blue-250` | `#86b6ef` | same |
| `--cds-blue-300` | `#6da7ec` | same |
| `--cds-blue-350` | `#5598e7` | same |
| `--cds-blue-400` | `#3987e5` | same |
| `--cds-blue-450` | `#2a78d6` | same |
| `--cds-blue-500` | `#256abf` | same |
| `--cds-blue-550` | `#1c5cab` | same |
| `--cds-blue-600` | `#184f95` | same |
| `--cds-blue-650` | `#104281` | same |
| `--cds-blue-700` | `#0d366b` | same |
| `--cds-blue-750` | `#062b57` | same |
| `--cds-blue-800` | `#032042` | same |
| `--cds-blue-810` | `#031e3d` | same |
| `--cds-blue-820` | `#021c39` | same |
| `--cds-blue-830` | `#021a36` | same |
| `--cds-blue-840` | `#021831` | same |
| `--cds-blue-850` | `#03162c` | same |
| `--cds-blue-860` | `#051426` | same |
| `--cds-blue-870` | `#07121f` | same |
| `--cds-blue-880` | `#091018` | same |
| `--cds-blue-890` | `#0a0d11` | same |
| `--cds-blue-900` | `#0b0b0b` | same |

## Palette: violet

| Token | Dark | Light |
|---|---|---|
| `--cds-violet-0` | `#fff` | same |
| `--cds-violet-10` | `#fcfbff` | same |
| `--cds-violet-20` | `#f8f8ff` | same |
| `--cds-violet-30` | `#f5f4ff` | same |
| `--cds-violet-40` | `#f2f1ff` | same |
| `--cds-violet-50` | `#efedff` | same |
| `--cds-violet-60` | `#ebeafe` | same |
| `--cds-violet-70` | `#e8e6fe` | same |
| `--cds-violet-80` | `#e5e2fd` | same |
| `--cds-violet-90` | `#e2dffd` | same |
| `--cds-violet-100` | `#dfdbfd` | same |
| `--cds-violet-150` | `#cfcafb` | same |
| `--cds-violet-200` | `#bfb9f5` | same |
| `--cds-violet-250` | `#b0a7f2` | same |
| `--cds-violet-300` | `#a096eb` | same |
| `--cds-violet-350` | `#9085e9` | same |
| `--cds-violet-400` | `#8173e3` | same |
| `--cds-violet-450` | `#7161e0` | same |
| `--cds-violet-500` | `#6250d6` | same |
| `--cds-violet-550` | `#5645be` | same |
| `--cds-violet-600` | `#4a3aa7` | same |
| `--cds-violet-650` | `#3e318e` | same |
| `--cds-violet-700` | `#322777` | same |
| `--cds-violet-750` | `#271e60` | same |
| `--cds-violet-800` | `#1d1649` | same |
| `--cds-violet-810` | `#1b1544` | same |
| `--cds-violet-820` | `#19133f` | same |
| `--cds-violet-830` | `#17123b` | same |
| `--cds-violet-840` | `#151036` | same |
| `--cds-violet-850` | `#130f32` | same |
| `--cds-violet-860` | `#110e2b` | same |
| `--cds-violet-870` | `#0f0e23` | same |
| `--cds-violet-880` | `#0e0d1b` | same |
| `--cds-violet-890` | `#0c0c13` | same |
| `--cds-violet-900` | `#0b0b0b` | same |

## Palette: magenta

| Token | Dark | Light |
|---|---|---|
| `--cds-magenta-0` | `#fff` | same |
| `--cds-magenta-10` | `#fefbfc` | same |
| `--cds-magenta-20` | `#fef6f9` | same |
| `--cds-magenta-30` | `#fdf2f6` | same |
| `--cds-magenta-40` | `#fbeff3` | same |
| `--cds-magenta-50` | `#faebf0` | same |
| `--cds-magenta-60` | `#f9e6ed` | same |
| `--cds-magenta-70` | `#f9e2eb` | same |
| `--cds-magenta-80` | `#f9dee8` | same |
| `--cds-magenta-90` | `#f9d9e5` | same |
| `--cds-magenta-100` | `#f9d4e2` | same |
| `--cds-magenta-150` | `#f3c0d3` | same |
| `--cds-magenta-200` | `#f3a8c3` | same |
| `--cds-magenta-250` | `#ed93b4` | same |
| `--cds-magenta-300` | `#e87ba4` | same |
| `--cds-magenta-350` | `#e46191` | same |
| `--cds-magenta-400` | `#d55181` | same |
| `--cds-magenta-450` | `#c04873` | same |
| `--cds-magenta-500` | `#ad3d66` | same |
| `--cds-magenta-550` | `#993458` | same |
| `--cds-magenta-600` | `#862a4c` | same |
| `--cds-magenta-650` | `#722340` | same |
| `--cds-magenta-700` | `#5e1c34` | same |
| `--cds-magenta-750` | `#4c1429` | same |
| `--cds-magenta-800` | `#390f1f` | same |
| `--cds-magenta-810` | `#360d1c` | same |
| `--cds-magenta-820` | `#320c1a` | same |
| `--cds-magenta-830` | `#2f0b18` | same |
| `--cds-magenta-840` | `#2b0a16` | same |
| `--cds-magenta-850` | `#270a14` | same |
| `--cds-magenta-860` | `#220a12` | same |
| `--cds-magenta-870` | `#1c0b11` | same |
| `--cds-magenta-880` | `#170b0f` | same |
| `--cds-magenta-890` | `#110b0d` | same |
| `--cds-magenta-900` | `#0b0b0b` | same |

## Font families

| Token | Dark | Light |
|---|---|---|
| `--cds-font-mono` | `"anthropic-mono",ui-monospace,monospace,"SF Mono",ui-monospace,Menlo,Consolas,monospace` | same |
| `--cds-font-mono-ui` | `"anthropic-mono",ui-monospace,monospace,"SF Mono",ui-monospace,Menlo,Consolas,monospace` | same |
| `--cds-font-sans` | `"anthropic-sans",system-ui,"Segoe UI",Roboto,Helvetica,Arial,"PingFang SC","PingFang TC","Hiragino Sans","Apple SD Gothic Neo","Kohinoor Devanagari","Kohinoor Bangla","Kohinoor Telugu","Tamil Sangam MN","Kohinoor Gujarati","Malayalam Sangam MN","Nirmala UI","Noto Sans Devanagari UI","Noto Sans Devanagari","Noto Sans Bengali UI","Noto Sans Bengali","Noto Sans Telugu UI","Noto Sans Telugu","Noto Sans Tamil UI","Noto Sans Tamil","Noto Sans Gujarati UI","Noto Sans Gujarati","Noto Sans Kannada UI","Noto Sans Kannada","Noto Sans Malayalam UI","Noto Sans Malayalam",Thonburi,"Leelawadee UI","Noto Sans Thai UI","Noto Sans Thai",Kefa,Ebrima,"Noto Sans Ethiopic","Abyssinica SIL",sans-serif,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"PingFang SC","PingFang TC","Hiragino Sans","Apple SD Gothic Neo",sans-serif` | same |
| `--cds-font-sans-display` | `"anthropic-sans",system-ui,"Segoe UI",Roboto,Helvetica,Arial,"PingFang SC","PingFang TC","Hiragino Sans","Apple SD Gothic Neo","Kohinoor Devanagari","Kohinoor Bangla","Kohinoor Telugu","Tamil Sangam MN","Kohinoor Gujarati","Malayalam Sangam MN","Nirmala UI","Noto Sans Devanagari UI","Noto Sans Devanagari","Noto Sans Bengali UI","Noto Sans Bengali","Noto Sans Telugu UI","Noto Sans Telugu","Noto Sans Tamil UI","Noto Sans Tamil","Noto Sans Gujarati UI","Noto Sans Gujarati","Noto Sans Kannada UI","Noto Sans Kannada","Noto Sans Malayalam UI","Noto Sans Malayalam",Thonburi,"Leelawadee UI","Noto Sans Thai UI","Noto Sans Thai",Kefa,Ebrima,"Noto Sans Ethiopic","Abyssinica SIL",sans-serif,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"PingFang SC","PingFang TC","Hiragino Sans","Apple SD Gothic Neo",sans-serif,"anthropic-sans",system-ui,"Segoe UI",Roboto,Helvetica,Arial,"PingFang SC","PingFang TC","Hiragino Sans","Apple SD Gothic Neo","Kohinoor Devanagari","Kohinoor Bangla","Kohinoor Telugu","Tamil Sangam MN","Kohinoor Gujarati","Malayalam Sangam MN","Nirmala UI","Noto Sans Devanagari UI","Noto Sans Devanagari","Noto Sans Bengali UI","Noto Sans Bengali","Noto Sans Telugu UI","Noto Sans Telugu","Noto Sans Tamil UI","Noto Sans Tamil","Noto Sans Gujarati UI","Noto Sans Gujarati","Noto Sans Kannada UI","Noto Sans Kannada","Noto Sans Malayalam UI","Noto Sans Malayalam",Thonburi,"Leelawadee UI","Noto Sans Thai UI","Noto Sans Thai",Kefa,Ebrima,"Noto Sans Ethiopic","Abyssinica SIL",sans-serif,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"PingFang SC","PingFang TC","Hiragino Sans","Apple SD Gothic Neo",sans-serif` | same |
| `--cds-font-system` | `ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"PingFang SC","PingFang TC","Hiragino Sans","Apple SD Gothic Neo",sans-serif` | same |
| `--cds-font-voice` | `"anthropic-serif","Anthropic Serif Fallback Georgia","Anthropic Serif Fallback Times","Anthropic Serif Fallback DejaVu","Anthropic Serif Fallback Noto",Georgia,"Arial Hebrew","Noto Sans Hebrew","Times New Roman",Times,"PingFang SC","Microsoft YaHei","Noto Sans CJK SC","PingFang TC","Microsoft JhengHei","Noto Sans CJK TC","Hiragino Sans","Yu Gothic",Meiryo,"Noto Sans CJK JP","Apple SD Gothic Neo","Malgun Gothic","Noto Sans CJK KR","Kohinoor Devanagari","Kohinoor Bangla","Kohinoor Telugu","Tamil Sangam MN","Kohinoor Gujarati","Malayalam Sangam MN","Nirmala UI","Noto Sans Devanagari UI","Noto Sans Devanagari","Noto Sans Bengali UI","Noto Sans Bengali","Noto Sans Telugu UI","Noto Sans Telugu","Noto Sans Tamil UI","Noto Sans Tamil","Noto Sans Gujarati UI","Noto Sans Gujarati","Noto Sans Kannada UI","Noto Sans Kannada","Noto Sans Malayalam UI","Noto Sans Malayalam",Thonburi,"Leelawadee UI","Noto Sans Thai UI","Noto Sans Thai",Kefa,Ebrima,"Noto Sans Ethiopic","Abyssinica SIL",serif,ui-serif,Georgia,"Times New Roman",serif` | same |

## Font sizes

The base scale. Variants with --xs/--sm/--lg suffixes are per-size overrides.

| Token | Dark | Light | Compact |
|---|---|---|---|
| `--cds-font-size-body` | `calc(.875rem*1)` | same | `calc(.8125rem*1)` |
| `--cds-font-size-caption` | `calc(.75rem*1)` | same | `calc(.6875rem*1)` |
| `--cds-font-size-code` | `calc(.8125rem*1)` | same | `calc(.75rem*1)` |
| `--cds-font-size-footnote` | `calc(.8125rem*1)` | same | `calc(.75rem*1)` |
| `--cds-font-size-heading` | `calc(.9375rem*1)` | same | `calc(.875rem*1)` |
| `--cds-font-size-prose` | `1rem` | same | `.875rem` |
| `--cds-font-size-title` | `calc(1.375rem*1)` | same | `calc(1.25rem*1)` |

## Font weights

| Token | Dark | Light |
|---|---|---|
| `--cds-font-weight-bold` | `600` | same |
| `--cds-font-weight-medium` | `500` | same |
| `--cds-font-weight-regular` | `400` | same |
| `--cds-font-weight-semibold` | `580` | same |

## Line heights

| Token | Dark | Light | Compact |
|---|---|---|---|
| `--cds-leading-body` | `calc(1.25rem*1)` | same | `calc(1.1875rem*1)` |
| `--cds-leading-caption` | `calc(1.0625rem*1)` | same | |
| `--cds-leading-code` | `calc(1.1875rem*1)` | same | `calc(1.0625rem*1)` |
| `--cds-leading-footnote` | `calc(1.0625rem*1)` | same | `calc(.9375rem*1)` |
| `--cds-leading-heading` | `calc(1.25rem*1)` | same | `calc(1.125rem*1)` |
| `--cds-leading-prose` | `1.5rem` | same | `1.25rem` |
| `--cds-leading-title` | `calc(1.75rem*1)` | same | `calc(1.5625rem*1)` |

## Padding

Tailwind: p-*, px-*, py-* … (p-md, px-lg).

| Token | Dark | Light | Compact |
|---|---|---|---|
| `--cds-pad-lg` | `calc(1rem*1)` | same | `calc(.75rem*1)` |
| `--cds-pad-md` | `calc(.75rem*1)` | same | `calc(.5rem*1)` |
| `--cds-pad-sm` | `calc(.5rem*1)` | same | `calc(.375rem*1)` |
| `--cds-pad-xl` | `calc(1.5rem*1)` | same | `calc(1.25rem*1)` |
| `--cds-pad-xs` | `calc(.375rem*1)` | same | `calc(.25rem*1)` |

## Gaps

Tailwind: gap-*, gap-x-*, gap-y-*.

| Token | Dark | Light | Compact |
|---|---|---|---|
| `--cds-gap-lg` | `calc(1.75rem*1)` | same | `calc(1.25rem*1)` |
| `--cds-gap-md` | `calc(1rem*1)` | same | `calc(.75rem*1)` |
| `--cds-gap-sm` | `calc(.75rem*1)` | same | `calc(.5rem*1)` |
| `--cds-gap-xl` | `calc(2.5rem*1)` | same | `calc(2rem*1)` |
| `--cds-gap-xs` | `calc(.5rem*1)` | same | `calc(.375rem*1)` |

## Radius

| Token | Dark | Light | Compact |
|---|---|---|---|
| `--cds-radius` | `calc(.5rem*1)` | same | `calc(.375rem*1)` |
| `--cds-radius--lg` | `calc(.625rem*1)` | same | `calc(.4375rem*1)` |
| `--cds-radius--sm` | `calc(.4375rem*1)` | same | `calc(.3125rem*1)` |
| `--cds-radius--xs` | `calc(.375rem*1)` | same | `calc(.3125rem*1)` |
| `--cds-radius-composer` | `calc(.875rem*1)` | same | `calc(.75rem*1)` |

## Control heights

Tailwind: h-control, h-control-nested.

| Token | Dark | Light | Compact |
|---|---|---|---|
| `--cds-h-control` | `calc(2rem*1)` | same | `calc(1.5rem*1)` |
| `--cds-h-control--lg` | `calc(2.5rem*1)` | same | `calc(1.75rem*1)` |
| `--cds-h-control--sm` | `calc(1.75rem*1)` | same | `calc(1.25rem*1)` |
| `--cds-h-control--xs` | `calc(1.5rem*1)` | same | `calc(1.25rem*1)` |
| `--cds-h-control-nested` | `calc(1.375rem*1)` | same | `calc(1.125rem*1)` |
| `--cds-h-control-nested--lg` | `calc(1.75rem*1)` | same | `calc(1.25rem*1)` |
| `--cds-h-control-nested--sm` | `calc(1.25rem*1)` | same | `calc(1rem*1)` |
| `--cds-h-control-nested--xs` | `calc(1.125rem*1)` | same | `calc(1rem*1)` |

## Shadows and focus

| Token | Dark | Light |
|---|---|---|
| `--cds-focus-shadow` | `inset 0 0 0 1px #151515,0 0 0 1px #2a78d6,0 0 6px 1px hsl(from #184f95 h s l/60%)` | `inset 0 0 0 1px #151515,0 0 0 1px #2a78d6,0 0 6px 1px #cde2fb` |
| `--cds-focus-shadow-danger` | `inset 0 0 0 1px #151515,0 0 0 1px #d03b3b,0 0 6px 1px hsl(from #8e2626 h s l/60%)` | `inset 0 0 0 1px #151515,0 0 0 1px #d03b3b,0 0 6px 1px #fad6d6` |
| `--cds-shadow-color` | `#0000003d` | `hsl(from #0b0b0b h s l/8%)` |
| `--cds-shadow-drop-glow` | `inset 0 0 24px -2px hsl(from #2a78d6 h s l/20%)` | same |
| `--cds-shadow-drop-glow-danger` | `inset 0 0 24px -2px hsl(from #d03b3b h s l/20%)` | same |
| `--cds-shadow-drop-ring` | `inset 0 0 0 2px #2a78d6` | same |
| `--cds-shadow-drop-ring-danger` | `inset 0 0 0 2px #d03b3b` | same |
| `--cds-shadow-lg` | `0 4px 8px 0 hsl(from #0b0b0b h s l/8%),0 12px 28px -2px #0000003d` | `0 4px 8px 0 hsl(from #0b0b0b h s l/8%),0 12px 28px -2px hsl(from #0b0b0b h s l/8%)` |
| `--cds-shadow-md` | `0 2px 4px 0 hsl(from #0b0b0b h s l/7%),0 6px 16px 0 #0000003d` | `0 2px 4px 0 hsl(from #0b0b0b h s l/7%),0 6px 16px 0 hsl(from #0b0b0b h s l/8%)` |
| `--cds-shadow-popover` | `0 8px 24px #00000052,0 2px 6px #0003` | `0 8px 24px #0000001f,0 2px 6px #00000014` |
| `--cds-shadow-sm` | `0 1px 2px 0 hsl(from #0b0b0b h s l/6%),0 2px 8px 0 #0000003d` | `0 1px 2px 0 hsl(from #0b0b0b h s l/6%),0 2px 8px 0 hsl(from #0b0b0b h s l/8%)` |

## Motion

| Token | Dark | Light |
|---|---|---|
| `--cds-dur-base` | `.2s` | same |
| `--cds-dur-fast` | `60ms` | same |
| `--cds-dur-sheet` | `.3s` | same |
| `--cds-dur-slow` | `.45s` | same |
| `--cds-dur-snap` | `.12s` | same |
| `--cds-ease-out` | `cubic-bezier(.165,.84,.44,1)` | same |
| `--cds-ease-overshoot` | `cubic-bezier(.34,1.3,.64,1)` | same |
| `--cds-ease-snap` | `cubic-bezier(.32,.72,0,1)` | same |

## Z-index

| Token | Dark | Light |
|---|---|---|
| `--cds-z-coachmark` | `35` | same |
| `--cds-z-modal` | `40` | same |
| `--cds-z-popover` | `50` | same |
| `--cds-z-toast` | `60` | same |
| `--cds-z-tooltip` | `50` | same |

## Component and misc tokens

Tokens for specific components (checkbox, switch, slider, chart, editor, message, scrollbar, …).

| Token | Dark | Light | Compact |
|---|---|---|---|
| `--cds-anim` | `0` | same | |
| `--cds-anim2` | `0` | same | |
| `--cds-assistant-message-text-inset` | `—` | same | |
| `--cds-assistant-message-text-stop` | `—` | same | |
| `--cds-avatar-lg` | `calc(2.5rem*1)` | same | `calc(2.25rem*1)` |
| `--cds-avatar-md` | `calc(2rem*1)` | same | `calc(1.75rem*1)` |
| `--cds-avatar-sm` | `calc(1.5rem*1)` | same | `calc(1.25rem*1)` |
| `--cds-avatar-text-xs` | `calc(.5625rem*1)` | same | `calc(.5rem*1)` |
| `--cds-avatar-xs` | `calc(1.25rem*1)` | same | `calc(1rem*1)` |
| `--cds-backdrop` | `#00000080` | `#0006` | |
| `--cds-badge-x-wght` | `577.8` | same | |
| `--cds-black` | `#000` | same | |
| `--cds-btn-spring` | `linear(0,.2459,.6526,.9468,1.0764,1.0915,1.0585,1.0219,.9993,.9914,.9921,.9957,.9988,1.0004,1)` | same | |
| `--cds-button-on-content` | `#0000008c` | `#fff9` | |
| `--cds-button-on-content-hover` | `#000000a6` | `#ffffffb3` | |
| `--cds-button-on-content-ring` | `transparent` | `#ffffff59` | |
| `--cds-cactus` | `#bcd1ca` | same | |
| `--cds-card-press-d` | `2px` | same | |
| `--cds-card-press-sx` | `.99` | same | |
| `--cds-card-press-sy` | `.99` | same | |
| `--cds-chart-axis` | `#383835` | `#c3c2b7` | |
| `--cds-chart-baseline` | `#383835` | `#c3c2b7` | |
| `--cds-chart-categorical-1` | `#3987e5` | `#2a78d6` | |
| `--cds-chart-categorical-2` | `#d95926` | `#eb6834` | |
| `--cds-chart-categorical-3` | `#199e70` | `#1baf7a` | |
| `--cds-chart-categorical-4` | `#c98500` | `#eda100` | |
| `--cds-chart-categorical-5` | `#d55181` | `#e87ba4` | |
| `--cds-chart-categorical-6` | `#008300` | same | |
| `--cds-chart-categorical-7` | `#9085e9` | `#6250d6` | |
| `--cds-chart-categorical-8` | `#e66767` | `#e34948` | |
| `--cds-chart-diverging-1` | `#6da7ec` | `#256abf` | |
| `--cds-chart-diverging-2` | `#2a78d6` | `#5598e7` | |
| `--cds-chart-diverging-3` | `#184f95` | `#9ec5f4` | |
| `--cds-chart-diverging-4` | `#383835` | `#f0efec` | |
| `--cds-chart-diverging-5` | `#8e2626` | `#f4abab` | |
| `--cds-chart-diverging-6` | `#d03b3b` | `#e66767` | |
| `--cds-chart-diverging-7` | `#ec7e7e` | `#b93535` | |
| `--cds-chart-grid` | `hsl(from #fff h s l/10%)` | `hsl(from #0b0b0b h s l/10%)` | |
| `--cds-chart-muted` | `#5f5e5a` | `#c3c2b7` | |
| `--cds-chart-reference` | `#97958d` | `#898781` | |
| `--cds-chart-reference-tint` | `hsl(from #97958d h s l/15%)` | `hsl(from #898781 h s l/15%)` | |
| `--cds-chart-sequential-1` | `#0d366b` | `#cde2fb` | |
| `--cds-chart-sequential-2` | `#184f95` | `#9ec5f4` | |
| `--cds-chart-sequential-3` | `#256abf` | `#6da7ec` | |
| `--cds-chart-sequential-4` | `#3987e5` | same | |
| `--cds-chart-sequential-5` | `#6da7ec` | `#256abf` | |
| `--cds-chart-sequential-6` | `#9ec5f4` | `#184f95` | |
| `--cds-chart-sequential-7` | `#cde2fb` | `#0d366b` | |
| `--cds-chart-status-critical` | `#d03b3b` | same | |
| `--cds-chart-status-good` | `#0ca30c` | same | |
| `--cds-chart-status-serious` | `#ec835a` | same | |
| `--cds-chart-status-warning` | `#fab219` | same | |
| `--cds-checkbox` | `calc(1.25rem*1)` | same | `calc(1rem*1)` |
| `--cds-checkbox--lg` | `calc(1.5rem*1)` | same | `calc(1.125rem*1)` |
| `--cds-checkbox--sm` | `calc(1.125rem*1)` | same | `calc(.875rem*1)` |
| `--cds-checkbox--xs` | `calc(1rem*1)` | same | `calc(.875rem*1)` |
| `--cds-checkbox-glyph` | `calc(1rem*1)` | same | |
| `--cds-checkbox-glyph--lg` | `calc(1.25rem*1)` | same | `calc(1rem*1)` |
| `--cds-checkbox-glyph--sm` | `calc(1rem*1)` | same | `calc(.875rem*1)` |
| `--cds-checkbox-glyph--xs` | `calc(1rem*1)` | same | `calc(.875rem*1)` |
| `--cds-checkbox-radius` | `calc(.3125rem*1)` | same | `calc(.25rem*1)` |
| `--cds-checkbox-radius--lg` | `calc(.375rem*1)` | same | `calc(.3125rem*1)` |
| `--cds-checkbox-radius--sm` | `calc(.3125rem*1)` | same | `calc(.25rem*1)` |
| `--cds-checkbox-radius--xs` | `calc(.25rem*1)` | same | |
| `--cds-checkbox-xxs` | `calc(.75rem*1)` | same | |
| `--cds-checkbox-xxs-glyph` | `calc(.75rem*1)` | same | |
| `--cds-checkbox-xxs-radius` | `calc(.1875rem*1)` | same | |
| `--cds-chip-in-base-delay` | `50ms` | same | |
| `--cds-comment-card-bg` | `—` | same | |
| `--cds-comment-card-row-tint` | `—` | same | |
| `--cds-cursor-interactive` | `pointer` | same | |
| `--cds-editor-code-ink` | `#f4abab` | `#8e2626` | |
| `--cds-editor-collaborator-1` | `#7161e0` | same | |
| `--cds-editor-collaborator-2` | `#c04873` | same | |
| `--cds-editor-collaborator-3` | `#0f7e5c` | same | |
| `--cds-editor-collaborator-4` | `#008300` | same | |
| `--cds-editor-collaborator-5` | `#945d00` | same | |
| `--cds-editor-collaborator-6` | `#6d6b67` | same | |
| `--cds-font-axis-wght` | `"wght"360,` | `—` | |
| `--cds-font-axis-wght-bold` | `"wght"560,` | `—` | |
| `--cds-font-axis-wght-medium` | `"wght"460,` | `—` | |
| `--cds-font-axis-wght-regular` | `"wght"360,` | `—` | |
| `--cds-font-axis-wght-semibold` | `"wght"540,` | `—` | |
| `--cds-font-grad` | `—` | same | |
| `--cds-font-grad-bold` | `200` | same | |
| `--cds-font-grad-semibold` | `180` | same | |
| `--cds-font-size-body--lg` | `calc(.9375rem*1)` | same | `calc(.875rem*1)` |
| `--cds-font-size-body--own` | `calc(.875rem*1)` | same | `calc(.8125rem*1)` |
| `--cds-font-size-body--sm` | `calc(.875rem*1)` | same | `calc(.75rem*1)` |
| `--cds-font-size-body--textlg` | `calc(.9375rem*1)` | same | `calc(.875rem*1)` |
| `--cds-font-size-body--textsm` | `calc(.8125rem*1)` | same | |
| `--cds-font-size-body--xs` | `calc(.8125rem*1)` | same | `calc(.75rem*1)` |
| `--cds-font-size-caption--lg` | `calc(.8125rem*1)` | same | `calc(.75rem*1)` |
| `--cds-font-size-caption--sm` | `calc(.75rem*1)` | same | `calc(.625rem*1)` |
| `--cds-font-size-caption--xs` | `calc(.6875rem*1)` | same | `calc(.625rem*1)` |
| `--cds-font-size-heading--textlg` | `calc(1rem*1)` | same | `calc(.9375rem*1)` |
| `--cds-font-size-heading--textsm` | `calc(.875rem*1)` | same | `calc(.8125rem*1)` |
| `--cds-font-size-prose--lg` | `1.125rem` | same | `.9375rem` |
| `--cds-font-size-prose--lg--textlg` | `1.125rem` | same | `1rem` |
| `--cds-font-size-prose--lg--textsm` | `1rem` | same | `.875rem` |
| `--cds-font-size-prose--sm` | `.9375rem` | same | `.8125rem` |
| `--cds-font-size-prose--sm--textlg` | `1rem` | same | `.875rem` |
| `--cds-font-size-prose--sm--textsm` | `.875rem` | same | `.8125rem` |
| `--cds-font-size-prose--textlg` | `1.125rem` | same | `.9375rem` |
| `--cds-font-size-prose--textsm` | `.9375rem` | same | `.8125rem` |
| `--cds-font-size-prose--xs` | `.875rem` | same | `.8125rem` |
| `--cds-font-size-prose--xs--textlg` | `.9375rem` | same | `.875rem` |
| `--cds-font-size-prose--xs--textsm` | `.8125rem` | same | |
| `--cds-font-size-text-entry-floor` | `—` | same | |
| `--cds-font-wght-bold` | `"wght"560` | `normal` | |
| `--cds-font-wght-medium` | `"wght"460` | `normal` | |
| `--cds-font-wght-regular` | `"wght"360` | `normal` | |
| `--cds-font-wght-semibold` | `"wght"540` | `normal` | |
| `--cds-heather` | `#cbcadb` | same | |
| `--cds-icon` | `calc(1.25rem*1)` | same | `calc(1rem*1)` |
| `--cds-icon--lg` | `calc(1.5rem*1)` | same | `calc(1rem*1)` |
| `--cds-icon--sm` | `calc(1rem*1)` | same | `calc(.75rem*1)` |
| `--cds-icon--xs` | `calc(1rem*1)` | same | `calc(.75rem*1)` |
| `--cds-leading-body--lg` | `calc(1.375rem*1)` | same | `calc(1.25rem*1)` |
| `--cds-leading-body--own` | `calc(1.25rem*1)` | same | `calc(1.1875rem*1)` |
| `--cds-leading-body--sm` | `calc(1.25rem*1)` | same | `calc(1.0625rem*1)` |
| `--cds-leading-body--textlg` | `calc(1.375rem*1)` | same | `calc(1.25rem*1)` |
| `--cds-leading-body--textsm` | `calc(1.1875rem*1)` | same | |
| `--cds-leading-body--xs` | `calc(1.1875rem*1)` | same | `calc(1.0625rem*1)` |
| `--cds-leading-heading--textlg` | `calc(1.5rem*1)` | same | `calc(1.375rem*1)` |
| `--cds-leading-heading--textsm` | `calc(1.25rem*1)` | same | `calc(1.125rem*1)` |
| `--cds-leading-prose--lg` | `1.6875rem` | same | `1.375rem` |
| `--cds-leading-prose--lg--textlg` | `1.6875rem` | same | `1.5rem` |
| `--cds-leading-prose--lg--textsm` | `1.5rem` | same | `1.25rem` |
| `--cds-leading-prose--sm` | `1.375rem` | same | `1.1875rem` |
| `--cds-leading-prose--sm--textlg` | `1.5rem` | same | `1.25rem` |
| `--cds-leading-prose--sm--textsm` | `1.25rem` | same | `1.1875rem` |
| `--cds-leading-prose--textlg` | `1.6875rem` | same | `1.375rem` |
| `--cds-leading-prose--textsm` | `1.375rem` | same | `1.1875rem` |
| `--cds-leading-prose--xs` | `1.25rem` | same | `1.1875rem` |
| `--cds-leading-prose--xs--textlg` | `1.375rem` | same | `1.25rem` |
| `--cds-leading-prose--xs--textsm` | `1.1875rem` | same | |
| `--cds-message-actions-opacity` | `1` | same | |
| `--cds-message-actions-reveal-in-delay` | `.1s` | same | |
| `--cds-message-actions-reveal-in-duration` | `.12s` | same | |
| `--cds-message-actions-reveal-in-ease` | `cubic-bezier(.32,.72,0,1)` | same | |
| `--cds-message-actions-reveal-origin` | `top` | same | |
| `--cds-message-actions-reveal-out-delay` | `0s` | same | |
| `--cds-message-actions-reveal-out-duration` | `60ms` | same | |
| `--cds-message-actions-reveal-out-ease` | `cubic-bezier(.32,.72,0,1)` | same | |
| `--cds-message-actions-reveal-scale` | `none` | same | |
| `--cds-mineral` | `#629987` | same | |
| `--cds-oncolor-200` | `#f8f8f7bf` | same | |
| `--cds-oncolor-300` | `#f8f8f780` | same | |
| `--cds-opacity-disabled` | `.4` | same | |
| `--cds-opacity-icon-secondary` | `.4` | same | |
| `--cds-outset-x` | `0px` | same | |
| `--cds-outset-y` | `0px` | same | |
| `--cds-pad-lg--lg` | `calc(1.25rem*1)` | same | `calc(.875rem*1)` |
| `--cds-pad-lg--sm` | `calc(.875rem*1)` | same | `calc(.625rem*1)` |
| `--cds-pad-lg--xs` | `calc(.75rem*1)` | same | `calc(.625rem*1)` |
| `--cds-pad-md--lg` | `calc(1rem*1)` | same | `calc(.625rem*1)` |
| `--cds-pad-md--sm` | `calc(.625rem*1)` | same | `calc(.375rem*1)` |
| `--cds-pad-md--xs` | `calc(.5rem*1)` | same | `calc(.375rem*1)` |
| `--cds-pad-sm--lg` | `calc(.75rem*1)` | same | `calc(.5rem*1)` |
| `--cds-pad-sm--sm` | `calc(.5rem*1)` | same | `calc(.25rem*1)` |
| `--cds-pad-sm--xs` | `calc(.375rem*1)` | same | `calc(.25rem*1)` |
| `--cds-pad-xl--lg` | `calc(1.75rem*1)` | same | `calc(1.375rem*1)` |
| `--cds-pad-xl--sm` | `calc(1.375rem*1)` | same | `calc(.875rem*1)` |
| `--cds-pad-xl--xs` | `calc(1.25rem*1)` | same | `calc(.875rem*1)` |
| `--cds-pad-xs--lg` | `calc(.5rem*1)` | same | `calc(.375rem*1)` |
| `--cds-pad-xs--sm` | `calc(.375rem*1)` | same | `calc(.125rem*1)` |
| `--cds-pad-xs--xs` | `calc(.25rem*1)` | same | `calc(.125rem*1)` |
| `--cds-page-header-title-leading` | `calc(2rem*1)` | same | |
| `--cds-page-header-title-size` | `calc(1.5rem*1)` | same | |
| `--cds-pictogram-highlight-cactus` | `#629987` | `#bcd1ca` | |
| `--cds-pictogram-highlight-default` | `#454442` | `#e7e6e1` | |
| `--cds-pictogram-highlight-heather` | `#827dbd` | `#cbcadb` | |
| `--cds-pinned-bg` | `—` | same | |
| `--cds-pinned-stripe` | `—` | same | |
| `--cds-plum` | `#827dbd` | same | |
| `--cds-popup-max-h` | `—` | same | |
| `--cds-prose-code-color` | `—` | same | |
| `--cds-prose-marker-color` | `—` | same | |
| `--cds-question-list-limit` | `—` | same | |
| `--cds-question-row-h` | `—` | same | |
| `--cds-radio-group-card-selected` | `#03162c` | `#e7f1fb` | |
| `--cds-rem-scale` | `—` | same | |
| `--cds-scroll-fade-bottom` | `0px` | same | |
| `--cds-scroll-fade-bottom-on` | `1` | same | |
| `--cds-scroll-fade-bottom-raw` | `0px` | same | |
| `--cds-scroll-fade-left` | `0px` | same | |
| `--cds-scroll-fade-left-on` | `1` | same | |
| `--cds-scroll-fade-left-raw` | `0px` | same | |
| `--cds-scroll-fade-right` | `0px` | same | |
| `--cds-scroll-fade-right-on` | `1` | same | |
| `--cds-scroll-fade-right-raw` | `0px` | same | |
| `--cds-scroll-fade-size` | `28px` | same | |
| `--cds-scroll-fade-strip-active` | `0` | same | |
| `--cds-scroll-fade-strip-color` | `#151515` | same | |
| `--cds-scroll-fade-strip-raw` | `0` | same | |
| `--cds-scroll-fade-top` | `0px` | same | |
| `--cds-scroll-fade-top-on` | `1` | same | |
| `--cds-scroll-fade-top-raw` | `0px` | same | |
| `--cds-scroll-fade-x-active` | `0` | same | |
| `--cds-scroll-fade-y-active` | `0` | same | |
| `--cds-segmented-control-thumb` | `hsl(from #fff h s l/10%)` | `#fff` | |
| `--cds-segmented-control-track` | `hsl(from #fff h s l/5%)` | `hsl(from #0b0b0b h s l/5%)` | |
| `--cds-shimmer-text-delay` | `0s` | same | |
| `--cds-shimmer-text-peak` | `transparent` | same | |
| `--cds-shimmer-text-play-state` | `running` | same | |
| `--cds-shortcut-cap-fill` | `transparent` | same | |
| `--cds-shortcut-cap-ink` | `#a5a49a` | `#6d6b67` | |
| `--cds-shortcut-cap-line` | `color-mix(in srgb,currentColor 22%,transparent)` | `color-mix(in srgb,currentColor 18%,transparent)` | |
| `--cds-skeleton-base` | `hsl(from #fff h s l/7.5%)` | `hsl(from #0b0b0b h s l/5%)` | |
| `--cds-skeleton-sheen` | `hsl(from #fff h s l/7.5%)` | `hsl(from #0b0b0b h s l/5%)` | |
| `--cds-slider-fill` | `hsl(from #fff h s l/35%)` | `hsl(from #0b0b0b h s l/20%)` | |
| `--cds-slider-handle` | `#fff` | same | |
| `--cds-slider-handle-shadow-depth` | `hsl(from #0b0b0b h s l/24%)` | `hsl(from #0b0b0b h s l/6%)` | |
| `--cds-slider-handle-shadow-outer` | `hsl(from #fff h s l/0%)` | `hsl(from #0b0b0b h s l/4%)` | |
| `--cds-slider-stop-dot` | `hsl(from #fff h s l/25%)` | `hsl(from #0b0b0b h s l/25%)` | |
| `--cds-slider-track` | `hsl(from #fff h s l/10%)` | `hsl(from #0b0b0b h s l/10%)` | |
| `--cds-split-ring` | `—` | same | |
| `--cds-stack-overlap` | `—` | same | |
| `--cds-sticky-edge-active` | `0` | same | |
| `--cds-sticky-edge-end` | `0` | same | |
| `--cds-sticky-edge-start` | `0` | same | |
| `--cds-switch-h` | `calc(1.25rem*1)` | same | `calc(1rem*1)` |
| `--cds-switch-h--lg` | `calc(1.5rem*1)` | same | `calc(1.125rem*1)` |
| `--cds-switch-h--sm` | `calc(1.125rem*1)` | same | `calc(.875rem*1)` |
| `--cds-switch-h--xs` | `calc(1rem*1)` | same | `calc(.875rem*1)` |
| `--cds-switch-knob` | `#fff` | same | |
| `--cds-switch-track` | `hsl(from #fff h s l/10%)` | `hsl(from #0b0b0b h s l/20%)` | |
| `--cds-switch-track-hover` | `hsl(from #fff h s l/20%)` | `hsl(from #0b0b0b h s l/35%)` | |
| `--cds-theme-api` | `1` | same | |
| `--cds-tooltip-bg` | `#20201f` | `#0b0b0b` | |
| `--cds-tooltip-fg` | `#f0efec` | `#fff` | |

## Utility classes

Tailwind-style classes already compiled into the CSS that map straight to a token. Only these exist; new arbitrary Tailwind classes will **not** work unless they are already in the stylesheet (see `docs/DESIGN_GUIDE.md`).

**bg** (151): `bg-accent` `bg-accent-000` `bg-accent-100` `bg-accent-900` `bg-accent-muted` `bg-accent-pro-100` `bg-alpha-0` `bg-alpha-1` `bg-alpha-2` `bg-alpha-3` `bg-alpha-4` `bg-alpha-5` `bg-alpha-6` `bg-alpha-7` `bg-alpha-8` `bg-aqua-50` `bg-aqua-350` `bg-aqua-400` `bg-aqua-450` `bg-aqua-500` `bg-aqua-600` `bg-backdrop` `bg-bg-000` `bg-bg-100` `bg-bg-200` `bg-bg-300` `bg-bg-500` `bg-black` `bg-blue-50` `bg-blue-300` `bg-blue-400` `bg-blue-450` `bg-blue-500` `bg-blue-600` `bg-border` `bg-border-200` `bg-border-400` `bg-cactus` `bg-clay` `bg-danger` `bg-danger-000` `bg-danger-100` `bg-danger-900` `bg-editor-canvas` `bg-editor-claude-pending` `bg-editor-comment` `bg-editor-comment-active` `bg-editor-highlight-blue` `bg-editor-highlight-gray` `bg-editor-highlight-green` `bg-editor-highlight-magenta` `bg-editor-highlight-violet` `bg-editor-highlight-yellow` `bg-fill-accent` `bg-fill-accent-hover` `bg-fill-brand` `bg-fill-control` `bg-fill-control-hover` `bg-fill-danger` `bg-fill-danger-hover` `bg-fill-field` `bg-fill-ghost-hover` `bg-fill-ghost-selected` `bg-fill-git-added` `bg-fill-git-removed` `bg-fill-primary` `bg-fill-pro` `bg-fill-secondary` `bg-fill-success` `bg-fill-success-hover` `bg-fill-warning` `bg-fill-warning-hover` `bg-git-added` `bg-git-closed` `bg-git-conflicting` `bg-git-merged` `bg-git-modified` `bg-git-opened` `bg-git-queued` `bg-git-removed` `bg-gray-0` `bg-gray-30` `bg-gray-50` `bg-gray-400` `bg-gray-450` `bg-gray-600` `bg-gray-700` `bg-green-50` `bg-green-250` `bg-green-400` `bg-green-450` `bg-green-500` `bg-green-600` `bg-heather` `bg-highlight` `bg-magenta-50` `bg-magenta-300` `bg-magenta-400` `bg-magenta-450` `bg-magenta-600` `bg-mineral` `bg-neutral` `bg-neutral-30` `bg-neutral-40` `bg-neutral-50` `bg-neutral-hover` `bg-orange-50` `bg-orange-450` `bg-orange-600` `bg-page` `bg-plum` `bg-pro` `bg-red-50` `bg-red-100` `bg-red-450` `bg-red-600` `bg-success` `bg-success-000` `bg-surface-0` `bg-surface-1` `bg-surface-2` `bg-surface-3` `bg-surface-panel` `bg-surface-popover` `bg-text-100` `bg-text-200` `bg-text-300` `bg-text-400` `bg-text-500` `bg-tint-aqua` `bg-tint-blue` `bg-tint-green` `bg-tint-magenta` `bg-tint-orange` `bg-tint-red` `bg-tint-red-opaque` `bg-tint-violet` `bg-tint-yellow` `bg-violet-50` `bg-violet-400` `bg-violet-450` `bg-violet-600` `bg-warning` `bg-warning-000` `bg-warning-900` `bg-yellow-50` `bg-yellow-300` `bg-yellow-400` `bg-yellow-450` `bg-yellow-500` `bg-yellow-600`

**border** (57): `border-accent` `border-accent-000` `border-accent-100` `border-accent-200` `border-accent-900` `border-accent-pro-100` `border-accent-pro-200` `border-alpha-1` `border-alpha-2` `border-alpha-3` `border-alpha-4` `border-alpha-5` `border-aqua-200` `border-b-bg-200` `border-bg-000` `border-blue-200` `border-blue-500` `border-border-200` `border-border-400` `border-danger` `border-danger-000` `border-danger-100` `border-danger-200` `border-git-merged` `border-gray-0` `border-green-200` `border-l-accent-200` `border-l-border-300` `border-l-danger-100` `border-l-danger-200` `border-l-success-100` `border-l-success-200` `border-l-text-500` `border-magenta-200` `border-neutral-50` `border-orange-200` `border-pro` `border-red-200` `border-s-accent` `border-strong` `border-stronger` `border-success` `border-t-bg-200` `border-t-stronger` `border-t-text-000` `border-t-text-300` `border-text-100` `border-text-300` `border-text-500` `border-violet-200` `border-violet-500` `border-warning` `border-warning-000` `border-warning-100` `border-warning-200` `border-x-bg-200` `border-yellow-200`

**fill** (21): `fill-accent` `fill-accent-900` `fill-bg-000` `fill-bg-200` `fill-blue-100` `fill-blue-400` `fill-border-300` `fill-brand` `fill-clay` `fill-danger` `fill-danger-200` `fill-neutral-30` `fill-pictogram-highlight-cactus` `fill-pictogram-highlight-default` `fill-pictogram-highlight-heather` `fill-primary` `fill-pro` `fill-secondary` `fill-success` `fill-text-100` `fill-warning`

**font** (5): `font-mono` `font-mono-ui` `font-sans` `font-sans-display` `font-voice`

**gap** (15): `gap-lg` `gap-md` `gap-sm` `gap-x-lg` `gap-x-md` `gap-x-sm` `gap-x-xl` `gap-x-xs` `gap-xl` `gap-xs` `gap-y-lg` `gap-y-md` `gap-y-sm` `gap-y-xl` `gap-y-xs`

**h** (6): `h-control` `h-control-nested` `h-icon` `min-h-control` `min-h-control-nested` `min-h-icon`

**m** (43): `m-md` `m-sm` `m-xs` `mb-lg` `mb-md` `mb-pad-lg` `mb-pad-md` `mb-pad-sm` `mb-pad-xs` `mb-sm` `mb-xl` `mb-xs` `ml-lg` `ml-md` `ml-pad-md` `ml-pad-xl` `ml-pad-xs` `ml-sm` `ml-xs` `mr-md` `mr-sm` `mr-xs` `mt-lg` `mt-md` `mt-pad-lg` `mt-pad-md` `mt-pad-sm` `mt-pad-xl` `mt-pad-xs` `mt-sm` `mt-xl` `mt-xs` `mx-lg` `mx-md` `mx-pad-lg` `mx-pad-md` `mx-pad-sm` `mx-pad-xl` `mx-sm` `mx-xs` `my-md` `my-sm` `my-xs`

**outline** (7): `outline-alpha-2` `outline-alpha-6` `outline-danger` `outline-editor-comment-target` `outline-fill-accent` `outline-strong` `outline-warning`

**p** (35): `p-lg` `p-md` `p-sm` `p-xl` `p-xs` `pb-lg` `pb-md` `pb-sm` `pb-xl` `pb-xs` `pl-lg` `pl-md` `pl-sm` `pl-xl` `pl-xs` `pr-lg` `pr-md` `pr-sm` `pr-xl` `pr-xs` `pt-lg` `pt-md` `pt-sm` `pt-xl` `pt-xs` `px-lg` `px-md` `px-sm` `px-xl` `px-xs` `py-lg` `py-md` `py-sm` `py-xl` `py-xs`

**rounded** (5): `rounded-bl` `rounded-br` `rounded-composer` `rounded-tl` `rounded-tr`

**stroke** (4): `stroke-blue-500` `stroke-border-300` `stroke-clay` `stroke-clay-emphasized`

**text** (89): `text-accent-000` `text-accent-100` `text-accent-200` `text-accent-900` `text-aqua-400` `text-aqua-450` `text-aqua-600` `text-bg-000` `text-bg-100` `text-black` `text-blue-400` `text-blue-450` `text-blue-500` `text-blue-600` `text-blue-700` `text-border-400` `text-clay` `text-clay-emphasized` `text-danger-000` `text-disabled` `text-git-added` `text-git-closed` `text-git-conflicting` `text-git-draft` `text-git-merged` `text-git-modified` `text-git-opened` `text-git-queued` `text-git-removed` `text-gray-0` `text-gray-400` `text-gray-450` `text-gray-500` `text-gray-600` `text-gray-900` `text-green-400` `text-green-450` `text-green-600` `text-green-700` `text-magenta-400` `text-magenta-450` `text-magenta-600` `text-magenta-700` `text-mineral` `text-muted` `text-on-accent` `text-on-brand` `text-on-danger` `text-on-primary` `text-on-pro` `text-on-success` `text-on-warning` `text-oncolor-200` `text-oncolor-300` `text-orange-450` `text-orange-600` `text-orange-700` `text-plum` `text-primary` `text-pro` `text-red-450` `text-red-600` `text-secondary` `text-success` `text-success-100` `text-success-200` `text-text-100` `text-text-300` `text-text-400` `text-text-500` `text-tint-aqua` `text-tint-blue` `text-tint-green` `text-tint-magenta` `text-tint-orange` `text-tint-red` `text-tint-violet` `text-tint-yellow` `text-violet-450` `text-violet-500` `text-violet-600` `text-violet-700` `text-warning-000` `text-warning-100` `text-warning-200` `text-yellow-400` `text-yellow-450` `text-yellow-600` `text-yellow-750`

**z** (5): `z-dropdown` `z-modal` `z-popover` `z-toast` `z-tooltip`
