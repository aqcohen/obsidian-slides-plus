# Release v0.1.2: Markdown-Native YAML Schema

## What's New

### 🎨 Markdown-Native YAML Schema

This release replaces CSS-based frontmatter syntax with **user-friendly, Markdown-native properties**. No CSS knowledge required!

**Background Presets**

```yaml
background: sunset  # Instead of linear-gradient(...)
background: ocean
background: forest
```

**Text Styling**

```yaml
text-size: large        # Instead of font-size: 1.2em
text-align: center
text-color: white
```

**Colors**

```yaml
accent-color: purple    # Named colors or hex codes
background-color: dark
```

**Fonts**

```yaml
heading-font: serif     # Preset font families
body-font: sans
```

**Spacing**

```yaml
padding: large          # none | small | normal | large
```

### Available Presets

- **Backgrounds**: sunset, ocean, forest, fire, night, aurora, cosmic
- **Colors**: blue, red, green, purple, orange, pink, yellow, teal
- **Text sizes**: small, normal, large, huge
- **Fonts**: serif, sans, mono (plus specific font names)

### Backwards Compatibility

✅ Old `sp-*` custom properties still work  
✅ Custom CSS available via `custom-css:` for power users

### Documentation

- See [Frontmatter Reference](docs/frontmatter-reference.md) for complete documentation
- Check [test-yaml-schema.md](test-yaml-schema.md) for examples

---

**Full Changelog**: <https://github.com/aqcohen/obsidian-slides-plus/compare/v0.1.1...v0.1.2>
