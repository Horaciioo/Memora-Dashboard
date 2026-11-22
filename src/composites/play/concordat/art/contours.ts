import { CONCORDAT_BANNER } from '@/declarations/play/concordat/banner'

// Points along one ring
const STEPS = 96

/**
 * Closed contour line of a massif, wobbling the same way at every height
 * @param {number} x - Centre x
 * @param {number} y - Centre y
 * @param {number} radius - Ring radius
 * @param {number} seed - Shape seed
 * @return {string} - Path data
 */

export const contourPath = (x: number, y: number, radius: number, seed: number) => {
  const points = Array.from({ length: STEPS }, (_, index) => {
    const angle = (index / STEPS) * Math.PI * 2
    const bend = CONCORDAT_BANNER.wobble.reduce(
      (sum, { wave, depth }, order) => sum + depth * Math.sin(wave * angle + seed * (order + 1)),
      1
    )
    const reach = radius * bend

    return `${(x + Math.cos(angle) * reach).toFixed(1)} ${(y + Math.sin(angle) * reach * 0.82).toFixed(1)}`
  })

  return `M${points.join('L')}Z`
}
