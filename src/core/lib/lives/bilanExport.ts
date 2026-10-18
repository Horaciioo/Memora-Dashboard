import { toCsv } from '@/core/lib/export/csv'
import type { LiveInsights } from '@/core/lib/lives/insights'
import { BILAN_CSV_HEADERS } from '@/declarations/lives/bilan'
import { MODERATION_KINDS } from '@/declarations/lives/moderation'
import type { LiveLogLine } from '@/types/lives'

/**
 * Key figures as CSV
 * @param {{ label: string, value: string }[]} figures - Figures
 * @return {string} - CSV
 */

export const summaryCsv = (figures: { label: string; value: string }[]): string =>
  toCsv(
    BILAN_CSV_HEADERS.summary,
    figures.map((figure) => [figure.label, figure.value])
  )

/**
 * Slices of the live as CSV
 * @param {LiveInsights} insights - Insights
 * @return {string} - CSV
 */

export const timelineCsv = (insights: LiveInsights): string =>
  toCsv(
    BILAN_CSV_HEADERS.timeline,
    insights.slices.map((slice) => [
      slice.at,
      slice.counts.delete,
      slice.counts.timeout,
      slice.counts.ban,
      slice.counts.other,
      slice.total,
      slice.viewers,
    ])
  )

/**
 * Full log as CSV
 * @param {LiveLogLine[]} log - Lines
 * @return {string} - CSV
 */

export const logCsv = (log: LiveLogLine[]): string =>
  toCsv(
    BILAN_CSV_HEADERS.log,
    log.map((line) => [
      line.occurredAt,
      line.actorName,
      MODERATION_KINDS[line.kind].label,
      line.targetLogin,
      line.durationSeconds,
      line.reason,
      line.excerpt,
      line.origin,
      line.liveconLevel,
      line.status,
    ])
  )

/**
 * Whole Bilan as JSON
 * @param {Object} payload - Bilan data
 * @return {string} - JSON text
 */

export const bilanJson = (payload: object): string => JSON.stringify(payload, null, 2)
