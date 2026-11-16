import type { ConcordatScene } from '@/composites/play/concordat/board/draw/types'
import { rgbText } from '@/core/lib/play/concordat'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { ConcordatRouteKinds } from '@/utils/constants/concordat'

const { routes: look, frame } = CONCORDAT_ART

type Point = [number, number]

// Point of a curve at a share of its length
const curveAt = (from: Point, bend: Point, to: Point, share: number): Point => {
  const rest = 1 - share

  return [
    rest * rest * from[0] + 2 * rest * share * bend[0] + share * share * to[0],
    rest * rest * from[1] + 2 * rest * share * bend[1] + share * share * to[1],
  ]
}

/**
 * Lines between linked markets, with gold pulses running both ways
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @return {void}
 */

export const drawRoutes = (context: CanvasRenderingContext2D, scene: ConcordatScene): void => {
  const { camera, client, colors, now } = scene
  const { routes, buildings } = client.systems
  if (!routes.length) return

  const width = Math.min(look.max, Math.max(look.min, camera.scale * look.base))
  const tiles = new Map(buildings.map((building) => [building.id, building.tile]))
  const centre = (tile: number): Point => {
    const column = tile % client.map.width

    return [
      camera.x + (column + 0.5) * camera.scale,
      camera.y + ((tile - column) / client.map.width + 0.5) * camera.scale,
    ]
  }

  context.save()
  context.lineCap = 'round'
  for (const route of routes) {
    const tileA = tiles.get(route.buildingA)
    const tileB = tiles.get(route.buildingB)
    if (route.kind !== ConcordatRouteKinds.Land || tileA === undefined || tileB === undefined)
      continue

    const from = centre(tileA)
    const to = centre(tileB)
    const length = Math.hypot(to[0] - from[0], to[1] - from[1])
    if (length < 1) continue

    // Gentle arc, always to the same side of the line
    const bend: Point = [
      (from[0] + to[0]) / 2 - ((to[1] - from[1]) / length) * length * look.arc,
      (from[1] + to[1]) / 2 + ((to[0] - from[0]) / length) * length * look.arc,
    ]
    const first = colors[route.a] ?? frame.shadow
    const second = colors[route.b] ?? frame.shadow

    // Pale casing, then the line in the two nation colours
    const gradient = context.createLinearGradient(from[0], from[1], to[0], to[1])
    gradient.addColorStop(0, rgbText(route.isCut ? look.cut : first, look.alpha))
    gradient.addColorStop(1, rgbText(route.isCut ? look.cut : second, look.alpha))
    context.setLineDash(route.isCut ? look.dash : [])
    for (const [stroke, extra] of [
      [rgbText(frame.rgb, look.casing), look.halo],
      [gradient, 0],
    ] as const) {
      context.strokeStyle = stroke
      context.lineWidth = width + extra
      context.beginPath()
      context.moveTo(from[0], from[1])
      context.quadraticCurveTo(bend[0], bend[1], to[0], to[1])
      context.stroke()
    }
    if (route.isCut) continue

    // One pulse each way, slower on long lines
    context.setLineDash([])
    const period = look.pulseMs + length * look.pulseSlow
    for (const [index, color] of [first, second].entries()) {
      const phase = (((now / period + route.id * 0.37 + index * 0.5) % 1) + 1) % 1
      const [x, y] = curveAt(from, bend, to, index ? 1 - phase : phase)
      context.fillStyle = rgbText(color)
      context.strokeStyle = rgbText(frame.rgb)
      context.lineWidth = Math.max(1, width * 0.4)
      context.beginPath()
      context.arc(x, y, width * look.pulse, 0, Math.PI * 2)
      context.fill()
      context.stroke()
    }
  }
  context.restore()
}
