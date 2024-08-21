import { parse } from 'culori'

export const inlayPostProcessor = (el: HTMLElement) => {
  for (const code of el.findAll('code')) {
    const color = code.innerText.trim()

    // Not a valid color
    try {
      if (parse(color) === undefined) return
    } catch {
      return
    }

    code.createSpan({
      prepend: true,
      cls: 'css-color-inlay',
      attr: { style: `--css-color-inlay-color: ${color};` },
    })
  }
}
