'use client'

import {
  SegmentedControl,
  type SegmentedOption,
} from '@/components/elements/actions/SegmentedControl'
import { useAppearanceStore, type FontScale } from '@/core/store/appearance'

const OPTIONS: SegmentedOption<FontScale>[] = [
  { value: 'sm', label: 'A-' },
  { value: 'md', label: 'A' },
  { value: 'lg', label: 'A+' },
]

/**
 * Three-way switch for the text size preference
 * @return {JSX.Element}
 */

export const AppearanceToggle = () => {
  const fontScale = useAppearanceStore((state) => state.fontScale)
  const setFontScale = useAppearanceStore((state) => state.setFontScale)

  return (
    <SegmentedControl
      options={OPTIONS}
      value={fontScale}
      onChange={setFontScale}
      label="Text size"
    />
  )
}
