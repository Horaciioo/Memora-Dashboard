'use client'

import { Select } from '@/components/elements/forms/Select'
import { COLOR_VISION_REGISTRY, type ColorVisionMode } from '@/declarations/access/preferences'
import { useColorVisionStore } from '@/core/store/colorVision'

/**
 * Selector for the color vision simulation mode
 * @return {JSX.Element}
 */

export const ColorVisionSelect = () => {
  const colorVisionMode = useColorVisionStore((state) => state.colorVisionMode)
  const setColorVisionMode = useColorVisionStore((state) => state.setColorVisionMode)

  return (
    <Select
      textSize="xs"
      value={colorVisionMode}
      onChange={(event) => setColorVisionMode(event.target.value as ColorVisionMode)}
      aria-label="Color vision mode"
    >
      {COLOR_VISION_REGISTRY.keys.map((key) => (
        <option key={key} value={key}>
          {COLOR_VISION_REGISTRY.get(key).label}
        </option>
      ))}
    </Select>
  )
}
