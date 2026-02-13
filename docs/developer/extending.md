# Extending Slides Plus

This guide explains how to extend Slides Plus with new features.

## Extension Points

### Adding New Themes

Themes are CSS-based. To add a new theme:

```css
/* In styles.css */
:root[data-theme="my-theme"] {
  --sp-bg-primary: #ffffff;
  --sp-text-primary: #1a1a1a;
  --sp-accent: #3b82f6;
  --sp-font-heading: 'My Font', sans-serif;
}
```

Register in frontmatter:

```yaml
---
theme: my-theme
---
```

### Adding New Layouts

1. Add CSS in `styles.css`:

```css
.sp-layout-my-layout {
  display: grid;
  grid-template-rows: auto 1fr;
  padding: 2rem;
}
```

2. Use in frontmatter:

```yaml
---
layout: my-layout
---
```

### Adding New Integrations

#### Step 1: Create Integration Module

```typescript
// src/integrations/myIntegration.ts
export function preprocessMyIntegration(markdown: string): { markdown: string; data: MyData[] } {
  // Extract special syntax from markdown
}

export async function resolveMyIntegration(
  app: App,
  container: HTMLElement,
  data: MyData[]
): Promise<void> {
  // Render the integration into the container
}
```

#### Step 2: Hook into Render Pipeline

In `renderEngine.ts`:

```typescript
// After MarkdownRenderer.render()
const { markdown, data } = preprocessMyIntegration(slideContent);
await renderMarkdownContent(markdown, container, component);
await resolveMyIntegration(this.app, container, data);
```

### Adding Custom Transitions

```typescript
// In transitionEngine.ts
const transitions = {
  slide: 'transform 0.3s ease',
  fade: 'opacity 0.3s ease',
  myCustom: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
};
```

Add to frontmatter:

```yaml
---
transition: myCustom
---
```

## Plugin Events

Future: Event system for extensibility:

```typescript
// Planned API
app.plugins.registerEvent('slides:slide-change', (slide) => {
  // Do something on slide change
});
```

## Contributing Extensions

1. Fork the repository
2. Add your feature
3. Write tests
4. Submit a PR

## Best Practices

1. **Follow existing patterns** - Match the code style
2. **Add tests** - Especially for parser/logic changes
3. **Document** - Update docs for user-facing features
4. **Be backward compatible** - Don't break existing presentations
