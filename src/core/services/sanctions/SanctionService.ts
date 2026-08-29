import 'server-only'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { readText } from '@/core/lib/forms/values'
import { assertInScope } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { SANCTION_FIELD_COPY } from '@/declarations/sanctions/copy'
import { SANCTION_MEASURE_TEMPLATE } from '@/declarations/sanctions/measures'
import { SANCTION_TEMPLATE } from '@/declarations/sanctions/template'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type {
  SanctionMeasureView,
  SanctionOffenseCard,
  SanctionOffenseDetail,
  SanctionPanelView,
  SanctionTierView,
} from '@/types/sanctions'

// Everything an offence row needs to become a detail
const OFFENSE_INCLUDE = {
  tiers: { include: { measure: true }, orderBy: { step: 'asc' } },
} as const

/**
 * Shape one measure row
 * @param {object} row - Measure row
 * @return {SanctionMeasureView} - Measure view
 */

const toMeasure = (row: {
  id: string
  name: string
  accent: string | null
  weight: number
}): SanctionMeasureView => ({
  id: row.id,
  name: row.name,
  accent: row.accent,
  weight: row.weight,
})

/**
 * Group the rungs of one offence by the panel they belong to
 * @param {Array<object>} tiers - Tier rows with their measure
 * @return {Record<string, SanctionTierView[]>} - Rungs per livecon level
 */

const toLadders = (
  tiers: {
    id: string
    levelId: string
    step: number
    note: string | null
    measure: { id: string; name: string; accent: string | null; weight: number }
  }[]
): Record<string, SanctionTierView[]> => {
  const ladders: Record<string, SanctionTierView[]> = {}

  for (const tier of tiers) {
    const rungs = ladders[tier.levelId] ?? []
    rungs.push({ id: tier.id, step: tier.step, note: tier.note, measure: toMeasure(tier.measure) })
    ladders[tier.levelId] = rungs
  }

  return ladders
}

/**
 * Build the offence form declarations
 * @return {FieldDefinition[]} - Field declarations
 */

export const offenseFields = (): FieldDefinition[] => [
  {
    name: 'name',
    kind: 'text',
    label: SANCTION_FIELD_COPY.name,
    required: true,
    maxLength: FORM_SETTINGS.titleMaxLength,
  },
  {
    name: 'summary',
    kind: 'textarea',
    label: SANCTION_FIELD_COPY.summary,
    maxLength: FORM_SETTINGS.longTextMaxLength,
  },
  {
    name: 'example',
    kind: 'textarea',
    label: SANCTION_FIELD_COPY.example,
    maxLength: FORM_SETTINGS.longTextMaxLength,
  },
  {
    name: 'warningExample',
    kind: 'textarea',
    label: SANCTION_FIELD_COPY.warningExample,
    maxLength: FORM_SETTINGS.longTextMaxLength,
  },
  {
    name: 'accent',
    kind: 'colour',
    label: SANCTION_FIELD_COPY.accent,
  },
]

/**
 * Read the measures a ladder may pick from
 * @return {Promise<SanctionMeasureView[]>} - Measures, lightest first
 */

export const listMeasures = async (): Promise<SanctionMeasureView[]> => {
  const rows = await prisma.sanctionMeasure.findMany({
    where: { archived: false },
    orderBy: [{ weight: 'asc' }, { position: 'asc' }],
  })

  return rows.map(toMeasure)
}

/**
 * Read the panel of one creator, the grid carrying titles only
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} youtuberId - Creator the panel belongs to
 * @param {string | null} activeLevelId - Level in force
 * @return {Promise<SanctionPanelView>} - Panel
 */

export const readPanel = async (
  scope: AccessScope,
  youtuberId: string,
  activeLevelId: string | null
): Promise<SanctionPanelView> => {
  assertInScope(scope, youtuberId)

  const rows = await prisma.sanctionOffense.findMany({
    where: { youtuberId, archived: false },
    orderBy: { position: 'asc' },
    include: {
      tiers: activeLevelId
        ? { where: { levelId: activeLevelId }, include: { measure: true } }
        : { include: { measure: true } },
    },
  })

  const offenses: SanctionOffenseCard[] = rows.map((row) => {
    // The tile borrows the tone of the harshest rung of the panel on screen
    const peak = row.tiers.reduce<{ accent: string | null; weight: number } | null>(
      (worst, tier) =>
        worst === null || tier.measure.weight > worst.weight
          ? { accent: tier.measure.accent, weight: tier.measure.weight }
          : worst,
      null
    )

    return { id: row.id, name: row.name, accent: row.accent, peakAccent: peak?.accent ?? null }
  })

  return { youtuberId, activeLevelId, offenses }
}

