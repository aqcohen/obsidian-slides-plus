import { App, PluginSettingTab, Setting } from "obsidian";
import type SlidesPlugin from "./main";

export interface SlidesPluginSettings {
  defaultTheme: string;
  defaultTransition: string;
  defaultAspectRatio: string;
  fontSize: number;
  showSlideNumbers: boolean;
  autoOpenPreview: boolean;
}

export const DEFAULT_SETTINGS: SlidesPluginSettings = {
  defaultTheme: "default",
  defaultTransition: "slide",
  defaultAspectRatio: "16/9",
  fontSize: 24,
  showSlideNumbers: true,
  autoOpenPreview: true,
};

export class SlidesSettingTab extends PluginSettingTab {
  plugin: SlidesPlugin;

  constructor(app: App, plugin: SlidesPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Slides Plus Settings" });

    new Setting(containerEl)
      .setName("Default theme")
      .setDesc("Theme used when no theme is specified in frontmatter")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("default", "Default")
          .addOption("dark", "Dark")
          .addOption("minimal", "Minimal")
          .addOption("corporate", "Corporate")
          .addOption("academic", "Academic")
          .addOption("creative", "Creative")
          .setValue(this.plugin.settings.defaultTheme)
          .onChange(async (value) => {
            this.plugin.settings.defaultTheme = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Default transition")
      .setDesc("Slide transition when not specified per-slide")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("slide", "Slide")
          .addOption("fade", "Fade")
          .addOption("slide-up", "Slide Up")
          .addOption("none", "None")
          .setValue(this.plugin.settings.defaultTransition)
          .onChange(async (value) => {
            this.plugin.settings.defaultTransition = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Aspect ratio")
      .setDesc("Slide aspect ratio")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("16/9", "16:9 (Widescreen)")
          .addOption("4/3", "4:3 (Standard)")
          .addOption("16/10", "16:10")
          .setValue(this.plugin.settings.defaultAspectRatio)
          .onChange(async (value) => {
            this.plugin.settings.defaultAspectRatio = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Base font size")
      .setDesc("Base font size in pixels for slide content")
      .addSlider((slider) =>
        slider
          .setLimits(16, 40, 2)
          .setValue(this.plugin.settings.fontSize)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.fontSize = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Show slide numbers")
      .setDesc("Display slide numbers in presentation mode")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showSlideNumbers)
          .onChange(async (value) => {
            this.plugin.settings.showSlideNumbers = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Auto-open preview")
      .setDesc("Automatically open the slide preview panel when opening a slides file")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoOpenPreview)
          .onChange(async (value) => {
            this.plugin.settings.autoOpenPreview = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
