import { CONCORDAT } from '@/declarations/play/concordat/rules'
import type { ConcordatState } from '@/types/concordat'
import { ConcordatModes } from '@/utils/constants/concordat'
import type { ConcordatModeName } from '@/utils/constants/concordat'

/**
 * Rules of a format
 * @param {ConcordatModeName} mode - Format
 * @return {typeof CONCORDAT.modes.free} - Rules
 */

export const modeRules = (mode: ConcordatModeName) => CONCORDAT.modes[mode]

/**
 * Teams play in this format
 * @param {ConcordatModeName} mode - Format
 * @return {boolean} - Teams
 */

export const hasTeams = (mode: ConcordatModeName): boolean =>
  mode === ConcordatModes.Teams || mode === ConcordatModes.Rotating

/**
 * Side of a nation, its team or itself alone
 * @param {ConcordatState} state - Game
 * @param {number} playerId - Nation
 * @return {number} - Side key
 */

export const sideOf = (state: ConcordatState, playerId: number): number =>
  state.teams[playerId - 1] || 1000 + playerId

/**
 * Two nations share a team
 * @param {ConcordatState} state - Game
 * @param {number} first - Nation
 * @param {number} second - Nation
 * @return {boolean} - Team mates
 */

export const areTeamMates = (state: ConcordatState, first: number, second: number): boolean =>
  first !== second &&
  state.teams[first - 1] > 0 &&
  state.teams[first - 1] === state.teams[second - 1]
