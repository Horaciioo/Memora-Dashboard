import { LEVEL_FRAME, LEVEL_SKINS } from '@/declarations/play/skins'
import type { FrameStep, LevelSkin } from '@/declarations/play/skins'

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
 * @return {FrameStep & { stage: number, fx: number }} - Frame, effects included
 */

export const frameOf = (level: number): FrameStep & { stage: number; fx: number } => {
  const { span, step, fxFrom, steps } = LEVEL_FRAME
  const skin = skinOf(level)
  const into = Math.max(0, level - Math.max(1, skin.from))
  const stage = Math.min(steps.length - 1, Math.floor(Math.min(into, span - 1) / step))

  return { ...steps[stage], stage, fx: stage >= fxFrom ? skin.fx : 0 }
}
