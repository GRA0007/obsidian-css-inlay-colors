import { parse } from 'culori'
import { Notice } from 'obsidian'
import type { CssColorsPluginSettings } from './settings'

export const inlayPostProcessor =
  (settings: CssColorsPluginSettings) => (el: HTMLElement) => {
    for (const code of el.findAll('code')) {
      let color = code.innerText.trim()
      let isNameHidden = false

      // If color is surrounded with square brackets, the name should be hidden
      if (color.startsWith('[') && color.endsWith(']')) {
        color = color.slice(1, -1)
        isNameHidden = true
      }

      // Not a valid color
      try {
        if (parse(color) === undefined) return
      } catch {
        return
      }

      // Clear codeblock before adding inlay
      if (settings.hideNames || isNameHidden) {
        code.innerHTML = ''
      }

      code.createSpan({
        prepend: true,
        cls: `css-color-inlay ${settings.hideNames || isNameHidden ? 'css-color-name-hidden' : ''}`,
        attr: { style: `--css-color-inlay-color: ${color};` },
      })

      if (settings.copyOnClick) {
        code.setAttr('aria-label', 'Click to copy')
        code.setAttr('style', 'cursor: pointer;')
        code.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()
          navigator.clipboard
            .writeText(color)
            .then(() => {
              const toast = document.createDocumentFragment()
              const toastColor = document.createElement('span')
              toastColor.className = 'css-color-inlay'
              toastColor.style = `--css-color-inlay-color: ${color};`
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
