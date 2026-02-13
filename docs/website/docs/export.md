# Export to PDF

Export your presentations to PDF for sharing and printing.

## Method 1: Browser Print (Recommended)

### Steps

1. Open your presentation in Slides Plus
2. Click **Present** to enter presentation mode
3. Right-click and select **Print** (or press `Ctrl/Cmd + P`)
4. Choose "Save as PDF" as the destination

### Print Settings

For best results:

- **Orientation**: Landscape
- **Margins**: None
- **Background graphics**: Checked
- **Scale**: Default

### CSS Print Styles

Slides Plus includes optimized `@media print` styles:

```css
@media print {
  .sp-slide {
    page-break-after: always;
    break-after: always;
  }
  
  .sp-slide:last-child {
    page-break-after: avoid;
  }
}
```

## Method 2: Export All Slides View

Coming soon: Direct export button from preview panel.

## Tips for Quality PDFs

### Use High Resolution

```yaml
---
aspectRatio: "16/9"
---
```

### Light Theme for Printing

If printing, use a light theme:

```yaml
---
theme: paper
background: "#ffffff"
---
```

### Avoid Dark Backgrounds

Dark backgrounds use more ink. For printing, use:

```yaml
---
theme: boardroom
---
```

## Known Limitations

- **Complex backgrounds**: Gradients and images may not print well
- **Excalidraw**: Requires Excalidraw plugin for rendering
- **Mermaid**: Should render but test before printing
- **Fonts**: Custom fonts may not embed in PDF

## Troubleshooting

### Slides cut off

- Check print scale settings
- Try "Fit to page" option

### Missing content

- Ensure all external resources are accessible
- Check browser console for errors

### Poor quality

- Increase browser zoom before printing
- Export at higher resolution settings
