# Parser API

Detailed documentation for the slide parser module.

## parseDeck

Main entry point for parsing markdown into slides.

```typescript
import { parseDeck } from '../src/parser/slideParser';

const deck = parseDeck(markdownString);
console.log(deck.slides.length); // number of slides
console.log(deck.globalConfig.theme); // theme from frontmatter
```

## Input Format

The parser expects standard markdown with `---` separators:

```markdown
---
slides: true
theme: dark
---

# Slide 1 Content

---

## Slide 2 Content

<!-- Speaker notes here -->
```

## Output: SlidesDeck

```typescript
{
  globalConfig: {
    theme: 'dark',
    transition: 'slide',
    aspectRatio: '16/9',
    highlightStyle: 'github'
  },
  slides: [
    {
      index: 0,
      content: '# Slide 1 Content',
      notes: '',
      frontmatter: {},
      raw: '# Slide 1 Content'
    },
    {
      index: 1,
      content: '## Slide 2 Content',
      notes: 'Speaker notes here',
      frontmatter: {},
      raw: '## Slide 2 Content\n\n<!-- Speaker notes here -->'
    }
  ]
}
```

## Per-Slide Frontmatter

The parser extracts per-slide frontmatter:

```markdown
---

layout: cover
background: sunset

---
```

Becomes:

```typescript
{
  index: 1,
  content: '...',
  frontmatter: {
    layout: 'cover',
    background: 'sunset'
  }
}
```

## Speaker Notes

Extracted from HTML comments:

```markdown
<!-- Note for presenter -->
```

## Edge Cases

### Fenced Code Blocks

```markdown
---

```javascript
const x = "---";
```

---

# Next slide
```

The `---` inside code blocks is NOT treated as a separator.

### Windows Line Endings

Automatically normalized to Unix `\n`.

### BOM Character

Automatically stripped from input.

## getSlideIndexAtLine

Maps cursor position to slide index:

```typescript
const line = editor.getCursor().line;
const slideIndex = getSlideIndexAtLine(markdown, line);
```

Used for syncing preview panel with editor cursor.
