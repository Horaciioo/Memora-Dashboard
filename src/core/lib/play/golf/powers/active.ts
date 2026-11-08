import { isArmed } from '@/core/lib/play/golf/powers/arming'
import { isEffectActive, isEffectKept } from '@/core/lib/play/golf/powers/effects'
import type { GolfEffect, GolfHazard } from '@/core/lib/play/golf/types'
import type { GolfPowerName } from '@/utils/constants/play'

export type GolfActiveState = 'active' | 'armed' | 'queued'

/**
 * Power acting now, shown in the active column
 * @typedef {Object} GolfActiveEntry
 */

export interface GolfActiveEntry {
  key: string
  power: GolfPowerName
  // Caster, none when unknown
  fromId: string | null
  state: GolfActiveState
  // Server ms it was played, newest first
  at: number
  // Server ms it wears off, or shots and lives left
  until?: number
  shots?: number
  lives?: number
  isMap: boolean
}

/**
 * State of a kept effect
 * @param {GolfEffect | GolfHazard} effect - Effect
 * @param {number} now - Server ms
 * @return {GolfActiveState} - State
 */

const stateOf = (effect: GolfEffect | GolfHazard, now: number): GolfActiveState => {
  if (!isArmed(effect.armsOn, now)) return 'active'

  return effect.armsOn && 'hole' in effect.armsOn ? 'queued' : 'armed'
}

/**
 * Powers acting on a viewer's ball and on the map, newest first, one per power and caster
 * @param {Object} view - Board
 * @param {{ accountId: string, effects: GolfEffect[] }[]} view.players - Balls
 * @param {GolfHazard[]} view.hazards - Map powers
 * @param {string} viewerId - Screen owner or watched ball
 * @param {number} now - Server ms
 * @return {GolfActiveEntry[]} - Entries
 */

export const activeList = (
  {
    players,
    hazards,
  }: { players: { accountId: string; effects: GolfEffect[] }[]; hazards: GolfHazard[] },
  viewerId: string,
  now: number
): GolfActiveEntry[] => {
  const mine = players.find((player) => player.accountId === viewerId)?.effects ?? []
  const entries: GolfActiveEntry[] = [
    ...mine
      .filter((effect) => isEffectKept(effect, now))
      .map((effect) => ({
        key: `ball-${effect.power}-${effect.from ?? ''}`,
        power: effect.power,
        fromId: effect.from ?? null,
        state: stateOf(effect, now),
        at: effect.castAt ?? 0,
        until: effect.until,
        shots: effect.shots,
        lives: effect.lives,
        isMap: false,
      })),
    ...hazards
      .filter((hazard) => isEffectActive(hazard, now) || isArmed(hazard.armsOn, now))
      .map((hazard) => ({
        key: `map-${hazard.power}-${hazard.ownerId}`,
        power: hazard.power,
        fromId: hazard.ownerId,
        state: stateOf(hazard, now),
        at: hazard.laidAt ?? 0,
        until: hazard.until,
        lives: hazard.lives,
        isMap: true,
      })),
  ]
  // Same power from the same caster shows once, the newest
  const newest = new Map<string, GolfActiveEntry>()
  for (const entry of entries) {
    const known = newest.get(entry.key)
    if (!known || entry.at > known.at) newest.set(entry.key, entry)
  }

  return [...newest.values()].sort((a, b) => b.at - a.at)
}
