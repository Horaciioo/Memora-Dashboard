// Number of segments of an oval
const OVAL_STEPS = 40

/**
 * Flat points of a shape dragged from one corner to another
 * @param {'line' | 'rect' | 'ellipse'} shape - Kind
 * @param {[number, number]} from - Where the drag began
 * @param {[number, number]} to - Where the pointer is
 * @return {number[]} - Points x0, y0, x1, y1, ...
 */

export const shapePoints = (
  shape: 'line' | 'rect' | 'ellipse',
  [x0, y0]: [number, number],
  [x1, y1]: [number, number]
): number[] => {
  if (shape === 'line') return [x0, y0, x1, y1]
  if (shape === 'rect') return [x0, y0, x1, y0, x1, y1, x0, y1, x0, y0]

  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  const rx = Math.abs(x1 - x0) / 2
  const ry = Math.abs(y1 - y0) / 2

  return Array.from({ length: OVAL_STEPS + 1 }, (_, step) => {
    const angle = (step / OVAL_STEPS) * Math.PI * 2

    return [Math.round(cx + Math.cos(angle) * rx), Math.round(cy + Math.sin(angle) * ry)]
  }).flat()
}
