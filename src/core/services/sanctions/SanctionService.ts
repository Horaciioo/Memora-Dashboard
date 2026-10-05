import 'server-only'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { readText } from '@/core/lib/forms/values'
import { assertInScope } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { SANCTION_FIELD_COPY } from '@/declarations/sanctions/copy'
import { SANCTION_MEASURE_TEMPLATE } from '@/declarations/sanctions/measures'
import { SANCTION_TEMPLATES, forCreator } from '@/declarations/sanctions/template'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type {
  SanctionMeasureView,
  SanctionOffenseCard,
  SanctionOffenseDetail,
  SanctionPanelView,
  SanctionRungInput,
  SanctionRungView,
} from '@/types/sanctions'
import { SanctionGravities } from '@/utils/constants/moderation'
import type { SanctionGravityName, SanctionPanelName } from '@/utils/constants/moderation'
import { tradeOfFunction } from '@/declarations/reference/fixed'
import { SANCTION_PANEL_REGISTRY } from '@/declarations/sanctions/registries'
import type { SessionUser } from '@/types/auth'
import type { Prisma } from '@prisma/client'

// A measure row with the fields every view reads
type MeasureRow = Prisma.SanctionMeasureGetPayload<object>

// Steps with their measures
const TIER_INCLUDE = {
  measures: { include: { measure: true }, orderBy: { position: 'asc' } },
} satisfies Prisma.SanctionTierInclude

type TierRow = Prisma.SanctionTierGetPayload<{ include: typeof TIER_INCLUDE }>

/**
 * Split a multi-line field into its cases
 * @param {string | null} value - Stored text
 * @return {string[]} - One case per line
 */

