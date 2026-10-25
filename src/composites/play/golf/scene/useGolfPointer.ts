'use client'

import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { useThree } from '@react-three/fiber'

import { bindPointer } from '@/composites/play/golf/scene/pointer'
import type { GolfPointerInput, GolfPointerState } from '@/composites/play/golf/scene/pointer'

/**
 * Pointer gestures of the course, handlers always the latest
 * @param {GolfPointerInput} input - Course and handlers
 * @return {RefObject<GolfPointerState>} - Live aim and spot
 */

export const useGolfPointer = (input: GolfPointerInput): RefObject<GolfPointerState> => {
  const { gl, camera } = useThree()
  const latest = useRef(input)
  const state = useRef<GolfPointerState>({ shot: null, spot: null })
  useEffect(() => {
    latest.current = input
  })

  useEffect(() => bindPointer(gl.domElement, camera, latest, state.current), [gl, camera])

  return state
}
