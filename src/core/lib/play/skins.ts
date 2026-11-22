import { LEVEL_SKINS } from '@/declarations/play/skins'
import type { LevelSkin } from '@/declarations/play/skins'

/**
 * Skin worn at a level
 * @param {number} level - Level
 * @return {LevelSkin} - Skin
 */

export const skinOf = (level: number): LevelSkin =>
  [...LEVEL_SKINS].reverse().find((skin) => level >= skin.from) ?? LEVEL_SKINS[0]
