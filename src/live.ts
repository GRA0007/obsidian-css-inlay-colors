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
import { parse } from 'culori'

class CSSColorInlayWidget extends WidgetType {
  constructor(readonly color: string) {
    super()
  }

  eq(other: CSSColorInlayWidget) {
    return other.color === this.color
  }

  toDOM() {
    const inlay = document.createElement('span')
    inlay.className = 'css-color-inlay'
    inlay.style.background = this.color

    const wrapper = document.createElement('span')
    wrapper.className = 'cm-inline-code css-color-wrapper'
    wrapper.append(inlay)

    return wrapper
  }
}

export function inlayExtension() {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet = Decoration.none

      constructor(public view: EditorView) {
        this.decorations = createColorWidgets(view)
      }

      update(update: ViewUpdate) {
        if (
          update.docChanged ||
          update.viewportChanged ||
          syntaxTree(update.startState) !== syntaxTree(update.state)
        ) {
          this.decorations = createColorWidgets(update.view)
        }
      }
    },
    {
      decorations: (v) => v.decorations,
    },
  )
}

function createColorWidgets(view: EditorView) {
  const widgets: Range<Decoration>[] = []

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (node) => {
        if (node.name === 'inline-code') {
          const color = view.state.sliceDoc(node.from, node.to)

          // Not a valid color
          if (parse(color) === undefined) return

          const deco = Decoration.widget({
            side: 1,
            widget: new CSSColorInlayWidget(color),
          })

          widgets.push(deco.range(node.from))
        }
      },
    })
  }

  return Decoration.set(widgets)
}