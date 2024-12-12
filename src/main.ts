import { Plugin } from 'obsidian'
import { inlayPostProcessor } from 'src/preview'
import { inlayExtension } from './live'
import {
  type CssColorsPluginSettings,
  CssColorsSettingsTab,
  DEFAULT_SETTINGS,
} from './settings'

export default class CssColorsPlugin extends Plugin {
  settings: CssColorsPluginSettings = DEFAULT_SETTINGS

  async onload() {
    await this.loadSettings()

    this.registerMarkdownPostProcessor(inlayPostProcessor(this.settings))

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
