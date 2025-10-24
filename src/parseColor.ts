import { type Color, parse, parseHex } from 'culori'
import { getPaletteClass } from 'src/palettes'

export const parseColor = (text: string, paletteClasses: string[]) => {
  // If color is surrounded with square brackets, the name should be hidden
  let isNameHidden = false
  if (text.startsWith('[') && text.endsWith(']')) {
    text = text.slice(1, -1)
    isNameHidden = true
  }

  // Check if color is valid
  let color: Color | 'palette' | undefined

  // Is palette color
  if (
    text.startsWith('(') &&
    text.endsWith(')') &&
    paletteClasses.includes(getPaletteClass(text.slice(1, -1)))
  ) {
    text = text.slice(1, -1)
    color = 'palette'
  }

  if (!color) {
    try {
      color = parse(text)
      if (color === undefined) return
      // Ignore hex colors that don't start with a hash
      if (color.mode === 'rgb' && parseHex(text) && text.charAt(0) !== '#')
        return
    } catch {
      return
    }
  }

  return { text, color, isNameHidden }
}
