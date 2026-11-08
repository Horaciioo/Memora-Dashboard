import 'server-only'
import { prisma } from '@/core/lib/db'
import { readNumberValue, readText } from '@/core/lib/forms/values'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { REFERENCE_FIELD_COPY } from '@/declarations/reference/copy'
import {
  accentField,
  nameField,
  noReorder,
  rethrow,
} from '@/core/services/reference/ReferenceService/resources/shared'
import type { ReferenceResource } from '@/core/services/reference/ReferenceService/resources/shared'

export const priorities: ReferenceResource = {
  fields: async () => [
    nameField,
    {
      name: 'weight',
      kind: 'number',
      label: REFERENCE_FIELD_COPY.weight,
      required: true,
      min: 0,
      max: FORM_SETTINGS.priorityMaxWeight,
      span: 'half',
    },
    accentField,
  ],
  list: async () => {
    const rows = await prisma.priority.findMany({
      orderBy: { weight: 'desc' },
      include: { _count: { select: { projects: true, tasks: true } } },
    })

    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      hint: null,
      accent: row.accent,
      badges: [],
      position: row.weight,
      usage: row._count.projects + row._count.tasks,
      values: { name: row.name, weight: row.weight, accent: row.accent },
    }))
  },
  create: async (values) => {
    const row = await prisma.priority
      .create({
        data: {
          name: readText(values, 'name') ?? '',
          weight: readNumberValue(values, 'weight') ?? 0,
          accent: readText(values, 'accent'),
        },
      })
      .catch(rethrow)

    return priorities.list().then((rows) => rows.find((entry) => entry.id === row.id)!)
  },
  update: async (id, values) => {
    await prisma.priority
      .update({
        where: { id },
        data: {
          name: readText(values, 'name') ?? undefined,
          weight: readNumberValue(values, 'weight') ?? undefined,
          accent: readText(values, 'accent'),
        },
      })
      .catch(rethrow)

    return priorities.list().then((rows) => rows.find((entry) => entry.id === id)!)
  },
  remove: async (id) => {
    await prisma.priority.delete({ where: { id } })
  },
  reorder: noReorder,
}
