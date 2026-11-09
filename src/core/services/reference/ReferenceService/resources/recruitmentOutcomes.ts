import 'server-only'
import { prisma } from '@/core/lib/db'
import { readFlag, readText } from '@/core/lib/forms/values'
import { REFERENCE_FIELD_COPY } from '@/declarations/reference/copy'
import { RECRUITMENT_FIELD_COPY } from '@/declarations/recruitment/copy'
import {
  accentField,
  applyOrder,
  clearOtherDefaults,
  nameField,
  nextPosition,
  rethrow,
} from '@/core/services/reference/ReferenceService/resources/shared'
import type { ReferenceResource } from '@/core/services/reference/ReferenceService/resources/shared'

export const recruitmentOutcomes: ReferenceResource = {
  fields: async () => [
    nameField,
    accentField,
    {
      name: 'isDefault',
      kind: 'toggle',
      label: RECRUITMENT_FIELD_COPY.isDefault,
      span: 'half',
    },
    {
      name: 'isTerminal',
      kind: 'toggle',
      label: RECRUITMENT_FIELD_COPY.isTerminal,
      span: 'half',
    },
    { name: 'archived', kind: 'toggle', label: REFERENCE_FIELD_COPY.archived },
  ],
  list: async () => {
    const rows = await prisma.recruitmentOutcome.findMany({
      orderBy: { position: 'asc' },
      include: { _count: { select: { candidates: true } } },
    })

    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      hint: null,
      accent: row.accent,
      badges: [
        ...(row.isDefault ? [RECRUITMENT_FIELD_COPY.isDefault] : []),
        ...(row.isTerminal ? [RECRUITMENT_FIELD_COPY.isTerminal] : []),
        ...(row.archived ? [REFERENCE_FIELD_COPY.archivedBadge] : []),
      ],
      position: row.position,
      usage: row._count.candidates,
      values: {
        name: row.name,
        accent: row.accent,
        isDefault: row.isDefault,
        isTerminal: row.isTerminal,
        archived: row.archived,
      },
    }))
  },
  create: async (values) => {
    const isDefault = readFlag(values, 'isDefault')

    const row = await prisma.recruitmentOutcome
      .create({
        data: {
          name: readText(values, 'name') ?? '',
          accent: readText(values, 'accent'),
          isDefault,
          isTerminal: readFlag(values, 'isTerminal'),
          archived: readFlag(values, 'archived'),
          position: await nextPosition(prisma.recruitmentOutcome),
        },
      })
      .catch(rethrow)

    if (isDefault) await clearOtherDefaults(row.id)

    return recruitmentOutcomes.list().then((rows) => rows.find((entry) => entry.id === row.id)!)
  },
  update: async (id, values) => {
    const isDefault = readFlag(values, 'isDefault')

    await prisma.recruitmentOutcome
      .update({
        where: { id },
        data: {
          name: readText(values, 'name') ?? undefined,
          accent: readText(values, 'accent'),
          isDefault,
          isTerminal: readFlag(values, 'isTerminal'),
          archived: readFlag(values, 'archived'),
        },
      })
      .catch(rethrow)

    if (isDefault) await clearOtherDefaults(id)

    return recruitmentOutcomes.list().then((rows) => rows.find((entry) => entry.id === id)!)
  },
  remove: async (id) => {
    await prisma.recruitmentOutcome.delete({ where: { id } })
  },
  reorder: (ids) =>
    applyOrder(
      (id, position) => prisma.recruitmentOutcome.update({ where: { id }, data: { position } }),
      ids
    ),
}
