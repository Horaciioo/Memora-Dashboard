import { Plane, Raycaster, Vector2, Vector3 } from 'three'
import type { Camera, Group } from 'three'
import type { RefObject } from 'react'

import { clampDistance } from '@/composites/play/golf/scene/rig'
import type { GolfRig } from '@/composites/play/golf/scene/rig'
import { shotVector } from '@/core/lib/play/golf'
import { useGolfAimStore } from '@/core/store/golfAim'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { aim, camera, physics } = GOLF_SETTINGS

// Ground faces up
const UP = new Vector3(0, 1, 0)

/**
 * What the pointer can do on the course
 * @typedef {Object} GolfPointerInput
 */

export interface GolfPointerInput {
  rigRef: RefObject<GolfRig>
  lawn: RefObject<Group | null>
  myId: string | null
  // Own ball can be hit now
  canShoot: () => boolean
  isPlacing: boolean
  onShoot: (angle: number, power: number) => void
  onPlace: (x: number, z: number) => void
}

/**
 * Pull and spot shared with the drawing
 * @typedef {Object} GolfPointerState
 */

export interface GolfPointerState {
  // Pull being aimed
  shot: { angle: number; power: number } | null
  // Lawn spot under the pointer while placing
  spot: Vector3 | null
}

/**
 * One bound canvas
 * @typedef {Object} PointerContext
 */

interface PointerContext {
  element: HTMLElement
  view: Camera
  input: RefObject<GolfPointerInput>
  state: GolfPointerState
  raycaster: Raycaster
  pointers: Map<number, Vector2>
  mode: 'idle' | 'aim' | 'turn' | 'pinch'
  downAt: Vector2
  pinch: number
}

/**
 * Cast the ray under a pointer
 * @param {PointerContext} context - Canvas
 * @param {PointerEvent} event - Pointer
 * @return {void}
 */

const castRay = ({ element, raycaster, view }: PointerContext, event: PointerEvent): void => {
  const box = element.getBoundingClientRect()
  const ndc = new Vector2(
    ((event.clientX - box.left) / box.width) * 2 - 1,
    -((event.clientY - box.top) / box.height) * 2 + 1
  )
  raycaster.setFromCamera(ndc, view)
}

/**
 * Own ball and the ground point under the pointer at its height
 * @param {PointerContext} context - Canvas
 * @param {PointerEvent} event - Pointer
 * @return {{ ball: Vector3, point: Vector3 } | null} - Ball and point
 */

const pointAtBall = (context: PointerContext, event: PointerEvent) => {
  const { myId, rigRef } = context.input.current
  const ball = myId ? rigRef.current.spots.get(myId) : undefined
  if (!ball) return null
  castRay(context, event)
  const point = context.raycaster.ray.intersectPlane(new Plane(UP, -ball.y), new Vector3())

  return point ? { ball, point } : null
}

/**
 * Pull from the ball, slingshot style
 * @param {PointerContext} context - Canvas
 * @param {PointerEvent} event - Pointer
 * @return {void}
 */

const pull = (context: PointerContext, event: PointerEvent): void => {
  const found = pointAtBall(context, event)
  if (!found) return
  const { angle, length } = shotVector(found.ball.x - found.point.x, found.ball.z - found.point.z)
  context.state.shot = { angle, power: Math.min(1, length / aim.pullMeters) }
  useGolfAimStore.getState().setPower(context.state.shot.power)
}

/**
 * Drop the pull being aimed
 * @param {GolfPointerState} state - Live aim
 * @return {void}
 */

export const cancelAim = (state: GolfPointerState): void => {
  state.shot = null
  useGolfAimStore.getState().setPower(null)
}

/**
 * Pointer down: second finger pinches, near the ball aims, elsewhere turns
 * @param {PointerContext} context - Canvas
 * @param {PointerEvent} event - Pointer
 * @return {void}
 */

