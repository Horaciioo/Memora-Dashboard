'use client'

import { Button } from '@/components/elements/actions/Button'
import { THEME_REGISTRY } from '@/declarations/access/preferences'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { useThemeStore } from '@/core/store/theme'

export interface ThemeIconButtonProps {
  className?: string
}

/**
 * One glyph showing the theme in force, a click moves on to the next one
 * @param {string} [className] - Extra classes
 * @return {JSX.Element}
 */

export const ThemeIconButton = ({ className }: ThemeIconButtonProps) => {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)

  const keys = THEME_REGISTRY.keys
  const next = keys[(keys.indexOf(theme) + 1) % keys.length]!
  const current = THEME_REGISTRY.get(theme)

  return (
    <Button
      variant="icon"
      icon={current.icon!}
      className={className}
      title={`${NAV_COPY.theme} : ${current.label}`}
      aria-label={`${NAV_COPY.theme} : ${current.label}`}
      onClick={() => setTheme(next)}
    />
  )
}
