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
  shortTextMaxLength,
} from '@/core/services/reference/ReferenceService/resources/shared'
import type { ReferenceResource } from '@/core/services/reference/ReferenceService/resources/shared'

export const socialNetworks: ReferenceResource = {
  fields: async () => [
    nameField,
    {
      name: 'urlPrefix',
      kind: 'text',
      label: REFERENCE_FIELD_COPY.urlPrefix,
      hint: REFERENCE_FIELD_COPY.urlPrefixHint,
      required: true,
      maxLength: shortTextMaxLength,
    },
    accentField,
    { name: 'avatarUrl', kind: 'image', label: REFERENCE_FIELD_COPY.avatarUrl, bucket: 'avatars' },
    { name: 'required', kind: 'toggle', label: REFERENCE_FIELD_COPY.socialRequired },
    { name: 'archived', kind: 'toggle', label: REFERENCE_FIELD_COPY.archived },
  ],
  list: async () => {
    const rows = await prisma.socialNetwork.findMany({
      orderBy: { position: 'asc' },
      include: { _count: { select: { links: true } } },
    })

    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      hint: row.urlPrefix,
      accent: row.accent,
      image: row.avatarUrl,
      badges: row.archived ? [REFERENCE_FIELD_COPY.archivedBadge] : [],
      position: row.position,
      usage: row._count.links,
      values: {
        name: row.name,
        urlPrefix: row.urlPrefix,
        accent: row.accent,
        avatarUrl: row.avatarUrl,
        required: row.required,
        archived: row.archived,
      },
    }))
  },
  create: async (values) => {
    const row = await prisma.socialNetwork
      .create({
        data: {
          name: readText(values, 'name') ?? '',
          urlPrefix: readText(values, 'urlPrefix') ?? '',
          accent: readText(values, 'accent'),
          avatarUrl: readText(values, 'avatarUrl'),
          required: readFlag(values, 'required'),
          archived: readFlag(values, 'archived'),
          position: await nextPosition(prisma.socialNetwork),
        },
      })
      .catch(rethrow)

    return socialNetworks.list().then((rows) => rows.find((entry) => entry.id === row.id)!)
  },
  update: async (id, values) => {
    await prisma.socialNetwork
      .update({
        where: { id },
        data: {
          name: readText(values, 'name') ?? undefined,
          urlPrefix: readText(values, 'urlPrefix') ?? undefined,
          accent: readText(values, 'accent'),
          avatarUrl: readText(values, 'avatarUrl'),
          required: readFlag(values, 'required'),
          archived: readFlag(values, 'archived'),
        },
      })
      .catch(rethrow)

    return socialNetworks.list().then((rows) => rows.find((entry) => entry.id === id)!)
  },
  remove: async (id) => {
    await prisma.socialNetwork.delete({ where: { id } })
  },
  reorder: (ids) =>
    applyOrder(
      (id, position) => prisma.socialNetwork.update({ where: { id }, data: { position } }),
      ids
    ),
}
