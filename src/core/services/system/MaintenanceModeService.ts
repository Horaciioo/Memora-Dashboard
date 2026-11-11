import 'server-only'

import { prisma } from '@/core/lib/db'
import { unavailable } from '@/core/lib/errors'
import { NEXUS_OWNER } from '@/declarations/nexus/owner'
import { SECOND_MS } from '@/utils/constants/time'

// Row key of the switch
const MAINTENANCE_KEY = 'maintenance'

// Seconds a reading stays fresh
const CACHE_SECONDS = 5

/**
 * Maintenance as members meet it
 * @typedef {Object} MaintenanceState
 * @property {boolean} enabled - Closed to members
 * @property {string | null} message - Words shown
 * @property {Date | null} until - Announced return
 */

export interface MaintenanceState {
  enabled: boolean
  message: string | null
  until: Date | null
}

let cached: { state: MaintenanceState; at: number } | null = null

/**
 * Current maintenance, cached a few seconds
 * @return {Promise<MaintenanceState>} - State
 */

export const readMaintenance = async (): Promise<MaintenanceState> => {
  if (cached && Date.now() - cached.at < CACHE_SECONDS * SECOND_MS) return cached.state

  const row = await prisma.systemFlag
    .findUnique({ where: { key: MAINTENANCE_KEY } })
    .catch(() => null)
  const lapsed = row?.until ? row.until.getTime() < Date.now() : false
  const state = {
    enabled: Boolean(row?.enabled) && !lapsed,
    message: row?.message ?? null,
    until: row?.until ?? null,
  }
  cached = { state, at: Date.now() }

  return state
}

/**
 * Switch maintenance on or off
 * @param {Object} change - New state
 * @param {boolean} change.enabled - Closed to members
 * @param {string | null} [change.message] - Words shown
 * @param {Date | null} [change.until] - Announced return
 * @param {string} actorId - Owner
 * @return {Promise<void>} - Saved
 */

export const setMaintenance = async (
  change: { enabled: boolean; message?: string | null; until?: Date | null },
  actorId: string
): Promise<void> => {
  const data = {
    enabled: change.enabled,
    message: change.message ?? null,
    until: change.until ?? null,
    updatedById: actorId,
  }
  await prisma.systemFlag.upsert({
    where: { key: MAINTENANCE_KEY },
    create: { key: MAINTENANCE_KEY, ...data },
    update: data,
  })
  cached = null
}

/**
 * Refuse a member while maintenance holds, the owner passes
 * @param {string} discordId - Signed in member
 * @return {Promise<void>} - Throws 503
 */

export const assertNotInMaintenance = async (discordId: string): Promise<void> => {
  if (discordId === NEXUS_OWNER.discordId) return

  const state = await readMaintenance()
  if (state.enabled) throw unavailable(state.message ?? undefined)
}

/**
 * Whether a member sees the maintenance screen
 * @param {string} discordId - Signed in member
 * @return {Promise<MaintenanceState | null>} - State when closed to them
 */

export const maintenanceFor = async (discordId: string): Promise<MaintenanceState | null> => {
  if (discordId === NEXUS_OWNER.discordId) return null
  const state = await readMaintenance()

  return state.enabled ? state : null
}
