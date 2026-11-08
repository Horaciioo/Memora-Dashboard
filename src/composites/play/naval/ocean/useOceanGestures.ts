'use client'

import { useEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'

import { clampCamera, panBy, seaPointOf, untilt, zoomAt } from '@/core/lib/play/naval/camera'
import type { NavalCamera, NavalPoint } from '@/core/lib/play/naval/camera'
import { NAVAL_VIEW } from '@/declarations/play/naval/view'

/**
 * Square of the sea
 * @typedef {Object} OceanCell
 */

export interface OceanCell {
  x: number
  y: number
}

/**
 * Handlers a sea answers to
 * @typedef {Object} OceanHandlers
 */

export interface OceanHandlers {
  onHover?: (cell: OceanCell | null) => void
  onTap?: (cell: OceanCell) => void
  // A press on a square may grab it, then the drag moves it instead of the camera
  onGrab?: (cell: OceanCell) => boolean
  onDrag?: (cell: OceanCell | null) => void
  onDrop?: (cell: OceanCell | null) => void
}

/**
 * Gesture inputs
 * @typedef {Object} OceanGestureInput
 */

interface OceanGestureInput extends OceanHandlers {
  box: RefObject<HTMLDivElement | null>
  size: number
  camera: NavalCamera
  tilt: number
  setCamera: (camera: NavalCamera) => void
}

/**
 * Square under a screen point, through the tilt and the camera
 * @param {HTMLDivElement} box - Untilted box of the sea
 * @param {NavalPoint} client - Screen point
 * @param {Object} view - Camera, size and tilt
 * @return {{ px: NavalPoint; cell: OceanCell | null }} - Flat pixel and square
 */

export const locate = (
  box: HTMLDivElement,
  client: NavalPoint,
  { camera, size, tilt }: { camera: NavalCamera; size: number; tilt: number }
): { px: NavalPoint; cell: OceanCell | null } => {
  const rect = box.getBoundingClientRect()
  const flat = untilt(
    { x: client.x - rect.left - rect.width / 2, y: client.y - rect.top - rect.height / 2 },
    tilt,
    NAVAL_VIEW.perspective
  )
  const px = { x: flat.x + rect.width / 2, y: flat.y + rect.height / 2 }
  const sea = seaPointOf(camera, px, rect.width)
  const x = Math.floor(sea.x)
  const y = Math.floor(sea.y)
  const isIn = x >= 0 && y >= 0 && x < size && y < size

  return { px, cell: isIn ? { x, y } : null }
}

/**
 * Pointers on a sea: hover, tap, drag to pan or move a ship, pinch and wheel to zoom
 * @param {OceanGestureInput} input - Sea and handlers
 * @return {Object} - Pointer handlers for the box
 */

export const useOceanGestures = (input: OceanGestureInput) => {
  const latest = useRef(input)
  useEffect(() => {
    latest.current = input
  })
  const pointers = useRef(new Map<number, NavalPoint>())
  const press = useRef<{ start: NavalPoint; moved: boolean; grabbed: boolean } | null>(null)

  // Wheel zoom, kept off the page scroll
  useEffect(() => {
    const box = input.box.current
    if (!box) return
    const onWheel = (event: WheelEvent) => {
      const { camera, size, tilt, setCamera } = latest.current
      if (camera.span >= size && event.deltaY > 0) return
      event.preventDefault()
      const { px } = locate(box, { x: event.clientX, y: event.clientY }, { camera, size, tilt })
      const factor = NAVAL_VIEW.zoomStep ** (event.deltaY < 0 ? 1 : -1)
      setCamera(clampCamera(zoomAt(camera, px, box.clientWidth, factor), size, NAVAL_VIEW.minCells))
    }
    box.addEventListener('wheel', onWheel, { passive: false })

    return () => box.removeEventListener('wheel', onWheel)
  }, [input.box])

  const cellOf = (event: ReactPointerEvent) => {
    const { box, camera, size, tilt } = latest.current

    return box.current
      ? locate(box.current, { x: event.clientX, y: event.clientY }, { camera, size, tilt })
      : { px: { x: 0, y: 0 }, cell: null }
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.current.size > 1) return
    const { cell } = cellOf(event)
    const grabbed = Boolean(cell && latest.current.onGrab?.(cell))
    press.current = { start: { x: event.clientX, y: event.clientY }, moved: false, grabbed }
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const { camera, size, setCamera, onHover, onDrag, box } = latest.current
    const width = box.current?.clientWidth ?? 1
    const before = pointers.current.get(event.pointerId)
    const here = { x: event.clientX, y: event.clientY }
    if (!before) return onHover?.(cellOf(event).cell)
    pointers.current.set(event.pointerId, here)

    // Two fingers: pinch around their middle
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      const other = a === here ? b : a
      const factor =
        Math.hypot(here.x - other.x, here.y - other.y) /
        Math.max(1, Math.hypot(before.x - other.x, before.y - other.y))
      const rect = box.current?.getBoundingClientRect()
      const middle = {
        x: (here.x + other.x) / 2 - (rect?.left ?? 0),
        y: (here.y + other.y) / 2 - (rect?.top ?? 0),
      }
      setCamera(clampCamera(zoomAt(camera, middle, width, factor), size, NAVAL_VIEW.minCells))
      if (press.current) press.current.moved = true

      return
    }
    const held = press.current
    if (!held) return
    const travel = Math.hypot(here.x - held.start.x, here.y - held.start.y)
    if (travel > NAVAL_VIEW.tapSlopPx) held.moved = true
    if (held.grabbed) return onDrag?.(cellOf(event).cell)
    if (held.moved)
      setCamera(
        clampCamera(
          panBy(camera, { x: here.x - before.x, y: here.y - before.y }, width),
          size,
          NAVAL_VIEW.minCells
        )
      )
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId)
    const held = press.current
    if (pointers.current.size > 0 || !held) return
    press.current = null
    const { cell } = cellOf(event)
    if (held.grabbed) return latest.current.onDrop?.(cell)
    if (!held.moved && cell) latest.current.onTap?.(cell)
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onPointerLeave: () => latest.current.onHover?.(null),
  }
}
