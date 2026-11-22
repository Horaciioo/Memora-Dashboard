import { CONCORDAT } from '@/declarations/play/concordat/rules'
import { readRange } from '@/declarations/play/settings'
import {
  CONCORDAT_RANDOM_STYLE,
  ConcordatDifficulties,
  ConcordatModes,
  ConcordatSizes,
  ConcordatSpeeds,
  ConcordatStyles,
} from '@/utils/constants/concordat'
import type {
  ConcordatDifficultyName,
  ConcordatStyleChoice,
  ConcordatModeName,
  ConcordatSizeName,
  ConcordatSpeedName,
  ConcordatStyleName,
} from '@/utils/constants/concordat'

/**
 * Concordat host choices
 * @type {Object}
 */

export const CONCORDAT_SETTINGS = {
  minPlayers: CONCORDAT.minPlayers,
  maxPlayers: CONCORDAT.maxPlayers,
  sizes: Object.values(ConcordatSizes) as ConcordatSizeName[],
  styles: Object.values(ConcordatStyles) as ConcordatStyleName[],
  styleChoices: [
    ...Object.values(ConcordatStyles),
    CONCORDAT_RANDOM_STYLE,
  ] as ConcordatStyleChoice[],
  speeds: Object.values(ConcordatSpeeds) as ConcordatSpeedName[],
  difficulties: Object.values(ConcordatDifficulties) as ConcordatDifficultyName[],
  initialDifficulty: ConcordatDifficulties.Normal as ConcordatDifficultyName,
  modes: Object.values(ConcordatModes) as ConcordatModeName[],
  initialMode: ConcordatModes.Free as ConcordatModeName,
  initialSize: ConcordatSizes.Medium as ConcordatSizeName,
  initialStyle: ConcordatStyles.World as ConcordatStyleName,
  initialStyleChoice: CONCORDAT_RANDOM_STYLE as ConcordatStyleChoice,
  initialSpeed: ConcordatSpeeds.Normal as ConcordatSpeedName,
  // Zero minutes means no time limit
  unlimited: 0,
  duration: readRange(CONCORDAT.durationMinutes, 'play/concordat.durationMinutes', {
    initial: 30,
    min: 10,
    max: 60,
  }),
}

/**
 * Protection range, zero means none
 * @type {{ initial: number, min: number, max: number }}
 */

export const CONCORDAT_PROTECTION = {
  initial: CONCORDAT.protectionMinutes.default,
  min: CONCORDAT.protectionMinutes.min,
  max: CONCORDAT.protectionMinutes.max,
}

/**
 * Starting troops range, in displayed troops
 * @type {{ initial: number, min: number, max: number, step: number }}
 */

export const CONCORDAT_START_TROOPS = {
  initial: CONCORDAT.startTroopsRange.default,
  min: CONCORDAT.startTroopsRange.min,
  max: CONCORDAT.startTroopsRange.max,
  step: CONCORDAT.startTroopsRange.step,
}

/**
 * Team count range of a team format
 * @type {{ initial: number, min: number, max: number }}
 */

export const CONCORDAT_TEAMS = {
  initial: CONCORDAT.teamCount.default,
  min: CONCORDAT.teamCount.min,
  max: CONCORDAT.teamCount.max,
}

/**
 * Regions that fit each map size, wide ones need a big map
 * @type {Record<ConcordatSizeName, ConcordatStyleName[]>}
 */

export const CONCORDAT_SIZE_STYLES: Record<ConcordatSizeName, ConcordatStyleName[]> = {
  [ConcordatSizes.Small]: [ConcordatStyles.Mediterranean, ConcordatStyles.Europe],
  [ConcordatSizes.Medium]: [
    ConcordatStyles.Europe,
    ConcordatStyles.Africa,
    ConcordatStyles.Oceania,
    ConcordatStyles.Mediterranean,
  ],
  [ConcordatSizes.Large]: [
    ConcordatStyles.World,
    ConcordatStyles.Asia,
    ConcordatStyles.Americas,
    ConcordatStyles.Africa,
  ],
}

/**
 * Choices of the region picker for a size, random included
 * @param {ConcordatSizeName} size - Map size
 * @return {ConcordatStyleChoice[]} - Regions then random
 */

export const concordatStyleChoicesOf = (size: ConcordatSizeName): ConcordatStyleChoice[] => [
  ...CONCORDAT_SIZE_STYLES[size],
  CONCORDAT_RANDOM_STYLE,
]
