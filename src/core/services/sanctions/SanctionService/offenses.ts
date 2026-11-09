import 'server-only'
import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { readText } from '@/core/lib/forms/values'
import { assertInScope } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { SANCTION_FIELD_COPY } from '@/declarations/sanctions/copy'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type {
  SanctionMeasureView,
  SanctionOffenseDetail,
  SanctionRungView,
} from '@/types/sanctions'
import type { SanctionPanelName } from '@/utils/constants/moderation'
import {
  TIER_INCLUDE,
  toLines,
  toMeasure,
  toRung,
} from '@/core/services/sanctions/SanctionService/shape'
import { SANCTION_MEASURE_TEMPLATE } from '@/declarations/sanctions/measures'

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
  {
    name: 'keywords',
    kind: 'textarea',
    label: SANCTION_FIELD_COPY.keywords,
    hint: SANCTION_FIELD_COPY.keywordsHint,
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
    keywords: row.keywords,
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
      ...(given('keywords') && { keywords: readText(values, 'keywords') }),
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
