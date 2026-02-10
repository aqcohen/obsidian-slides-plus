# v0.1.2: Markdown-Native YAML Schema + Academic Theme Improvements

## 🎨 New Features

### Markdown-Native YAML Schema

User-friendly frontmatter properties (no CSS knowledge required):

**Background Presets**

```yaml
background: sunset  # Gradient presets
background: ocean
background: forest
```

**Text Styling**

```yaml
text-size: large        # small | normal | large | huge
text-align: center
text-color: white
```

**Colors & Fonts**

```yaml
accent-color: purple    # Named colors or hex codes
heading-font: serif     # Preset font families
body-font: sans
```

**Available Presets:**

- **Backgrounds**: sunset, ocean, forest, fire, night, aurora, cosmic
- **Colors**: blue, red, green, purple, orange, pink, yellow, teal
- **Text sizes**: small, normal, large, huge
- **Fonts**: serif, sans, mono (plus specific font names)

## 🎓 Academic Theme Improvements

- **Better typography**: 26px base font, weight 700 headings
- **Enhanced readability**: Optimized line-height (1.65) for serif body text
- **Refined colors**: Warmer cream background (#fdfcf9), improved contrast
- **Italic emphasis**: Accent color for emphasis in body text
- **Letter-spacing**: Optical adjustments for headings (-0.02em)

## 📊 Table Styles

Tables now render properly with:

- Clean borders and headers
- Striped rows for readability  
- Responsive sizing
- Theme-aware colors

## Backwards Compatibility

✅ Old `sp-*` custom properties still work  
✅ Custom CSS available via `custom-css:` for power users

## Documentation

- [Frontmatter Reference](docs/frontmatter-reference.md) - Complete guide
- [test-yaml-schema.md](test-yaml-schema.md) - Examples

---

**Full Changelog**: <https://github.com/aqcohen/obsidian-slides-plus/compare/v0.1.1...v0.1.2>
