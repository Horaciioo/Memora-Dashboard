'use client'

import {
  SegmentedControl,
  type SegmentedOption,
} from '@/components/elements/actions/SegmentedControl'
import { THEME_REGISTRY, type ThemePreference } from '@/declarations/access/preferences'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { useThemeStore } from '@/core/store/theme'

// Compact captions
const OPTIONS: SegmentedOption<ThemePreference>[] = THEME_REGISTRY.keys.map((key) => ({
  value: key,
  label: THEME_REGISTRY.get(key).short,
}))

/**
 * Three-way switch for the light/dark/system preference
 * @return {JSX.Element}
 */

export const ThemeToggle = () => {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)

  return (
    <SegmentedControl options={OPTIONS} value={theme} onChange={setTheme} label={NAV_COPY.theme} />
  )
}
