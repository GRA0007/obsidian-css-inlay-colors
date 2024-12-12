import { type App, PluginSettingTab, Setting } from 'obsidian'
import type CssColorsPlugin from './main'

export interface CssColorsPluginSettings {
  showInLiveEditor: boolean
  colorPickerEnabled: boolean
  hideNames: boolean
}

export const DEFAULT_SETTINGS: CssColorsPluginSettings = {
  showInLiveEditor: true,
  colorPickerEnabled: false,
  hideNames: false,
}

export class CssColorsSettingsTab extends PluginSettingTab {
  plugin: CssColorsPlugin

  constructor(app: App, plugin: CssColorsPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this

    containerEl.empty()

    new Setting(containerEl)
      .setName('Show in live preview mode')
      .setDesc('Enable color inlays in the live preview (requires reload).')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showInLiveEditor)
          .onChange(async (value) => {
            this.plugin.settings.showInLiveEditor = value
            await this.plugin.saveSettings()
          }),
      )

    new Setting(containerEl)
      .setName('Enable the color picker')
      .setDesc('Allows you to edit a color by clicking on the inlay.')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.colorPickerEnabled)
          .onChange(async (value) => {
            this.plugin.settings.colorPickerEnabled = value
            await this.plugin.saveSettings()
          }),
      )
      .descEl.createDiv({
        text: 'Opacity and colors outside of the sRGB color space are not supported.',
        cls: 'mod-warning',
      })

    new Setting(containerEl)
      .setName('Hide color names')
      .setDesc(
        'Hides the inline code block in live preview and reading mode so only the color inlay is visible.',
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.hideNames)
          .onChange(async (value) => {
            this.plugin.settings.hideNames = value
            await this.plugin.saveSettings()
          }),
      )
  }
}
