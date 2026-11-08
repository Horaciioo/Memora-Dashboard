import { Plane, Raycaster, Vector2, Vector3 } from 'three'
import type { Camera, Group } from 'three'
import type { RefObject } from 'react'

import {
  clampDistance,
  clampFree,
  clampFreeSpeed,
  clampPitch,
  flatAxes,
} from '@/composites/play/golf/scene/rig'
import type { GolfRig } from '@/composites/play/golf/scene/rig'
import { aimOf, isAimHidden, shotVector } from '@/core/lib/play/golf'
import type { GolfPowerName } from '@/utils/constants/play'
import { useGolfAimStore } from '@/core/store/golfAim'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { aim, camera, freeCamera, physics } = GOLF_SETTINGS

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
  // Powers on the own ball now
  powers: () => Set<GolfPowerName>
  onShoot: (angle: number, power: number) => void
  onPlace: (x: number, z: number) => void
}

/**
 * Pull and spot shared with the drawing
 * @typedef {Object} GolfPointerState
 */

export interface GolfPointerState {
  // Pull being aimed, sway clock in ms, camera look when it began
  shot: { angle: number; power: number; since: number; axis: number } | null
  // Ground point held, the rubber band end
  grip: Vector3 | null
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
  const since = context.state.shot?.since ?? performance.now()
  const axis = context.state.shot?.axis ?? context.input.current.rigRef.current.yaw
  context.state.shot = { angle, power: Math.min(1, length / aim.pullMeters), since, axis }
  context.state.grip = found.point
  // Blind aim shows no gauge
  const isHidden = isAimHidden(context.input.current.powers())
  useGolfAimStore.getState().setPower(isHidden ? null : context.state.shot.power)
}

/**
 * Angle of the arrow now, the one the ball leaves on
 * @param {NonNullable<GolfPointerState['shot']>} shot - Pull
 * @param {Set<GolfPowerName>} powers - Powers on the ball
 * @return {number} - Angle
 */

export const aimedAngle = (
  shot: NonNullable<GolfPointerState['shot']>,
  powers: Set<GolfPowerName>
): number => aimOf({ ...shot, seconds: (performance.now() - shot.since) / 1000 }, powers)

/**
 * Drop the pull being aimed
 * @param {GolfPointerState} state - Live aim
 * @return {void}
 */

export const cancelAim = (state: GolfPointerState): void => {
  state.shot = null
  state.grip = null
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
  if (context.mode === 'turn' && rig.isFree && event.pointerType === 'touch') {
    // One finger slides the flight over the ground
    const { ahead, right } = flatAxes(rig.yaw)
    const side = -(event.clientX - last.x) * freeCamera.pan
    const forth = (event.clientY - last.y) * freeCamera.pan
    rig.free.position.x += right[0] * side + ahead[0] * forth
    rig.free.position.z += right[1] * side + ahead[1] * forth
    clampFree(rig.free.position, rig.free.box)
  } else if (context.mode === 'turn') {
    // The ground follows the finger
    rig.yaw -= (event.clientX - last.x) * camera.dragTurn
    rig.pitch = clampPitch(rig.pitch + (event.clientY - last.y) * camera.dragPitch)
  }
  last.set(event.clientX, event.clientY)
  if (context.mode !== 'pinch' || context.pointers.size < 2) return
  const [first, second] = [...context.pointers.values()]
  const distance = first.distanceTo(second)
  if (rig.isFree) {
    // Spreading the fingers flies ahead
    const { ahead } = flatAxes(rig.yaw)
    const step = (distance - context.pinch) * freeCamera.pinch
    rig.free.position.x += ahead[0] * step
    rig.free.position.z += ahead[1] * step
    clampFree(rig.free.position, rig.free.box)
  } else {
    rig.distance = clampDistance((rig.distance * context.pinch) / Math.max(1, distance))
  }
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
    onShoot(aimedAngle(shot, context.input.current.powers()), shot.power)
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
    // Free flight: the wheel sets the speed
    if (rig.isFree) rig.free.speed = clampFreeSpeed(rig.free.speed * Math.exp(-event.deltaY * freeCamera.wheel))
    else rig.distance = clampDistance(rig.distance * Math.exp(event.deltaY * camera.zoomStep))
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
