---
version: beta
name: Claude-design-analysis
description: A warm-canvas editorial interface inspired by Anthropic's Claude product. The system anchors on a tinted cream canvas with heavy humanist-sans display headlines, warm coral CTAs, and a dark navy footer. Brand voltage comes from the cream/coral pairing — deliberately warm where most AI brands use cool blue + slate. Type voice runs Plus Jakarta Sans for all display and body text with tight negative letter-spacing; JetBrains Mono handles code.

colors:
  primary: "#cc785c"
  primary-active: "#a9583e"
  primary-disabled: "#e6dfd8"
  ink: "#141413"
  body: "#3d3d3a"
  body-strong: "#252523"
  muted: "#6c6a64"
  muted-soft: "#8e8b82"
  hairline: "#e6dfd8"
  hairline-soft: "#ebe6df"
  canvas: "#faf9f5"
  surface-soft: "#f5f0e8"
  surface-card: "#efe9de"
  surface-cream-strong: "#e8e0d2"
  surface-dark: "#e8e0d2"       # repurposed — same as surface-cream-strong; used for light elevated surfaces (NOT dark)
  surface-dark-elevated: "#f5f0e8"  # repurposed to light value
  surface-dark-soft: "#fcfbf8"      # repurposed to light value
  surface-navy: "#181715"       # the actual dark surface; used only in footer
  on-dark: "#141413"            # dark ink text on light surface-dark
  on-dark-soft: "#6c6a64"       # muted text on light surface-dark
  on-navy: "#faf9f5"            # cream text on surface-navy (footer)
  on-navy-soft: "#a09d96"       # secondary text on surface-navy (footer)
  on-primary: "#ffffff"
  success: "#5db872"
  warning: "#d4a017"
  error: "#c64545"

typography:
  display-hero:
    fontFamily: "Plus Jakarta Sans Variable, sans-serif"
    fontSize: "clamp(2.85rem, 8vw, 5.25rem)"
    fontWeight: 650
    lineHeight: 0.98
    letterSpacing: -0.05em
  display-title:
    fontFamily: "Plus Jakarta Sans Variable, sans-serif"
    fontSize: "clamp(2.15rem, 5vw, 3.75rem)"
    fontWeight: 620
    lineHeight: 1.02
    letterSpacing: -0.045em
  display-subtitle:
    fontFamily: "Plus Jakarta Sans Variable, sans-serif"
    fontSize: "clamp(1.45rem, 3vw, 2rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: -0.03em
  body-md:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  body-sm:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  section-label:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: 0.18em
    textTransform: uppercase
    color: primary
  body-lead:
    fontFamily: "Inter Variable, sans-serif"
    fontSize: 1.05rem
    fontWeight: 400
    lineHeight: 1.7
    color: body
  code:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: 0

rounded:
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  2xl: 20px
  3xl: 24px
  4xl: 28px
  pill: 9999px
  full: 9999px

spacing:
  section-mobile: 72px   # 4.5rem
  section-desktop: 96px  # 6rem
  container-max: 76rem
  container-padding-mobile: 1rem
  container-padding-sm: 1.5rem
  container-padding-lg: 2rem

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: 12px 20px
    height: 40px
  button-primary-active:
    backgroundColor: "{colors.primary-active}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
  button-primary-disabled:
    backgroundColor: "{colors.primary-disabled}"
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.md}"
    padding: 12px 20px
    height: 40px
  button-icon-circular:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.full}"
    size: 36px
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.md}"
    padding: 10px 14px
    height: 40px
  surface-card:
    backgroundColor: "{colors.surface-card}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.lg}"
  surface-soft:
    backgroundColor: "{colors.surface-soft}"
    border: "1px solid {colors.hairline-soft}"
    rounded: "{rounded.lg}"
  surface-coral:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.xl}"
  footer-navy:
    backgroundColor: "{colors.surface-navy}"
    textColor: "{colors.on-navy}"
    secondaryTextColor: "{colors.on-navy-soft}"
  badge-pill:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: 4px 12px
  category-tab:
    backgroundColor: transparent
    textColor: "{colors.muted}"
    padding: 8px 14px
    rounded: "{rounded.md}"
  category-tab-active:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
---

## Overview

