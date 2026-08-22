import { createRegistry } from '@/core/lib/registry'

export type ColorVisionMode = 'NONE' | 'PROTANOPIA' | 'DEUTERANOPIA' | 'TRITANOPIA'

interface ColorVisionOption {
  label: string
  // SVG filter id
  attribute?: string
}

/**
 * Color vision modes
 * @type {Record<ColorVisionMode, ColorVisionOption>}
 */

const COLOR_VISION_MAP: Record<ColorVisionMode, ColorVisionOption> = {
  NONE: { label: 'Default' },
  PROTANOPIA: { label: 'Protanopia', attribute: 'protanopia' },
  DEUTERANOPIA: { label: 'Deuteranopia', attribute: 'deuteranopia' },
  TRITANOPIA: { label: 'Tritanopia', attribute: 'tritanopia' },
}

export const COLOR_VISION_REGISTRY = createRegistry(COLOR_VISION_MAP)
