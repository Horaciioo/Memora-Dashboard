import type { ModerationKind } from '@prisma/client'

/**
 * One log line the report reads
 * @typedef {Object} ReportAction
 */

export interface ReportAction {
  kind: ModerationKind
  actorAccountId: string | null
  actorName: string
  targetPlatformUserId: string | null
  occurredAt: Date
  succeeded: boolean
}

/**
 * One presence the report reads
 * @typedef {Object} ReportPresence
 */

export interface ReportPresence {
  accountId: string
  name: string
  visibleSeconds: number
  activeSeconds: number
}

/**
 * One Livecon level in force during the live
 * @typedef {Object} ReportLevel
 */

export interface ReportLevel {
  level: number
  name: string
  from: Date
  to: Date | null
}

/**
 * Report of one live
 * @typedef {Object} LiveReport
 */

export interface LiveReport {
  actions: number
  failed: number
  distinctTargets: number
  byKind: { kind: ModerationKind; count: number }[]
  moderators: {
    key: string
    name: string
    isMember: boolean
    actions: number
    activeSeconds: number
    visibleSeconds: number
  }[]
  timeline: { at: string; count: number }[]
  peak: { at: string; count: number } | null
  levels: { level: number; name: string; from: string; to: string | null }[]
  teamActiveSeconds: number
}

/**
 * Build the report of a live
 * @param {Object} input - Rows of the live
 * @param {ReportAction[]} input.actions - Log lines
 * @param {ReportPresence[]} input.presences - Presences
 * @param {ReportLevel[]} input.levels - Livecon levels in force
 * @param {Date} input.start - Live start
 * @param {Date} input.end - Live end
 * @param {number} input.bucketMinutes - Width of one timeline slice
 * @return {LiveReport} - Report
 */

export const buildLiveReport = (input: {
  actions: ReportAction[]
  presences: ReportPresence[]
  levels: ReportLevel[]
  start: Date
  end: Date
  bucketMinutes: number
}): LiveReport => {
  const done = input.actions.filter((action) => action.succeeded)

  // Gestures per kind
  const kinds = new Map<ModerationKind, number>()
  done.forEach((action) => kinds.set(action.kind, (kinds.get(action.kind) ?? 0) + 1))

  // Moderators: gestures and time
  const moderators = new Map<string, LiveReport['moderators'][number]>()
  const seat = (key: string, name: string, isMember: boolean) => {
    const existing = moderators.get(key)
    if (existing) return existing
    const created = { key, name, isMember, actions: 0, activeSeconds: 0, visibleSeconds: 0 }
    moderators.set(key, created)
    return created
  }
  done.forEach((action) => {
    seat(
      action.actorAccountId ?? `platform:${action.actorName}`,
      action.actorName,
      action.actorAccountId !== null
    ).actions += 1
  })
  input.presences.forEach((presence) => {
    const row = seat(presence.accountId, presence.name, true)
    row.activeSeconds += presence.activeSeconds
    row.visibleSeconds += presence.visibleSeconds
  })

  // Slices from the start
  const bucketMs = input.bucketMinutes * 60 * 1000
  const slices = Math.max(1, Math.ceil((input.end.getTime() - input.start.getTime()) / bucketMs))
  const counts = new Array<number>(slices).fill(0)
  done.forEach((action) => {
    const index = Math.floor((action.occurredAt.getTime() - input.start.getTime()) / bucketMs)
    counts[Math.min(slices - 1, Math.max(0, index))]! += 1
  })
  const timeline = counts.map((count, index) => ({
    at: new Date(input.start.getTime() + index * bucketMs).toISOString(),
    count,
  }))
  const peak = timeline.reduce<LiveReport['peak']>(
    (best, slice) => (slice.count > 0 && slice.count > (best?.count ?? 0) ? slice : best),
    null
  )

  return {
    actions: done.length,
    failed: input.actions.length - done.length,
    distinctTargets: new Set(
      done.flatMap((action) => (action.targetPlatformUserId ? [action.targetPlatformUserId] : []))
    ).size,
    byKind: [...kinds.entries()]
      .map(([kind, count]) => ({ kind, count }))
      .sort((left, right) => right.count - left.count),
    moderators: [...moderators.values()].sort(
      (left, right) => right.actions - left.actions || right.activeSeconds - left.activeSeconds
    ),
    timeline,
    peak,
    levels: input.levels
      .slice()
      .sort((left, right) => left.from.getTime() - right.from.getTime())
      .map((level) => ({
        level: level.level,
        name: level.name,
        from: level.from.toISOString(),
        to: level.to?.toISOString() ?? null,
      })),
    teamActiveSeconds: input.presences.reduce(
      (total, presence) => total + presence.activeSeconds,
      0
    ),
  }
}