const onDown = (context: PointerContext, event: PointerEvent): void => {
  context.pointers.set(event.pointerId, new Vector2(event.clientX, event.clientY))
  context.element.setPointerCapture(event.pointerId)
  context.downAt = new Vector2(event.clientX, event.clientY)
  if (context.pointers.size > 1) {
    cancelAim(context.state)
    const [first, second] = [...context.pointers.values()]
    context.mode = 'pinch'
    context.pinch = first.distanceTo(second)
    return
  }
  const { canShoot, isPlacing } = context.input.current
  const found = pointAtBall(context, event)
  const isGrab = Boolean(found && found.point.distanceTo(found.ball) <= aim.grabRadius)
  context.mode = canShoot() && !isPlacing && isGrab ? 'aim' : 'turn'
  if (context.mode === 'aim') pull(context, event)
}

/**
 * Pointer move: aim, turn, pinch, or follow the lawn while placing
 * @param {PointerContext} context - Canvas
 * @param {PointerEvent} event - Pointer
 * @return {void}
 */

const onMove = (context: PointerContext, event: PointerEvent): void => {
  const { rigRef, isPlacing, lawn } = context.input.current
  const rig = rigRef.current
  if (isPlacing) {
    castRay(context, event)
    context.state.spot =
      context.raycaster.intersectObjects(lawn.current?.children ?? [], true)[0]?.point ?? null
  }
  const last = context.pointers.get(event.pointerId)
  if (!last) return
  if (context.mode === 'aim') pull(context, event)
  if (context.mode === 'turn') rig.yaw += (event.clientX - last.x) * camera.dragTurn
  last.set(event.clientX, event.clientY)
  if (context.mode !== 'pinch' || context.pointers.size < 2) return
  const [first, second] = [...context.pointers.values()]
  const distance = first.distanceTo(second)
  rig.distance = clampDistance((rig.distance * context.pinch) / Math.max(1, distance))
  context.pinch = distance
}

/**
 * Pointer up: shoot the pull, or place where tapped
 * @param {PointerContext} context - Canvas
 * @param {PointerEvent} event - Pointer
 * @return {void}
 */

const onUp = (context: PointerContext, event: PointerEvent): void => {
  context.pointers.delete(event.pointerId)
  const { onShoot, onPlace, isPlacing } = context.input.current
  const { shot, spot } = context.state
  const moved = context.downAt.distanceTo(new Vector2(event.clientX, event.clientY))
  if (context.mode === 'aim' && shot && shot.power >= physics.minPower)
    onShoot(shot.angle, shot.power)
  if (context.mode !== 'aim' && moved < GOLF_SCENE.aim.clickPixels && isPlacing && spot) {
    onPlace(spot.x, spot.z)
  }
  cancelAim(context.state)
  if (!context.pointers.size) context.mode = 'idle'
}

/**
 * Listen to the canvas gestures
 * @param {HTMLElement} element - Canvas
 * @param {Camera} view - Camera
 * @param {RefObject<GolfPointerInput>} input - Latest handlers
 * @param {GolfPointerState} state - Live aim
 * @return {() => void} - Stop listening
 */

export const bindPointer = (
  element: HTMLElement,
  view: Camera,
  input: RefObject<GolfPointerInput>,
  state: GolfPointerState
): (() => void) => {
  const context: PointerContext = {
    element,
    view,
    input,
    state,
    raycaster: new Raycaster(),
    pointers: new Map(),
    mode: 'idle',
    downAt: new Vector2(),
    pinch: 0,
  }
  const wheel = (event: WheelEvent) => {
    event.preventDefault()
    const rig = input.current.rigRef.current
    rig.distance = clampDistance(rig.distance * Math.exp(event.deltaY * camera.zoomStep))
  }
  const handlers: [string, (event: PointerEvent) => void][] = [
    ['pointerdown', (event) => onDown(context, event)],
    ['pointermove', (event) => onMove(context, event)],
    ['pointerup', (event) => onUp(context, event)],
    ['pointercancel', (event) => onUp(context, event)],
  ]
  for (const [name, handler] of handlers) element.addEventListener(name, handler as EventListener)
  element.addEventListener('wheel', wheel, { passive: false })

  return () => {
    for (const [name, handler] of handlers)
      element.removeEventListener(name, handler as EventListener)
    element.removeEventListener('wheel', wheel)
    cancelAim(state)
  }
}
