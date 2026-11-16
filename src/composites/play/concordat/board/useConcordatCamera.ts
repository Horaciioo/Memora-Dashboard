'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

import {
  centerOnTile,
  clampCamera,
  fitCamera,
  fitScale,
  tileAtPoint,
  zoomCamera,
} from '@/core/lib/play/concordat'
import type { ConcordatCamera, ConcordatFrame } from '@/core/lib/play/concordat'
import { CONCORDAT_ART } from '@/declarations/play/concordat/art'

const { zoom, maxDpr } = CONCORDAT_ART

// Pixels a pointer may drift and still tap
const TAP_SLOP = 6
// Free margin around the map in pixels
const SLACK = 48
const ARROWS: Record<string, [number, number]> = {
  ArrowLeft: [1, 0],
  ArrowRight: [-1, 0],
  ArrowUp: [0, 1],
  ArrowDown: [0, -1],
}

export interface ConcordatCameraProps {
  wrap: RefObject<HTMLDivElement | null>
  canvas: RefObject<HTMLCanvasElement | null>
  mapWidth: number
  mapHeight: number
  // Tile the first view lands on, none shows the whole map
  focusTile: number
  // Redraw request
  invalidate: () => void
  onTap: (tile: number, x: number, y: number) => void
  onHover: (tile: number, x: number, y: number) => void
  onMenu: (tile: number, x: number, y: number) => void
}

/**
 * Camera of the map: size of the canvas, drag, wheel, pinch and arrow keys
 * @param {ConcordatCameraProps} props - Elements and callbacks
 * @return {Object} - Camera and size refs, recentre on a tile
 */

