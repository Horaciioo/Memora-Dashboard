import 'server-only'

import { prisma } from '@/core/lib/db'
import { invalidInput } from '@/core/lib/errors'
import { readBodyInteger, readBodyList } from '@/core/lib/play'
import { setFeatures } from '@/core/services/features'
import { FeatureModes, gameFeatureKey } from '@/declarations/features'
import { PLAY_ERRORS, PLAY_GAMES } from '@/declarations/play'
import { PLAY_CONFIG_DEFAULTS, PLAY_CONFIG_LIMITS } from '@/declarations/play/config'
import type { PlayConfigView } from '@/types/play'
import type { PlayGameName } from '@/utils/constants/play'
import { SECOND_MS } from '@/utils/constants/time'

// Row stays read this long before the database is asked again
const CACHE_MS = 3 * SECOND_MS

// Row of the one settings record
const ROW = 'global'

let cache: { at: number; value: PlayConfigView } | null = null

/**
 * Settings, the defaults while the row is missing
 * @return {Promise<PlayConfigView>} - Settings
 */

export const readPlayConfig = async (): Promise<PlayConfigView> => {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.value

  const row = await Promise.resolve()
    .then(() => prisma.playConfig.findUnique({ where: { id: ROW } }))
    .catch(() => null)
  const value: PlayConfigView = row
    ? {
        featuredGames: row.featuredGames.filter(PLAY_GAMES.has),
        featuredBoostOn: row.featuredBoostOn,
        featuredBoostPercent: row.featuredBoostPercent,
        featuredBoostUntil: row.featuredBoostUntil?.toISOString() ?? null,
        globalBoostOn: row.globalBoostOn,
        globalBoostPercent: row.globalBoostPercent,
        globalBoostUntil: row.globalBoostUntil?.toISOString() ?? null,
        tablesPaused: row.tablesPaused,
        announcement: row.announcement,
        announcementOn: row.announcementOn,
      }
    : PLAY_CONFIG_DEFAULTS
  cache = { at: Date.now(), value }

  return value
}

/**
 * Boolean of a body, missing when absent
 * @param {unknown} value - Raw value
 * @param {string} field - Field name
 * @return {boolean | undefined}
 */

const flagOf = (value: unknown, field: string): boolean | undefined => {
  if (value === undefined) return undefined
  if (typeof value !== 'boolean')
    throw invalidInput([{ field, message: PLAY_ERRORS.invalidSettings }])

  return value
}

/**
 * Whole percent of a body inside the bounds
 * @param {Record<string, unknown>} raw - Body
 * @param {string} field - Field name
 * @return {number | undefined}
 */

const percentOf = (raw: Record<string, unknown>, field: string): number | undefined => {
  if (raw[field] === undefined) return undefined
  const value = readBodyInteger(raw, field) ?? Number(raw[field])
  if (!Number.isInteger(value) || value < 1 || value > PLAY_CONFIG_LIMITS.boostMax) {
    throw invalidInput([{ field, message: PLAY_ERRORS.invalidSettings }])
  }

  return value
}

/**
 * End date of a body, null to clear it
 * @param {Record<string, unknown>} raw - Body
 * @param {string} field - Field name
 * @return {Date | null | undefined}
 */

const dateOf = (raw: Record<string, unknown>, field: string): Date | null | undefined => {
  const value = raw[field]
  if (value === undefined) return undefined
  if (value === null || value === '') return null

  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) {
    throw invalidInput([{ field, message: PLAY_ERRORS.invalidSettings }])
  }

  return date
}

/**
 * Banner games of a body, known and distinct, five at most
 * @param {Record<string, unknown>} raw - Body
 * @return {PlayGameName[] | undefined}
 */

const featuredOf = (raw: Record<string, unknown>): PlayGameName[] | undefined => {
  const list = readBodyList(raw, 'featuredGames')
  if (!list) return undefined

  const games = [...new Set(list)].filter(PLAY_GAMES.has)
  if (games.length !== new Set(list).size || games.length > PLAY_CONFIG_LIMITS.featuredMax) {
    throw invalidInput([{ field: 'featuredGames', message: PLAY_ERRORS.invalidSettings }])
  }

  return games
}

/**
 * Change some settings, the ones absent from the body stay as they are
 * @param {Record<string, unknown>} raw - Body
 * @param {string} actorId - Admin acting
 * @return {Promise<PlayConfigView>} - Settings now
 */

export const updatePlayConfig = async (
  raw: Record<string, unknown>,
  actorId: string
): Promise<PlayConfigView> => {
  const note = typeof raw.announcement === 'string' ? raw.announcement.trim() : raw.announcement
  if (typeof note === 'string' && note.length > PLAY_CONFIG_LIMITS.announcementMax) {
    throw invalidInput([{ field: 'announcement', message: PLAY_ERRORS.invalidSettings }])
  }

  const data = {
    featuredGames: featuredOf(raw),
    featuredBoostOn: flagOf(raw.featuredBoostOn, 'featuredBoostOn'),
    featuredBoostPercent: percentOf(raw, 'featuredBoostPercent'),
    featuredBoostUntil: dateOf(raw, 'featuredBoostUntil'),
    globalBoostOn: flagOf(raw.globalBoostOn, 'globalBoostOn'),
    globalBoostPercent: percentOf(raw, 'globalBoostPercent'),
    globalBoostUntil: dateOf(raw, 'globalBoostUntil'),
    tablesPaused: flagOf(raw.tablesPaused, 'tablesPaused'),
    announcementOn: flagOf(raw.announcementOn, 'announcementOn'),
    announcement: typeof note === 'string' ? note || null : undefined,
    updatedById: actorId,
  }

  await prisma.playConfig.upsert({
    where: { id: ROW },
    create: {
      id: ROW,
      ...PLAY_CONFIG_DEFAULTS,
      ...Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)),
    },
    update: data,
  })
  cache = null

  return readPlayConfig()
}

/**
 * Open or close one game for every player
 * @param {Record<string, unknown>} raw - Body with the game and its state
 * @param {string} actorId - Admin acting
 * @return {Promise<void>}
 */

export const setGameOpen = async (raw: Record<string, unknown>, actorId: string) => {
  const game = typeof raw.game === 'string' ? raw.game : ''
  if (!PLAY_GAMES.has(game) || typeof raw.isOpen !== 'boolean') {
    throw invalidInput([{ field: 'game', message: PLAY_ERRORS.unknownGame }])
  }

  await setFeatures(
    {
      keys: [gameFeatureKey(PLAY_GAMES.get(game).slug)],
      mode: raw.isOpen ? FeatureModes.On : FeatureModes.Off,
    },
    actorId
  )
}
