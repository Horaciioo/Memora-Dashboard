'use client'

import { SelectMenu } from '@/components/elements/forms/SelectMenu'
import { toOptions } from '@/core/lib/forms/options'
import { COLOR_VISION_REGISTRY, type ColorVisionMode } from '@/declarations/access/preferences'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { useColorVisionStore } from '@/core/store/colorVision'

/**
 * Selector for the color vision simulation mode
 * @return {JSX.Element}
 */

export const ColorVisionSelect = () => {
  const colorVisionMode = useColorVisionStore((state) => state.colorVisionMode)
  const setColorVisionMode = useColorVisionStore((state) => state.setColorVisionMode)

  return (
    <SelectMenu
      size="compact"
      label={NAV_COPY.colorVision}
      options={toOptions(COLOR_VISION_REGISTRY)}
      value={colorVisionMode}
      className="w-auto min-w-44"
      onChange={(value) => setColorVisionMode(value as ColorVisionMode)}
    />
  )
}