export const useConcordatCamera = ({
  wrap,
  canvas,
  mapWidth,
  mapHeight,
  focusTile,
  invalidate,
  onTap,
  onHover,
  onMenu,
}: ConcordatCameraProps) => {
  const camera = useRef<ConcordatCamera>({ x: 0, y: 0, scale: 1 })
  const size = useRef({ width: 0, height: 0 })
  const [view, setView] = useState({ width: 0, height: 0 })
  // Stays on the whole map until the player moves it
  const isFitted = useRef(true)
  const isLanded = useRef(false)
  const taps = useRef({ onTap, onHover, onMenu })
  useEffect(() => {
    taps.current = { onTap, onHover, onMenu }
  })

  const frameOf = useCallback(
    (): ConcordatFrame => ({
      viewWidth: size.current.width,
      viewHeight: size.current.height,
      mapWidth,
      mapHeight,
    }),
    [mapWidth, mapHeight]
  )

  const limitsOf = useCallback(
    () => [fitScale(frameOf(), zoom.fit) * zoom.out, zoom.max],
    [frameOf]
  )

  // Zoom target, eased toward frame by frame
  const goal = useRef<{ scale: number; x: number; y: number } | null>(null)
  const loop = useRef(0)

  const place = useCallback(
    (next: ConcordatCamera) => {
      camera.current = clampCamera(next, frameOf(), SLACK)
      invalidate()
    },
    [frameOf, invalidate]
  )

  const glide = useCallback(() => {
    cancelAnimationFrame(loop.current)
    let last = performance.now()
    const tick = (now: number) => {
      const target = goal.current
      if (!target) return
      const ease = 1 - Math.exp(-(now - last) / zoom.glide)
      last = now
      const ratio = target.scale / camera.current.scale
      const done = Math.abs(Math.log(ratio)) < 0.002
      const step = done ? ratio : ratio ** ease
      place(zoomCamera(camera.current, step, target.x, target.y, limitsOf()))
      if (done) goal.current = null
      else loop.current = requestAnimationFrame(tick)
    }
    loop.current = requestAnimationFrame(tick)
  }, [place, limitsOf])

  const zoomTo = useCallback(
    (factor: number, x: number, y: number) => {
      const [low, high] = limitsOf()
      const base = goal.current?.scale ?? camera.current.scale
      isFitted.current = false
      goal.current = { scale: Math.min(high, Math.max(low, base * factor)), x, y }
      glide()
    },
    [limitsOf, glide]
  )

  const stopGlide = useCallback(() => {
    goal.current = null
    cancelAnimationFrame(loop.current)
  }, [])

  useEffect(() => stopGlide, [stopGlide])

  const recenter = useCallback(
    (tile: number, scale: number) => {
      stopGlide()
      isFitted.current = false
      place(centerOnTile(camera.current, frameOf(), tile, scale))
    },
    [frameOf, place, stopGlide]
  )

  // Canvas follows its box, pixel ratio capped
  useEffect(() => {
    const box = wrap.current
    const target = canvas.current
    if (!box || !target) return

    const observer = new ResizeObserver(() => {
      const ratio = Math.min(maxDpr, window.devicePixelRatio || 1)
      size.current = { width: box.clientWidth, height: box.clientHeight }
      setView(size.current)
      // Hidden box, nothing to frame yet
      if (!size.current.width || !size.current.height) return

      target.width = Math.round(box.clientWidth * ratio)
      target.height = Math.round(box.clientHeight * ratio)
      const frame = frameOf()
      if (!isLanded.current && focusTile >= 0) {
        isLanded.current = true
        // A camera the player already placed stays where it is
        if (!isFitted.current) {
          place(camera.current)

          return
        }
        isFitted.current = false
        place(
          centerOnTile(
            camera.current,
            frame,
            focusTile,
            size.current.height / CONCORDAT_ART.focusTiles
          )
        )

        return
      }
      place(isFitted.current ? fitCamera(frame, zoom.fit) : camera.current)
    })
    observer.observe(box)

    return () => observer.disconnect()
  }, [wrap, canvas, frameOf, place, focusTile])

  // Wheel, drag, pinch and taps
  useEffect(() => {
    const box = wrap.current
    if (!box) return
    const pointers = new Map<number, { x: number; y: number }>()
    let drag = { moved: 0 }
    let pinch = 0
    const local = (event: PointerEvent | WheelEvent): [number, number] => {
      const rect = box.getBoundingClientRect()

      return [event.clientX - rect.left, event.clientY - rect.top]
    }

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const [x, y] = local(event)
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1
      const raw = event.deltaY * unit
      // Trackpad residue is dropped, a pinch is amplified
      if (!event.ctrlKey && Math.abs(raw) < zoom.deadZone) return
      const delta = Math.max(-300, Math.min(300, raw * (event.ctrlKey ? zoom.pinchBoost : 1)))
      stopGlide()
      isFitted.current = false
      place(zoomCamera(camera.current, 1 / (1 + delta / zoom.divisor), x, y, limitsOf()))
    }
    const onDown = (event: PointerEvent) => {
      if (event.button > 0) return
      const [x, y] = local(event)
      stopGlide()
      // A lost release must not leave a ghost finger
      if (event.pointerType === 'mouse') pointers.clear()
      pointers.set(event.pointerId, { x, y })
      box.setPointerCapture(event.pointerId)
      drag = { moved: 0 }
      pinch = 0
    }
    const onMove = (event: PointerEvent) => {
      const [x, y] = local(event)
      const last = pointers.get(event.pointerId)
      if (!last) return taps.current.onHover(tileAtPoint(camera.current, frameOf(), x, y), x, y)
      pointers.set(event.pointerId, { x, y })
      if (pointers.size === 2) {
        const [first, second] = [...pointers.values()]
        const gap = Math.hypot(first.x - second.x, first.y - second.y)
        if (pinch) {
          isFitted.current = false
          const midX = (first.x + second.x) / 2
          const midY = (first.y + second.y) / 2
          place(zoomCamera(camera.current, gap / pinch, midX, midY, limitsOf()))
        }
        pinch = gap
        drag.moved = TAP_SLOP + 1

        return
      }
      drag.moved += Math.abs(x - last.x) + Math.abs(y - last.y)
      if (drag.moved <= TAP_SLOP) return
      isFitted.current = false
      place({
        ...camera.current,
        x: camera.current.x + x - last.x,
        y: camera.current.y + y - last.y,
      })
    }
    const onUp = (event: PointerEvent) => {
      const [x, y] = local(event)
      const isTap = pointers.size === 1 && drag.moved <= TAP_SLOP && event.type === 'pointerup'
      pointers.delete(event.pointerId)
      pinch = 0
      if (isTap) taps.current.onTap(tileAtPoint(camera.current, frameOf(), x, y), x, y)
    }
    const onLeave = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && !pointers.size) taps.current.onHover(-1, 0, 0)
    }

    const onContext = (event: MouseEvent) => {
      event.preventDefault()
      const rect = box.getBoundingClientRect()
      const [x, y] = [event.clientX - rect.left, event.clientY - rect.top]
      pointers.clear()
      taps.current.onMenu(tileAtPoint(camera.current, frameOf(), x, y), x, y)
    }

    box.addEventListener('contextmenu', onContext)
    box.addEventListener('wheel', onWheel, { passive: false })
    box.addEventListener('pointerdown', onDown)
    box.addEventListener('pointermove', onMove)
    box.addEventListener('pointerup', onUp)
    box.addEventListener('pointercancel', onUp)
    box.addEventListener('pointerleave', onLeave)
    box.addEventListener('lostpointercapture', onUp)

    return () => {
      box.removeEventListener('contextmenu', onContext)
      box.removeEventListener('wheel', onWheel)
      box.removeEventListener('pointerdown', onDown)
      box.removeEventListener('pointermove', onMove)
      box.removeEventListener('pointerup', onUp)
      box.removeEventListener('pointercancel', onUp)
      box.removeEventListener('pointerleave', onLeave)
      box.removeEventListener('lostpointercapture', onUp)
    }
  }, [wrap, frameOf, limitsOf, place, stopGlide])

  // Arrow keys pan, plus and minus zoom
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, [contenteditable="true"]')) return
      const step = ARROWS[event.key]
      const centre = [size.current.width / 2, size.current.height / 2]
      if (step) {
        isFitted.current = false
        stopGlide()
        place({
          ...camera.current,
          x: camera.current.x + step[0] * zoom.pan,
          y: camera.current.y + step[1] * zoom.pan,
        })
      } else if (event.key === '+' || event.key === '-') {
        const factor = event.key === '+' ? 1 + zoom.keyStep : 1 / (1 + zoom.keyStep)
        zoomTo(factor, centre[0], centre[1])
      }
    }
    window.addEventListener('keydown', onKey)

    return () => window.removeEventListener('keydown', onKey)
  }, [place, zoomTo, stopGlide])

  return { camera, size, view, recenter }
}
