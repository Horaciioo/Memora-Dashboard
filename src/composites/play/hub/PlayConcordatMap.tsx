'use client'

import { useEffect, useRef } from 'react'

import { generateMap, paintTerrain } from '@/core/lib/play/concordat'
import { CONCORDAT_HUB } from '@/declarations/play/concordat/hub'
import { PLAY_HUB } from '@/declarations/ui/variants'

/**
 * The world map in 2D behind the Concordat hub, oceans and land
 * @return {JSX.Element}
 */

export const PlayConcordatMap = () => {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const target = canvas.current
    const context = target?.getContext('2d')
    if (!target || !context) return

    const map = generateMap(CONCORDAT_HUB.map)
    // Each tile is a square of whole pixels, so every edge stays sharp
    const tiles = document.createElement('canvas')
    tiles.width = map.width
    tiles.height = map.height
    tiles.getContext('2d')?.putImageData(paintTerrain(map, CONCORDAT_HUB), 0, 0)
    target.width = map.width * CONCORDAT_HUB.pixel
    target.height = map.height * CONCORDAT_HUB.pixel
    context.imageSmoothingEnabled = false
    context.drawImage(tiles, 0, 0, target.width, target.height)
  }, [])

  return (
    <div className={PLAY_HUB.embers} aria-hidden="true">
      <canvas ref={canvas} className={PLAY_HUB.worldMap} />
      <div className={PLAY_HUB.worldVeil} />
    </div>
  )
}
