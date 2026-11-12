import type { CroquisStroke } from '@/core/lib/play/croquis/strokes'
import {
  CROQUIS_COLORS,
  CROQUIS_PAPER,
  CROQUIS_PEN,
  CROQUIS_SETTINGS,
  CROQUIS_SIZES,
} from '@/declarations/play'

/**
 * Stroke drawn as a smooth line, a single point as a dot
 * @param {CanvasRenderingContext2D} ctx - Context
 * @param {CroquisStroke} stroke - Stroke
 * @param {string} color - Resolved colour
 * @return {void}
 */

const paintStroke = (ctx: CanvasRenderingContext2D, stroke: CroquisStroke, color: string): void => {
  const { p } = stroke
  const width = CROQUIS_SIZES[stroke.w] ?? CROQUIS_SIZES[0]
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = width

  if (p.length < 4) {
    ctx.beginPath()
    ctx.arc(p[0], p[1], width / 2, 0, Math.PI * 2)
    ctx.fill()

    return
  }

  ctx.beginPath()
  ctx.moveTo(p[0], p[1])
  // Curves through the middle of each pair of points
  for (let index = 2; index < p.length - 2; index += 2) {
    ctx.quadraticCurveTo(
      p[index],
      p[index + 1],
      (p[index] + p[index + 2]) / 2,
      (p[index + 1] + p[index + 3]) / 2
    )
  }
  ctx.lineTo(p[p.length - 2], p[p.length - 1])
  ctx.stroke()
}

/**
 * Whole drawing painted on the paper
 * @param {HTMLCanvasElement} canvas - Surface
 * @param {CroquisStroke[]} strokes - Strokes in order
 * @return {void}
 */

export const paintDrawing = (canvas: HTMLCanvasElement, strokes: CroquisStroke[]): void => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const styles = getComputedStyle(canvas)
  const colorOf = (index: number): string =>
    styles
      .getPropertyValue(CROQUIS_COLORS[index]?.token ?? CROQUIS_COLORS[CROQUIS_PAPER].token)
      .trim()
  const { width, height } = CROQUIS_SETTINGS.canvas

  ctx.setTransform(CROQUIS_PEN.scale, 0, 0, CROQUIS_PEN.scale, 0, 0)
  ctx.fillStyle = colorOf(CROQUIS_PAPER)
  ctx.fillRect(0, 0, width, height)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (const stroke of strokes) paintStroke(ctx, stroke, colorOf(stroke.c))
}
