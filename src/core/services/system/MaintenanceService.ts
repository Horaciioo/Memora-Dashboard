import 'server-only'

import { prisma } from '@/core/lib/db'
import { logger } from '@/core/lib/logger'
import { pruneSessions } from '@/core/services/auth/SessionService'
import { purgeModerationLog } from '@/core/services/lives/ModerationLogService'
import { pruneOrphanFiles } from '@/core/services/system/FileService'
import { RETENTION_SETTINGS } from '@/declarations/configurations/settings'
import { RETENTION_POLICIES } from '@/declarations/system/security/privacy'
import { DAY_MS } from '@/utils/constants/time'

/**
 * What one maintenance pass removed
 * @typedef {Object} MaintenanceReport
 * @property {number} sessions - Expired sessions dropped
 * @property {number} notifications - Read notifications dropped
 * @property {number} pushDeliveries - Push journal lines dropped
 * @property {number} activityLogs - Journal entries dropped
 * @property {number} candidates - Rejected candidacies dropped
 * @property {number} bans - Lapsed blacklist entries dropped
 * @property {number} files - Orphan files dropped
 * @property {number} storedBytes - Weight the binaries add to every backup
 */

export interface MaintenanceReport {
  sessions: number
  notifications: number
  pushDeliveries: number
  activityLogs: number
  moderationLogs: number
  candidates: number
  bans: number
  files: number
  storedBytes: number
}

/**
 * Build the cut-off date of one retention window
 * @param {number} days - Retention length
 * @return {Date} - Horizon
 */

const horizon = (days: number): Date => new Date(Date.now() - days * DAY_MS)

/**
 * Drop the notifications a member already read long ago
 * @return {Promise<number>} - Removed count
 */

const pruneNotifications = async (): Promise<number> => {
  const { count } = await prisma.notification.deleteMany({
    where: { readAt: { not: null, lt: horizon(RETENTION_POLICIES.readNotifications) } },
  })

  return count
}

/**
 * Drop push journal lines past their window
 * @return {Promise<number>} - Removed count
 */

const prunePushDeliveries = async (): Promise<number> => {
  const { count } = await prisma.pushDelivery.deleteMany({
    where: { createdAt: { lt: horizon(RETENTION_POLICIES.pushDeliveries) } },
  })

  return count
}

/**
 * Drop journal entries past their retention window
 * @return {Promise<number>} - Removed count
 */

const pruneActivityLogs = async (): Promise<number> => {
  const { count } = await prisma.activityLog.deleteMany({
    where: { createdAt: { lt: horizon(RETENTION_POLICIES.activityLogs) } },
  })

  return count
}

/**
 * Drop the candidacies that never became accounts
 * @return {Promise<number>} - Removed count
 */

const pruneRejectedCandidates = async (): Promise<number> => {
  const cutoff = horizon(RETENTION_POLICIES.rejectedCandidates)

  // A candidate who joined the team is a member now
  const { count } = await prisma.recruitmentCandidate.deleteMany({
    where: {
      updatedAt: { lt: cutoff },
      OR: [{ outcome: { isTerminal: true } }, { outcomeId: null }],
    },
  })

  return count
}

/**
 * Drop the blacklist entries past their window
 * @return {Promise<number>} - Removed count
 */

const pruneBans = async (): Promise<number> => {
  const { count } = await prisma.recruitmentBan.deleteMany({
    where: { createdAt: { lt: horizon(RETENTION_POLICIES.bannedCandidates) } },
  })

  return count
}

/**
 * Weigh what the stored binaries add to the database
 * @return {Promise<number>} - Bytes held
 */

const storedBytes = async (): Promise<number> => {
  const [row] = await prisma.$queryRaw<{ total: bigint | null }[]>`
    SELECT SUM(octet_length(data))::bigint AS total FROM storage_entries
  `

  return Number(row?.total ?? 0)
}

/**
 * Apply every retention policy once
 * @return {Promise<MaintenanceReport>} - What was removed
 */

export const runMaintenance = async (): Promise<MaintenanceReport> => {
  const [
    sessions,
    notifications,
    pushDeliveries,
    activityLogs,
    moderationLogs,
    candidates,
    bans,
    files,
  ] = await Promise.all([
    pruneSessions(RETENTION_POLICIES.expiredSessions),
    pruneNotifications(),
    prunePushDeliveries(),
    pruneActivityLogs(),
    // A table not migrated yet keeps nothing to purge
    purgeModerationLog().catch(() => 0),
    pruneRejectedCandidates(),
    pruneBans(),
    pruneOrphanFiles(RETENTION_SETTINGS.orphanFileHours),
  ])

  const report: MaintenanceReport = {
    sessions,
    notifications,
    pushDeliveries,
    activityLogs,
    moderationLogs,
    candidates,
    bans,
    files,
    // Weighed after the sweep
    storedBytes: await storedBytes(),
  }

  logger.info('[maintenance] retention pass complete', report)

  return report
}
