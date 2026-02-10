# Slides Plus

Slidev-inspired presentations inside Obsidian. Write your slides in Markdown, preview them live, and present directly from your vault.

## Features

- **Markdown slides** — Use `---` separators to split your notes into slides. Add `slides: true` to your frontmatter to activate.
- **6 themes** — Default, Dark, Minimal, Corporate, Academic (Anthropic-inspired), and Creative. Set via frontmatter or settings.
- **Layouts** — Cover, center, two-cols, image-right, image-left, section, quote, and full bleed.
- **Transitions** — Slide, fade, slide-up, or none. Configurable per-slide.
- **Presenter view** — Current slide, next slide preview, speaker notes, and a timer.
- **Slide navigator** — Thumbnail grid for quick navigation.
- **PDF export** — Print your deck to PDF via the command palette.
- **Live preview** — Sidebar panel updates as you type.
- **Per-slide styling** — Override any design token via frontmatter (`sp-slide-bg`, `sp-slide-accent`, `sp-font-heading`, etc.).

## Integrations

- **LaTeX** — Math equations rendered with MathJax.
- **Mermaid** — Diagrams rendered inline.
- **Excalidraw** — Embed `.excalidraw` drawings in your slides.

## Quick Start

1. Create a new note and add this frontmatter:

```yaml
---
slides: true
theme: academic
---
```

2. Write your slides separated by `---`:

```markdown
---
layout: cover
---

# My Presentation
## Subtitle here

---

## Slide 2

- Point one
- Point two
- Point three

---
layout: quote
---

> A great quote goes here.
```

3. Open the **Slide Preview** panel from the command palette or the ribbon icon.
4. Press the **Present** button to go fullscreen.

## Themes

| Theme | Description |
|-------|-------------|
| **Default** | Inherits your Obsidian colors |
| **Dark** | Deep blue background, red accent |
| **Minimal** | Clean, reduced, light weight headings |
| **Corporate** | Professional sans-serif, blue accent |
| **Academic** | Poppins + Lora, warm Anthropic-inspired palette |
| **Creative** | Bold, high-contrast, vibrant rose accent |

Set a theme globally in **Settings → Slides Plus**, or per-deck in frontmatter:

```yaml
---
slides: true
theme: corporate
---
```

## Per-Slide Overrides

Override any design token on a single slide:

```yaml
---
sp-slide-bg: "#1a1a2e"
sp-slide-accent: "#e94560"
sp-font-heading: Georgia, serif
---
```

## Speaker Notes

Add speaker notes as HTML comments:

```markdown
## My Slide

Content here.

<!-- These are speaker notes visible only in presenter view -->
```

## License

[MIT](LICENSE) — aqcohen
