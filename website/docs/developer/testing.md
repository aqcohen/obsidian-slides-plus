# Testing Guide

Slides Plus uses Vitest for testing. This guide covers writing tests.

## Running Tests

```bash
npm test           # Run tests once
npm run test:watch # Watch mode during development
npm run test:coverage # With coverage report
```

## Test Structure

```
tests/
├── slideParser.test.ts  # Parser tests
├── utils.test.ts        # Utility tests
└── __mocks__/          # Mock files
    └── obsidian.ts     # Obsidian API mocks
```

## Writing Tests

### Example: Testing the Parser

```typescript
import { describe, it, expect } from 'vitest';
import { parseDeck, getSlideIndexAtLine } from '../src/parser/slideParser';

describe('parseDeck', () => {
  it('handles empty string', () => {
    const result = parseDeck('');
    expect(result.slides).toHaveLength(1);
  });

  it('parses multiple slides', () => {
    const markdown = '# Slide 1\n\n---\n\n# Slide 2';
    const result = parseDeck(markdown);
    expect(result.slides).toHaveLength(2);
  });
});
```

### Example: Testing Utils

```typescript
import { describe, it, expect } from 'vitest';
import { isSlidesFile } from '../src/utils';

describe('isSlidesFile', () => {
  it('returns true for slides: true', () => {
    expect(isSlidesFile('---\nslides: true\n---\n')).toBe(true);
  });
});
```

## Test Coverage

Current coverage: **94%+**

We require **80% minimum** coverage on the parser module.

### Viewing Coverage

```bash
npm run test:coverage
```

This generates a report in `coverage/`.

## Mocking Obsidian APIs

For tests that need Obsidian types:

```typescript
// tests/__mocks__/obsidian.ts
export const MockApp = {
  metadataCache: {
    getFirstLinkpathDest: () => null,
  },
};

export const MockComponent = {
  load: () => {},
  unload: () => {},
};
```

## Test Best Practices

1. **Test edge cases** - Empty input, malformed frontmatter
2. **Test real-world scenarios** - What users actually write
3. **Name tests descriptively** - `it('extracts speaker notes from <!-- -->')`
4. **Keep tests independent** - No order dependency
5. **Cover failure paths** - What happens when things go wrong

## CI Integration

Tests run automatically on tagged releases via GitHub Actions.

```yaml
# In .github/workflows/release.yml
- name: Run tests
  run: |
    cd tests
    npm install
    npm run test:coverage
```

## Adding New Tests

1. Create `tests/yourModule.test.ts`
2. Import the module under test
3. Write describe/it blocks
4. Run `npm test` to verify
