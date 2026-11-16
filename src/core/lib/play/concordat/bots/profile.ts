import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatBotProfile } from '@/types/concordat'
import { ConcordatBotLevels, ConcordatBotPersonalities } from '@/utils/constants/concordat'
import type {
  ConcordatBotLevelName,
  ConcordatBotPersonalityName,
  ConcordatBuildingKind,
  ConcordatTechPath,
} from '@/utils/constants/concordat'

const { bots } = CONCORDAT

const LEVELS = Object.values(ConcordatBotLevels)
const PERSONALITIES = Object.values(ConcordatBotPersonalities)

// Stable value of a seed and a nation, 0 to 1
const noiseOf = (seed: number, playerId: number, salt: number): number => {
  const mixed = Math.imul(seed ^ Math.imul(playerId + salt, 2654435761), 2246822519)

  return ((mixed ^ (mixed >>> 15)) >>> 0) / 4294967296
}

// Level drawn by the configured shares
const levelFor = (roll: number): ConcordatBotLevelName => {
  let acc = 0
  for (const level of LEVELS) {
    acc += bots.levelShare[level]
    if (roll < acc) return level
  }

  return ConcordatBotLevels.Recruit
}

/**
 * Level and personality of a nation, drawn from the map seed so a restart keeps them
 * @param {number} seed - Map seed
 * @param {number} playerId - Nation
 * @param {ConcordatBotLevelName} [asked] - Level of the bot account, drawn when absent
 * @return {ConcordatBotProfile} - Profile
 */

export const botProfileOf = (
  seed: number,
  playerId: number,
  asked?: ConcordatBotLevelName
): ConcordatBotProfile => {
  const level = asked ?? levelFor(noiseOf(seed, playerId, 11))
  const personality: ConcordatBotPersonalityName =
    PERSONALITIES[Math.floor(noiseOf(seed, playerId, 29) * PERSONALITIES.length)]
  const traits = bots.personalities[personality]

  return {
    level,
    personality,
    ...bots.levels[level],
    ...traits,
    build: traits.build as ConcordatBuildingKind[],
    techPath: traits.techPath as ConcordatTechPath,
  }
}
