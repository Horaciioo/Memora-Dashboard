import type { ModerationKind } from '@prisma/client'

import type { LiveLogLine, LiveModTime } from '@/types/lives'
import { HOUR_SECONDS, MINUTE_MS } from '@/utils/constants/time'

/**
 * Figures of the actions of one moderator, or of the whole team
 * @typedef {Object} ModStat
 * @property {number} actions - Actions done
 * @property {number} failed - Actions the platform refused
 * @property {number} targets - Viewers concerned
 * @property {number} perHour - Actions per hour spent
 * @property {number | null} gapSeconds - Median seconds between two actions
 * @property {string | null} firstAt - First action
 * @property {string | null} lastAt - Last action
 * @property {{ kind: ModerationKind, count: number }[]} kinds - Actions per type, most first
 * @property {{ label: string, count: number }[]} reasons - Reasons given, most first
 * @property {{ at: string, count: number }[]} rhythm - Actions per slice of the live
 */

export interface ModStat {
  actions: number
  failed: number
  targets: number
  perHour: number
  gapSeconds: number | null
  firstAt: string | null
  lastAt: string | null
  kinds: { kind: ModerationKind; count: number }[]
  reasons: { label: string; count: number }[]
  rhythm: { at: string; count: number }[]
}

// Reasons kept in a ranking
const REASON_SIZE = 5

/**
 * Count items by a label, most frequent first
 * @param {string[]} labels - One label per item
 * @return {[string, number][]} - Label and count
 */

const tally = (labels: string[]): [string, number][] =>
  [...Map.groupBy(labels, (label) => label)]
    .map(([label, list]) => [label, list.length] as [string, number])
    .sort((left, right) => right[1] - left[1])

/**
 * Figures of some log lines
 * @param {LiveLogLine[]} lines - Lines of one moderator, or all of them
 * @param {Object} frame - Frame of the figures
 * @param {Date} frame.start - Live start
 * @param {Date} frame.end - Live end
 * @param {number} frame.bucketMinutes - Width of one rhythm slice
 * @param {number} frame.seconds - Time the lines were made over
 * @return {ModStat} - Figures
 */

export const modStats = (
  lines: LiveLogLine[],
  frame: { start: Date; end: Date; bucketMinutes: number; seconds: number }
): ModStat => {
  const done = lines.filter((line) => line.status === 'SUCCEEDED')
  const times = done.map((line) => Date.parse(line.occurredAt)).sort((left, right) => left - right)
  const gaps = times.slice(1).map((time, index) => (time - times[index]) / 1000)
  gaps.sort((left, right) => left - right)

  // Slices from the live start
  const bucketMs = frame.bucketMinutes * MINUTE_MS
  const slices = Math.max(1, Math.ceil((+frame.end - +frame.start) / bucketMs))
  const counts = new Array<number>(slices).fill(0)
  times.forEach((time) => {
    const index = Math.floor((time - +frame.start) / bucketMs)
    counts[Math.min(slices - 1, Math.max(0, index))] += 1
  })

  return {
    actions: done.length,
    failed: lines.filter((line) => line.status === 'FAILED').length,
    targets: new Set(done.flatMap((line) => (line.targetLogin ? [line.targetLogin] : []))).size,
    perHour: frame.seconds > 0 ? done.length / (frame.seconds / HOUR_SECONDS) : 0,
    gapSeconds: gaps.length > 0 ? gaps[Math.floor(gaps.length / 2)] : null,
    firstAt: times.length > 0 ? new Date(times[0]).toISOString() : null,
    lastAt: times.length > 0 ? new Date(times[times.length - 1]).toISOString() : null,
    kinds: tally(done.map((line) => line.kind)).map(([kind, count]) => ({
      kind: kind as ModerationKind,
      count,
    })),
    reasons: tally(done.flatMap((line) => (line.reason ? [line.reason] : [])))
      .slice(0, REASON_SIZE)
      .map(([label, count]) => ({ label, count })),
    rhythm: counts.map((count, index) => ({
      at: new Date(+frame.start + index * bucketMs).toISOString(),
      count,
    })),
  }
}

/**
 * Figures of the whole team
 * @param {LiveModTime[]} team - Who moderated
 * @param {Map<string, ModStat>} stats - Figures per moderator
 * @return {Object} - Team figures
 */

export const teamFigures = (
  team: LiveModTime[],
  stats: Map<string, ModStat>
): {
  moderators: number
  totalSeconds: number
  averageSeconds: number
  averageActions: number
  top: { accountId: string; name: string; actions: number } | null
  extraSeconds: number
  absent: number
  reinforcements: number
} => {
  const present = team.filter((member) => !member.isAbsent)
  const totalSeconds = present.reduce((sum, member) => sum + member.seconds, 0)
  const actions = team.map((member) => ({
    accountId: member.accountId,
    name: member.name,
    actions: stats.get(member.accountId)?.actions ?? 0,
  }))
  const top = actions.sort((left, right) => right.actions - left.actions)[0] ?? null

  return {
    moderators: present.length,
    totalSeconds,
    averageSeconds: present.length > 0 ? Math.round(totalSeconds / present.length) : 0,
    averageActions:
      present.length > 0
        ? Math.round((actions.reduce((sum, row) => sum + row.actions, 0) / present.length) * 10) /
          10
        : 0,
    top: top && top.actions > 0 ? top : null,
    extraSeconds: team.reduce((sum, member) => sum + member.extraSeconds, 0),
    absent: team.filter((member) => member.isAbsent).length,
    reinforcements: team.filter((member) => member.reinforcement !== null).length,
  }
}
