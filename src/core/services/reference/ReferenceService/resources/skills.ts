import 'server-only'
import { prisma } from '@/core/lib/db'
import { activeFunctions } from '@/core/services/reference/lookups'
import { functionOptions, rowsToOptions } from '@/core/lib/forms/options'
import { readText } from '@/core/lib/forms/values'
import { REFERENCE_FIELD_COPY } from '@/declarations/reference/copy'
import {
  applyOrder,
  longTextMaxLength,
  nameField,
  nextPosition,
  rethrow,
} from '@/core/services/reference/ReferenceService/resources/shared'
import type { ReferenceResource } from '@/core/services/reference/ReferenceService/resources/shared'

export const skills: ReferenceResource = {
  fields: async () => {
    const [categories, functions, dispositifRows] = await Promise.all([
      prisma.skillCategory.findMany({ orderBy: { position: 'asc' } }),
      activeFunctions(),
      prisma.dispositif.findMany({ orderBy: { position: 'asc' } }),
    ])

    return [
      nameField,
      {
        name: 'categoryId',
        kind: 'select',
        label: REFERENCE_FIELD_COPY.category,
        required: true,
        options: rowsToOptions(categories),
      },
      {
        name: 'functionId',
        kind: 'select',
        label: REFERENCE_FIELD_COPY.jobFunction,
        options: functionOptions(functions),
        span: 'half',
      },
      {
        name: 'dispositifId',
        kind: 'select',
        label: REFERENCE_FIELD_COPY.dispositif,
        options: rowsToOptions(dispositifRows),
        span: 'half',
      },
      {
        name: 'description',
        kind: 'textarea',
        label: REFERENCE_FIELD_COPY.summary,
        maxLength: longTextMaxLength,
      },
    ]
  },
  list: async () => {
    const rows = await prisma.skill.findMany({
      orderBy: [{ category: { position: 'asc' } }, { position: 'asc' }],
      include: { category: true, jobFunction: true, dispositif: true },
    })

    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      hint: row.description,
      accent: row.category.accent,
      badges: [
        row.category.name,
        ...(row.jobFunction ? [row.jobFunction.name] : []),
        ...(row.dispositif ? [row.dispositif.name] : []),
      ],
      position: row.position,
      // No consumer reads a skill yet
      usage: 0,
      values: {
        name: row.name,
        categoryId: row.categoryId,
        functionId: row.functionId,
        dispositifId: row.dispositifId,
        description: row.description,
      },
    }))
  },
  create: async (values) => {
    const row = await prisma.skill
      .create({
        data: {
          name: readText(values, 'name') ?? '',
          categoryId: readText(values, 'categoryId') ?? '',
          functionId: readText(values, 'functionId'),
          dispositifId: readText(values, 'dispositifId'),
          description: readText(values, 'description'),
          position: await nextPosition(prisma.skill),
        },
      })
      .catch(rethrow)

    return skills.list().then((rows) => rows.find((entry) => entry.id === row.id)!)
  },
  update: async (id, values) => {
    await prisma.skill
      .update({
        where: { id },
        data: {
          name: readText(values, 'name') ?? undefined,
          categoryId: readText(values, 'categoryId') ?? undefined,
          functionId: readText(values, 'functionId'),
          dispositifId: readText(values, 'dispositifId'),
          description: readText(values, 'description'),
        },
      })
      .catch(rethrow)

    return skills.list().then((rows) => rows.find((entry) => entry.id === id)!)
  },
  remove: async (id) => {
    await prisma.skill.delete({ where: { id } })
  },
  reorder: (ids) =>
    applyOrder((id, position) => prisma.skill.update({ where: { id }, data: { position } }), ids),
}
