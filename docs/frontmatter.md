# Frontmatter Reference

Complete reference for all frontmatter options in Slides Plus.

## Global Frontmatter

Set at the top of your file, before the first `---` separator:

```yaml
---
slides: true
theme: obsidian
transition: slide
aspectRatio: 16/9
highlightStyle: github
header: "Optional Header"
footer: "Optional Footer"
---
```

### Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `slides` | boolean | required | Must be `true` to activate |
| `theme` | string | `"obsidian"` | Theme name |
| `transition` | string | `"slide"` | Transition type |
| `aspectRatio` | string | `"16/9"` | Slide aspect ratio |
| `highlightStyle` | string | `"github"` | Code highlighting style |
| `header` | string | - | Header text (appears on all slides) |
| `footer` | string | - | Footer text (appears on all slides) |

## Per-Slide Frontmatter

Customize individual slides:

```yaml
---
layout: cover
background: sunset
transition: fade
---

# Title Slide
```

### Options

| Property | Type | Description |
|----------|------|-------------|
| `layout` | string | Layout name (default, cover, center, etc.) |
| `background` | string | Background color, gradient, or preset |
| `transition` | string | Override transition for this slide |
| `accent-color` | string | Accent color for this slide |
| `text-size` | string | Text size: small, normal, large, huge |
| `text-align` | string | Text alignment: left, center, right |
| `heading-font` | string | Heading font family |
| `padding` | string | Padding: none, small, normal, large |
| `class` | string | Additional CSS class |

## Background Presets

### Gradients

```yaml
background: sunset    # Orange to purple
background: ocean    # Blue gradient
background: forest    # Green gradient
background: fire      # Red to orange
background: night     # Dark blue
background: aurora    # Green to purple
background: cosmic   # Purple to blue
```

### Colors

```yaml
background: "#ff0000"  # Hex color
background: "red"      # Named color
background: "rgba(0,0,0,0.5)"  # RGBA
```

### Images

```yaml
background: "url(https://example.com/image.jpg)"
```

## Text Size

```yaml
text-size: small   # 0.8em
text-size: normal # 1em (default)
text-size: large  # 1.25em
text-size: huge   # 1.5em
```

## Text Alignment

```yaml
text-align: left
text-align: center
text-align: right
```

## Padding

```yaml
padding: none    # 0
padding: small   # 16px
padding: normal  # 32px
padding: large   # 64px
```

## Custom CSS

Add custom CSS classes:

```yaml
class: "my-custom-class"
```

Then in a CSS snippet:

```css
.slide.my-custom-class {
  /* Custom styles */
}
```

## Examples

### Title Slide

```yaml
---
layout: cover
background: sunset
accent-color: "#f59e0b"
---

# My Presentation

## Subtitle
```

### Two-Column Layout

```yaml
---
layout: two-cols
background: "#1e293b"
text-color: "#ffffff"
---

## Left Content

::right::

## Right Content
```

### Section Divider

```yaml
---
layout: section
background: cosmic
---

# Part 2

Deep Dive
```

## Related

- [Themes](./themes.md)
- [Layouts](./layouts.md)
- [Features](./features.md)
