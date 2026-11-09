import 'server-only'
import { prisma } from '@/core/lib/db'
import { readNumberValue, readText } from '@/core/lib/forms/values'
import { LIVECON_SETTINGS } from '@/declarations/configurations/settings'
import { REFERENCE_FIELD_COPY } from '@/declarations/reference/copy'
import {
  accentField,
  longTextMaxLength,
  markdownMaxLength,
  nameField,
  noReorder,
  rethrow,
} from '@/core/services/reference/ReferenceService/resources/shared'
import type { ReferenceResource } from '@/core/services/reference/ReferenceService/resources/shared'

export const liveconLevels: ReferenceResource = {
  fields: async () => [
    {
      name: 'level',
      kind: 'number',
      label: REFERENCE_FIELD_COPY.level,
      required: true,
      min: LIVECON_SETTINGS.minLevel,
      max: LIVECON_SETTINGS.maxLevel,
      span: 'half',
    },
    { ...nameField, span: 'half' },
    accentField,
    {
      name: 'summary',
      kind: 'textarea',
      label: REFERENCE_FIELD_COPY.situation,
      maxLength: longTextMaxLength,
    },
    {
      name: 'guidelines',
      kind: 'markdown',
      label: REFERENCE_FIELD_COPY.guidelines,
      maxLength: markdownMaxLength,
    },
  ],
  list: async () => {
    const rows = await prisma.liveconLevel.findMany({
      orderBy: { level: 'desc' },
      include: { _count: { select: { entries: true, sanctionTiers: true } } },
    })

    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      hint: row.summary,
      accent: row.accent,
      badges: [`${REFERENCE_FIELD_COPY.levelBadge} ${row.level}`],
      position: row.level,
      usage: row._count.entries + row._count.sanctionTiers,
      values: {
        level: row.level,
        name: row.name,
        accent: row.accent,
        summary: row.summary,
        guidelines: row.guidelines,
      },
    }))
  },
  create: async (values) => {
    const row = await prisma.liveconLevel
      .create({
        data: {
          level: readNumberValue(values, 'level') ?? LIVECON_SETTINGS.defaultLevel,
          name: readText(values, 'name') ?? '',
          accent: readText(values, 'accent'),
          summary: readText(values, 'summary'),
          guidelines: readText(values, 'guidelines'),
        },
      })
      .catch(rethrow)

    return liveconLevels.list().then((rows) => rows.find((entry) => entry.id === row.id)!)
  },
  update: async (id, values) => {
    await prisma.liveconLevel
      .update({
        where: { id },
        data: {
          level: readNumberValue(values, 'level') ?? undefined,
          name: readText(values, 'name') ?? undefined,
          accent: readText(values, 'accent'),
          summary: readText(values, 'summary'),
          guidelines: readText(values, 'guidelines'),
        },
      })
      .catch(rethrow)

    return liveconLevels.list().then((rows) => rows.find((entry) => entry.id === id)!)
  },
  remove: async (id) => {
    await prisma.liveconLevel.delete({ where: { id } })
  },
  reorder: noReorder,
}
