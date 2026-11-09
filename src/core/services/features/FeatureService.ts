import 'server-only'

import { prisma } from '@/core/lib/db'
import { closedKeys, isClosed, verdictOf } from '@/core/lib/features/resolve'
import type { FeatureVerdict } from '@/core/lib/features/resolve'
import { invalidInput } from '@/core/lib/errors'
import { FEATURE_MAP, FeatureModes, FEATURES, subtreeOf } from '@/declarations/features'
import type { FeatureModeName, FeatureState } from '@/declarations/features'
import { FEATURE_COPY } from '@/declarations/features/copy'
import { areBotsAwake } from '@/declarations/play/bots'
import { PlayGames } from '@/utils/constants/play'
import type { ClosedFeatures, FeatureRow } from '@/types/features'
import { SECOND_MS } from '@/utils/constants/time'

// Rows stay read this long before the database is asked again
const CACHE_MS = 3 * SECOND_MS

// Longest note a member reads
const NOTE_MAX = 200

type Overrides = Map<string, FeatureState>

// Asleep whatever its switch says
const isPausedFeature = (key: string): boolean =>
  key === 'play.bots.golf' && !areBotsAwake(PlayGames.Golf)

let cache: { at: number; rows: Overrides } | null = null

/**
 * Switches away from their default, read through a short cache
 * @return {Promise<Overrides>} - Rows by key
 */

export const readOverrides = async (): Promise<Overrides> => {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.rows

  // A missing table or stale client leaves everything open
  const rows = await Promise.resolve()
    .then(() => prisma.featureSwitch.findMany())
    .catch(() => [])
  const overrides: Overrides = new Map(
    rows
      .filter((row) => FEATURE_MAP.has(row.key))
      .map((row) => [row.key, { mode: row.mode as FeatureModeName, note: row.note }])
  )
  cache = { at: Date.now(), rows: overrides }

  return overrides
}

/**
 * Features closed to a viewer
 * @param {boolean} isAdmin - Viewer holds the system
 * @return {Promise<string[]>} - Closed keys
 */

export const readClosedKeys = async (isAdmin: boolean): Promise<string[]> =>
  closedKeys(await readOverrides(), isAdmin)

/**
 * Closed features with the words members read, for the shell
 * @param {boolean} isAdmin - Viewer holds the system
 * @return {Promise<ClosedFeatures>} - Closed features by key
 */

export const readClosedFeatures = async (isAdmin: boolean): Promise<ClosedFeatures> => {
  const overrides = await readOverrides()

  return Object.fromEntries(
    closedKeys(overrides, isAdmin).map((key) => {
      const { mode, note } = verdictOf(key, overrides)

      return [key, { mode, note }]
    })
  )
}

/**
 * Verdict of one feature, parents counted
 * @param {string} key - Feature key
 * @return {Promise<FeatureVerdict>} - Verdict
 */

export const readVerdict = async (key: string): Promise<FeatureVerdict> =>
  verdictOf(key, await readOverrides())

/**
 * Feature is fully on for everyone, for the systems code runs on its own
 * @param {string} key - Feature key
 * @return {Promise<boolean>} - On
 */

export const isFeatureOn = async (key: string): Promise<boolean> =>
  (await readVerdict(key)).mode === FeatureModes.On

/**
 * Feature open to a viewer
 * @param {string} key - Feature key
 * @param {boolean} isAdmin - Viewer holds the system
 * @return {Promise<boolean>} - Open
 */

export const isFeatureOpen = async (key: string, isAdmin: boolean): Promise<boolean> =>
  !isClosed(await readVerdict(key), isAdmin)

/**
 * Every feature with its switch, for the console
 * @return {Promise<FeatureRow[]>} - Rows in registry order
 */

export const listFeatureRows = async (): Promise<FeatureRow[]> => {
  const overrides = await readOverrides()

  return FEATURES.map((feature) => {
    const verdict = verdictOf(feature.key, overrides)

    return {
      key: feature.key,
      own: overrides.get(feature.key)?.mode ?? FeatureModes.On,
      mode: verdict.mode,
      source: verdict.source,
      note: verdict.note,
      isPaused: isPausedFeature(feature.key),
    }
  })
}

/**
 * Move switches, a feature and everything under it when asked
 * @param {Object} change - Change
 * @param {string[]} change.keys - Features to move
 * @param {FeatureModeName} change.mode - New position
 * @param {string | null} [change.note] - Words members read
 * @param {boolean} [change.withChildren] - Carry the whole subtree
 * @param {string} actorId - Member making the change
 * @return {Promise<number>} - Switches written
 */

export const setFeatures = async (
  change: {
    keys: string[]
    mode: FeatureModeName
    note?: string | null
    withChildren?: boolean
  },
  actorId: string
): Promise<number> => {
  const requested = change.withChildren ? change.keys.flatMap(subtreeOf) : change.keys
  const keys = [...new Set(requested)].filter((key) => FEATURE_MAP.has(key))
  if (keys.length === 0) throw invalidInput([{ field: 'keys', message: FEATURE_COPY.unknown }])

  // Locked and sleeping features never move
  const movable = keys.filter((key) => !FEATURE_MAP.get(key)?.locked && !isPausedFeature(key))
  const note = change.note?.trim().slice(0, NOTE_MAX) || null

  if (change.mode === FeatureModes.On) {
    await prisma.featureSwitch.deleteMany({ where: { key: { in: movable } } })
  } else {
    await prisma.$transaction(
      movable.map((key) =>
        prisma.featureSwitch.upsert({
          where: { key },
          create: { key, mode: change.mode, note, updatedById: actorId },
          update: {
            mode: change.mode,
            ...(change.note !== undefined && { note }),
            updatedById: actorId,
          },
        })
      )
    )
  }

  cache = null

  return movable.length
}

/**
 * Put every feature back to its default
 * @return {Promise<number>} - Switches cleared
 */

export const resetFeatures = async (): Promise<number> => {
  const { count } = await prisma.featureSwitch.deleteMany()
  cache = null

  return count
}
