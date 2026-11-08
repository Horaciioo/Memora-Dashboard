'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, SRGBColorSpace } from 'three'
import type { Sprite } from 'three'

import type { GolfPaint } from '@/composites/play/golf/scene/decor/paint'
import type { GolfFace } from '@/composites/play/golf/types'
import { cupCheerLine, cupNear } from '@/core/lib/play/golf'
import type { GolfHole } from '@/core/lib/play/golf'
import { useGolfCheerStore } from '@/core/store/play/golfCheer'
import type { GolfCupCheer as GolfCupCheerEntry } from '@/core/store/play/golfCheer'
import { fillPlayMessage } from '@/declarations/play/copy'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { cupCheer } = GOLF_SCENE
const { pixels } = cupCheer

// Share of the life spent rising in, then fading up
const RISE_SHARE = 0.2
const FADE_SHARE = 0.75

/**
 * Canvas of one floating line, soft outline for any ground
 * @param {string} text - Line
 * @param {GolfPaint} paint - Colours
 * @return {CanvasTexture} - Texture
 */

const lineTexture = (text: string, paint: GolfPaint): CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = pixels.width
  canvas.height = pixels.height
  const context = canvas.getContext('2d')
  if (context) {
    context.font = `800 ${pixels.font}px ${getComputedStyle(document.body).fontFamily}`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.lineJoin = 'round'
    context.lineWidth = pixels.stroke
    context.strokeStyle = `#${paint.shade.getHexString()}`
    context.fillStyle = `#${paint.pole.getHexString()}`
    context.strokeText(text, pixels.width / 2, pixels.height / 2, pixels.width - pixels.stroke)
    context.fillText(text, pixels.width / 2, pixels.height / 2, pixels.width - pixels.stroke)
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace

  return texture
}

/**
 * One line rising over the flag, swaying, then fading up
 * @param {Object} props - Cheer and place
 * @return {JSX.Element}
 */

const CheerLine = ({
  cheer,
  text,
  base,
  row,
  paint,
}: {
  cheer: GolfCupCheerEntry
  text: string
  base: [number, number, number]
  row: number
  paint: GolfPaint
}) => {
  const sprite = useRef<Sprite>(null)
  const texture = useMemo(() => lineTexture(text, paint), [text, paint])
  useEffect(() => () => texture.dispose(), [texture])
  const height = (cupCheer.width * pixels.height) / pixels.width

  useFrame(() => {
    if (!sprite.current) return
    const life = Math.min(1, (performance.now() - cheer.at) / cupCheer.ms)
    const rise = Math.min(1, life / RISE_SHARE)
    const fade = Math.max(0, (life - FADE_SHARE) / (1 - FADE_SHARE))
    const sway = Math.sin(life * cupCheer.swaySpeed * Math.PI) * cupCheer.sway
    sprite.current.position.set(
      base[0],
      base[1] + row * cupCheer.gap + cupCheer.rise * (rise + fade) + sway,
      base[2]
    )
    sprite.current.material.opacity = Math.min(rise, 1 - fade)
  })

  return (
    <sprite ref={sprite} scale={[cupCheer.width, height, 1]} renderOrder={2}>
      <spriteMaterial map={texture} transparent depthTest={false} depthWrite={false} />
    </sprite>
  )
}

/**
 * Words floating over the cup for every ball holed, same line on every screen
 * @param {Object} props - Course and players
 * @param {GolfHole} props.hole - Hole
 * @param {GolfFace[]} props.faces - Players
 * @param {GolfPaint} props.paint - Colours
 * @return {JSX.Element}
 */

export const GolfCupCheer = ({
  hole,
  faces,
  paint,
}: {
  hole: GolfHole
  faces: GolfFace[]
  paint: GolfPaint
}) => {
  const { cheers, prune } = useGolfCheerStore()

  // Gone once faded
  useEffect(() => {
    if (cheers.length === 0) return
    const timer = window.setTimeout(() => prune(performance.now() - cupCheer.ms), cupCheer.ms)

    return () => window.clearTimeout(timer)
  }, [cheers, prune])

  return (
    <>
      {cheers.map((cheer, row) => {
        const spot = cupNear(hole, cheer.x, cheer.z)
        const base: [number, number, number] = [
          spot.x,
          spot.floor + GOLF_SETTINGS.render.flagHeight + cupCheer.lift,
          spot.z,
        ]
        const name = faces.find((face) => face.accountId === cheer.id)?.name ?? ''
        const line = cupCheerLine(GOLF_BOARD_COPY.cupCheers, `${cheer.id}:${spot.x}:${spot.z}`)
        return (
          <CheerLine
            key={`${cheer.id}-${cheer.at}`}
            cheer={cheer}
            text={fillPlayMessage(line, { user: name.toUpperCase() })}
            base={base}
            row={row}
            paint={paint}
          />
        )
      })}
    </>
  )
}
