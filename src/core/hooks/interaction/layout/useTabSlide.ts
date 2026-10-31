'use client'

import { useState } from 'react'

/**
 * Class sliding a panel in from the side its tab sits on
 * @param {number} index - Position of the open tab
 * @return {string} - Animation class, empty until the tab changes
 */

export const useTabSlide = (index: number): string => {
  const [trail, setTrail] = useState<{ index: number; slide: string }>({ index, slide: '' })

  if (trail.index !== index) {
    setTrail({ index, slide: index > trail.index ? 'tab-slide-next' : 'tab-slide-prev' })
  }

  return trail.slide
}
