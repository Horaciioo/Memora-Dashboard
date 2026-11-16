import {
  drawBoardBase,
  drawCrossings,
  drawProvinceLines,
} from '@/composites/play/concordat/board/draw/drawBase'
import { drawEchoes } from '@/composites/play/concordat/board/draw/drawEchoes'
import { drawArrows, drawPick } from '@/composites/play/concordat/board/draw/drawFront'
import {
  drawNationNames,
  drawProvinceNames,
} from '@/composites/play/concordat/board/draw/drawLabels'
import { drawBuildings } from '@/composites/play/concordat/board/draw/drawBuildings'
import { drawAim, drawStrikes, drawZones } from '@/composites/play/concordat/board/draw/drawStrikes'
import { drawPawns, drawStructures } from '@/composites/play/concordat/board/draw/drawMarks'
import type { ConcordatScene } from '@/composites/play/concordat/board/draw/types'

/**
 * One frame of the map, layer by layer
 * @param {CanvasRenderingContext2D} context - Canvas
 * @param {ConcordatScene} scene - Frame data
 * @return {void}
 */

export const drawBoard = (context: CanvasRenderingContext2D, scene: ConcordatScene): void => {
  context.clearRect(0, 0, scene.width, scene.height)
  drawBoardBase(context, scene)
  drawProvinceLines(context, scene)
  drawCrossings(context, scene)
  drawProvinceNames(context, scene)
  drawNationNames(context, scene)
  drawZones(context, scene)
  drawArrows(context, scene)
  drawEchoes(context, scene)
  drawBuildings(context, scene)
  drawStructures(context, scene)
  drawStrikes(context, scene)
  if (scene.aim) drawAim(context, scene, scene.aim.isHeavy)
  drawPick(context, scene)
  drawPawns(context, scene)
}
