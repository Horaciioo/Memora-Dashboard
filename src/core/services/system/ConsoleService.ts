import 'server-only'

import { prisma } from '@/core/lib/db'
import { isEncryptionActive } from '@/core/lib/crypto'
import { runtime } from '@/managers/infrastructure/Core/runtime'
import { APP_ENVIRONMENT, ENVIRONMENT_MANIFESTS } from '@/declarations/system/environments'
import { CONFIG_SUBJECTS } from '@/types/infrastructure'
import type { ConfigSubject, ProbeResult } from '@/types/infrastructure'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { scopedWhere } from '@/core/services/auth/ScopeService'

/**
 * Subject state
 * @typedef {Object} SubjectState
 * @property {ConfigSubject} subject - Subject key
 * @property {boolean} enabled - Turned on in the configuration
 * @property {boolean} required - The environment refuses to boot without it
 * @property {ProbeResult | null} probe - Last probe of that subject
 */

export interface SubjectState {
  subject: ConfigSubject
  enabled: boolean
  required: boolean
  probe: ProbeResult | null
}

/**
 * Runtime report
 * @typedef {Object} RuntimeReport
 * @property {string} environment - Running environment
 * @property {string} label - Display name of that environment
 * @property {boolean} strict - Boot fails on a missing subject
 * @property {boolean} started - The container actually loaded
 * @property {boolean} encrypted - Secrets are protected at rest
 * @property {SubjectState[]} subjects - Every subject and its probe
 */

export interface RuntimeReport {
  environment: string
  label: string
  strict: boolean
  started: boolean
  encrypted: boolean
  subjects: SubjectState[]
}

/**
 * Read one subject off a runtime report
 * @param {RuntimeReport} report - Runtime report
 * @param {ConfigSubject} subject - Subject key
 * @return {SubjectState} - Subject state, off when the container never loaded
 */

export const subjectState = (report: RuntimeReport, subject: ConfigSubject): SubjectState =>
  report.subjects.find((entry) => entry.subject === subject) ?? {
    subject,
    enabled: false,
    required: false,
    probe: null,
  }

/**
 * Data report
 * @typedef {Object} DataReport
 * @property {Record<string, number>} counts - One count per collection
 */

export interface DataReport {
  counts: Record<string, number>
}

/**
 * Read the runtime
 * @return {RuntimeReport} - Runtime report
 */

export const readRuntimeReport = (): RuntimeReport => {
  const container = runtime()
  const manifest = ENVIRONMENT_MANIFESTS[APP_ENVIRONMENT]
  const probes = container?.uptime.results ?? []

  const subjects = CONFIG_SUBJECTS.map((subject) => ({
    subject,
    // A container that never loaded reports every subject as off, which is the truth
    enabled: container?.isLoaded() ? container.config.isEnabled(subject) : false,
    required: manifest.required.includes(subject),
    probe: probes.find((probe) => probe.name === subject) ?? null,
  }))

  return {
    environment: APP_ENVIRONMENT,
    label: manifest.label,
    strict: manifest.strict,
    started: container?.isLoaded() ?? false,
    encrypted: isEncryptionActive(),
    subjects,
  }
}

/**
 * Count the data
 * @param {AccessScope} scope - Perimeter
 * @return {Promise<DataReport>} - Data report
 */

export const readDataReport = async (scope: AccessScope): Promise<DataReport> => {
  const [
    accounts,
    sessions,
    twoFactor,
    creators,
    teams,
    projects,
    tasks,
    files,
    logs,
    notifications,
  ] = await Promise.all([
    prisma.account.count({ where: scopedWhere('account', scope) }),
    prisma.session.count({ where: { expiresAt: { gt: new Date() } } }),
    prisma.twoFactorCredential.count({ where: { confirmedAt: { not: null } } }),
    scope.activeYoutuberId !== null
      ? Promise.resolve(1)
      : scope.isGlobal
        ? prisma.youtuber.count({ where: { archived: false } })
        : Promise.resolve(scope.youtuberIds.length),
    prisma.team.count({ where: scopedWhere('team', scope, { archived: false }) }),
    prisma.project.count({ where: scopedWhere('project', scope) }),
    prisma.task.count({ where: scopedWhere('task', scope) }),
    prisma.storageEntry.count(),
    prisma.activityLog.count(),
    prisma.notification.count(),
  ])

  return {
    counts: {
      accounts,
      sessions,
      twoFactor,
      creators,
      teams,
      projects,
      tasks,
      files,
      logs,
      notifications,
    },
  }
}

/**
 * One bucket and what it holds
 * @typedef {Object} BucketUsage
 * @property {string} bucket - Bucket key as stored
 * @property {number} entries - Objects kept
 * @property {number} bytes - Bytes kept
 */

export interface BucketUsage {
  bucket: string
  entries: number
  bytes: number
}

/**
 * Storage report
 * @typedef {Object} StorageReport
 * @property {number} entries - Objects kept, every bucket together
 * @property {number} bytes - Bytes kept, every bucket together
 * @property {BucketUsage[]} buckets - One row per bucket holding something
 */

export interface StorageReport {
  entries: number
  bytes: number
  buckets: BucketUsage[]
}

/**
 * Measure what the store holds
 * @return {Promise<StorageReport>} - Storage report
 */

export const readStorageReport = async (): Promise<StorageReport> => {
  const rows = await prisma.storageEntry.groupBy({
    by: ['bucket'],
    _count: { _all: true },
    _sum: { byteSize: true },
    orderBy: { bucket: 'asc' },
  })

  const buckets = rows.map((row) => ({
    bucket: row.bucket,
    entries: row._count._all,
    bytes: row._sum.byteSize ?? 0,
  }))

  return {
    entries: buckets.reduce((total, entry) => total + entry.entries, 0),
    bytes: buckets.reduce((total, entry) => total + entry.bytes, 0),
    buckets,
  }
}
