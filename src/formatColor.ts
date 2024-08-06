import { type Color, converter, formatCss, round } from 'culori'

const twoDecimals = round(2)
const fourDecimals = round(4)
const re = /[0-9\.%]+/g

/** Format a hex the same as an existing color format */
export const formatColor = (
  previousText: string,
  previousColor: Color,
  hex: string,
) => {
  const color = converter(previousColor.mode)(hex)
  if (!color) return undefined
  // Copy alpha across, as the native color picker doesn't support it
  color.alpha = previousColor.alpha

  const hasPercentSymbol = previousText
    .match(re)
    ?.map((match) => match.contains('%'))

  // rgb
  if (color.mode === 'rgb' && previousText.startsWith('rgb')) {
    return replaceNumbers(previousText, [
      twoDecimals(color.r * 255),
      twoDecimals(color.g * 255),
      twoDecimals(color.b * 255),
      formatAlpha(color.alpha, hasPercentSymbol?.at(3)),
    ])
  }

  // hsl
  if (color.mode === 'hsl' && previousText.startsWith('hsl')) {
    return replaceNumbers(previousText, [
      twoDecimals(color.h ?? 0),
      percent(twoDecimals(color.s * 100), hasPercentSymbol?.at(1)),
      percent(twoDecimals(color.l * 100), hasPercentSymbol?.at(2)),
      formatAlpha(color.alpha, hasPercentSymbol?.at(3)),
    ])
  }

  // hwb
  if (color.mode === 'hwb' && previousText.startsWith('hwb')) {
    return replaceNumbers(previousText, [
      twoDecimals(color.h ?? 0),
      percent(twoDecimals(color.w * 100), hasPercentSymbol?.at(1)),
      percent(twoDecimals(color.b * 100), hasPercentSymbol?.at(2)),
      formatAlpha(color.alpha, hasPercentSymbol?.at(3)),
    ])
  }

  // lab
  if (color.mode === 'lab' && previousText.startsWith('lab')) {
    return replaceNumbers(previousText, [
      percent(twoDecimals(color.l), hasPercentSymbol?.at(0)),
      percent(twoDecimals(color.a), hasPercentSymbol?.at(1)),
      percent(twoDecimals(color.b), hasPercentSymbol?.at(2)),
      formatAlpha(color.alpha, hasPercentSymbol?.at(3)),
    ])
  }

  // lch
  if (color.mode === 'lch' && previousText.startsWith('lch')) {
    return replaceNumbers(previousText, [
      percent(twoDecimals(color.l), hasPercentSymbol?.at(0)),
      hasPercentSymbol?.at(1)
        ? percent(twoDecimals(color.c / 1.5), true)
        : twoDecimals(color.c),
      twoDecimals(color.h),
      formatAlpha(color.alpha, hasPercentSymbol?.at(3)),
    ])
  }

  // oklab
  if (color.mode === 'oklab' && previousText.startsWith('oklab')) {
    return replaceNumbers(previousText, [
      hasPercentSymbol?.at(0)
        ? percent(twoDecimals(color.l * 100), true)
        : fourDecimals(color.l),
      hasPercentSymbol?.at(1)
        ? percent(twoDecimals((color.a + 0.4) * 125), true)
        : fourDecimals(color.a),
      hasPercentSymbol?.at(2)
        ? percent(twoDecimals((color.b + 0.4) * 125), true)
        : fourDecimals(color.b),
      formatAlpha(color.alpha, hasPercentSymbol?.at(3)),
    ])
  }

  // oklch
  if (color.mode === 'oklch' && previousText.startsWith('oklch')) {
    return replaceNumbers(previousText, [
      hasPercentSymbol?.at(0)
        ? percent(twoDecimals(color.l * 100), true)
        : fourDecimals(color.l),
      hasPercentSymbol?.at(1)
        ? percent(twoDecimals(color.c * 250), true)
        : fourDecimals(color.c),
      twoDecimals(color.h),
      formatAlpha(color.alpha, hasPercentSymbol?.at(3)),
    ])
  }

  // hex (or named color)
  if (color.mode === 'rgb') return hex

  // Fallback to culori's formatter
  return formatCss(color)
}

/**
 * Format a numeric alpha channel, assuming it can be between 0 and 1 or a percentage.
 */
const formatAlpha = (
  alpha: number | undefined,
  hasPercentSymbol: boolean | undefined,
) => {
  if (alpha === undefined) return
  return hasPercentSymbol ? percent(alpha * 100, true) : alpha
}

/**
 * Takes an existing color string and replaces the numbers without touching the formatting.
 *
 * ```ts
 * replaceNumbers('rgb(10, 20, 30, .4)', [5, 6, 7, .8]) === 'rgb(5, 6, 7, 0.8)'
 * ```
 */
const replaceNumbers = (
  text: string,
  numbers: (string | number | undefined | null)[],
) => {
  const parts = text.split(re)
  return parts.reduce((newText, part, i) => {
    if (i === parts.length - 1) return `${newText}${part}`
    return `${newText}${part}${numbers[i] ?? 0}`
  }, '')
}

/**
 * Optionally adds a percent symbol
 *
 * ```ts
 * percent(50, false) === '50'
 * percent(60, true) === '60%'
 * ```
 */
const percent = (value: number | undefined, hasPercentSymbol = false) => {
  if (value === undefined) return
  return `${value}${hasPercentSymbol ? '%' : ''}`
}
