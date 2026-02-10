# AGENTS.md

This file contains guidelines and commands for agentic coding agents working on the obsidian-slides-plus codebase.

## Build Commands

```bash
# Development build with file watching
npm run dev

# Production build (includes type checking)
npm run build

# Type checking only
tsc -noEmit -skipLibCheck

# Single test execution (from tests/ directory)
cd tests && npm test

# Watch mode for tests
cd tests && npm run test:watch

# Test coverage
cd tests && npm run test:coverage
```

## Project Structure

This is an Obsidian plugin for creating presentations. Key directories:
- `src/` - Main TypeScript source code
- `src/parser/` - Markdown parsing logic
- `src/views/` - UI components (preview, presentation, presenter)
- `src/engine/` - Rendering, theme, and layout engines
- `src/integrations/` - External integrations (Mermaid, LaTeX, Excalidraw)
- `src/export/` - PDF export functionality
- `src/editor/` - CodeMirror editor decorations
- `tests/` - Jest test suite with separate package.json

## Code Style Guidelines

### TypeScript Configuration
- Target: ES2018, Module: ESNext
- Strict mode enabled with `noImplicitAny` and `strictNullChecks`
- Use `import type` for type-only imports
- No implicit returns - always specify return types for public APIs

### Import Organization
```typescript
// 1. External libraries (obsidian, etc.)
import { Plugin, MarkdownView } from "obsidian";
import type { App } from "obsidian";

// 2. Internal modules (relative imports)
import { Slide, SlidesDeck } from "../types";
import { parseDeck } from "../parser/slideParser";
import { PreviewPanel } from "./previewPanel";
```

### Naming Conventions
- **Classes**: PascalCase (`SlideRenderEngine`, `PreviewPanel`)
- **Functions/Methods**: camelCase (`parseDeck`, `getSlideIndexAtLine`)
- **Constants**: UPPER_SNAKE_CASE for exports (`DEFAULT_DECK_CONFIG`, `PREVIEW_VIEW_TYPE`)
- **Interfaces**: PascalCase with descriptive names (`SlidesDeck`, `SlideFrontmatter`)
- **Private members**: prefix with `private` keyword

### File Naming
- Use kebab-case for files (`slide-parser.ts`, `preview-panel.ts`)
- Match file names to main export class/function
- Keep related functionality in the same directory

### Error Handling
- Use Obsidian's `Notice` class for user-facing messages
- Return null/undefined for expected failures in parsing functions
- Use try/catch for external API calls and file operations
- Validate inputs early and fail fast

### Frontmatter Processing
- Handle Windows line endings (`\r\n` → `\n`)
- Strip BOM characters (`\uFEFF`)
- Support both quoted and unquoted YAML values
- Maintain backwards compatibility with legacy properties

### Component Patterns
- Extend Obsidian's base classes (`ItemView`, `Component`)
- Use private fields for component state
- Clean up resources in `onDestroy()` methods
- Use `Component` for lifecycle management in dynamic content

### CSS and Styling
- Use BEM-style class naming for slide components
- Prefer CSS custom properties for theming
- Keep styles modular and scoped to specific views
- Support both light and dark themes

### Testing Guidelines
- Write tests for parsing logic and utility functions
- Mock Obsidian APIs in unit tests
- Test edge cases (empty input, malformed frontmatter)
- Use descriptive test names that explain the scenario

## Key Dependencies
- **obsidian**: Main plugin API
- **esbuild**: Build tool and bundler
- **typescript**: Type checking and compilation
- **@codemirror/***: Editor integration (imported as external)

## Development Notes
- The plugin uses esbuild for fast development builds
- TypeScript compilation is part of the production build process
- External Obsidian modules are marked as external in bundling
- Source maps are enabled in development mode
- Tests have their own package.json and dependencies

## Common Patterns

### Parser Functions
```typescript
export function parseDeck(markdown: string): SlidesDeck {
  // Normalize input first
  const normalized = markdown.replace(/\r\n/g, "\n");
  // Extract components
  // Return structured data
}
```

### View Components
```typescript
export class PreviewPanel extends ItemView {
  private renderEngine: SlideRenderEngine;
  
  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
    // Initialize engines and state
  }
  
  getViewType(): string {
    return PREVIEW_VIEW_TYPE;
  }
}
```

### Settings Management
- Use `PluginSettingTab` for settings UI
- Provide `DEFAULT_SETTINGS` constant
- Validate settings on load
- Use descriptive keys with clear types