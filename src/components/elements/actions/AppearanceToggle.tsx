'use client'

import {
  SegmentedControl,
  type SegmentedOption,
} from '@/components/elements/actions/SegmentedControl'
import { FONT_SCALE_REGISTRY, type FontScale } from '@/declarations/access/preferences'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { useAppearanceStore } from '@/core/store/appearance'

// Compact captions, the rail has no room for the full labels
const OPTIONS: SegmentedOption<FontScale>[] = FONT_SCALE_REGISTRY.keys.map((key) => ({
  value: key,
  label: FONT_SCALE_REGISTRY.get(key).short,
}))

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
      label={NAV_COPY.textSize}
    />
  )
}
