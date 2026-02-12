# v0.1.4: PDF Export Redesign + Theme & Fragment Improvements

## PDF Export — Complete Rewrite

The PDF export has been rebuilt from scratch. The old approach (Electron's `window.print()`) was blocked by Obsidian's plugin sandbox.

**New approach:**
1. Run **Export slides to PDF** from the command palette
2. A self-contained HTML file opens in your system browser
3. Press `Cmd/Ctrl + P` → Save as PDF

**What's included in the exported HTML:**
- All slide content with correct layouts
- Theme styles with dark/light mode support
- LaTeX math with embedded MathJax fonts (base64-inlined)
- Mermaid diagrams
- Excalidraw drawings (SVG)
- Google Fonts used by themes
- Print-optimized CSS (`@page landscape`, page breaks)

## Theme Dark Mode in Exports

Exported HTML now respects your current Obsidian dark/light mode. If you're using dark mode with the `academic` theme, the export renders with the dark palette.

## Fragment Support

- Incremental reveal with `fragments: true` in per-slide frontmatter
- Keyboard navigation: arrow keys advance/retreat fragments before changing slides
- Presenter view syncs fragment state
- Fragments are always fully visible in PDF exports

## Excalidraw Fix

- Fixed Excalidraw SVG rendering — uses correct `ea.createSVG(path)` API

## Theme Redesign

- All 6 themes (obsidian, midnight, paper, boardroom, academic, studio) redesigned with intentional palettes and font pairings

---

**Full Changelog**: <https://github.com/aqcohen/obsidian-slides-plus/compare/v0.1.2...v0.1.4>
