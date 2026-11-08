import 'server-only'
import type { SanctionMeasureView, SanctionRungView } from '@/types/sanctions'
import type { Prisma } from '@prisma/client'

// A measure row with the fields every view reads
type MeasureRow = Prisma.SanctionMeasureGetPayload<object>

// Steps with their measures
export const TIER_INCLUDE = {
  measures: { include: { measure: true }, orderBy: { position: 'asc' } },
} satisfies Prisma.SanctionTierInclude

export type TierRow = Prisma.SanctionTierGetPayload<{ include: typeof TIER_INCLUDE }>

/**
 * Split a multi-line field into its cases
 * @param {string | null} value - Stored text
 * @return {string[]} - One case per line
 */

export const toLines = (value: string | null): string[] =>
  (value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

/**
 * Shape one measure row
 * @param {MeasureRow} row - Measure row
 * @return {SanctionMeasureView} - Measure view
 */

export const toMeasure = (row: MeasureRow): SanctionMeasureView => ({
  id: row.id,
  name: row.name,
  kind: row.kind,
  durationMinutes: row.durationMinutes,
  permanent: row.permanent,
  accent: row.accent,
  weight: row.weight,
})

/**
 * Shape one ladder step
 * @param {TierRow} row - Step row with its measures
 * @return {SanctionRungView} - Step view
 */

export const toRung = (row: TierRow): SanctionRungView => ({
  id: row.id,
  step: row.step,
  condition: row.note,
  measures: row.measures.map((entry) => toMeasure(entry.measure)),
})
