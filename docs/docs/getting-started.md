# Getting Started

This guide will help you install and create your first presentation with Slides Plus.

## Installation

### From Obsidian Community Plugins

1. Open **Obsidian** → **Settings** → **Community plugins**
2. Click **Browse** and search for "Slides Plus"
3. Click **Install** and then **Enable**

### Manual Installation

1. Download the latest release from [GitHub](https://github.com/aqcohen/obsidian-slides-plus/releases)
2. Extract the files to your vault's `.obsidian/plugins/obsidian-slides-plus/` folder
3. Reload Obsidian
4. Enable the plugin in Settings → Community plugins

## Creating Your First Presentation

### Step 1: Create a New Note

Create a new note in your vault (e.g., `presentation.md`).

### Step 2: Add Frontmatter

Add the required frontmatter at the top of your file:

```markdown
---
slides: true
---
```

### Step 3: Write Your Slides

Use `---` to separate slides:

```markdown
---
slides: true
---

# Welcome to My Presentation

---

## Agenda

- Introduction
- Main Content
- Conclusion

---

## Introduction

This is my first slide presentation!

<!-- This is a speaker note that only you will see in presenter view -->
```

### Step 4: Open the Preview Panel

1. Open the command palette (`Ctrl/Cmd + P`)
2. Search for "Open slide preview panel"
3. Click to open the preview

### Step 5: Start Presenting

1. Click the **Present** button in the preview panel
2. Your presentation opens in fullscreen
3. Use arrow keys to navigate
4. Press `Esc` to exit

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `→` or `Space` | Next slide |
| `←` | Previous slide |
| `Home` | First slide |
| `End` | Last slide |
| `Esc` | Exit presentation |
| `F` | Toggle fullscreen |
| `T` | Toggle timer |

## Next Steps

- Learn about [Themes](./themes.md) to customize the look
- Explore [Layouts](./layouts.md) for different slide structures
- Check out [Integrations](./integrations.md) for Excalidraw, Mermaid, and LaTeX
