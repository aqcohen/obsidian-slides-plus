# Layouts

Slides Plus provides multiple layouts for different slide types.

## Available Layouts

| Layout | Description |
|--------|-------------|
| `default` | Title + content, top-aligned |
| `cover` | Centered, large text, for title slides |
| `center` | All content vertically + horizontally centered |
| `two-cols` | Two equal columns |
| `image-right` | Content left, image right |
| `image-left` | Image left, content right |
| `section` | Large centered heading, for section dividers |
| `quote` | Styled blockquote layout |
| `full` | No padding, content fills entire slide |

## Using Layouts

Set layout in per-slide frontmatter:

```markdown
---
layout: cover
---

# Cover Slide

---

layout: center

# Centered Content
```

## Layout Details

### Default

Standard slide layout with title at top, content below.

```markdown
---
layout: default
---

# Heading

- Point 1
- Point 2
- Point 3
```

### Cover

Large centered text, ideal for title slides.

```markdown
---
layout: cover
---

# Presentation Title

## Subtitle

---

Your Name
```

### Center

Everything centered both horizontally and vertically.

```markdown
---
layout: center
---

# Centered Message

This content is perfectly centered.
```

### Two Columns

Use `::right::` syntax to split content:

```markdown
---
layout: two-cols
---

## Left Side

Content here

::right::

## Right Side

Content here
```

### Image Right

```markdown
---
layout: image-right
image: https://example.com/image.png
---

## Content on Left

Description of the image
```

### Image Left

```markdown
---
layout: image-left
image: https://example.com/image.png
---

## Content on Right

Description of the image
```

### Section

Large heading for section dividers:

```markdown
---
layout: section
---

# Part 2

Deep Dive
```

### Quote

Styled blockquote:

```markdown
---
layout: quote
---

> "The best way to predict the future is to create it."
> — Peter Drucker
```

### Full

No padding, content fills the entire slide:

```markdown
---
layout: full
---

![Large Image](https://example.com/large.png)
```

## Related

- [Themes](./themes.md)
- [Frontmatter Reference](./frontmatter.md)
