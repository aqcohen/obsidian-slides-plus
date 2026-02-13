# Developer Guide

Welcome to the Slides Plus developer documentation. This guide covers how to set up a development environment, understand the architecture, and extend the plugin.

## Overview

Slides Plus is an Obsidian plugin written in TypeScript. It uses:

- **TypeScript** for type-safe JavaScript
- **esbuild** for fast builds
- **Vitest** for testing
- **Obsidian API** for plugin functionality

## Quick Links

- [GitHub Repository](https://github.com/aqcohen/obsidian-slides-plus)
- [Issue Tracker](https://github.com/aqcohen/obsidian-slides-plus/issues)
- [Discussions](https://github.com/aqcohen/obsidian-slides-plus/discussions)

## Project Structure

```
obsidian-slides-plus/
├── src/
│   ├── main.ts              # Plugin entry point
│   ├── settings.ts           # Settings management
│   ├── types.ts             # TypeScript types
│   ├── parser/              # Markdown parsing
│   ├── engine/              # Rendering & theming
│   ├── views/               # UI components
│   ├── editor/              # CodeMirror extensions
│   ├── integrations/        # External integrations
│   └── export/               # PDF export
├── tests/                   # Test suite
├── website/                  # Documentation site
├── styles.css              # All styles
└── manifest.json           # Plugin manifest
```

## Key Concepts

### Slide Parsing

The parser converts Markdown to slide objects:

```typescript
interface Slide {
  index: number;
  content: string;
  notes: string;
  frontmatter: SlideFrontmatter;
  raw: string;
}
```

### Rendering Pipeline

1. Parse markdown → `SlidesDeck`
2. Apply theme → CSS variables
3. Render slide → DOM elements
4. Process integrations → Mermaid, LaTeX, Excalidraw
5. Apply transitions → CSS animations

### View Architecture

- **PreviewPanel**: Live preview in sidebar (ItemView)
- **PresentationView**: Fullscreen presentation
- **PresenterView**: Speaker view with notes
- **SlideNavigator**: Thumbnail grid

## Technology Stack

| Component | Technology |
|-----------|------------|
| Language | TypeScript |
| Build | esbuild |
| Testing | Vitest |
| Styling | CSS |
| Rendering | Obsidian MarkdownRenderer |
| PDF | Browser Print API |

## Getting Help

- Check existing [issues](https://github.com/aqcohen/obsidian-slides-plus/issues)
- Search [discussions](https://github.com/aqcohen/obsidian-slides-plus/discussions)
- Ask in the community

## Next Steps

1. [Setup Development Environment](./setup.md)
2. [Understand the Architecture](./architecture.md)
3. [Learn How to Extend](./extending.md)
4. [Write Tests](./testing.md)
5. [Contribute](./contributing.md)
