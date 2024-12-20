import { syntaxTree, tokenClassNodeProp } from '@codemirror/language'
import type { Range } from '@codemirror/state'
import {
  Decoration,
  type DecorationSet,
  type EditorView,
  ViewPlugin,
  type ViewUpdate,
  WidgetType,
} from '@codemirror/view'
import type { NodeProp } from '@lezer/common'
import { type Color, formatHex, parse } from 'culori'
import { editorLivePreviewField } from 'obsidian'
import { formatColor } from './formatColor'
import type { CssColorsPluginSettings } from './settings'

export const inlayExtension = (settings: CssColorsPluginSettings) => {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet = Decoration.none

      constructor(public view: EditorView) {
        this.decorations = createColorWidgets(view, settings)
      }

      update(update: ViewUpdate) {
        if (
          settings.hideNames ||
          update.docChanged ||
          update.viewportChanged ||
          syntaxTree(update.startState) !== syntaxTree(update.state)
        ) {
          this.decorations = createColorWidgets(update.view, settings)
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
    readonly hideName: boolean,
    readonly view: EditorView,
  ) {
    super()
  }

  eq(other: CSSColorInlayWidget) {
    return other.text === this.text
  }

  toDOM() {
    const inlay = document.createElement('label')
    inlay.className = `css-color-inlay ${this.hideName ? 'css-color-name-hidden' : ''}`
    inlay.style.setProperty('--css-color-inlay-color', this.text)

    if (this.colorPickerEnabled) {
      const input = document.createElement('input')
      input.type = 'color'
      input.value = formatHex(this.color)
      input.addEventListener('change', (e) => {
        if (
          !e.currentTarget ||
          !(e.currentTarget as Node).instanceOf(HTMLInputElement)
        )
          return
        const pos = this.view.posAtDOM(wrapper)
        this.view.dispatch({
          changes: {
            from: pos,
            to: pos + this.text.length,
            insert: formatColor(
              this.text,
              this.color,
              (e.currentTarget as HTMLInputElement).value,
            ),
          },
        })
      })
      inlay.append(input)
    }

    const wrapper = document.createElement('span')
    wrapper.className = 'cm-inline-code css-color-wrapper'
    wrapper.append(inlay)

    return wrapper
  }
}

const createColorWidgets = (
  view: EditorView,
  settings: CssColorsPluginSettings,
) => {
  // Only create widgets in live preview mode
  if (!view.state.field(editorLivePreviewField)) return Decoration.none

  const widgets: Range<Decoration>[] = []

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (node) => {
        if (
          node.type.prop(tokenClassNodeProp)?.split(' ').includes('inline-code')
        ) {
          const text = view.state.sliceDoc(node.from, node.to)

          // Not a valid color
          let color: Color | undefined
          try {
            color = parse(text)
            if (color === undefined) return
          } catch {
            return
          }

          if (
            settings.hideNames &&
            !view.state.selection.ranges.some(
              (range) => range.from - 1 <= node.to && range.to + 1 >= node.from,
            )
          ) {
            const deco = Decoration.replace({
              widget: new CSSColorInlayWidget(
                text,
                color,
                settings.colorPickerEnabled,
                true,
                view,
              ),
            })

            widgets.push(deco.range(node.from, node.to))
          } else {
            const deco = Decoration.widget({
              side: 1,
              widget: new CSSColorInlayWidget(
                text,
                color,
                settings.colorPickerEnabled,
                false,
                view,
              ),
            })

            widgets.push(deco.range(node.from))
          }
        }
      },
    })
  }

  return Decoration.set(widgets)
}

// Codemirror does not correctly export a type for this constant, but it does exist
declare module '@codemirror/language' {
  const tokenClassNodeProp: NodeProp<string>
}
