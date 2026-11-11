'use client'

import { useEffect, useRef } from 'react'

import { paintHull } from '@/composites/play/naval/ocean/paint/hull'
import { NAVAL_SKIN } from '@/declarations/play/naval/skins'

// Canvas height in squares, room around the hull
const HEIGHT = 1.4

/**
 * A ship drawn alone, flat, for the dock
 * @param {Object} props - Sprite
 * @param {number} props.length - Squares
 * @param {number} props.id - Place in the fleet
 * @param {number} props.cell - Pixels per square
 * @return {JSX.Element}
 */

export const NavalShipSprite = ({
  length,
  id,
  cell,
}: {
  length: number
  id: number
  cell: number
}) => {
  const canvas = useRef<HTMLCanvasElement>(null)
  const width = length * cell
  const height = Math.round(cell * HEIGHT)

  useEffect(() => {
    const element = canvas.current
    const ctx = element?.getContext('2d')
    if (!element || !ctx) return
    const ratio = window.devicePixelRatio || 1
    element.width = Math.round(width * ratio)
    element.height = Math.round(height * ratio)
    ctx.setTransform(ratio, 0, 0, ratio, 0, height / 2)
    paintHull(
      { ctx, width, cell, left: 0, top: 0, size: length, now: 0, skin: NAVAL_SKIN, ratio, life: 0 },
      { id, length, x: 0, y: 0, isHorizontal: true }
    )
  }, [id, length, cell, width, height])

  return (
    <canvas ref={canvas} style={{ width, height }} className="block" aria-hidden="true" />
  )
}
