import { Plugin } from 'obsidian'
import { checkIfSnippetEnabled } from 'src/palettes'
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
      this.registerEditorExtension(inlayExtension(this.settings))
    }

    this.addSettingTab(new CssColorsSettingsTab(this.app, this))
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async loadData(): Promise<typeof this.settings> {
    const data = await super.loadData()
    const { enabled: palettesEnabled } = await checkIfSnippetEnabled(this.app)
    return { ...data, palettesEnabled }
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
}