This interface uses a **tinted cream canvas** (`{colors.canvas}` — #faf9f5) as the page floor — warm and deliberate, not the cool gray-white common to AI products. All display and body text uses **Plus Jakarta Sans** (a humanist sans-serif) at heavy weights (620–650) with aggressive negative letter-spacing for headlines, paired with **Inter Variable** for body copy. JetBrains Mono handles code. There are no serif fonts.

Brand voltage comes from the **cream + coral pairing** — coral (`{colors.primary}` — #cc785c) anchors all primary CTAs and is used as a full-bleed surface on CTA bands. The dark navy (`{colors.surface-navy}` — #181715) is reserved exclusively for the footer.

The body background carries a subtle radial coral gradient at the top (`rgba(204, 120, 92, 0.08)`) that fades out — warm and barely perceptible.

**Key Characteristics:**
- Warm cream canvas (`{colors.canvas}`) with dark warm-ink text (`{colors.ink}` — #141413).
- Coral primary (`{colors.primary}` — #cc785c) for CTAs, accents, and full-bleed `surface-coral` bands.
- Heavy humanist-sans display (Plus Jakarta Sans, weight 620–650, tight negative tracking). No serif display fonts.
- All cream surfaces: soft (`{colors.surface-soft}`), card (`{colors.surface-card}`), and cream-strong (`{colors.surface-cream-strong}`) for progressive elevation within the light register.
- Dark navy (`{colors.surface-navy}`) used **only in the footer** — no dark band alternation in product pages.
- No dark mode — the `.dark` CSS class mirrors the light theme.
- Border radius is hierarchical: `{rounded.md}` (8px) for buttons/inputs, `{rounded.lg}` (12px) for content cards, `{rounded.xl}` / `{rounded.2xl}` / `{rounded.3xl}` for larger containers and chat bubbles.

## Colors

### Brand & Accent
- **Coral / Primary** (`{colors.primary}` — #cc785c): Signature warm coral. Every primary CTA, full-bleed coral callout bands, focus rings, inline icons, selection highlight.
- **Coral Active** (`{colors.primary-active}` — #a9583e): Press/hover-darker state.
- **Coral Disabled** (`{colors.primary-disabled}` — #e6dfd8): Desaturated cream-tinted disabled state.

### Surface
- **Canvas** (`{colors.canvas}` — #faf9f5): Default page floor. Tinted cream.
- **Surface Soft** (`{colors.surface-soft}` — #f5f0e8): Very-soft band backgrounds, disabled states, avatar containers, sidebar.
- **Surface Card** (`{colors.surface-card}` — #efe9de): Content cards, chat composer, form cards. One step darker than canvas.
- **Surface Cream Strong** (`{colors.surface-cream-strong}` — #e8e0d2): Strongest cream variant; selected tab states, accent backgrounds.
- **Surface Dark** (`{colors.surface-dark}` — #e8e0d2): **Repurposed** — same hex as `surface-cream-strong`. Used as an elevated light surface in `SurfacePanel tone="dark"`, not a dark surface. Name is a legacy artifact.
- **Surface Navy** (`{colors.surface-navy}` — #181715): The only true dark surface. Used exclusively in the footer.
- **Hairline** (`{colors.hairline}` — #e6dfd8): 1px border on cream surfaces.
- **Hairline Soft** (`{colors.hairline-soft}` — #ebe6df): Barely-visible divider within the same band.

### Text
- **Ink** (`{colors.ink}` — #141413): Headlines and primary text. Warm dark.
- **Body Strong** (`{colors.body-strong}` — #252523): Emphasized paragraphs.
- **Body** (`{colors.body}` — #3d3d3a): Default running-text.
- **Muted** (`{colors.muted}` — #6c6a64): Secondary labels, breadcrumbs.
- **Muted Soft** (`{colors.muted-soft}` — #8e8b82): Captions, fine-print.
- **On Dark** (`{colors.on-dark}` — #141413): Dark ink text used on `surface-dark` (which is light cream). Counterintuitively dark — because `surface-dark` is now cream.
- **On Dark Soft** (`{colors.on-dark-soft}` — #6c6a64): Muted text on `surface-dark`.
- **On Navy** (`{colors.on-navy}` — #faf9f5): Cream text on the footer's `surface-navy`.
- **On Navy Soft** (`{colors.on-navy-soft}` — #a09d96): Secondary footer text.
- **On Primary** (`{colors.on-primary}` — #ffffff): Text on coral buttons/surfaces.

### Semantic
- **Success** (`{colors.success}` — #5db872): Status dots, positive indicators.
- **Warning** (`{colors.warning}` — #d4a017): Warning callouts.
- **Error / Destructive** (`{colors.error}` — #c64545): Validation errors, destructive actions.

## Typography

### Font Families
- **Plus Jakarta Sans Variable** (`--font-heading`): All display headlines. Humanist geometric sans. Heavy weights (620–650) with aggressive negative letter-spacing.
- **Inter Variable** (`--font-sans`): Body copy, labels, navigation, buttons. Weight 400 for body, 500–600 for UI labels.
- **JetBrains Mono** (`--font-mono`): All code blocks, terminal text, monospace snippets.

No serif fonts are used. The display character comes from weight and tight tracking, not from a typeface category change.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `display-hero` | clamp(2.85rem → 5.25rem) | 650 | 0.98 | -0.05em | Homepage h1, hero band |
| `display-title` | clamp(2.15rem → 3.75rem) | 620 | 1.02 | -0.045em | Section heads |
| `display-subtitle` | clamp(1.45rem → 2rem) | 600 | 1.08 | -0.03em | Sub-section heads, feature card titles |
| `body-lead` | 1.05rem | 400 | 1.7 | 0 | Intro paragraphs, hero sub-copy |
| `body-md` | 16px | 400 | 1.55 | 0 | Default running-text |
| `body-sm` | 14px | 400 | 1.55 | 0 | Secondary copy, fine-print |
| `section-label` | 12px | 600 | 1 | 0.18em (uppercase) | Eyebrow labels above section titles |
| `code` | 14px | 400 | 1.65 | 0 | Code blocks — JetBrains Mono |

### Principles
Display sizes are fluid (`clamp()`), not fixed px. Heavy weight (620–650) with tight negative tracking is the display voice — not bold/700, which reads as aggressive. Body text stays at weight 400. UI labels and captions use 500–600.

## Layout

### Container
- Max width: 76rem, centered via `.editorial-container`.
- Padding: 1rem mobile → 1.5rem (sm) → 2rem (lg).

### Section Rhythm
- `.section-space`: 4.5rem (72px) on mobile, 6rem (96px) at md+.

### Utility Classes
- `.editorial-container`: Centered max-width container.
- `.section-space`: Responsive vertical section padding.
- `.display-hero`, `.display-title`, `.display-subtitle`: Fluid heading styles.
- `.section-label`: Uppercase coral eyebrow label.
- `.body-lead`: Large intro paragraph.
- `.surface-card`, `.surface-soft`, `.surface-dark`, `.surface-coral`: Semantic surface classes with bg + border + radius baked in.
- `.hairline-grid`: Subtle cream hairline grid overlay (used on hero sections).
- `.dark-code-grid`: Faint grid overlay for dark/navy surfaces.
- `.mono-scroll`: Monospace pre-formatted scrollable block.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow, no border | Body sections, nav |
| Soft hairline | 1px `{colors.hairline}` border | Inputs, cards, sub-nav |
| Surface soft | `{colors.surface-soft}` bg | Muted band backgrounds, avatar containers |
| Surface card | `{colors.surface-card}` bg + hairline | Content cards, chat composer |
| Surface coral | `{colors.primary}` bg | Full-bleed CTA bands |
| Surface navy | `{colors.surface-navy}` bg | Footer only |

Elevation is **color-block only** — no box shadows except rarely on floating elements (e.g. the scroll-to-bottom button uses `shadow-md`).

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.sm}` | 6px | Small inline elements |
| `{rounded.md}` | 8px | Buttons, text inputs, category tabs |
| `{rounded.lg}` | 12px | Content cards |
| `{rounded.xl}` | 16px | Larger containers, surface panels |
| `{rounded.2xl}` | 20px | Chat bubbles (outer) |
| `{rounded.3xl}` | 24px | Large section cards |
| `{rounded.4xl}` | 28px | Hero illustration containers |
| `{rounded.pill}` | 9999px | Badge pills, status chips |
| `{rounded.full}` | 9999px | Avatar circles, icon buttons |

## Components

### Buttons
- **`button-primary`**: Coral fill, white text, `{rounded.md}`. The primary action button.
- **`button-secondary`**: Canvas fill, hairline border, ink text. Same size as primary.
- **`button-icon-circular`**: Circular icon button (`{rounded.full}`), canvas fill, hairline border, 36px.
- No dark-surface button variant is actively used.

### Surface Panels (`SurfacePanel` component)
The `SurfacePanel` component in `src/components/layout/editorial.tsx` wraps the four surface tones:
- `tone="card"` → `.surface-card` (default)
- `tone="soft"` → `.surface-soft`
- `tone="dark"` → `.surface-dark` (light cream — see color note above)
- `tone="coral"` → `.surface-coral`

### Cards
- **Feature cards**: `surface-card` tone, `{rounded.lg}`, generous padding.
- **Chat composer**: `surface-card` class with `flex` layout for textarea + send button.
- **Auth cards**: `bg-background` (canvas) with hairline border.

### Footer
The only dark-navy surface in the product. `bg-surface-navy`, `text-on-navy` for primary text, `text-on-navy-soft` for secondary links and copyright.

### Inputs
`bg-background`, hairline border, `{rounded.md}`, ink text. Focus ring uses `{colors.primary}` at 40% opacity.

### Badges / Tags
Cream-fill pill (`{colors.surface-card}` bg, `{rounded.pill}`). No coral badge variant is actively used.

## Do's and Don'ts

### Do
- Anchor every page on the cream canvas. The warm tint is the brand differentiator.
- Use Plus Jakarta Sans at weight 620–650 with tight negative letter-spacing for display. This is the display voice.
- Reserve `{colors.primary}` coral for primary CTAs and `surface-coral` full-bleed bands.
- Use the surface hierarchy (canvas → surface-soft → surface-card → surface-cream-strong) for progressive elevation within the light register.
- Use `{colors.surface-navy}` for the footer only. Don't expand dark surfaces into page content.

### Don't
- Don't use serif fonts. Plus Jakarta Sans heavy + tight tracking is the display character.
- Don't use `dark:` Tailwind modifier classes — the project has no dark mode.
- Don't confuse `surface-dark` (light cream, legacy name) with `surface-navy` (the actual dark).
- Don't use `accent-teal` or `accent-amber` — these colors are not wired into the CSS token system.
- Don't use `text-on-dark` / `text-on-dark-soft` for footer text — use `text-on-navy` / `text-on-navy-soft` instead.
- Don't add box shadows beyond the system's rare use (floating elements only).

## Responsive Behavior

### Breakpoints
| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 640px | Single column, `section-space` 72px, container padding 1rem |
| Small | 640–1024px | Container padding 1.5rem |
| Desktop | 1024px+ | Container padding 2rem, multi-column grids |
| Wide | 1200px+ | Content capped at 76rem max-width |

### Touch Targets
- Buttons minimum 40px height.
- Icon buttons 36px (slightly under WCAG 44px — acceptable for this design density).
- Input height 40px.

## Known Gaps / Decisions

- **`surface-dark` naming**: The CSS token `--surface-dark` was repurposed from dark navy (#181715) to light cream (#e8e0d2) during the design system adaptation. The name is a legacy artifact and can be confusing. `surface-navy` is the authoritative dark surface token.
- **No serif fonts**: DESIGN.md originally specified Copernicus/Tiempos Headline (licensed Anthropic typefaces). The implementation uses Plus Jakarta Sans Variable as the closest open-source substitute that maintains the heavy, tightly-tracked display aesthetic.
- **Dark mode**: The `.dark` CSS class exists (shadcn/ui scaffold) but maps identical values to the light theme. There is no implemented dark mode.
- **`accent-teal` / `accent-amber`**: Defined in the original design analysis but never wired into `globals.css`. Not available as Tailwind utilities.
- **Chat product components**: Chat bubbles, message tools, conversation sidebar, and typing indicators are product-specific patterns not formalized as design tokens — they use the same surface/color tokens compositely.
- **Animation timings**: Not documented. The codebase uses Tailwind's default `transition-colors duration-150` globally and `tw-animate-css` for component entrance animations.
