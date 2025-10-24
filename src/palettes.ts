import { type App, Modal, Notice, normalizePath, Setting } from 'obsidian'

const SNIPPET_NAME = 'css-inlay-palettes'

/** Normalize a palette name into a class */
export const getPaletteClass = (text: string) =>
  text.trim().toLocaleLowerCase().replace(/\s+/g, '-')

const parsePaletteClasses = (selectorText: string) => {
  return selectorText.split(',').flatMap((selector) => {
    const name = selector
      .replaceAll('.css-color-inlay', '')
      .replace(/[&.]/g, '')
      .trim()
    return name.toLocaleLowerCase() === name ? [name] : []
  })
}

/** Get a list of all palette classes available */
export const getPaletteClasses = () => {
  const classes = []

  for (const sheet of document.styleSheets) {
    for (const rule of sheet.cssRules) {
      if (
        rule instanceof CSSStyleRule &&
        rule.selectorText.contains('.css-color-inlay')
      ) {
        // Nested rule
        if (rule.cssRules.length > 0) {
          for (const nestedRule of rule.cssRules) {
            if (
              nestedRule instanceof CSSStyleRule &&
              nestedRule.selectorText.startsWith('&') &&
              nestedRule.styleMap.has('color')
            ) {
              classes.push(...parsePaletteClasses(nestedRule.selectorText))
            }
          }
        }
        // Individual rule (.css-color-inlay.my-color)
        if (
          rule.selectorText !== '.css-color-inlay' &&
          rule.cssRules.length === 0 &&
          rule.styleMap.has('color')
        ) {
          classes.push(...parsePaletteClasses(rule.selectorText))
        }
      }
    }
  }

  return classes
}

const createPaletteFilePath = (app: App) =>
  normalizePath(`${app.vault.configDir}/snippets/${SNIPPET_NAME}.css`)

/** Snippet exists and is enabled in Obsidian Appearance settings */
const checkIfSnippetEnabled = async (app: App) => {
  if (!(await app.vault.adapter.exists(createPaletteFilePath(app))))
    return false

  const config = await app.vault.adapter.read(
    normalizePath(`${app.vault.configDir}/appearance.json`),
  )
  try {
    const enabledSnippets: string[] = JSON.parse(config).enabledCssSnippets
    return enabledSnippets.includes(SNIPPET_NAME)
  } catch {
    return false
  }
}

const confirmIfOverwrite = async (app: App) => {
  if (await app.vault.adapter.exists(createPaletteFilePath(app)))
    return new Promise<boolean>((resolve) => {
      new ConfirmDownloadModal(app, (confirmed) => resolve(confirmed)).open()
    })

  return true
}

/** Download the predefined palettes file to the snippets directory. Confirm if the file already exists. */
export const downloadPredefinedPalettes = async (app: App) => {
  if (await confirmIfOverwrite(app)) {
    try {
      await fetch(
        'https://raw.githubusercontent.com/GRA0007/obsidian-css-inlay-colors/refs/heads/main/palettes.css',
      )
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch')
          return res.text()
        })
        .then((data) =>
          app.vault.adapter.write(createPaletteFilePath(app), data),
        )
      new Notice('Palette file downloaded')
      if (!(await checkIfSnippetEnabled(app)))
        new EnableSnippetInfoModal(app).open()
    } catch {
      new Notice('Failed to download file')
    }
  }
}

class ConfirmDownloadModal extends Modal {
  constructor(app: App, onConfirm: (confirmed: boolean) => void) {
    super(app)
    this.setTitle('Overwrite Existing Palettes')
    this.setContent(
      "You've already got a custom palette file in your snippets directory, would you like to redownload and overwrite it?",
    )

    let confirmed = false
    new Setting(this.contentEl)
      .addButton((button) =>
        button.setButtonText('Cancel').onClick(() => {
          this.close()
        }),
      )
      .addButton((button) =>
        button
          .setButtonText('Replace existing file')
          .setCta()
          .onClick(() => {
            confirmed = true
            this.close()
          }),
      )
    this.setCloseCallback(() => onConfirm(confirmed))
  }
}

class EnableSnippetInfoModal extends Modal {
  constructor(app: App) {
    super(app)
    this.setTitle('Enable CSS Snippet')
    this.setContent(
      'The custom palette file has been downloaded, you should now enable it from the "Appearance → CSS snippets" setting.',
    )

    new Setting(this.contentEl).addButton((button) =>
      button.setButtonText('Got it').onClick(() => {
        this.close()
      }),
    )
  }
}
