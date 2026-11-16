import { drawBoat } from '@/composites/play/concordat/board/draw/drawBoat'
import type { ConcordatScene } from '@/composites/play/concordat/board/draw/types'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { crossingsOf, rgbText } from '@/core/lib/play/concordat'

const { frame, drop, paper, detail, wash, boat } = CONCORDAT_ART

/**
 * Board frame with its hard drop shadow, then the paper map
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @return {void}
 */

export const drawBoardBase = (context: CanvasRenderingContext2D, scene: ConcordatScene): void => {
  const { camera, client, layers } = scene
  const width = client.map.width * camera.scale
  const height = client.map.height * camera.scale
  const edge = Math.min(frame.max, Math.max(frame.min, camera.scale * frame.size))

  context.fillStyle = rgbText(frame.shadow, drop.alpha)
  context.fillRect(
    camera.x - edge + drop.x,
    camera.y - edge + drop.y,
    width + 2 * edge,
    height + 2 * edge
  )
  context.fillStyle = rgbText(frame.rgb)
  context.fillRect(camera.x - edge, camera.y - edge, width + 2 * edge, height + 2 * edge)

  context.imageSmoothingEnabled = false
  context.drawImage(layers.terrain, camera.x, camera.y, width, height)
  context.drawImage(layers.owner, camera.x, camera.y, width, height)
  if (scene.washed) {
    context.globalAlpha = wash.alpha
    context.drawImage(layers.mask, camera.x, camera.y, width, height)
    context.globalAlpha = 1
  }
}

/**
 * Thin lines between provinces, when the zoom is close enough
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @return {void}
 */

export const drawProvinceLines = (
  context: CanvasRenderingContext2D,
  scene: ConcordatScene
): void => {
  const { camera, client, width, height } = scene
  if (camera.scale < detail.provinces) return
  const { map } = client
  const first = Math.max(0, Math.floor(-camera.x / camera.scale))
  const last = Math.min(map.width - 1, Math.ceil((width - camera.x) / camera.scale))
  const top = Math.max(0, Math.floor(-camera.y / camera.scale))
  const bottom = Math.min(map.height - 1, Math.ceil((height - camera.y) / camera.scale))

  // Lines inside one nation take its colour, darkened, the rest stay grey
  const paths = new Map<number, Path2D>()
  const pathOf = (owner: number): Path2D => {
    const known = paths.get(owner) ?? new Path2D()
    paths.set(owner, known)

    return known
  }
  const ownerAt = (tile: number, other: number): number =>
    client.owner[tile] && client.owner[tile] === client.owner[other] ? client.owner[tile] : 0

  for (let row = top; row <= bottom; row++) {
    for (let column = first; column <= last; column++) {
      const tile = row * map.width + column
      const province = map.province[tile]
      if (!province) continue
      const x = camera.x + (column + 1) * camera.scale
      const y = camera.y + (row + 1) * camera.scale
      if (column < map.width - 1 && map.province[tile + 1] && map.province[tile + 1] !== province) {
        const path = pathOf(ownerAt(tile, tile + 1))
        path.moveTo(x, y - camera.scale)
        path.lineTo(x, y)
      }
      if (
        row < map.height - 1 &&
        map.province[tile + map.width] &&
        map.province[tile + map.width] !== province
      ) {
        const path = pathOf(ownerAt(tile, tile + map.width))
        path.moveTo(x - camera.scale, y)
        path.lineTo(x, y)
      }
    }
  }

  context.lineWidth = 1
  for (const [owner, path] of paths) {
    const rgb = scene.colors[owner]
    context.strokeStyle =
      owner && rgb
        ? rgbText(
            rgb.map((value) => value * paper.ownDark),
            0.9
          )
        : rgbText(paper.line, paper.alpha)
    context.lineWidth = owner ? Math.min(3, Math.max(1.5, camera.scale * 0.12)) : 1
    context.stroke(path)
  }
}

/**
 * Small boat on each narrow water, the only way over a river
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @return {void}
 */

export const drawCrossings = (context: CanvasRenderingContext2D, scene: ConcordatScene): void => {
  const { camera, client, width, height } = scene
  if (camera.scale < detail.crossings) return

  const size = Math.min(boat.max, Math.max(boat.min, camera.scale * boat.size))
  for (const tile of crossingsOf(client.map)) {
    const x = camera.x + ((tile % client.map.width) + 0.5) * camera.scale
    const y = camera.y + (Math.floor(tile / client.map.width) + 0.5) * camera.scale
    if (x < -size || y < -size || x > width + size || y > height + size) continue

    drawBoat(context, x, y, size, Math.PI / 2, boat.rgb, scene.now, tile)
  }
}
