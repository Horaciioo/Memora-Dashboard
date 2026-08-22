'use client'

import { useEffect } from 'react'

import { COLOR_VISION_REGISTRY } from '@/declarations/access/preferences'
import { useColorVisionStore } from '@/core/store/colorVision'

/**
 * Sync color vision mode
 * @return {null} - No render
 */

export const ColorVisionManager = () => {
  const colorVisionMode = useColorVisionStore((state) => state.colorVisionMode)

  useEffect(() => {
    const attribute = COLOR_VISION_REGISTRY.get(colorVisionMode).attribute

    if (attribute) {
      document.documentElement.dataset.colorVision = attribute
    } else {
      delete document.documentElement.dataset.colorVision
    }
  }, [colorVisionMode])

  return null
}
