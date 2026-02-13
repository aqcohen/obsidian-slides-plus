# Features

Slides Plus provides a comprehensive set of features for creating professional presentations.

## Core Features

### Live Preview

The preview panel updates in real-time as you type. It shows:
- Current slide content
- Slide number (e.g., 1/5)
- Previous/Next buttons
- Present button

### Slide Separators

Separate slides with `---` on its own line:

```markdown
# Slide 1

Content here

---

# Slide 2

Content here
```

### Per-Slide Frontmatter

Customize individual slides with frontmatter:

```markdown
---
layout: cover
background: sunset
---

# Title Slide

---

layout: two-cols
---

## Left Column

## Right Column
```

### Speaker Notes

Add private notes visible only in presenter view:

```markdown
# Slide Title

<!-- Remind audience about the key point -->

---

# Another Slide

<!-- 
  Multi-line
  speaker notes
-->
```

## Presentation Mode

### Navigation

| Key | Action |
|-----|--------|
| `→` `Space` | Next slide |
| `←` | Previous slide |
| `Home` | First slide |
| `End` | Last slide |
| `Esc` | Exit |

### Presenter View

Opens in a new window with:
- Current slide (large)
- Next slide preview
- Speaker notes
- Elapsed timer
- Slide counter

## Transitions

Configure slide transitions in frontmatter:

```markdown
---
transition: fade
---

# Slide with fade transition
```

**Available transitions:**
- `slide` (default)
- `fade`
- `slide-up`
- `none`

Set per-slide:

```markdown
---
transition: fade
---

# Fade in

---

transition: none

# No transition
```

## Additional Features

- **Auto-save** — Presentations save automatically with your notes
- **Multiple presentations** — One file = one presentation
- **Version control** — Git-friendly Markdown format
- **Export to PDF** — Print or save as PDF
- **Reading view** — Styled separators in Obsidian's reading view
