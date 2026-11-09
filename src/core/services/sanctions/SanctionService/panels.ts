import 'server-only'
import { prisma } from '@/core/lib/db'
import { assertInScope } from '@/core/services/auth/ScopeService'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { SANCTION_TEMPLATES, forCreator } from '@/declarations/sanctions/template'
import type {
  SanctionOffenseCard,
  SanctionOffenseDetail,
  SanctionPanelView,
  SanctionRungInput,
} from '@/types/sanctions'
import { SanctionGravities } from '@/utils/constants/moderation'
import type { SanctionGravityName, SanctionPanelName } from '@/utils/constants/moderation'
import { tradeOfFunction } from '@/declarations/reference/fixed'
import { SANCTION_PANEL_REGISTRY } from '@/declarations/sanctions/registries'
import type { SessionUser } from '@/types/auth'
import { TIER_INCLUDE, toLines, toRung } from '@/core/services/sanctions/SanctionService/shape'
import type { TierRow } from '@/core/services/sanctions/SanctionService/shape'
import { readOffense, seedMeasures } from '@/core/services/sanctions/SanctionService/offenses'

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
      tolerated: toLines(row.toleratedExample),
      keywords: toLines(row.keywords),
    }
  })

  return { youtuberId, panel, levelId, offenses }
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
