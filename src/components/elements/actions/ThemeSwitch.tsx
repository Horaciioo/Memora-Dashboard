'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { resolveTheme, useThemeStore } from '@/core/store/theme'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'

/**
 * Icon switch flipping the light and dark preference
 * @return {JSX.Element}
 */

export const ThemeSwitch = () => {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)

  // Resolved mode only exists client-side
  const [mode, setMode] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const apply = () => setMode(resolveTheme(theme))

    apply()

    if (theme !== 'SYSTEM') return

    // React to system preference changes
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    query.addEventListener('change', apply)

    return () => query.removeEventListener('change', apply)
  }, [theme])

  const isDark = mode === 'dark'
  const label = isDark ? NAV_COPY.themeLight : NAV_COPY.themeDark

  return (
    <Button
      variant="icon"
      icon={isDark ? 'light' : 'dark'}
      aria-label={label}
      title={label}
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? 'LIGHT' : 'DARK')}
    />
  )
}
