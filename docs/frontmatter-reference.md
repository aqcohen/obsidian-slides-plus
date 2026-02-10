# Slides Plus — Frontmatter Reference

Quick reference for slide frontmatter properties. All properties are **optional** and use Markdown-friendly values (no CSS knowledge required).

## Basic Structure

```yaml
---
# Global deck config (top of file)
slides: true
theme: academic
transition: slide
aspectRatio: 16/9
---

# First slide content

---
# Per-slide frontmatter (after each --- separator)
layout: cover
background: sunset
text-size: large
---

# Second slide content
```

---

## Layout Options

```yaml
layout: default      # Top-aligned vertical flow
layout: cover        # Centered title slide
layout: center       # Everything centered
layout: two-cols     # Two equal columns
layout: image-right  # Content left, image right
layout: image-left   # Image left, content right
layout: section      # Large centered heading (section divider)
layout: quote        # Styled blockquote layout
layout: full         # No padding, full bleed
```

---

## Background Presets

Use preset names for common gradients and colors:

```yaml
background: sunset    # Gradient presets
background: ocean
background: forest
background: fire
background: night
background: aurora
background: cosmic

background: blue      # Named colors
background: purple
background: orange
background: teal

background: image.jpg # Or use image paths
background: "#ff5733" # Or custom hex colors
```

---

## Text Styling

```yaml
text-size: small      # 0.8em
text-size: normal     # 1em (default)
text-size: large      # 1.2em
text-size: huge       # 1.5em

text-align: left
text-align: center
text-align: right

text-color: white     # Named colors work
text-color: "#333"    # Or use hex codes
```

---

## Colors

Use preset names or hex codes:

```yaml
background-color: cream  # Override background color
accent-color: purple     # Accent color for highlights
text-color: white        # Text color

# Available color presets:
# blue, red, green, purple, orange, pink, yellow, teal
# white, black, gray, light-gray, dark-gray
```

---

## Fonts

Use preset names for common font families:

```yaml
heading-font: serif      # Lora, Georgia, serif
heading-font: sans       # Poppins, Arial, sans-serif
heading-font: mono       # Consolas, Monaco, monospace

body-font: serif
body-font: sans

# Or specific fonts:
heading-font: poppins
heading-font: lora
heading-font: georgia

# Or custom font families (for power users):
heading-font: "Custom Font, sans-serif"
```

---

## Spacing

```yaml
padding: none    # 0
padding: small   # 24px
padding: normal  # 48px (default)
padding: large   # 72px
```

---

## Advanced: Custom CSS

For power users who need full control:

```yaml
custom-css: |
  background: linear-gradient(45deg, red, blue);
  font-size: 2.5rem;
  filter: blur(2px);
```

**Note**: This is an escape hatch. Most users won't need this.

---

## Complete Example

```yaml
---
slides: true
theme: academic
transition: fade
---

# Presentation Title

---
layout: cover
background: sunset
text-size: huge
---

# Welcome

---
layout: two-cols
accent-color: teal
---

## Left Column

Content here

::right::

## Right Column

More content

---
layout: center
background-color: dark
text-color: white
text-size: large
heading-font: serif
---

## Styled Slide

Beautiful and simple!
```

---

## Migration from Old Syntax

If you have existing slides using CSS syntax, they still work:

```yaml
# Old syntax (still works)
sp-slide-bg: "#1a1a2e"
sp-font-heading: "Georgia, serif"

# New syntax (recommended)
background-color: "#1a1a2e"
heading-font: georgia
```

Both syntaxes can be mixed in the same file.
