import { parse } from 'culori'
import { Plugin } from 'obsidian'

// interface CssColorsPluginSettings {
//   showInLiveEditor: boolean
// }

// const DEFAULT_SETTINGS: CssColorsPluginSettings = {
//   showInLiveEditor: true,
// }

export default class CssColorsPlugin extends Plugin {
  // settings: CssColorsPluginSettings = DEFAULT_SETTINGS

  async onload() {
    // await this.loadSettings()

    this.registerMarkdownPostProcessor((el) => {
      for (const code of el.findAll('code')) {
        const text = code.innerText.trim()
        const color = parse(text)
        if (color !== undefined) {
          code.createSpan({
            prepend: true,
            cls: 'css-color-inlay',
            attr: { style: `background: ${text};` },
          })
        }
      }
    })

    // this.addSettingTab(new CssColorsSettingsTab(this.app, this))
  }

  onunload() {}

  // async loadSettings() {
  //   this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  // }

  // async saveSettings() {
  //   await this.saveData(this.settings)
  // }
}

// class CssColorsSettingsTab extends PluginSettingTab {
//   plugin: CssColorsPlugin

//   constructor(app: App, plugin: CssColorsPlugin) {
//     super(app, plugin)
//     this.plugin = plugin
//   }

//   display(): void {
//     const { containerEl } = this

//     containerEl.empty()

//     new Setting(containerEl)
//       .setName('Show in live editor')
//       .setDesc('Enable colors in the live editor')
//       .addToggle((toggle) =>
//         toggle
//           .setValue(this.plugin.settings.showInLiveEditor)
//           .onChange(async (value) => {
//             this.plugin.settings.showInLiveEditor = value
//             await this.plugin.saveSettings()
//           }),
//       )
//   }
// }
