import { type App, PluginSettingTab, Setting } from 'obsidian'
import type CssColorsPlugin from './main'
import {
  checkIfSnippetEnabled,
  downloadPredefinedPalettes,
  SNIPPET_NAME,
} from './palettes'

export interface CssColorsPluginSettings {
  showInLiveEditor: boolean
  colorPickerEnabled: boolean
  hideNames: boolean
  copyOnClick: boolean
  palettesEnabled: boolean
}

export const DEFAULT_SETTINGS: CssColorsPluginSettings = {
  showInLiveEditor: true,
  colorPickerEnabled: false,
  hideNames: false,
  copyOnClick: true,
  palettesEnabled: false,
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
      .setName('Hide all color names')
      .setDesc(
        'Hides the inline code block in live preview and reading mode for all colors so only the color inlay is visible. You can also do this on a case-by-case basis by surrounding the color with square brackets.',
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.hideNames)
          .onChange(async (value) => {
            this.plugin.settings.hideNames = value
            await this.plugin.saveSettings()
          }),
      )

    new Setting(containerEl)
      .setName('Copy on click')
      .setDesc(
        'Allows clicking on a color in reading mode to copy it to your clipboard.',
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.copyOnClick)
          .onChange(async (value) => {
            this.plugin.settings.copyOnClick = value
            await this.plugin.saveSettings()
          }),
      )

    let palettesEnabledStatus: HTMLSpanElement | undefined
    new Setting(containerEl)
      .setHeading()
      .setName('Custom Palettes')
      .setDesc(
        createFragment((desc) => {
          desc.appendText(
            `Create and enable a CSS snippet called ${SNIPPET_NAME}.css. This will generate classes for every inline code block surrounded in parentheses so they can be targeted.`,
          )
          desc.createEl('br')
          desc.appendText('This feature is currently: ')
          palettesEnabledStatus = desc.createSpan({ text: 'loading...' })
          desc.createEl('br')
          desc.createEl('a', {
            text: 'Learn more',
            href: 'https://github.com/GRA0007/obsidian-css-inlay-colors?tab=readme-ov-file#custom-palettes',
          })
        }),
      )

    // Display palette
    checkIfSnippetEnabled(this.app).then(({ exists, enabled }) => {
      if (!palettesEnabledStatus) return
      palettesEnabledStatus.empty()
      palettesEnabledStatus.createEl('strong', {
        cls: enabled ? 'mod-success' : 'mod-warning',
        text: enabled ? 'enabled' : 'disabled',
      })
      if (!enabled) {
        palettesEnabledStatus.appendText(
          exists
            ? ' (snippet exists but is currently disabled)'
            : ' (no snippet file found)',
        )
      }
    })

    new Setting(containerEl)
      .setName('Download predefined palettes')
      .setDesc(
        createFragment((desc) => {
          desc.appendText('You can download a ')
          desc.createEl('a', {
            text: 'snippet file',
            href: 'https://github.com/GRA0007/obsidian-css-inlay-colors/blob/main/palettes.css',
          })
          desc.appendText(
            ' with some predefined palettes. It comes with the following:',
          )
        }),
      )
      .addButton((button) => {
        button
          .setButtonText('Download')
          .onClick(() => downloadPredefinedPalettes(this.app))
      })
      .infoEl.createDiv({ cls: 'setting-item-description' })
      .createEl('ul', {
        text: createFragment((el) => {
          el.createEl('li', {
            text: createFragment((li) => {
              li.createEl('strong', { text: 'AutoCAD Color Index' })
              li.createDiv({ text: 'Example: (aci 91)' })
            }),
          })
          el.createEl('li', {
            text: createFragment((li) => {
              li.createEl('strong', {
                text: 'Australian Color Standard (AS 2700)',
              })
              li.createDiv({ text: 'Example: (as N45)' })
            }),
          })
          el.createEl('li', {
            text: createFragment((li) => {
              li.createEl('strong', {
                text: 'British Standard Colors (BS 381, BS 4800)',
              })
              li.createDiv({ text: 'Example: (bs 381 593) or (bs 14-E-51)' })
            }),
          })
          el.createEl('li', {
            text: createFragment((li) => {
              li.createEl('strong', { text: 'Federal Standard (FS 595C, ANA)' })
              li.createDiv({ text: 'Example: (fs 11086) or (fs w3-ana-609)' })
            }),
          })
          el.createEl('li', {
            text: createFragment((li) => {
              li.createEl('strong', { text: 'Pantone' })
              li.createDiv({ text: 'Example: (pantone 340)' })
            }),
          })
          el.createEl('li', {
            text: createFragment((li) => {
              li.createEl('strong', {
                text: 'RAL Colors (Classic, Design, Effect, Plastics)',
              })
              li.createDiv({ text: 'Example: (ral 170 50 10) or (ral 6010)' })
            }),
          })
        }),
      })
  }
}