/**
 * Read one offence in full, every panel included
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} id - Offence identifier
 * @return {Promise<SanctionOffenseDetail>} - Offence detail
 */

export const readOffense = async (
  scope: AccessScope,
  id: string
): Promise<SanctionOffenseDetail> => {
  const row = await prisma.sanctionOffense.findUnique({ where: { id }, include: OFFENSE_INCLUDE })
  if (!row) throw notFound()

  assertInScope(scope, row.youtuberId)

  return {
    id: row.id,
    name: row.name,
    summary: row.summary,
    example: row.example,
    warningExample: row.warningExample,
    accent: row.accent,
    ladders: toLadders(row.tiers),
  }
}

/**
 * Edit the wording of one offence
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} id - Offence identifier
 * @param {FormValues} values - Parsed body
 * @return {Promise<SanctionOffenseDetail>} - Offence detail
 */

export const updateOffense = async (
  scope: AccessScope,
  id: string,
  values: FormValues
): Promise<SanctionOffenseDetail> => {
  await readOffense(scope, id)

  await prisma.sanctionOffense.update({
    where: { id },
    data: {
      name: readText(values, 'name') ?? undefined,
      summary: readText(values, 'summary'),
      example: readText(values, 'example'),
      warningExample: readText(values, 'warningExample'),
      accent: readText(values, 'accent'),
    },
  })

  return readOffense(scope, id)
}

/**
 * One rung a caller wants to persist
 * @typedef {Object} LadderStepInput
 * @property {string} measureId - Measure applied
 * @property {string | null} note - Label overriding the declared step
 */

export interface LadderStepInput {
  measureId: string
  note: string | null
}

/**
 * Replace the ladder of one offence inside one panel, the rungs being ordered by position
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} id - Offence identifier
 * @param {string} levelId - Panel the ladder belongs to
 * @param {LadderStepInput[]} steps - Rungs to persist
 * @return {Promise<SanctionOffenseDetail>} - Offence detail
 */

export const replaceLadder = async (
  scope: AccessScope,
  id: string,
  levelId: string,
  steps: LadderStepInput[]
): Promise<SanctionOffenseDetail> => {
  await readOffense(scope, id)

  await prisma.$transaction([
    prisma.sanctionTier.deleteMany({ where: { offenseId: id, levelId } }),
    prisma.sanctionTier.createMany({
      data: steps.map((entry, step) => ({
        offenseId: id,
        levelId,
        step,
        measureId: entry.measureId,
        note: entry.note,
      })),
    }),
  ])

  return readOffense(scope, id)
}

/**
 * Seed the declared measures, an administrator staying free to edit them afterwards
 * @return {Promise<void>} - Seeded
 */

export const seedMeasures = async (): Promise<void> => {
  await prisma.sanctionMeasure.createMany({
    data: SANCTION_MEASURE_TEMPLATE.map((entry, index) => ({
      name: entry.name,
      kind: entry.kind,
      durationMinutes: entry.durationMinutes,
      permanent: entry.permanent,
      weight: entry.weight,
      accent: entry.accent,
      position: index * FORM_SETTINGS.positionStep,
    })),
    skipDuplicates: true,
  })
}

/**
 * Clone the declared panel onto one creator, safe to replay — an offence already
 * there is left untouched, ladders included
 * @param {string} youtuberId - Creator receiving the panel
 * @return {Promise<number>} - Offences created
 */

export const instantiatePanel = async (youtuberId: string): Promise<number> => {
  await seedMeasures()

  const [levels, measures, existing] = await Promise.all([
    prisma.liveconLevel.findMany({ orderBy: { level: 'asc' } }),
    prisma.sanctionMeasure.findMany({ select: { id: true, name: true } }),
    prisma.sanctionOffense.findMany({ where: { youtuberId }, select: { name: true } }),
  ])

  if (levels.length === 0) return 0

  const measureIds = new Map(measures.map((measure) => [measure.name, measure.id]))
  const known = new Set(existing.map((offense) => offense.name))
  const pending = SANCTION_TEMPLATE.filter((offense) => !known.has(offense.name))

  // One creator, one panel, cloned offence by offence with its ladders
  for (const [index, offense] of pending.entries()) {
    const tiers = levels.flatMap((level) =>
      (offense.ladder[level.level] ?? []).flatMap((name, step) => {
        const measureId = measureIds.get(name)

        return measureId ? [{ levelId: level.id, step, measureId }] : []
      })
    )

    await prisma.sanctionOffense.create({
      data: {
        youtuberId,
        name: offense.name,
        summary: offense.summary,
        example: offense.example,
        warningExample: offense.warningExample,
        position: index * FORM_SETTINGS.positionStep,
        tiers: { create: tiers },
      },
    })
  }

  return pending.length
}
