import { type App, Plugin, PluginSettingTab, Setting } from 'obsidian'
import { inlayPostProcessor } from 'src/preview'
import { inlayExtension } from './live'

interface CssColorsPluginSettings {
  showInLiveEditor: boolean
  colorPickerEnabled: boolean
}

const DEFAULT_SETTINGS: CssColorsPluginSettings = {
  showInLiveEditor: true,
  colorPickerEnabled: false,
}

export default class CssColorsPlugin extends Plugin {
  settings: CssColorsPluginSettings = DEFAULT_SETTINGS

  async onload() {
    await this.loadSettings()

    this.registerMarkdownPostProcessor(inlayPostProcessor)

    if (this.settings.showInLiveEditor) {
      this.registerEditorExtension(
        inlayExtension(this.settings.colorPickerEnabled),
      )
    }

    this.addSettingTab(new CssColorsSettingsTab(this.app, this))
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
}

class CssColorsSettingsTab extends PluginSettingTab {
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
  }
}
