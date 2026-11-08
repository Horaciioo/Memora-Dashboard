'use client'

import { useState } from 'react'

import { firstCamera } from '@/core/lib/play/naval/camera'
import type { NavalCamera } from '@/core/lib/play/naval/camera'
import { NAVAL_VIEW } from '@/declarations/play/naval/view'

/**
 * Camera of one sea, back to the start when the sea changes
 * @param {number} size - Squares per side
 * @param {string} key - Sea shown, a new one recentres
 * @param {number} [startSpan] - Squares across on arrival
 * @return {[NavalCamera, (camera: NavalCamera) => void]} - Camera and setter
 */

export const useOceanCamera = (
  size: number,
  key: string,
  startSpan: number = NAVAL_VIEW.startCells
): [NavalCamera, (camera: NavalCamera) => void] => {
  const [held, setHeld] = useState<{ key: string; camera: NavalCamera } | null>(null)
  const camera = held?.key === key ? held.camera : firstCamera(size, startSpan)

  return [camera, (next) => setHeld({ key, camera: next })]
}
