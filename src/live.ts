import { syntaxTree } from '@codemirror/language'
import type { Range } from '@codemirror/state'
import {
  Decoration,
  type DecorationSet,
  type EditorView,
  ViewPlugin,
  type ViewUpdate,
  WidgetType,
} from '@codemirror/view'
import { type Color, formatHex, parse } from 'culori'
import { formatColor } from './formatColor'

export const inlayExtension = (colorPickerEnabled: boolean) => {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet = Decoration.none

      constructor(public view: EditorView) {
        this.decorations = createColorWidgets(view, colorPickerEnabled)
      }

      update(update: ViewUpdate) {
        if (
          update.docChanged ||
          update.viewportChanged ||
          syntaxTree(update.startState) !== syntaxTree(update.state)
        ) {
          this.decorations = createColorWidgets(update.view, colorPickerEnabled)
        }
      }
    },
    {
      decorations: (v) => v.decorations,
    },
  )
}

class CSSColorInlayWidget extends WidgetType {
  constructor(
    readonly text: string,
    readonly color: Color,
    readonly colorPickerEnabled: boolean,
  ) {
    super()
  }

  eq(other: CSSColorInlayWidget) {
    return other.text === this.text
  }

  toDOM() {
    const inlay = document.createElement('label')
    inlay.className = 'css-color-inlay'
    inlay.style.background = this.text

    if (this.colorPickerEnabled) {
      const input = document.createElement('input')
      input.type = 'color'
      input.value = formatHex(this.color)
      input.addEventListener('change', (e) => {
        if (!(e.currentTarget instanceof HTMLInputElement)) return
        console.log(
          'result',
          formatColor(this.text, this.color, e.currentTarget.value),
        )
      })
      inlay.append(input)
    }

    const wrapper = document.createElement('span')
    wrapper.className = 'cm-inline-code css-color-wrapper'
    wrapper.append(inlay)

    return wrapper
  }
}

const createColorWidgets = (view: EditorView, colorPickerEnabled: boolean) => {
  // Only create widgets in live preview mode
  if (!view.dom.parentElement?.classList.contains('is-live-preview'))
    return Decoration.none

  const widgets: Range<Decoration>[] = []

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (node) => {
        if (node.name.includes('inline-code')) {
          const text = view.state.sliceDoc(node.from, node.to)

          // Not a valid color
          let color: Color | undefined
          try {
            color = parse(text)
            if (color === undefined) return
          } catch {
            return
          }

          const deco = Decoration.widget({
            side: 1,
            widget: new CSSColorInlayWidget(text, color, colorPickerEnabled),
          })

          widgets.push(deco.range(node.from))
        }
      },
    })
  }

  return Decoration.set(widgets)
}
