import { Notice } from 'obsidian'
import { parseColor } from './parseColor'
import type { CssColorsPluginSettings } from './settings'

export const inlayPostProcessor =
  (settings: CssColorsPluginSettings) => (el: HTMLElement) => {
    for (const code of el.findAll('code')) {
      const res = parseColor(code.innerText.trim())
      if (!res) continue
      const { text, isNameHidden } = res

      // Clear codeblock before adding inlay
      if (settings.hideNames || isNameHidden) {
        code.innerHTML = ''
      }

      code.createSpan({
        prepend: true,
        cls: `css-color-inlay ${settings.hideNames || isNameHidden ? 'css-color-name-hidden' : ''}`,
        attr: { style: `--css-color-inlay-color: ${text};` },
      })

      if (settings.copyOnClick) {
        code.setAttr('aria-label', 'Click to copy')
        code.setAttr('style', 'cursor: pointer;')
        code.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          navigator.clipboard
            .writeText(text)
            .then(() => {
              const toast = document.createDocumentFragment()
              const toastColor = document.createElement('span')
              toastColor.className = 'css-color-inlay'
              toastColor.style = `--css-color-inlay-color: ${text};`
              toast.append(toastColor)
              toast.append(
                document.createTextNode('Copied color to the clipboard'),
              )
              new Notice(toast)
            })
            .catch(() => {
              new Notice('Failed to copy color')
            })
        })
      }
    }
  }
