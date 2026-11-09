import 'server-only'
import { prisma } from '@/core/lib/db'
import { readFlag, readText } from '@/core/lib/forms/values'
import { REFERENCE_FIELD_COPY } from '@/declarations/reference/copy'
import {
  accentField,
  applyOrder,
  nameField,
  nextPosition,
  rethrow,
} from '@/core/services/reference/ReferenceService/resources/shared'
import type { ReferenceResource } from '@/core/services/reference/ReferenceService/resources/shared'

export const platforms: ReferenceResource = {
  fields: async () => [
    nameField,
    accentField,
    { name: 'avatarUrl', kind: 'image', label: REFERENCE_FIELD_COPY.avatarUrl, bucket: 'avatars' },
    { name: 'archived', kind: 'toggle', label: REFERENCE_FIELD_COPY.archived },
  ],
  list: async () => {
    const rows = await prisma.platform.findMany({
      orderBy: { position: 'asc' },
      include: { _count: { select: { projects: true } } },
    })

    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      hint: null,
      accent: row.accent,
      image: row.avatarUrl,
      badges: row.archived ? [REFERENCE_FIELD_COPY.archivedBadge] : [],
      position: row.position,
      usage: row._count.projects,
      values: {
        name: row.name,
        accent: row.accent,
        avatarUrl: row.avatarUrl,
        archived: row.archived,
      },
    }))
  },
  create: async (values) => {
    const row = await prisma.platform
      .create({
        data: {
          name: readText(values, 'name') ?? '',
          accent: readText(values, 'accent'),
          avatarUrl: readText(values, 'avatarUrl'),
          archived: readFlag(values, 'archived'),
          position: await nextPosition(prisma.platform),
        },
      })
      .catch(rethrow)

    return platforms.list().then((rows) => rows.find((entry) => entry.id === row.id)!)
  },
  update: async (id, values) => {
    await prisma.platform
      .update({
        where: { id },
        data: {
          name: readText(values, 'name') ?? undefined,
          accent: readText(values, 'accent'),
          avatarUrl: readText(values, 'avatarUrl'),
          archived: readFlag(values, 'archived'),
        },
      })
      .catch(rethrow)

    return platforms.list().then((rows) => rows.find((entry) => entry.id === id)!)
  },
  remove: async (id) => {
    await prisma.platform.delete({ where: { id } })
  },
  reorder: (ids) =>
    applyOrder(
      (id, position) => prisma.platform.update({ where: { id }, data: { position } }),
      ids
    ),
}
