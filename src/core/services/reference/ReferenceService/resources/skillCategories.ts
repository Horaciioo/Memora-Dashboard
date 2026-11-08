import 'server-only'
import { prisma } from '@/core/lib/db'
import { readText } from '@/core/lib/forms/values'
import {
  accentField,
  applyOrder,
  nameField,
  nextPosition,
  rethrow,
} from '@/core/services/reference/ReferenceService/resources/shared'
import type { ReferenceResource } from '@/core/services/reference/ReferenceService/resources/shared'

export const skillCategories: ReferenceResource = {
  fields: async () => [nameField, accentField],
  list: async () => {
    const rows = await prisma.skillCategory.findMany({
      orderBy: { position: 'asc' },
      include: { _count: { select: { skills: true } } },
    })

    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      hint: null,
      accent: row.accent,
      badges: [],
      position: row.position,
      usage: row._count.skills,
      values: { name: row.name, accent: row.accent },
    }))
  },
  create: async (values) => {
    const row = await prisma.skillCategory
      .create({
        data: {
          name: readText(values, 'name') ?? '',
          accent: readText(values, 'accent'),
          position: await nextPosition(prisma.skillCategory),
        },
      })
      .catch(rethrow)

    return skillCategories.list().then((rows) => rows.find((entry) => entry.id === row.id)!)
  },
  update: async (id, values) => {
    await prisma.skillCategory
      .update({
        where: { id },
        data: {
          name: readText(values, 'name') ?? undefined,
          accent: readText(values, 'accent'),
        },
      })
      .catch(rethrow)

    return skillCategories.list().then((rows) => rows.find((entry) => entry.id === id)!)
  },
  remove: async (id) => {
    await prisma.skillCategory.delete({ where: { id } })
  },
  reorder: (ids) =>
    applyOrder(
      (id, position) => prisma.skillCategory.update({ where: { id }, data: { position } }),
      ids
    ),
}
