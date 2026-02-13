# Development Setup

This guide walks through setting up a local development environment for Slides Plus.

## Prerequisites

- **Node.js** 18+ 
- **npm** 9+
- **Git**
- **Obsidian** (for testing)

## Clone the Repository

```bash
git clone https://github.com/aqcohen/obsidian-slides-plus.git
cd obsidian-slides-plus
```

## Install Dependencies

```bash
npm install
```

## Development Workflow

### Start Development Server

```bash
npm run dev
```

This starts esbuild in watch mode. Changes to `src/` are automatically compiled.

### Build for Production

```bash
npm run build
```

This runs TypeScript type checking and creates the production build.

### Run Tests

```bash
npm test           # Run tests once
npm run test:watch # Watch mode
npm run test:coverage # With coverage report
```

## Loading the Plugin in Obsidian

### Method 1: Symlink

Create a symlink from your vault's plugins folder:

```bash
# On macOS/Linux
ln -s /path/to/obsidian-slides-plus /path/to/vault/.obsidian/plugins/obsidian-slides-plus

# On Windows (PowerShell)
New-Item -ItemType SymbolicLink -Path "vault\.obsidian\plugins\obsidian-slides-plus" -Target "path\to\obsidian-slides-plus"
```

### Method 2: Manual Copy

After building, copy the following files to your vault's plugin folder:

- `main.js`
- `manifest.json`
- `styles.css`

## Reloading the Plugin

After making changes:

1. Run `npm run dev` or `npm run build`
2. In Obsidian: Settings → Community plugins → Reload (button for Slides Plus)

## IDE Setup

### VS Code

The project includes TypeScript configuration. Just open in VS Code:

```bash
code .
```

### Recommended Extensions

- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)

## Troubleshooting

### Build fails

- Ensure Node.js 18+ is installed: `node --version`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Plugin not loading

- Check Obsidian console for errors: View → Toggle Developer Tools → Console
- Verify all required files exist in the plugins folder

### TypeScript errors

Run type check separately:

```bash
tsc -noEmit -skipLibCheck
```

## Next Steps

- Read [Architecture Overview](./architecture.md)
- Learn about [Testing](./testing.md)