const toLines = (value: string | null): string[] =>
  (value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

/**
 * Shape one measure row
 * @param {MeasureRow} row - Measure row
 * @return {SanctionMeasureView} - Measure view
 */

const toMeasure = (row: MeasureRow): SanctionMeasureView => ({
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

const toRung = (row: TierRow): SanctionRungView => ({
  id: row.id,
  step: row.step,
  condition: row.note,
  measures: row.measures.map((entry) => toMeasure(entry.measure)),
})

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
    kind: 'markdown',
    label: SANCTION_FIELD_COPY.summary,
    maxLength: FORM_SETTINGS.markdownMaxLength,
  },
  {
    name: 'example',
    kind: 'textarea',
    label: SANCTION_FIELD_COPY.example,
    hint: SANCTION_FIELD_COPY.linesHint,
    maxLength: FORM_SETTINGS.longTextMaxLength,
  },
  {
    name: 'toleratedExample',
    kind: 'textarea',
    label: SANCTION_FIELD_COPY.toleratedExample,
    hint: SANCTION_FIELD_COPY.linesHint,
    maxLength: FORM_SETTINGS.longTextMaxLength,
  },
  {
    name: 'warningExample',
    kind: 'textarea',
    label: SANCTION_FIELD_COPY.warningExample,
    maxLength: FORM_SETTINGS.longTextMaxLength,
  },
]

/**
 * Read the measures a ladder may pick from
 * @return {Promise<SanctionMeasureView[]>} - Measures
 */

export const listMeasures = async (): Promise<SanctionMeasureView[]> => {
  await seedMeasures()

  const rows = await prisma.sanctionMeasure.findMany({
    where: { archived: false },
    orderBy: [{ weight: 'asc' }, { position: 'asc' }],
  })

  return rows.map(toMeasure)
}

/**
 * Read the panel of one creator on one surface
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} youtuberId - Creator
 * @param {SanctionPanelName} panel - Surface
 * @param {string | null} levelId - Level read
 * @return {Promise<SanctionPanelView>} - Panel
 */

export const readPanel = async (
  scope: AccessScope,
  youtuberId: string,
  panel: SanctionPanelName,
  levelId: string | null
): Promise<SanctionPanelView> => {
  assertInScope(scope, youtuberId)

  const rows = await prisma.sanctionOffense.findMany({
    where: { youtuberId, panel, archived: false },
    orderBy: [{ position: 'asc' }, { name: 'asc' }],
    include: {
      levels: levelId ? { where: { levelId } } : false,
      tiers: levelId
        ? { where: { levelId }, include: TIER_INCLUDE, orderBy: { step: 'asc' } }
        : false,
    },
  })

  const offenses: SanctionOffenseCard[] = rows.map((row) => {
    const tiers = (row.tiers ?? []) as TierRow[]

    return {
      id: row.id,
      name: row.name,
      gravity: row.levels?.[0]?.gravity ?? SanctionGravities.Low,
      firstRung: tiers[0] ? toRung(tiers[0]) : null,
      rungCount: tiers.length,
      rungs: tiers.map(toRung),
      examples: toLines(row.example),
    }
  })

  return { youtuberId, panel, levelId, offenses }
}

/**
 * Read one offence in full
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} id - Offence identifier
 * @return {Promise<SanctionOffenseDetail>} - Offence detail
 */

export const readOffense = async (
  scope: AccessScope,
  id: string
): Promise<SanctionOffenseDetail> => {
  const row = await prisma.sanctionOffense.findUnique({
    where: { id },
    include: { levels: true, tiers: { include: TIER_INCLUDE, orderBy: { step: 'asc' } } },
  })
  if (!row) throw notFound()

  assertInScope(scope, row.youtuberId)

  const ladders: Record<string, SanctionRungView[]> = {}
  for (const tier of row.tiers) {
    ladders[tier.levelId] = [...(ladders[tier.levelId] ?? []), toRung(tier)]
  }

  return {
    id: row.id,
    panel: row.panel,
    name: row.name,
    summary: row.summary,
    examples: toLines(row.example),
    tolerated: toLines(row.toleratedExample),
    warningExample: row.warningExample,
    gravities: Object.fromEntries(row.levels.map((entry) => [entry.levelId, entry.gravity])),
    ladders,
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

  // A field left out of the body stays as it is
  const given = (name: string) => name in values

  await prisma.sanctionOffense.update({
    where: { id },
    data: {
      name: readText(values, 'name') ?? undefined,
      ...(given('summary') && { summary: readText(values, 'summary') }),
      ...(given('example') && { example: readText(values, 'example') }),
      ...(given('toleratedExample') && { toleratedExample: readText(values, 'toleratedExample') }),
      ...(given('warningExample') && { warningExample: readText(values, 'warningExample') }),
    },
  })

  return readOffense(scope, id)
}

/**
 * Add a blank offence at the end of a panel
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} youtuberId - Creator
 * @param {SanctionPanelName} panel - Surface
 * @param {string} name - Display name
 * @return {Promise<SanctionOffenseDetail>} - Offence detail
 */

export const createOffense = async (
  scope: AccessScope,
  youtuberId: string,
  panel: SanctionPanelName,
  name: string
): Promise<SanctionOffenseDetail> => {
  assertInScope(scope, youtuberId)

  const last = await prisma.sanctionOffense.aggregate({
    where: { youtuberId, panel },
    _max: { position: true },
  })

  const row = await prisma.sanctionOffense.create({
    data: {
      youtuberId,
      panel,
      name,
      position: (last._max.position ?? 0) + FORM_SETTINGS.positionStep,
    },
  })

  return readOffense(scope, row.id)
}

/**
 * Drop one offence with its levels and ladders
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} id - Offence identifier
 * @return {Promise<string>} - Offence name
 */

export const removeOffense = async (scope: AccessScope, id: string): Promise<string> => {
  const offense = await readOffense(scope, id)

  await prisma.sanctionOffense.delete({ where: { id } })

  return offense.name
}

/**
 * Replace the ladder and the gravity of one offence inside one level
 * @param {AccessScope} scope - Creator perimeter
 * @param {string} id - Offence identifier
 * @param {string} levelId - Level the ladder belongs to
 * @param {SanctionGravityName} gravity - Weight at this level
 * @param {SanctionRungInput[]} steps - Steps
 * @return {Promise<SanctionOffenseDetail>} - Offence detail
 */

export const replaceLadder = async (
  scope: AccessScope,
  id: string,
  levelId: string,
  gravity: SanctionGravityName,
  steps: SanctionRungInput[]
): Promise<SanctionOffenseDetail> => {
  await readOffense(scope, id)

  await prisma.$transaction([
    prisma.sanctionTier.deleteMany({ where: { offenseId: id, levelId } }),
    ...steps.map((entry, step) =>
      prisma.sanctionTier.create({
        data: {
          offenseId: id,
          levelId,
          step,
          note: entry.condition,
          measures: {
            create: entry.measureIds.map((measureId, position) => ({ measureId, position })),
          },
        },
      })
    ),
    prisma.sanctionOffenseLevel.upsert({
      where: { offenseId_levelId: { offenseId: id, levelId } },
      update: { gravity },
      create: { offenseId: id, levelId, gravity },
    }),
  ])

  return readOffense(scope, id)
}

/**
 * Seed the declared measures
 * @return {Promise<void>} - Seeded
 */

export const seedMeasures = async (): Promise<void> => {
  await prisma.sanctionMeasure.createMany({
    data: SANCTION_MEASURE_TEMPLATE.map((entry) => ({
      name: entry.name,
      kind: entry.kind,
      durationMinutes: entry.durationMinutes,
      permanent: entry.permanent,
      weight: entry.weight,
      accent: entry.accent,
      position: entry.weight,
    })),
    skipDuplicates: true,
  })
}

/**
 * Clone the reference panel of one surface onto a creator. Safe to replay: an offence already there is left untouched
 * @param {string} youtuberId - Creator receiving the panel
 * @param {SanctionPanelName} panel - Surface
 * @param {boolean} [replace] - Drop the current panel of this surface first
 * @return {Promise<number>} - Offences created
 */

export const instantiatePanel = async (
  youtuberId: string,
  panel: SanctionPanelName,
  replace = false
): Promise<number> => {
  await seedMeasures()

  const [creator, levels, measures] = await Promise.all([
    prisma.youtuber.findUniqueOrThrow({ where: { id: youtuberId }, select: { name: true } }),
    prisma.liveconLevel.findMany(),
    prisma.sanctionMeasure.findMany({ select: { id: true, name: true } }),
  ])
  if (levels.length === 0) return 0

  // Starting over only ever touches this creator on this surface
  if (replace) await prisma.sanctionOffense.deleteMany({ where: { youtuberId, panel } })

  const existing = await prisma.sanctionOffense.findMany({
    where: { youtuberId, panel },
    select: { name: true },
  })

  const measureIds = new Map(measures.map((measure) => [measure.name, measure.id]))
  const known = new Set(existing.map((offense) => offense.name))
  const seeds = SANCTION_TEMPLATES[panel]
    .map((seed, index) => ({ seed, index, name: forCreator(seed.name, creator.name) }))
    .filter((entry) => !known.has(entry.name))

  // One offence at a time
  for (const { seed, index, name } of seeds) {
    const text = (value: string) => forCreator(value, creator.name)

    await prisma.sanctionOffense.create({
      data: {
        youtuberId,
        panel,
        name,
        summary: text(seed.summary),
        example: seed.examples.map(text).join('\n') || null,
        toleratedExample: seed.tolerated.map(text).join('\n') || null,
        warningExample: seed.warningExample ? text(seed.warningExample) : null,
        position: index * FORM_SETTINGS.positionStep,
        levels: {
          create: levels.flatMap((level) => {
            const handling = seed.levels[level.level]

            return handling ? [{ levelId: level.id, gravity: handling.gravity }] : []
          }),
        },
        tiers: {
          create: levels.flatMap((level) =>
            (seed.levels[level.level]?.ladder ?? []).map((rung, step) => ({
              levelId: level.id,
              step,
              note: rung.condition,
              measures: {
                create: rung.measures.flatMap((measureName, position) => {
                  const measureId = measureIds.get(measureName)

                  return measureId ? [{ measureId, position }] : []
                }),
              },
            }))
          ),
        },
      },
    })
  }

  return seeds.length
}

/**
 * Surface of each trade a member works
 * @param {SessionUser} viewer - Signed-in member
 * @return {Promise<SanctionPanelName[]>} - Surfaces
 */

export const panelsFor = async (viewer: SessionUser): Promise<SanctionPanelName[]> => {
  const held = await prisma.jobFunction.findMany({
    where: { id: { in: viewer.functionIds } },
    select: { name: true },
  })

  // A junior function reads as its trade
  const trades = new Set(held.map((row) => tradeOfFunction(row.name)))
  const seen = new Set<string>()

  const worked = SANCTION_PANEL_REGISTRY.keys.filter((panel) => {
    const trade = SANCTION_PANEL_REGISTRY.get(panel).functionName
    if (!trades.has(trade) || seen.has(trade)) return false

    seen.add(trade)

    return true
  })

  return worked.length > 0 ? worked : SANCTION_PANEL_REGISTRY.keys.slice(0, 1)
}
