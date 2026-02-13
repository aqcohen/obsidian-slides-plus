# Render Engine API

Documentation for the rendering system.

## SlideRenderEngine

Main class for rendering slides to DOM.

```typescript
import { SlideRenderEngine } from '../src/engine/renderEngine';

const engine = new SlideRenderEngine(app, sourcePath);
const component = await engine.renderSlide(slide, container, deckConfig);
```

## Methods

### renderSlide

```typescript
async renderSlide(
  slide: Slide,
  container: HTMLElement,
  deckConfig: DeckConfig
): Promise<Component>
```

Renders a single slide into the given container.

**Process:**
1. Create slide wrapper element
2. Apply frontmatter styles
3. Apply background
4. Render markdown content
5. Process integrations (Excalidraw, Mermaid, LaTeX)
6. Return component for lifecycle management

### applyFrontmatterStyles

```typescript
applyFrontmatterStyles(
  slideEl: HTMLElement,
  frontmatter: SlideFrontmatter
): void
```

Applies per-slide styling:
- text-size
- text-align
- heading-font
- padding

### applyBackground

```typescript
applyBackground(
  slideEl: HTMLElement,
  frontmatter: SlideFrontmatter
): void
```

Applies background:
- Color (`#ff0000`)
- Gradient preset (`sunset`, `ocean`, etc.)
- Image URL

## Integration Pipeline

### Order

1. Pre-process: Extract special syntax (Excalidraw)
2. MarkdownRenderer: Render markdown to HTML
3. Post-process: Resolve integrations

### Adding Integration

```typescript
// 1. Pre-process in your module
const { markdown, embeds } = preprocessMyEmbed(markdown);

// 2. Call MarkdownRenderer
await MarkdownRenderer.render(app, markdown, container, sourcePath, component);

// 3. Post-process
await resolveMyEmbed(app, container, embeds);
```

## Lifecycle

The returned Component manages cleanup:

```typescript
const component = await engine.renderSlide(slide, container, config);

// When done:
component.unload(); // Cleans up integration components
```

## Theme Application

Themes are applied via CSS custom properties:

```css
:root[data-theme="obsidian"] {
  --sp-bg-primary: #ffffff;
  --sp-text-primary: #1a1a1a;
}
```

The ThemeEngine sets the data attribute on the slide container.
