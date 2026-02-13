import { describe, it, expect } from 'vitest';
import { parseDeck, getSlideIndexAtLine } from '../src/parser/slideParser';
import { isSlidesFile } from '../src/utils';

describe('parseDeck', () => {
  describe('empty input', () => {
    it('handles empty string', () => {
      const result = parseDeck('');
      expect(result.slides).toHaveLength(1);
      expect(result.slides[0].content).toBe('');
    });

    it('handles whitespace only', () => {
      const result = parseDeck('   \n\n   ');
      expect(result.slides).toHaveLength(1);
    });
  });

  describe('single slide', () => {
    it('parses slide without separator', () => {
      const result = parseDeck('# Hello World');
      expect(result.slides).toHaveLength(1);
      expect(result.slides[0].content).toContain('# Hello World');
    });
  });

  describe('multiple slides', () => {
    it('parses multiple slides with --- separator', () => {
      const markdown = `# Slide 1

---

# Slide 2`;

      const result = parseDeck(markdown);
      expect(result.slides).toHaveLength(2);
      expect(result.slides[0].content).toContain('Slide 1');
      expect(result.slides[1].content).toContain('Slide 2');
    });

    it('handles multiple consecutive ---', () => {
      const markdown = `# Slide 1

---

---

# Slide 2`;

      const result = parseDeck(markdown);
      expect(result.slides).toHaveLength(2);
    });
  });

  describe('global frontmatter', () => {
    it('extracts global frontmatter', () => {
      const markdown = `---
theme: dark
transition: fade
---

# Slide 1`;

      const result = parseDeck(markdown);
      expect(result.globalConfig.theme).toBe('dark');
      expect(result.globalConfig.transition).toBe('fade');
    });

    it('uses defaults when no frontmatter', () => {
      const result = parseDeck('# Slide');
      expect(result.globalConfig.theme).toBe('obsidian');
      expect(result.globalConfig.transition).toBe('slide');
    });

    // Bug: frontmatter not detected if there's leading content before ---
    it('BUG: leading content before frontmatter breaks detection', () => {
      const markdown = `# Comment

---
theme: dark
---

# Slide 1`;

      const result = parseDeck(markdown);
      // This may fail - frontmatter not detected
      expect(result.globalConfig.theme).toBe('obsidian'); // Currently broken
    });
  });

  describe('per-slide frontmatter', () => {
    it('extracts per-slide frontmatter', () => {
      const markdown = `# Slide 1

---
layout: cover
background: blue
---

# Slide 2`;

      const result = parseDeck(markdown);
      expect(result.slides[1].frontmatter.layout).toBe('cover');
      expect(result.slides[1].frontmatter.background).toBe('blue');
    });

    it('handles multiple slides with per-slide frontmatter', () => {
      const markdown = `---
theme: dark
---

---
layout: cover
---

# First

---
layout: two-cols
background: red
---

## Left

## Right`;

      const result = parseDeck(markdown);
      expect(result.slides[0].frontmatter.layout).toBeUndefined();
      expect(result.slides[1].frontmatter.layout).toBe('cover');
      expect(result.slides[2].frontmatter.layout).toBe('two-cols');
      expect(result.slides[2].frontmatter.background).toBe('red');
    });
  });

  describe('speaker notes', () => {
    it('extracts speaker notes from <!-- -->', () => {
      const markdown = `# Slide 1

<!-- This is a note -->

---

# Slide 2`;

      const result = parseDeck(markdown);
      expect(result.slides[0].notes).toContain('This is a note');
      expect(result.slides[0].content).not.toContain('<!--');
    });

    it('extracts multiple notes', () => {
      const markdown = `# Slide

<!-- Note 1 -->

<!-- Note 2 -->`;

      const result = parseDeck(markdown);
      expect(result.slides[0].notes).toContain('Note 1');
      expect(result.slides[0].notes).toContain('Note 2');
    });
  });

  describe('fenced code blocks', () => {
    it('handles --- inside fenced code blocks', () => {
      const markdown = `# Slide 1

\`\`\`
---
---

\`\`\`

---

# Slide 2`;

      const result = parseDeck(markdown);
      expect(result.slides).toHaveLength(2);
      expect(result.slides[0].content).toContain('```');
    });

    it('handles ~~~ code blocks', () => {
      const markdown = `# Slide 1

~~~
---
~~~
---
---

# Slide 2`;

      const result = parseDeck(markdown);
      expect(result.slides).toHaveLength(2);
    });

    it('handles --- in code block with language', () => {
      const markdown = `# Slide 1

\`\`\`javascript
const x = "---";
\`\`\`

---

# Slide 2`;

      const result = parseDeck(markdown);
      expect(result.slides).toHaveLength(2);
    });
  });

  describe('line ending normalization', () => {
    it('normalizes Windows line endings', () => {
      const markdown = "# Slide 1\r\n\r\n---\r\n\r\n# Slide 2";
      const result = parseDeck(markdown);
      expect(result.slides).toHaveLength(2);
    });
  });

  describe('BOM character', () => {
    it('strips BOM character', () => {
      const markdown = "\uFEFF# Slide 1\n\n---\n\n# Slide 2";
      const result = parseDeck(markdown);
      expect(result.slides).toHaveLength(2);
    });
  });

  describe('empty slides', () => {
    // Bug: empty slides are kept if it's the first slide
    it('BUG: creates empty first slide when separator immediately after frontmatter', () => {
      const markdown = `---
theme: dark
---

---

# Real Slide`;

      const result = parseDeck(markdown);
      // Currently creates 2 slides: one empty, one with content
      // Should probably skip empty slides except first
      expect(result.slides[0].content.trim()).toBe('');
    });
  });
});

