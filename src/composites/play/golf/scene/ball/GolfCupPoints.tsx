'use client'

import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'

import type { GolfPaint } from '@/composites/play/golf/scene/decor/paint'
import type { GolfCup } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { points } = GOLF_SCENE

/**
 * Round badge with the points of a hole
 * @param {number} value - Points
 * @param {string} color - Disc colour
 * @return {CanvasTexture} - Texture
 */

const badgeTexture = (value: number, color: string): CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = points.pixels
  canvas.height = points.pixels
  const context = canvas.getContext('2d')
  const half = points.pixels / 2
  if (context) {
    context.fillStyle = color
    context.beginPath()
    context.arc(half, half, half - points.ring, 0, Math.PI * 2)
    context.fill()
    context.lineWidth = points.ring
    context.strokeStyle = '#ffffff'
    context.stroke()
    context.fillStyle = '#ffffff'
    context.font = `800 ${points.pixels * 0.6}px sans-serif`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(String(value), half, half + points.pixels * 0.04)
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace

  return texture
}

/**
 * Badge floating above a scoring hole
 * @param {Object} props - Hole and colours
 * @param {GolfCup} props.spot - Hole
 * @param {GolfPaint} props.paint - Colours
 * @return {JSX.Element}
 */

export const GolfCupPoints = ({ spot, paint }: { spot: GolfCup; paint: GolfPaint }) => {
  const color = `#${paint[points.tints[Math.min(spot.points, points.tints.length - 1)]].getHexString()}`
  const texture = useMemo(() => badgeTexture(spot.points, color), [spot.points, color])
  useEffect(() => () => texture.dispose(), [texture])

  return (
    <sprite
      position={[spot.x, spot.floor + GOLF_SETTINGS.render.flagHeight + points.lift, spot.z]}
      scale={[points.size, points.size, 1]}
    >
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  )
}
