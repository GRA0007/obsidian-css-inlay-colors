import { parse } from 'culori'

export function inlayPostProcessor(el: HTMLElement) {
  for (const code of el.findAll('code')) {
    const color = code.innerText.trim()

    // Not a valid color
    if (parse(color) === undefined) return

    code.createSpan({
      prepend: true,
      cls: 'css-color-inlay',
      attr: { style: `background: ${color};` },
    })
  }
}
