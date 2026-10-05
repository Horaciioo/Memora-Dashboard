import { LEGACY_CONFLICTS } from '@/declarations/academy/legacy/conflicts'
import { LEGACY_MANAGEMENT } from '@/declarations/academy/legacy/management'
import {
  LEGACY_ANIMATORS,
  LEGACY_DISCORD,
  LEGACY_LIVES,
} from '@/declarations/academy/legacy/trades'
import type { Course } from '@/declarations/academy/curriculum/types'

/**
 * Every Legacy module
 * @type {ReadonlyMap<string, Course>}
 */

export const LEGACY_MODULES: ReadonlyMap<string, Course> = new Map(
  [LEGACY_MANAGEMENT, LEGACY_CONFLICTS, LEGACY_DISCORD, LEGACY_LIVES, LEGACY_ANIMATORS].map(
    (course) => [course.key, course]
  )
)

// Modules every track follows
const COMMON_MODULES = [LEGACY_MANAGEMENT.key, LEGACY_CONFLICTS.key]

/**
 * Module of each trade
 * @type {Readonly<Record<string, string>>}
 */

const TRADE_MODULES: Readonly<Record<string, string>> = {
  Discord: LEGACY_DISCORD.key,
  Lives: LEGACY_LIVES.key,
  Animateurs: LEGACY_ANIMATORS.key,
}

/**
 * Trades a Legacy track can lead
 * @type {readonly string[]}
 */

export const LEGACY_TRADES: readonly string[] = Object.keys(TRADE_MODULES)

/**
 * The three modules of a track: the two common ones
 * @param {string | null} trade - Trade the future Responsable leads
 * @return {Course[]} - Modules in order
 */

export const modulesForTrade = (trade: string | null): Course[] =>
  [...COMMON_MODULES, ...(trade && TRADE_MODULES[trade] ? [TRADE_MODULES[trade]] : [])].flatMap(
    (key) => {
      const found = LEGACY_MODULES.get(key)

      return found ? [found] : []
    }
  )
