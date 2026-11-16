import { CONCORDAT } from '@/declarations/play/concordat/rules'
import { readRange } from '@/declarations/play/settings'
import {
  ConcordatDifficulties,
  ConcordatModes,
  ConcordatSizes,
  ConcordatSpeeds,
  ConcordatStyles,
} from '@/utils/constants/concordat'
import type {
  ConcordatDifficultyName,
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
  speeds: Object.values(ConcordatSpeeds) as ConcordatSpeedName[],
  difficulties: Object.values(ConcordatDifficulties) as ConcordatDifficultyName[],
  initialDifficulty: ConcordatDifficulties.Normal as ConcordatDifficultyName,
  modes: Object.values(ConcordatModes) as ConcordatModeName[],
  initialMode: ConcordatModes.Free as ConcordatModeName,
  initialSize: ConcordatSizes.Medium as ConcordatSizeName,
  initialStyle: ConcordatStyles.World as ConcordatStyleName,
  initialSpeed: ConcordatSpeeds.Normal as ConcordatSpeedName,
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
 * Team count range of a team format
 * @type {{ initial: number, min: number, max: number }}
 */

export const CONCORDAT_TEAMS = {
  initial: CONCORDAT.teamCount.default,
  min: CONCORDAT.teamCount.min,
  max: CONCORDAT.teamCount.max,
}
