'use client'

import { THEME_REGISTRY } from '@/declarations/access/preferences'
import { ICONS } from '@/declarations/ui/icons'
import { useThemeStore } from '@/core/store/theme'

// Plain icon per choice
const THEME_ICONS = {
  LIGHT: 'themeLight',
  DARK: 'themeDark',
  SYSTEM: 'themeSystem',
} as const

export interface ThemeCycleProps {
  className?: string
  iconClassName?: string
}

/**
 * Icon button cycling light, dark and system, its glyph follows the choice
 * @param {string} [className] - Button classes
 * @param {string} [iconClassName] - Glyph classes
 * @return {JSX.Element}
 */

export const ThemeCycle = ({ className, iconClassName }: ThemeCycleProps) => {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  const keys = THEME_REGISTRY.keys
  const current = THEME_REGISTRY.get(theme)
  const Icon = ICONS[THEME_ICONS[theme]]

  return (
    <button
      type="button"
      aria-label={current.label}
      title={current.label}
      onClick={() => setTheme(keys[(keys.indexOf(theme) + 1) % keys.length])}
      className={className}
    >
      <Icon className={iconClassName} aria-hidden="true" />
    </button>
  )
}
