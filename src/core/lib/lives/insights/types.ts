import type { ModerationKind, ModerationOrigin } from '@prisma/client'

import type { ReportGroup } from '@/declarations/lives/reportGroups'

/**
 * One gesture the insights read
 * @typedef {Object} InsightAction
 */

export interface InsightAction {
  kind: ModerationKind
  actorKey: string
  actorName: string
  isMember: boolean
  targetLogin: string | null
  reason: string | null
  occurredAt: Date
  succeeded: boolean
  origin: ModerationOrigin
  liveconLevel: number | null
}

/**
 * One viewer count read on the platform
 * @typedef {Object} InsightSample
 */

export interface InsightSample {
  at: Date
  viewers: number
}

export type GroupCounts = Record<ReportGroup, number>

/**
 * One slice of the live
 * @typedef {Object} InsightSlice
 * @property {string} at - Slice start
 * @property {GroupCounts} counts - Gestures per family
 * @property {number} total - All gestures
 * @property {number | null} viewers - Average viewers
 */

export interface InsightSlice {
  at: string
  counts: GroupCounts
  total: number
  viewers: number | null
}

/**
 * Everything the Bilan charts draw
 * @typedef {Object} LiveInsights
 */

export interface LiveInsights {
  // Width of one slice
  bucketMinutes: number
  slices: InsightSlice[]
  cumulative: number[]
  heat: { key: string; name: string; counts: number[] }[]
  reasons: { label: string; count: number }[]
  repeatTargets: { login: string; count: number }[]
  origins: { memora: number; platform: number }
  levels: { level: number; name: string; minutes: number; actions: number; perHour: number }[]
  viewers: { peak: number; peakAt: string; average: number } | null
  perHour: number
  gapSeconds: number | null
  per1000Viewers: number | null
  failureRate: number
  busiestShare: number | null
}

/**
 * Average of the lives before this one
 * @typedef {Object} LiveBaseline
 * @property {number} lives - Lives averaged
 * @property {number} actions - Gestures per live
 * @property {number} perHour - Gestures per hour
 * @property {number} durationSeconds - Length per live
 * @property {number | null} averageViewers - Mean of the means
 * @property {number | null} peakViewers - Mean of the peaks
 * @property {GroupCounts} mix - Share of each family
 */

export interface LiveBaseline {
  lives: number
  actions: number
  perHour: number
  durationSeconds: number
  averageViewers: number | null
  peakViewers: number | null
  mix: GroupCounts
}
