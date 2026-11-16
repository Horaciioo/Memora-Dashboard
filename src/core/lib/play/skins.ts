import { LEVEL_FRAME, LEVEL_SKINS } from '@/declarations/play/skins'
import type { LevelSkin } from '@/declarations/play/skins'

/**
 * Skin worn at a level
 * @param {number} level - Level
 * @return {LevelSkin} - Skin
 */

export const skinOf = (level: number): LevelSkin =>
  [...LEVEL_SKINS].reverse().find((skin) => level >= skin.from) ?? LEVEL_SKINS[0]

/**
 * Ornaments of the frame worn at a level
 * @param {number} level - Level
 * @return {{ leaves: number, hasChin: boolean, hasArch: boolean, stars: number }} - Frame
 */

export const frameOf = (level: number) => {
  const { tier, step, leaves, chinFrom, archFrom, maxStars } = LEVEL_FRAME
  const stage = Math.min(leaves.length - 1, Math.floor((Math.max(0, level) % tier) / step))

  return {
    leaves: leaves[stage],
    hasChin: stage >= chinFrom,
    hasArch: stage >= archFrom,
    stars: Math.min(maxStars, Math.floor(Math.max(0, level) / tier)),
  }
}
