import { createElement } from 'react'

import { WeekPlanning, planningSize } from '@/composites/recruitment/file/WeekPlanning'
import type { WeekPlan } from '@/core/lib/recruitment/weekPlanning'
import { PLANNING_LAYOUT, PLANNING_TOKENS } from '@/declarations/recruitment/planning'
import type { PlanningPalette } from '@/declarations/recruitment/planning'

/**
 * Paint as live token references
 * @type {PlanningPalette}
 */

export const LIVE_PALETTE = Object.fromEntries(
  Object.entries(PLANNING_TOKENS).map(([role, token]) => [role, `var(${token})`])
) as PlanningPalette

/**
 * Paint as the values now in force
 * @return {PlanningPalette} - Resolved colours
 */

const resolvedPalette = (): PlanningPalette => {
  const styles = getComputedStyle(document.documentElement)

  return Object.fromEntries(
    Object.entries(PLANNING_TOKENS).map(([role, token]) => [
      role,
      styles.getPropertyValue(token).trim(),
    ])
  ) as PlanningPalette
}

/**
 * Load a picture source
 * @param {string} source - Image URL
 * @return {Promise<HTMLImageElement>} - Decoded image
 */

const loadImage = (source: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Planning image failed to load'))
    image.src = source
  })

/**
 * Render a week as a PNG
 * @param {WeekPlan} plan - Week laid out
 * @return {Promise<Blob>} - PNG file
 */

export const renderPlanningPng = async (plan: WeekPlan): Promise<Blob> => {
  // Markup with resolved paint
  const { renderToStaticMarkup } = await import('react-dom/server')
  const markup = renderToStaticMarkup(
    createElement(WeekPlanning, { plan, palette: resolvedPalette() })
  )

  // Vector drawn onto a canvas
  const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }))
  const { width, height } = planningSize(plan)
  const canvas = document.createElement('canvas')
  canvas.width = width * PLANNING_LAYOUT.exportScale
  canvas.height = height * PLANNING_LAYOUT.exportScale

  try {
    const image = await loadImage(url)
    canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height)
  } finally {
    URL.revokeObjectURL(url)
  }

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Planning PNG empty'))),
      'image/png'
    )
  )
}
