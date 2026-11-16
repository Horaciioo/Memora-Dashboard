/**
 * Colour recipe of the nations
 * @typedef {Object} ConcordatNationLook
 */

export interface ConcordatNationLook {
  hueStart: number
  hueStep: number
  saturation: number
  lightness: readonly number[]
}

// One channel of an HSL colour
const channel = (n: number, hue: number, chroma: number, lightness: number): number => {
  const k = (n + hue / 30) % 12

  return lightness - chroma * Math.max(-1, Math.min(k - 3, 9 - k, 1))
}

/**
 * RGB of a nation, spread by the golden angle so neighbours differ
 * @param {number} id - Nation, from one
 * @param {ConcordatNationLook} look - Recipe
 * @return {[number, number, number]} - Channels, 0 to 255
 */

export const nationRgb = (id: number, look: ConcordatNationLook): [number, number, number] => {
  const hue = (look.hueStart + (id - 1) * look.hueStep) % 360
  const lightness = look.lightness[(id - 1) % look.lightness.length]
  const chroma = look.saturation * Math.min(lightness, 1 - lightness)
  const rgb = [0, 8, 4].map((n) => Math.round(255 * channel(n, hue, chroma, lightness)))

  return [rgb[0], rgb[1], rgb[2]]
}

/**
 * RGB of a nation: its own packed colour, else the palette
 * @param {{ id: number; color: number }} player - Nation
 * @param {ConcordatNationLook} look - Recipe
 * @return {[number, number, number]} - Channels, 0 to 255
 */

export const playerRgb = (
  player: { id: number; color: number },
  look: ConcordatNationLook
): [number, number, number] =>
  player.color
    ? [(player.color >> 16) & 255, (player.color >> 8) & 255, player.color & 255]
    : nationRgb(player.id, look)

/**
 * CSS colour of an RGB triple
 * @param {readonly number[]} rgb - Channels
 * @param {number} [alpha] - Opacity
 * @return {string} - CSS colour
 */

export const rgbText = (rgb: readonly number[], alpha = 1): string =>
  `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]} / ${alpha})`
