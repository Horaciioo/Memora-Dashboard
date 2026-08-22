'use client'

import { useEffect } from 'react'

import { resolveTheme, useThemeStore } from '@/core/store/theme'

/**
 * Sync theme
 * @return {null} - No render
 */

export const ThemeManager = () => {
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    const apply = () => {
      document.documentElement.classList.toggle('dark', resolveTheme(theme) === 'dark')
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
