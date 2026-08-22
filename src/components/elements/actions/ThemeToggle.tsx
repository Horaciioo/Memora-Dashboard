'use client'

import {
  SegmentedControl,
  type SegmentedOption,
} from '@/components/elements/actions/SegmentedControl'
import { useThemeStore, type ThemePreference } from '@/core/store/theme'

const OPTIONS: SegmentedOption<ThemePreference>[] = [
  { value: 'LIGHT', label: 'Light' },
  { value: 'DARK', label: 'Dark' },
  { value: 'SYSTEM', label: 'Auto' },
]

/**
 * Three-way switch for the light/dark/system preference
 * @return {JSX.Element}
 */

export const ThemeToggle = () => {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)

  return <SegmentedControl options={OPTIONS} value={theme} onChange={setTheme} label="Theme" />
}
