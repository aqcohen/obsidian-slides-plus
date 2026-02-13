# API Reference

Technical reference for Slides Plus internals.

## Types

### SlidesDeck

```typescript
interface SlidesDeck {
  globalConfig: DeckConfig;
  slides: Slide[];
}
```

### Slide

```typescript
interface Slide {
  index: number;
  content: string;
  notes: string;
  frontmatter: SlideFrontmatter;
  raw: string;
}
```

### SlideFrontmatter

```typescript
interface SlideFrontmatter {
  layout?: string;
  background?: string;
  transition?: string;
  'accent-color'?: string;
  'text-size'?: 'small' | 'normal' | 'large' | 'huge';
  'text-align'?: 'left' | 'center' | 'right';
  'heading-font'?: string;
  padding?: 'none' | 'small' | 'normal' | 'large';
  class?: string;
}
```

### DeckConfig

```typescript
interface DeckConfig {
  theme: string;
  transition: string;
  aspectRatio: string;
  highlightStyle: string;
  header?: string;
  footer?: string;
}
```

## Functions

### parseDeck

```typescript
function parseDeck(markdown: string): SlidesDeck
```

Parses a Markdown string into a deck of slides.

**Parameters:**
- `markdown` - Raw markdown content

**Returns:** `SlidesDeck` object containing global config and slides array

### getSlideIndexAtLine

```typescript
function getSlideIndexAtLine(markdown: string, line: number): number
```

Finds which slide contains the given line number.

**Parameters:**
- `markdown` - Raw markdown content
- `line` - Line number (0-indexed)

**Returns:** Slide index (0-based)

### isSlidesFile

```typescript
function isSlidesFile(content: string): boolean
```

Checks if content has `slides: true` in frontmatter.

**Parameters:**
- `content` - Raw markdown content

**Returns:** `true` if it's a slides file

## View Classes

### PreviewPanel

```typescript
class PreviewPanel extends ItemView {
  constructor(leaf: WorkspaceLeaf);
  async onOpen(): Promise<void>;
  async onClose(): Promise<void>;
}
```

### PresentationView

```typescript
class PresentationView extends ItemView {
  constructor(leaf: WorkspaceLeaf);
  async setDeck(deck: SlidesDeck, sourcePath: string): Promise<void>;
  navigate(direction: number): void;
}
```

### PresenterView

```typescript
class PresenterView extends ItemView {
  constructor(leaf: WorkspaceLeaf);
  async setDeck(deck: SlidesDeck, sourcePath: string): Promise<void>;
  resetTimer(): void;
}
```

## Engine Classes

### SlideRenderEngine

```typescript
class SlideRenderEngine {
  constructor(app: App, sourcePath: string);
  async renderSlide(slide: Slide, container: HTMLElement, deckConfig: DeckConfig): Promise<Component>;
  applyFrontmatterStyles(slideEl: HTMLElement, frontmatter: SlideFrontmatter): void;
  applyBackground(slideEl: HTMLElement, frontmatter: SlideFrontmatter): void;
}
```

### ThemeEngine

```typescript
class ThemeEngine {
  applyTheme(themeName: string): void;
  getCurrentTheme(): string;
  destroy(): void;
}
```
