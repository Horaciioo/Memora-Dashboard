import { drawBoardBase } from '@/composites/play/concordat/board/draw/drawBase'
import { drawEchoes } from '@/composites/play/concordat/board/draw/drawEchoes'
import { drawArrows, drawPick } from '@/composites/play/concordat/board/draw/drawFront'
import { drawNationNames } from '@/composites/play/concordat/board/draw/drawLabels'
import { drawRoutes } from '@/composites/play/concordat/board/draw/drawRoutes'
import { drawBuildings } from '@/composites/play/concordat/board/draw/drawBuildings'
import { drawAim, drawStrikes, drawZones } from '@/composites/play/concordat/board/draw/drawStrikes'
import { drawPawns, drawStructures } from '@/composites/play/concordat/board/draw/drawMarks'
import { drawAir } from '@/composites/play/concordat/board/draw/drawAir'
import { drawGroundMood, drawSkyMood } from '@/composites/play/concordat/board/draw/drawAtmosphere'
import { drawBlasts, drawScars } from '@/composites/play/concordat/board/draw/drawBlasts'
import type { ConcordatScene } from '@/composites/play/concordat/board/draw/types'
import { updateWar } from '@/composites/play/concordat/board/draw/warState'

/**
 * One frame of the map, layer by layer
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @return {boolean} - War still moves
 */

export const drawBoard = (context: CanvasRenderingContext2D, scene: ConcordatScene): boolean => {
  const isWar = updateWar(scene.war, scene)
  context.clearRect(0, 0, scene.width, scene.height)
  // A blast shakes the whole map a moment
  const shake = scene.war.shake
  context.save()
  if (shake > 0.05)
    context.translate(Math.sin(scene.now * 0.09) * shake, Math.cos(scene.now * 0.113) * shake)
  drawBoardBase(context, scene)
  drawGroundMood(context, scene)
  drawScars(context, scene)
  drawNationNames(context, scene)
  drawZones(context, scene)
  drawArrows(context, scene)
  drawEchoes(context, scene)
  drawRoutes(context, scene)
  drawBuildings(context, scene)
  drawStructures(context, scene)
  drawStrikes(context, scene)
  if (scene.aim) drawAim(context, scene, scene.aim.radius)
  drawPick(context, scene)
  drawPawns(context, scene)
  drawAir(context, scene)
  drawBlasts(context, scene)
  drawSkyMood(context, scene)
  context.restore()

  return isWar
}
