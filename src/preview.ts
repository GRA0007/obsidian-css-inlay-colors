import { parse } from 'culori'
import type { CssColorsPluginSettings } from './settings'

export const inlayPostProcessor =
  (settings: CssColorsPluginSettings) => (el: HTMLElement) => {
    for (const code of el.findAll('code')) {
      const color = code.innerText.trim()

      // Not a valid color
      try {
        if (parse(color) === undefined) return
      } catch {
        return
      }

      // Clear codeblock before adding inlay
      if (settings.hideNames) {
        code.innerHTML = ''
      }

      code.createSpan({
        prepend: true,
        cls: `css-color-inlay ${settings.hideNames ? 'css-color-name-hidden' : ''}`,
        attr: { style: `--css-color-inlay-color: ${color};` },
      })
    }
  }
