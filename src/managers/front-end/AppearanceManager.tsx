'use client'

import { useEffect } from 'react'

import { useAppearanceStore } from '@/core/store/appearance'

/**
 * Sync appearance
 * @return {null} - No render
 */

export const AppearanceManager = () => {
  const fontScale = useAppearanceStore((state) => state.fontScale)

  useEffect(() => {
    document.documentElement.dataset.fontScale = fontScale
  }, [fontScale])

  return null
}
