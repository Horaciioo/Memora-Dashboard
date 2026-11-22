import type { ConcordatScene } from '@/composites/play/concordat/board/draw/types'
import { rgbText, tieOfRows } from '@/core/lib/play/concordat'
import { cornersOf, railsOf } from '@/core/lib/play/concordat/trade/rails'
import type { ConcordatRail } from '@/core/lib/play/concordat/trade/rails'
import { useConcordatViewStore } from '@/core/store/play/concordatView'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'
import { CONCORDAT } from '@/declarations/play/concordat/rules'
import {
  ConcordatBuildingKinds,
  ConcordatRouteKinds,
  ConcordatTerrains,
  ConcordatTies,
} from '@/utils/constants/concordat'

const { rails: look } = CONCORDAT_ART
const { trains } = CONCORDAT.trade

type Point = [number, number]

// Rails of a factory read once per set of stations
const MEMO = new Map<string, ConcordatRail[]>()

const railsFor = (scene: ConcordatScene, factory: number, stations: number[]): ConcordatRail[] => {
  const key = `${factory}|${stations.join(',')}`
  let rails = MEMO.get(key)
  if (!rails) {
    if (MEMO.size > 400) MEMO.clear()
    const { terrain, width } = scene.client.map
    rails = railsOf(terrain, width, factory, stations, trains.range, trains.links)
    MEMO.set(key, rails)
  }

  return rails
}

// One rail along its corners: dark casing, then a white dashed core
const drawRail = (
  context: CanvasRenderingContext2D,
  points: Point[],
  width: number,
  color: { casing: string; core: string },
  isDashed: boolean,
  isThin = false
): void => {
  context.beginPath()
  points.forEach(([x, y], index) => (index ? context.lineTo(x, y) : context.moveTo(x, y)))
  context.setLineDash(isDashed ? [width, width] : [])
  context.strokeStyle = color.casing
  context.lineWidth = isThin ? Math.max(1.5, width * 0.4) : width
  context.stroke()
  if (isDashed || isThin) return
  context.setLineDash([width * look.dash[0], width * look.dash[1]])
  context.strokeStyle = color.core
  context.lineWidth = width * 0.4
  context.stroke()
}

/**
 * Rails from every factory to the markets and ports it serves, right angles over land, and the rail a building armed on the pointer would lay
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @return {void}
 */

export const drawRoutes = (context: CanvasRenderingContext2D, scene: ConcordatScene): void => {
  const { camera, client, hoverTile } = scene
  const { buildings, routes, ties } = client.systems
  const { width, terrain } = client.map
  const centre = (tile: number): Point => {
    const column = tile % width

    return [
      camera.x + (column + 0.5) * camera.scale,
      camera.y + ((tile - column) / width + 0.5) * camera.scale,
    ]
  }
  const pointsOf = (from: number, line: number[]): Point[] =>
    cornersOf(width, from, line).map(centre)
  const stroke = Math.min(look.max, Math.max(look.min, camera.scale * look.base))
  // Rails take the colour of their nation: deep casing, light dotted core
  const tint = (owner: number): { casing: string; core: string } => {
    const rgb = scene.colors[owner] ?? look.casing

    return {
      casing: rgbText(
        rgb.map((value) => Math.round(value * look.shade)),
        0.95
      ),
      core: rgbText(rgb.map((value) => Math.round(value + (255 - value) * look.tint))),
    }
  }

  context.save()
  context.lineCap = 'butt'
  context.lineJoin = 'miter'

  // Stations a factory may serve: markets and ports that are not at war with it
  const stationsOf = (owner: number): number[] =>
    buildings
      .filter(
        (building) =>
          (building.kind === ConcordatBuildingKinds.Market ||
            building.kind === ConcordatBuildingKinds.Port) &&
          (building.owner === owner ||
            tieOfRows(ties, owner, building.owner) !== ConcordatTies.Hostile)
      )
      .map((building) => building.tile)

  for (const factory of buildings) {
    if (factory.kind !== ConcordatBuildingKinds.Factory) continue
    for (const rail of railsFor(scene, factory.tile, stationsOf(factory.owner))) {
      drawRail(context, pointsOf(factory.tile, rail.line), stroke, tint(factory.owner), false)
    }
  }

  // Links between allied markets, as rails too
  const tiles = new Map(buildings.map((building) => [building.id, building.tile]))
  const owners = new Map(buildings.map((building) => [building.id, building.owner]))
  for (const route of routes) {
    const from = tiles.get(route.buildingA)
    const to = tiles.get(route.buildingB)
    if (route.kind !== ConcordatRouteKinds.Land || from === undefined || to === undefined) continue
    drawRail(
      context,
      [centre(from), centre(to)],
      stroke,
      tint(owners.get(route.buildingA) ?? 0),
      route.isCut
    )
  }

  // Preview: where the armed building would lay rails
  const { tool } = useConcordatViewStore.getState()
  const isMine = hoverTile >= 0 && client.owner[hoverTile] === client.me
  if (tool?.kind === 'build' && isMine && terrain[hoverTile] !== ConcordatTerrains.Sea) {
    const ghost = {
      casing: rgbText(look.ghost, look.ghostAlpha),
      core: rgbText(look.core, look.ghostAlpha),
    }
    const mine = stationsOf(client.me)
    const jobs: { from: number; line: number[] }[] = []
    if (tool.building === ConcordatBuildingKinds.Factory) {
      for (const rail of railsFor(scene, hoverTile, mine))
        jobs.push({ from: hoverTile, line: rail.line })
    } else if (
      tool.building === ConcordatBuildingKinds.Market ||
      tool.building === ConcordatBuildingKinds.Port
    ) {
      for (const factory of buildings) {
        if (factory.kind !== ConcordatBuildingKinds.Factory || factory.owner !== client.me) continue
        const rail = railsFor(scene, factory.tile, [...mine, hoverTile]).find(
          (found) => found.station === hoverTile
        )
        if (rail) jobs.push({ from: factory.tile, line: rail.line })
      }
    }
    for (const job of jobs) {
      drawRail(context, pointsOf(job.from, job.line), stroke, ghost, false, true)
    }
    // Reach of a factory about to be laid
    if (tool.building === ConcordatBuildingKinds.Factory) {
      const [x, y] = centre(hoverTile)
      context.setLineDash([])
      context.beginPath()
      context.arc(x, y, trains.range * camera.scale, 0, Math.PI * 2)
      context.fillStyle = rgbText(look.core, 0.16)
      context.fill()
      context.strokeStyle = rgbText(look.core, 0.6)
      context.lineWidth = 2
      context.stroke()
    }
  }
  context.restore()
}
