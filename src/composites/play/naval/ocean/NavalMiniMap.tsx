'use client'

import { useEffect, useRef } from 'react'
import type { PointerEvent } from 'react'

import { clampCamera } from '@/core/lib/play/naval/camera'
import type { NavalCamera } from '@/core/lib/play/naval/camera'
import { cellsOf } from '@/core/lib/play/naval/fleet'
import type { NavalShip } from '@/core/lib/play/naval/fleet'
import { SeaMarks } from '@/core/lib/play/naval/sea'
import type { SeaMark } from '@/core/lib/play/naval/sea'
import { NAVAL_BOARD_COPY } from '@/declarations/play/naval/copy'
import { NAVAL_WATER } from '@/declarations/play/naval/skins'
import { NAVAL_VIEW } from '@/declarations/play/naval/view'
import { NAVAL_OCEAN } from '@/declarations/ui/variants/naval'

// Colour of each mark on the map
const MARK_COLOURS: Partial<Record<SeaMark, string>> = {
  [SeaMarks.Miss]: NAVAL_WATER.clear,
  [SeaMarks.Hit]: NAVAL_WATER.hit,
  [SeaMarks.Spotted]: NAVAL_WATER.spotted,
}

/**
 * Whole sea in a corner, the view framed, a tap moves there
 * @param {Object} props - Map
 * @param {number} props.size - Squares per side
 * @param {SeaMark[]} props.marks - Marks
 * @param {NavalShip[]} props.ships - Ships shown
 * @param {NavalCamera} props.camera - Camera
 * @param {(camera: NavalCamera) => void} props.setCamera - Move the camera
 * @return {JSX.Element | null}
 */

export const NavalMiniMap = ({
  size,
  marks,
  ships,
  camera,
  setCamera,
}: {
  size: number
  marks: SeaMark[]
  ships: NavalShip[]
  camera: NavalCamera
  setCamera: (camera: NavalCamera) => void
}) => {
  const canvas = useRef<HTMLCanvasElement>(null)
  const isShown = size >= NAVAL_VIEW.mapFrom && camera.span < size

  useEffect(() => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx || !isShown) return
    ctx.canvas.width = size
    ctx.canvas.height = size
    ctx.fillStyle = NAVAL_WATER.map
    ctx.fillRect(0, 0, size, size)
    ctx.fillStyle = NAVAL_WATER.foam
    for (const cell of ships.flatMap(cellsOf)) ctx.fillRect(cell.x, cell.y, 1, 1)
    marks.forEach((mark, index) => {
      const colour = MARK_COLOURS[mark]
      if (!colour) return
      ctx.fillStyle = colour
      ctx.fillRect(index % size, Math.floor(index / size), 1, 1)
    })
    ctx.strokeStyle = NAVAL_WATER.view
    ctx.lineWidth = 0.6
    ctx.strokeRect(camera.x - camera.span / 2, camera.y - camera.span / 2, camera.span, camera.span)
  }, [isShown, size, marks, ships, camera])

  if (!isShown) return null

  const jump = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * size
    const y = ((event.clientY - rect.top) / rect.height) * size
    setCamera(clampCamera({ ...camera, x, y }, size, NAVAL_VIEW.minCells))
  }

  return (
    <canvas
      ref={canvas}
      className={NAVAL_OCEAN.map}
      aria-label={NAVAL_BOARD_COPY.map}
      onPointerDown={jump}
      onPointerMove={(event) => event.buttons > 0 && jump(event)}
    />
  )
}
