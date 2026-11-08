import 'server-only'
import { prisma } from '@/core/lib/db'
import { readText } from '@/core/lib/forms/values'
import { REFERENCE_FIELD_COPY } from '@/declarations/reference/copy'
import {
  accentField,
  applyOrder,
  longTextMaxLength,
  nameField,
  nextPosition,
  rethrow,
} from '@/core/services/reference/ReferenceService/resources/shared'
import type { ReferenceResource } from '@/core/services/reference/ReferenceService/resources/shared'

export const dispositifs: ReferenceResource = {
  fields: async () => [
    nameField,
    accentField,
    {
      name: 'summary',
      kind: 'textarea',
      label: REFERENCE_FIELD_COPY.summary,
      maxLength: longTextMaxLength,
    },
  ],
  list: async () => {
    const rows = await prisma.dispositif.findMany({
      orderBy: { position: 'asc' },
      include: { _count: { select: { juniors: true } } },
    })

    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      hint: row.summary,
      accent: row.accent,
      badges: [],
      position: row.position,
      usage: row._count.juniors,
      values: {
        name: row.name,
        accent: row.accent,
        summary: row.summary,
      },
    }))
  },
  create: async (values) => {
    const row = await prisma.dispositif
      .create({
        data: {
          name: readText(values, 'name') ?? '',
          accent: readText(values, 'accent'),
          summary: readText(values, 'summary'),
          position: await nextPosition(prisma.dispositif),
        },
      })
      .catch(rethrow)

    return dispositifs.list().then((rows) => rows.find((entry) => entry.id === row.id)!)
  },
  update: async (id, values) => {
    await prisma.dispositif
      .update({
        where: { id },
        data: {
          name: readText(values, 'name') ?? undefined,
          accent: readText(values, 'accent'),
          summary: readText(values, 'summary'),
        },
      })
      .catch(rethrow)

    return dispositifs.list().then((rows) => rows.find((entry) => entry.id === id)!)
  },
  remove: async (id) => {
    await prisma.dispositif.delete({ where: { id } })
  },
  reorder: (ids) =>
    applyOrder(
      (id, position) => prisma.dispositif.update({ where: { id }, data: { position } }),
      ids
    ),
}
