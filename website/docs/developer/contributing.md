# Contributing to Slides Plus

Thank you for your interest in contributing!

## Ways to Contribute

- 🐛 **Bug reports** - Help us find and fix issues
- 💡 **Feature requests** - Suggest new functionality
- 📖 **Documentation** - Improve guides and examples
- 💻 **Code contributions** - Add features or fix bugs
- 🎨 **Themes** - Create new themes for the community

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Submit a pull request

## Development Setup

See [Development Setup](./developer/setup.md) for detailed instructions.

## Code Style

We follow these conventions:

### TypeScript

- Strict mode enabled
- Use `import type` for type-only imports
- Explicit return types for public APIs
- Private keyword for encapsulation

### Naming

- **Classes**: PascalCase (`SlideRenderEngine`)
- **Functions**: camelCase (`parseDeck`)
- **Constants**: UPPER_SNAKE_CASE for exports

### File Organization

```
// 1. External libraries
import { Plugin, MarkdownView } from "obsidian";

// 2. Internal modules
import { Slide, SlidesDeck } from "../types";
import { parseDeck } from "../parser/slideParser";
```

## Commit Messages

Follow conventional commits:

```
feat: add new feature
fix: resolve a bug
docs: update documentation
test: add or fix tests
refactor: restructure code without behavior change
chore: maintenance tasks
```

## Pull Request Process

1. **Test locally** - Run `npm test` and `npm run build`
2. **Update docs** - If adding features, update relevant docs
3. **Describe changes** - Explain what/why/how in PR description
4. **Keep it focused** - One feature or fix per PR

## Issue Guidelines

### Bug Reports

Include:
- Steps to reproduce
- Expected vs actual behavior
- Obsidian version
- Plugin version

### Feature Requests

Include:
- Use case description
- Proposed solution
- Alternative approaches considered

## Recognition

Contributors will be:
- Added to README.md
- Listed in release notes

## Code of Conduct

Be respectful and inclusive. Follow Obsidian's community guidelines.

## Questions?

- Open a [discussion](https://github.com/aqcohen/obsidian-slides-plus/discussions)
- Check existing [issues](https://github.com/aqcohen/obsidian-slides-plus/issues)
