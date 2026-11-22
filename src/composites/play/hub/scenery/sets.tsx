import type { ReactNode } from 'react'

import { STOPGO_SET } from '@/composites/play/hub/scenery/stopgoSet'

export interface ScenerySet {
  // Blurred layer on the horizon
  far: ReactNode
  // Sharp layer at the screen corners
  near: ReactNode
  // Layer pinned to the top edge, never cropped by the window ratio
  top?: ReactNode
  // Halo token, the tone when absent
  halo?: string
}

// Set of each hub ground, on a 1600 × 900 canvas
export const SCENERY_SETS: Record<string, ScenerySet> = {
  stopgo: STOPGO_SET,
}
