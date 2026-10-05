'use client'

import { useEffect } from 'react'

import { resolveTheme, useThemeStore } from '@/core/store/theme'

// Longer than the fade in base/theme.css
const THEME_FADE_MS = 700

/**
 * Sync theme
 * @return {null} - No render
 */

export const ThemeManager = () => {
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    const root = document.documentElement
    const apply = () => {
      // Colours glide instead of snapping
      root.classList.add('theme-fade')
      root.classList.toggle('dark', resolveTheme(theme) === 'dark')
      window.setTimeout(() => root.classList.remove('theme-fade'), THEME_FADE_MS)
    }

    apply()

    if (theme !== 'SYSTEM') return

    // React to system preference changes
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    query.addEventListener('change', apply)

    return () => query.removeEventListener('change', apply)
  }, [theme])

  return null
}
