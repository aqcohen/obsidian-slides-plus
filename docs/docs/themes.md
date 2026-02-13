# Themes

Slides Plus comes with 6 built-in themes that adapt to your presentation needs.

## Available Themes

| Theme | Description |
|-------|-------------|
| `obsidian` | Adapts to Obsidian's light/dark mode |
| `midnight` | Deep blue, fixed dark palette |
| `paper` | Paper-and-ink, weight-based hierarchy |
| `boardroom` | Professional, projection-optimized |
| `academic` | Warm academic, Poppins + Lora fonts |
| `studio` | Bold artist's palette on black |

## Setting a Theme

### Global Theme

Set in file frontmatter:

```markdown
---
slides: true
theme: academic
---

# Your presentation
```

### Per-Slide Theme

Override theme for a specific slide:

```markdown
---

theme: midnight

# This slide uses midnight theme

---

# Back to global theme
```

## Theme Details

### Obsidian

Adapts to your Obsidian appearance setting:
- Light mode: Clean white background
- Dark mode: Dark gray background
- Uses system fonts

### Midnight

Deep blue palette optimized for dark rooms:

```yaml
primary: #1e3a5f
background: #0a1929
text: #e6f1ff
```

### Paper

Academic paper aesthetic:

```yaml
primary: #1a1a1a
background: #faf9f6
text: #1a1a1a
font-heading: Source Serif
font-body: Inter
```

### Boardroom

Professional for business presentations:

```yaml
primary: #2563eb
background: #ffffff
text: #1e293b
font-heading: Outfit
font-body: Inter
```

### Academic

Warm, readable, with academic fonts:

```yaml
primary: #7c3aed
background: #fefefe
text: #1f2937
font-heading: Poppins
font-body: Lora
```

### Studio

Bold artistic presentation:

```yaml
primary: #f59e0b
background: #000000
text: #ffffff
font-heading: Syne
font-body: Work Sans
```

## Custom Themes (v0.2.0)

Coming soon: Create your own themes with custom CSS.

## Related

- [Frontmatter Reference](./frontmatter.md)
- [Layouts](./layouts.md)
