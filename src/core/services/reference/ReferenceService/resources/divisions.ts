import 'server-only'
import { prisma } from '@/core/lib/db'
import { readFlag, readText } from '@/core/lib/forms/values'
import { REFERENCE_FIELD_COPY } from '@/declarations/reference/copy'
import {
  nameField,
  noReorder,
  rethrow,
} from '@/core/services/reference/ReferenceService/resources/shared'
import type { ReferenceResource } from '@/core/services/reference/ReferenceService/resources/shared'

/**
 * Read the next free rank of the divisions
 * @return {Promise<number>} - Next rank
 */

const nextDivisionRank = async (): Promise<number> => {
  const result = await prisma.division.aggregate({ _max: { rank: true } })

  return (result._max.rank ?? -1) + 1
}

export const divisions: ReferenceResource = {
  // A division is a name
  fields: async () => [
    nameField,
    {
      name: 'imagePath',
      kind: 'image',
      label: REFERENCE_FIELD_COPY.imagePath,
      bucket: 'avatars',
    },
    {
      name: 'leadAssignable',
      kind: 'toggle',
      label: REFERENCE_FIELD_COPY.leadAssignable,
      hint: REFERENCE_FIELD_COPY.leadAssignableHint,
      adminOnly: true,
    },
  ],
  list: async () => {
    const rows = await prisma.division.findMany({
      orderBy: { rank: 'asc' },
      include: { _count: { select: { accounts: true } } },
    })

    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      hint: row.summary,
      accent: null,
      image: row.imagePath,
      badges: row.leadAssignable ? [] : [REFERENCE_FIELD_COPY.adminOnlyBadge],
      position: row.rank,
      usage: row._count.accounts,
      values: {
        name: row.name,
        imagePath: row.imagePath,
        leadAssignable: row.leadAssignable,
      },
    }))
  },
  create: async (values) => {
    const row = await prisma.division
      .create({
        data: {
          name: readText(values, 'name') ?? '',
          imagePath: readText(values, 'imagePath'),
          leadAssignable: readFlag(values, 'leadAssignable'),
          rank: await nextDivisionRank(),
        },
      })
      .catch(rethrow)

    return divisions.list().then((rows) => rows.find((entry) => entry.id === row.id)!)
  },
  update: async (id, values) => {
    await prisma.division
      .update({
        where: { id },
        data: {
          name: readText(values, 'name') ?? undefined,
          imagePath: readText(values, 'imagePath'),
          // Only an administrator ever reaches this key
          ...('leadAssignable' in values
            ? { leadAssignable: readFlag(values, 'leadAssignable') }
            : {}),
        },
      })
      .catch(rethrow)

    return divisions.list().then((rows) => rows.find((entry) => entry.id === id)!)
  },
  remove: async (id) => {
    await prisma.division.delete({ where: { id } })
  },
  reorder: noReorder,
}
