import 'server-only'

import { prisma } from '@/core/lib/db'
import { logger } from '@/core/lib/logger'
import { pruneSessions } from '@/core/services/auth/SessionService'
import { pruneOrphanFiles } from '@/core/services/system/FileService'
import { RETENTION_SETTINGS } from '@/declarations/configurations/settings'
import { RETENTION_POLICIES } from '@/declarations/system/privacy'

// Milliseconds in one day
const DAY_MS = 86_400_000

/**
 * What one maintenance pass removed
 * @typedef {Object} MaintenanceReport
 * @property {number} sessions - Expired sessions dropped
 * @property {number} notifications - Read notifications dropped
 * @property {number} activityLogs - Journal entries dropped
 * @property {number} candidates - Rejected candidacies dropped
 * @property {number} files - Orphan files dropped
 * @property {number} storedBytes - Weight the binaries add to every backup
 */

export interface MaintenanceReport {
  sessions: number
  notifications: number
  activityLogs: number
  candidates: number
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

  // A candidate who joined the team is a member now, their file lives elsewhere
  const { count } = await prisma.recruitmentCandidate.deleteMany({
    where: {
      updatedAt: { lt: cutoff },
      OR: [{ outcome: { isTerminal: true } }, { outcomeId: null }],
    },
  })

  return count
}

/**
 * Weigh what the stored binaries add to the database, and to every backup of it.
 * Reported rather than acted on: moving them out is an infrastructure decision
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
  const [sessions, notifications, activityLogs, candidates, files] = await Promise.all([
    pruneSessions(RETENTION_POLICIES.expiredSessions),
    pruneNotifications(),
    pruneActivityLogs(),
    pruneRejectedCandidates(),
    pruneOrphanFiles(RETENTION_SETTINGS.orphanFileHours),
  ])

  const report: MaintenanceReport = {
    sessions,
    notifications,
    activityLogs,
    candidates,
    files,
    // Weighed after the sweep, so the number reflects what is actually kept
    storedBytes: await storedBytes(),
  }

  logger.info('[maintenance] retention pass complete', report)

  return report
}
