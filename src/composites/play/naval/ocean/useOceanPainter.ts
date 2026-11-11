'use client'

import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

import { frameOf } from '@/composites/play/naval/ocean/paint/frame'
import { paintMarks } from '@/composites/play/naval/ocean/paint/marks'
import { paintShips } from '@/composites/play/naval/ocean/paint/ships'
import type { OceanShip } from '@/composites/play/naval/ocean/paint/ships'
import { paintStrike } from '@/composites/play/naval/ocean/paint/strike'
import type { OceanStrike } from '@/composites/play/naval/ocean/paint/strike'
import { paintWater } from '@/composites/play/naval/ocean/paint/water'
import { paintNearGrid, paintZone } from '@/composites/play/naval/ocean/paint/zone'
import type { OceanZone } from '@/composites/play/naval/ocean/paint/zone'
import type { OceanCell } from '@/composites/play/naval/ocean/useOceanGestures'
import type { NavalCamera } from '@/core/lib/play/naval/camera'
import type { SeaMark } from '@/core/lib/play/naval/sea'
import type { NavalSkin } from '@/declarations/play/naval/skins'
import { NAVAL_SHAKE, NAVAL_VIEW } from '@/declarations/play/naval/view'
import { NAVAL_WEAPONS } from '@/declarations/play/naval/weapons'
import { SECOND_MS } from '@/utils/constants/time'
import { prefersReducedMotion } from '@/utils/motion'

/**
 * Everything a sea paints
 * @typedef {Object} OceanScene
 */

export interface OceanScene {
  size: number
  camera: NavalCamera
  marks: SeaMark[]
  ships: OceanShip[]
  skin: NavalSkin
  hover: OceanCell | null
  zone: OceanZone | null
  playing: OceanStrike | null
}

/**
 * Wrecks seen go down once, those already down lie still
 * @param {Map<string, number>} seen - Ship key to the clock it sank
 * @param {OceanShip[]} ships - Ships
 * @param {number} now - Clock
 * @param {boolean} isFirst - First frame, nothing sinks
 * @return {OceanShip[]} - Ships with their sinking clock
 */

const withSinking = (
  seen: Map<string, number>,
  ships: OceanShip[],
  now: number,
  isFirst: boolean
) =>
  ships.map((entry) => {
    if (!entry.isWreck) return entry
    const key = `${entry.ship.id}:${entry.ship.x}:${entry.ship.y}`
    if (!seen.has(key)) seen.set(key, isFirst ? -Infinity : now)
    const from = seen.get(key) ?? -Infinity

    return Number.isFinite(from) ? { ...entry, sinkFrom: from } : entry
  })

/**
 * Paint loop of a sea on a canvas, one frame per screen refresh
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
    const sinking = new Map<string, number>()
    const isCalm = prefersReducedMotion()
    const idleGap = SECOND_MS / NAVAL_VIEW.idleFps
    let frameId = 0
    let isFirst = true
    let paintedAt = -Infinity
    // Width read once per resize, never per frame
    let width = element.clientWidth
    let isSeen = true
    const sizer = new ResizeObserver(() => {
      width = element.clientWidth
      isDirty.current = true
    })
    sizer.observe(element)
    // A sea scrolled away stops painting
    const sight = new IntersectionObserver(([entry]) => {
      isSeen = entry?.isIntersecting ?? true
      isDirty.current = true
    })
    sight.observe(element)

    const draw = (now: number) => {
      frameId = requestAnimationFrame(draw)
      const { playing } = latest.current
      const isDue = playing || isDirty.current || now - paintedAt >= idleGap
      if (!isSeen || !isDue) return
      paintedAt = now
      isDirty.current = false
      const ratio = window.devicePixelRatio || 1
      if (element.width !== Math.round(width * ratio)) {
        element.width = Math.round(width * ratio)
        element.height = Math.round(width * ratio)
      }
      const { size, camera, marks, ships, skin, hover, zone } = latest.current
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      const frame = frameOf({ ctx, width, size, now, skin }, camera)
      paintWater(frame)
      if (hover) paintNearGrid(frame, hover)
      paintShips(frame, withSinking(sinking, ships, now, isFirst))
      paintMarks(frame, marks)
      if (zone) paintZone(frame, zone)
      const shake = playing ? paintStrike(frame, playing) : 0
      const weapon = playing ? NAVAL_WEAPONS[playing.strike.weapon]?.name : undefined
      const amount = isCalm || !weapon ? 0 : shake * NAVAL_SHAKE[weapon]
      element.style.translate = amount
        ? `${(Math.random() - 0.5) * amount}px ${(Math.random() - 0.5) * amount}px`
        : ''
      isFirst = false
    }
    frameId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frameId)
      sizer.disconnect()
      sight.disconnect()
    }
  }, [canvas])
}
