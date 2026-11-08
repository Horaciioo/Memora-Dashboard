'use client'

import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'

import { flatAxes } from '@/composites/play/golf/scene/rig'
import { GOLF_KEYS } from '@/declarations/play/golf/keys'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import { GOLF_SETTINGS } from '@/declarations/play/golf/settings'

const { fly } = GOLF_SCENE.panorama
const { freeCamera } = GOLF_SETTINGS

// Reused each frame
const look = new Vector3()

/**
 * Keys held, read by physical code
 * @param {Set<string>} held - Codes held
 * @param {readonly string[]} keys - Codes of an action
 * @return {number} - One when held
 */

const pressed = (held: Set<string>, keys: readonly string[]): number =>
  keys.some((key) => held.has(key)) ? 1 : 0

/**
 * Free flight over the whole map: keys move, a drag looks, the wheel sets the speed
 * @param {Object} props - Start
 * @param {Vector3} props.start - Camera spot
 * @param {Vector3} props.target - Spot looked at first
 * @return {null}
 */

export const GolfFlyCamera = ({ start, target }: { start: Vector3; target: Vector3 }) => {
  const { camera, gl } = useThree()
  const state = useRef({ yaw: 0, pitch: 0, speed: freeCamera.speed * 2, held: new Set<string>() })

  // First look at the map
  useEffect(() => {
    const direction = target.clone().sub(start).normalize()
    state.current.yaw = Math.atan2(direction.x, direction.z)
    state.current.pitch = -Math.asin(direction.y)
    camera.position.copy(start)
  }, [camera, start, target])

  useEffect(() => {
    const canvas = gl.domElement
    const { held } = state.current
    const keyDown = (event: KeyboardEvent) => held.add(event.code)
    const keyUp = (event: KeyboardEvent) => held.delete(event.code)
    const move = (event: PointerEvent) => {
      if (!(event.buttons & 1)) return
      state.current.yaw -= event.movementX * fly.look
      state.current.pitch = Math.max(
        -fly.maxPitch,
        Math.min(fly.maxPitch, state.current.pitch + event.movementY * fly.look)
      )
    }
    const wheel = (event: WheelEvent) => {
      event.preventDefault()
      state.current.speed = Math.max(
        freeCamera.minSpeed,
        Math.min(freeCamera.maxSpeed * 2, state.current.speed * (1 - event.deltaY * fly.wheel))
      )
    }
    window.addEventListener('keydown', keyDown)
    window.addEventListener('keyup', keyUp)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('wheel', wheel, { passive: false })

    return () => {
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('wheel', wheel)
    }
  }, [gl])

  useFrame(({ camera: view }, delta) => {
    const { yaw, pitch, speed, held } = state.current
    const { ahead, right } = flatAxes(yaw)
    const forward = pressed(held, GOLF_KEYS.zoomIn) - pressed(held, GOLF_KEYS.zoomOut)
    const side = pressed(held, GOLF_KEYS.right) - pressed(held, GOLF_KEYS.left)
    const rise = pressed(held, GOLF_KEYS.rise) - pressed(held, GOLF_KEYS.sink)
    const step = speed * delta
    view.position.x += (ahead[0] * forward + right[0] * side) * step
    view.position.z += (ahead[1] * forward + right[1] * side) * step
    view.position.y = Math.max(freeCamera.minHeight, view.position.y + rise * step)
    look.set(Math.sin(yaw) * Math.cos(pitch), -Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch))
    view.lookAt(look.add(view.position))
  })

  return null
}