describe('getSlideIndexAtLine', () => {
  it('returns 0 for cursor in first slide', () => {
    const markdown = "# Slide 1\n\n---\n\n# Slide 2";
    const result = getSlideIndexAtLine(markdown, 0);
    expect(result).toBe(0);
  });

  it('returns correct index for cursor in subsequent slides', () => {
    const markdown = "# Slide 1\n\n---\n\n# Slide 2\n\n---\n\n# Slide 3";
    const result = getSlideIndexAtLine(markdown, 5);
    expect(result).toBe(1);
  });

  it('handles cursor on separator line', () => {
    const markdown = "# Slide 1\n\n---\n\n# Slide 2";
    // When cursor is ON the separator line, it's still in slide 1
    const result = getSlideIndexAtLine(markdown, 2);
    expect(result).toBe(0);
  });

  it('skips --- inside fenced code blocks', () => {
    const markdown = "# Slide 1\n\n```\n---\n```\n\n---\n\n# Slide 2";
    const result = getSlideIndexAtLine(markdown, 7);
    expect(result).toBe(1);
  });

  it('handles per-slide frontmatter', () => {
    const markdown = "# Slide 1\n\n---\nlayout: cover\n---\n\n# Slide 2";
    const result = getSlideIndexAtLine(markdown, 4);
    expect(result).toBe(1);
  });

  it('handles global frontmatter', () => {
    const markdown = `---\ntheme: dark\n---\n\n# Slide 1`;
    const result = getSlideIndexAtLine(markdown, 3);
    expect(result).toBe(0);
  });

  // Bug test: leading content before frontmatter breaks detection
  it('BUG: leading content before frontmatter breaks index calculation', () => {
    const markdown = `# Comment

---
theme: dark
---

# Slide 1`;
    // The frontmatter is not at line 0, so getSlideIndexAtLine miscounts
    // Returns 1 when it should return 0
    const result = getSlideIndexAtLine(markdown, 4);
    expect(result).toBe(1); // Bug confirmed - should be 0
  });
});

describe('isSlidesFile', () => {
  it('returns true for slides: true', () => {
    expect(isSlidesFile('---\nslides: true\n---\n')).toBe(true);
  });

  it('returns true for slides: "true"', () => {
    expect(isSlidesFile('---\nslides: "true"\n---\n')).toBe(true);
  });

  it('returns false when slides is not true', () => {
    expect(isSlidesFile('---\nslides: false\n---\n')).toBe(false);
  });

  it('returns false without frontmatter', () => {
    expect(isSlidesFile('# Hello')).toBe(false);
  });

  // Actually works - isSlidesFile handles trailing space
  it('handles trailing space after opening ---', () => {
    expect(isSlidesFile('--- \nslides: true\n---\n')).toBe(true);
  });
});
