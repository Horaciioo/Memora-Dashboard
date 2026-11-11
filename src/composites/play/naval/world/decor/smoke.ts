import type { Pen } from '@/composites/play/naval/world/pen'

/**
 * Plume of smoke: puffs swelling and fading along the wind, lit from below
 * @param {Pen} pen - Pen
 * @param {Object} plume - Plume
 * @param {number} plume.x - Source column
 * @param {number} plume.y - Source row
 * @param {[number, number]} plume.wind - Drift per puff, squares
 * @param {number} plume.size - First puff radius
 * @param {number} plume.puffs - Puffs
 * @param {string} plume.colour - Smoke colour
 * @param {string} [plume.glow] - Light from below
 * @param {() => number} plume.rng - Random source
 * @return {void}
 */

export const paintSmoke = (
  pen: Pen,
  {
    x,
    y,
    wind,
    size,
    puffs,
    colour,
    glow,
    rng,
  }: {
    x: number
    y: number
    wind: [number, number]
    size: number
    puffs: number
    colour: string
    glow?: string
    rng: () => number
  }
): void => {
  for (let index = puffs - 1; index >= 0; index -= 1) {
    const share = index / puffs
    const radius = size * (1 + share * 2.6) * (0.85 + rng() * 0.3)
    const px = x + wind[0] * index + (rng() - 0.5) * radius * 0.6
    const py = y + wind[1] * index + (rng() - 0.5) * radius * 0.4
    const puff = pen.createRadialGradient(px - radius * 0.3, py - radius * 0.3, radius * 0.1, px, py, radius)
    puff.addColorStop(0, colour)
    puff.addColorStop(0.7, colour)
    puff.addColorStop(1, 'rgba(0,0,0,0)')
    pen.globalAlpha = 0.9 - share * 0.6
    pen.fillStyle = puff
    pen.beginPath()
    pen.arc(px, py, radius, 0, Math.PI * 2)
    pen.fill()
    if (!glow || share > 0.35) continue
    // Underside lit by the fire
    const lit = pen.createRadialGradient(px, py + radius * 0.5, 0, px, py + radius * 0.5, radius * 0.9)
    lit.addColorStop(0, glow)
    lit.addColorStop(1, 'rgba(0,0,0,0)')
    pen.globalAlpha = 0.55 * (1 - share * 2)
    pen.fillStyle = lit
    pen.beginPath()
    pen.arc(px, py + radius * 0.4, radius * 0.9, 0, Math.PI * 2)
    pen.fill()
  }
  pen.globalAlpha = 1
}

/**
 * Light glowing on what lies under it, added to the colours
 * @param {Pen} pen - Pen
 * @param {Object} light - Glow
 * @return {void}
 */

export const paintGlow = (
  pen: Pen,
  { x, y, radius, colour, strength = 1 }: { x: number; y: number; radius: number; colour: string; strength?: number }
): void => {
  const glow = pen.createRadialGradient(x, y, 0, x, y, radius)
  glow.addColorStop(0, colour)
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  pen.save()
  pen.globalCompositeOperation = 'lighter'
  pen.globalAlpha = strength
  pen.fillStyle = glow
  pen.fillRect(x - radius, y - radius, radius * 2, radius * 2)
  pen.restore()
}
