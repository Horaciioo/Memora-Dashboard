import type { ConcordatScene } from '@/composites/play/concordat/board/draw/types'
import { rgbText } from '@/core/lib/play/concordat'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { drawBoat, drawTrain } from '@/composites/play/concordat/board/draw/drawBoat'
import { drawShipBadge } from '@/composites/play/concordat/board/draw/drawShipBadge'
import { ConcordatPhases, ConcordatPowers, ConcordatShipKinds } from '@/utils/constants/concordat'

const { pawn, frame, arrow, ship: look } = CONCORDAT_ART

// Tile centre on screen
const centerOf = (scene: ConcordatScene, tile: number): [number, number] => {
  const { camera, client } = scene
  const column = tile % client.map.width
  const row = (tile - column) / client.map.width

  return [camera.x + (column + 0.5) * camera.scale, camera.y + (row + 0.5) * camera.scale]
}

// Round pawn: coloured head, pale ring, shadow
const drawPawn = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: readonly number[],
  isMine: boolean
): void => {
  context.fillStyle = rgbText(frame.shadow, 0.35)
  context.beginPath()
  context.ellipse(x + size * 0.15, y + size * 0.55, size * 0.7, size * 0.3, 0, 0, Math.PI * 2)
  context.fill()
  context.lineWidth = pawn.ring * (isMine ? 1.6 : 1)
  context.strokeStyle = rgbText(frame.rgb)
  context.fillStyle = rgbText(color)
  context.beginPath()
  context.arc(x, y, size * 0.55, 0, Math.PI * 2)
  context.fill()
  context.stroke()
}

/**
 * One pawn per nation, on its capital or on its start while picking
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @return {void}
 */

export const drawPawns = (context: CanvasRenderingContext2D, scene: ConcordatScene): void => {
  const { camera, client, colors } = scene
  const size = Math.min(pawn.max, Math.max(pawn.min, camera.scale * pawn.base))
  const isPicking = client.phase === ConcordatPhases.Picking

  for (const player of client.players) {
    const tile = isPicking ? player.start : player.capital
    if (!player.alive || tile < 0) continue
    if (player.kind !== ConcordatPowers.Human && camera.scale < pawn.aiScale) continue
    const [x, y] = centerOf(scene, tile)
    drawPawn(context, x, y, size, colors[player.id], player.id === client.me)
  }
}

// Last tile of each ship and when it got there, for the glide
const voyages = new Map<
  number,
  { tile: number; from: number; at: number; span: number; heading: number }
>()

// Where a ship is between its previous tile and its tile, and which way it points
const voyageOf = (
  id: number,
  tile: number,
  now: number
): { from: number; glide: number; angle: (scene: ConcordatScene) => number; isMoving: boolean } => {
  const known = voyages.get(id)
  if (!known) voyages.set(id, { tile, from: tile, at: now, span: 600, heading: 0 })
  const voyage = voyages.get(id)!

  // A new tile starts a glide as long as the last wait
  if (voyage.tile !== tile) {
    voyage.span = Math.min(2000, Math.max(120, now - voyage.at))
    voyage.from = voyage.tile
    voyage.tile = tile
    voyage.at = now
  }
  const glide = voyage.from === tile ? 1 : Math.min(1, (now - voyage.at) / voyage.span)

  return {
    from: voyage.from,
    glide,
    isMoving: now - voyage.at < voyage.span * 2 && voyage.from !== tile,
    angle: (scene) => {
      if (voyage.from !== tile) {
        const [fromX, fromY] = centerOf(scene, voyage.from)
        const [toX, toY] = centerOf(scene, tile)
        voyage.heading = Math.atan2(toY - fromY, toX - fromX)
      }

      return voyage.heading
    },
  }
}

/**
 * Ships as hulls at any zoom, with their course to the far shore
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @return {void}
 */

export const drawStructures = (context: CanvasRenderingContext2D, scene: ConcordatScene): void => {
  const { camera, client, colors } = scene
  const size = Math.max(look.min, camera.scale * 0.8)

  // A sunk ship forgets its voyage
  if (voyages.size > client.ships.length) {
    const alive = new Set(client.ships.map((ship) => ship.id))
    for (const id of voyages.keys()) if (!alive.has(id)) voyages.delete(id)
  }

  for (const ship of client.ships) {
    const [x, y] = centerOf(scene, ship.tile)
    const isWar = ship.kind === ConcordatShipKinds.War
    const isCargo = ship.kind === ConcordatShipKinds.Trade

    // Dotted course toward the coast it lands on
    if (ship.landing >= 0) {
      const [goalX, goalY] = centerOf(scene, ship.landing)
      context.save()
      context.setLineDash(arrow.dash)
      context.lineWidth = 2
      context.strokeStyle = rgbText(colors[ship.owner] ?? frame.shadow, 0.8)
      context.beginPath()
      context.moveTo(x, y)
      context.lineTo(goalX, goalY)
      context.stroke()
      context.restore()
    }
    // Glides from the last tile to this one, heading along the move
    const { from, glide, angle, isMoving } = voyageOf(ship.id, ship.tile, scene.now)
    const [fromX, fromY] = centerOf(scene, from)
    const at = [fromX + (x - fromX) * glide, fromY + (y - fromY) * glide]
    const hull = size * (isCargo ? 1.1 : 1.4)
    const color = colors[ship.owner] ?? frame.shadow
    if (ship.kind === ConcordatShipKinds.Train) {
      drawTrain(context, at[0], at[1], size * 0.9, angle(scene), color)

      continue
    }
    drawBoat(context, at[0], at[1], hull, angle(scene), color, scene.now, ship.id, isMoving, isWar)
    drawShipBadge(context, at[0], at[1], hull, color, ship.kind, ship.hp, ship.vet)
  }
}
