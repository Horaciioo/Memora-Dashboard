export interface GearSpec {
  key: string
  // Centre in the drawing
  x: number
  y: number
  tilt: number
  outer: number
  inner: number
  hole: number
  teeth: number
  // Tooth left out
  missing: number
  fill: string
  // Zigzag drawn from the hole to the rim
  crack: string
}

const point = (angle: number, radius: number) =>
  `${(Math.cos(angle) * radius).toFixed(2)} ${(Math.sin(angle) * radius).toFixed(2)}`

/**
 * Outline of a toothed wheel with a centre hole
 * @param {GearSpec} gear - Shape
 * @return {string} - SVG path data
 */

export const gearPath = ({ outer, inner, hole, teeth, missing }: GearSpec): string => {
  const step = (Math.PI * 2) / teeth
  const base = step * 0.3
  const tip = step * 0.18
  let d = ''
  for (let i = 0; i < teeth; i += 1) {
    const a = i * step
    d += `${i === 0 ? 'M' : 'L'}${point(a - base, inner)} `
    if (i !== missing) {
      d += `L${point(a - tip, outer)} L${point(a + tip, outer)} `
    }
    d += `L${point(a + base, inner)} A${inner} ${inner} 0 0 1 ${point(a + step - base, inner)} `
  }
  return `${d}Z M${hole} 0 A${hole} ${hole} 0 1 0 ${-hole} 0 A${hole} ${hole} 0 1 0 ${hole} 0 Z`
}
