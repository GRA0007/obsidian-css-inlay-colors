import { parse } from 'culori'

export function inlayPostProcessor(el: HTMLElement) {
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
}
