'use client'

import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

import { freeLayer } from '@/composites/play/naval/ocean/layers'
import { oceanLoop } from '@/composites/play/naval/ocean/loop'
import { recordPaint } from '@/composites/play/naval/ocean/monitor'
import { createPen, paintOcean } from '@/composites/play/naval/ocean/paintOcean'
import type { OceanPen, OceanScene } from '@/composites/play/naval/ocean/paintOcean'
import { currentTier, reportFrame } from '@/composites/play/naval/ocean/tier'
import { NAVAL_QUALITY } from '@/declarations/play/naval/quality'
import { NAVAL_SHAKE, NAVAL_VIEW } from '@/declarations/play/naval/view'
import { NAVAL_WEAPONS } from '@/declarations/play/naval/weapons'
import { NavalQualities } from '@/utils/constants/play'
import { SECOND_MS } from '@/utils/constants/time'
import { prefersReducedMotion } from '@/utils/motion'

export type { OceanScene } from '@/composites/play/naval/ocean/paintOcean'

/**
 * Latest scene and whether it still has to be painted
 * @typedef {Object} OceanFeed
 */

interface OceanFeed {
  scene: RefObject<OceanScene>
  isDirty: RefObject<boolean>
}

/**
 * Canvas sized to its box at the tier density
 * @param {HTMLCanvasElement} element - Canvas
 * @param {OceanPen} pen - Pen
 * @param {number} ceiling - Tier pixel ceiling
 * @return {void}
 */

const fitCanvas = (element: HTMLCanvasElement, pen: OceanPen, ceiling: number): void => {
  pen.ratio = Math.min(window.devicePixelRatio || 1, ceiling)
  const pixels = Math.round(pen.width * pen.ratio)
  if (element.width === pixels) return
  element.width = pixels
  element.height = pixels
}

/**
 * Screen shake of the strike under way, scaled by the tier
 * @param {OceanScene} scene - Scene
 * @param {number} share - Strike shake share
 * @param {number} tierShake - Tier shake share, zero under reduced motion
 * @return {string} - Translate value
 */

const shakeOf = ({ playing }: OceanScene, share: number, tierShake: number): string => {
  const weapon = playing[0] ? NAVAL_WEAPONS[playing[0].strike.weapon]?.name : undefined
  const amount = weapon ? share * NAVAL_SHAKE[weapon] * tierShake : 0

  return amount ? `${(Math.random() - 0.5) * amount}px ${(Math.random() - 0.5) * amount}px` : ''
}

/**
 * Paint loop of a canvas: full pace during a strike, idle pace otherwise, none out of sight
 * @param {HTMLCanvasElement} element - Canvas
 * @param {CanvasRenderingContext2D} ctx - Pen
 * @param {OceanFeed} feed - Scene feed
 * @return {() => void} - Stops and frees the layers
 */

const startOcean = (element: HTMLCanvasElement, ctx: CanvasRenderingContext2D, feed: OceanFeed) => {
  const pen = createPen(ctx, element.clientWidth)
  const isCalm = prefersReducedMotion()
  let paintedAt = -Infinity
  let busyAt: number | null = null
  const tick = (now: number) => {
    const { name, tier: picked } = currentTier()
    // Reduced motion: still sea, flash and mark only
    const tier = isCalm ? { ...picked, life: 0, follow: false, shake: 0 } : picked
    const scene = feed.scene.current
    const fps = name === NavalQualities.Minimal ? NAVAL_QUALITY.ecoFps : NAVAL_VIEW.idleFps
    const isBusy = scene.playing.length > 0 || pen.stage.pool.live > 0
    if (!isBusy && !feed.isDirty.current && now - paintedAt < SECOND_MS / fps) return
    if (isBusy && busyAt !== null) reportFrame(now - busyAt, now)
    busyAt = isBusy ? now : null
    paintedAt = now
    feed.isDirty.current = false
    fitCanvas(element, pen, tier.pixelRatio)
    const started = performance.now()
    const share = paintOcean(pen, scene, now, tier)
    recordPaint(performance.now() - started, name, {
      particles: pen.stage.pool.live,
      strikes: scene.playing.length,
    })
    element.style.translate = shakeOf(scene, share, tier.shake)
  }
  const wake = () => {
    pen.width = element.clientWidth
    busyAt = null
    feed.isDirty.current = true
  }
  const stop = oceanLoop(element, { tick, wake, rest: () => (element.style.translate = '') })

  return () => {
    stop()
    freeLayer(pen.still)
    freeLayer(pen.marked)
  }
}

/**
 * Paint loop of a sea on a canvas
 * @param {RefObject<HTMLCanvasElement | null>} canvas - Canvas
 * @param {OceanScene} scene - Scene, read on every frame
 * @return {void}
 */

export const useOceanPainter = (
  canvas: RefObject<HTMLCanvasElement | null>,
  scene: OceanScene
): void => {
  const latest = useRef(scene)
  // A new scene paints on the next frame, whatever the pace
  const isDirty = useRef(true)
  useEffect(() => {
    latest.current = scene
    isDirty.current = true
  })

  useEffect(() => {
    const element = canvas.current
    const ctx = element?.getContext('2d')
    if (!element || !ctx) return

    return startOcean(element, ctx, { scene: latest, isDirty })
  }, [canvas])
}
