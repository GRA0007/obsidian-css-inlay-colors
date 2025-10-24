import { type App, Modal, Notice, normalizePath, Setting } from 'obsidian'

export const SNIPPET_NAME = 'css-inlay-palettes'

const createPaletteFilePath = (app: App) =>
  normalizePath(`${app.vault.configDir}/snippets/${SNIPPET_NAME}.css`)

/** Snippet exists and is enabled in Obsidian Appearance settings */
export const checkIfSnippetEnabled = async (app: App) => {
  if (!(await app.vault.adapter.exists(createPaletteFilePath(app))))
    return { exists: false, enabled: false }

  const config = await app.vault.adapter.read(
    normalizePath(`${app.vault.configDir}/appearance.json`),
  )
  try {
    const enabledSnippets: string[] = JSON.parse(config).enabledCssSnippets
    return { exists: true, enabled: enabledSnippets.includes(SNIPPET_NAME) }
  } catch {
    return { exists: true, enabled: false }
  }
}

const confirmIfOverwrite = async (app: App) => {
  const { exists } = await checkIfSnippetEnabled(app)
  if (exists)
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
