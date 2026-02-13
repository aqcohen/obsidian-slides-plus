# Architecture

Understanding the Slides Plus architecture helps you extend and contribute to the project.

## High-Level Overview

```
User Input (Markdown)
        │
        ▼
┌───────────────────┐
│   Slide Parser    │  parseDeck() → SlidesDeck
│  (slideParser.ts) │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Render Engine    │  Slide → DOM
│(renderEngine.ts) │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Integrations     │  Mermaid, LaTeX, Excalidraw
│                   │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│   Theme Engine   │  CSS Variables
│ (themeEngine.ts) │
└───────────────────┘
        │
        ▼
    User View
```

## Core Modules

### Parser (`src/parser/`)

**slideParser.ts**
- `parseDeck(markdown: string): SlidesDeck`
- `getSlideIndexAtLine(markdown: string, line: number): number`

Parses Markdown with `---` separators into slide objects. Handles:
- Global frontmatter
- Per-slide frontmatter
- Speaker notes
- Fenced code blocks

### Engine (`src/engine/`)

**renderEngine.ts**
- `renderSlide(slide, container, deckConfig): Component`
- Creates DOM elements
- Applies frontmatter styles
- Triggers integrations

**themeEngine.ts**
- `applyTheme(themeName: string)`
- Loads CSS variables
- Handles theme switching

**layoutEngine.ts**
- `renderSlots(content, layout): ContentSlot[]`
- `getLayoutClass(layout): string`
- Handles `::right::` slot syntax

**transitionEngine.ts**
- Manages CSS transitions between slides

### Views (`src/views/`)

All views extend Obsidian's `ItemView`:

| View | Purpose |
|------|---------|
| PreviewPanel | Live preview in sidebar |
| PresentationView | Fullscreen presentation |
| PresenterView | Speaker view with notes |
| SlideNavigator | Thumbnail grid |

### Integrations (`src/integrations/`)

- **excalidrawEmbed.ts**: Render Excalidraw drawings
- **mermaidRenderer.ts**: Render Mermaid diagrams
- **latexRenderer.ts**: Render LaTeX math

## Data Flow

### Opening a Presentation

1. User opens note with `slides: true` frontmatter
2. Preview panel detects change via `editor-change` event
3. `parseDeck()` converts markdown to slides
4. `renderEngine` renders current slide
5. Integrations process special content (Mermaid, LaTeX, Excalidraw)

### Presenting

1. User clicks "Present" button
2. PresentationView opens in new window
3. Keyboard events navigate slides
4. TransitionEngine applies animations

## Key Types

```typescript
interface SlidesDeck {
  globalConfig: DeckConfig;
  slides: Slide[];
}

interface Slide {
  index: number;
  content: string;
  notes: string;
  frontmatter: SlideFrontmatter;
  raw: string;
}

interface DeckConfig {
  theme: string;
  transition: string;
  aspectRatio: string;
  highlightStyle: string;
  header?: string;
  footer?: string;
}
```

## Testing Strategy

- **Unit tests**: Parser, utilities (Vitest)
- **Integration tests**: View components (manual)
- **E2E**: Full workflow (manual)

See [Testing Guide](./testing.md) for details.

## Extending Slides Plus

### Adding a New Theme

1. Add CSS to `styles.css`
2. Register in theme engine (future)
3. Document in docs

### Adding a New Layout

1. Add CSS grid template in `styles.css`
2. Update layout engine if needed

### Adding a New Integration

See [Extending Guide](./extending.md).

## Related

- [Extending Slides Plus](./extending.md)
- [Testing](./testing.md)
