import 'server-only'
import { prisma } from '@/core/lib/db'
import { activeFunctions } from '@/core/services/reference/lookups'
import { functionOptions, rowsToOptions, toOptions } from '@/core/lib/forms/options'
import { readFlag, readText } from '@/core/lib/forms/values'
import { ACADEMY_PERIOD_REGISTRY } from '@/declarations/access/roles'
import { REFERENCE_FIELD_COPY } from '@/declarations/reference/copy'
import type { AcademyPeriodName } from '@/utils/constants'
import {
  applyOrder,
  markdownMaxLength,
  nameField,
  nextPosition,
  rethrow,
} from '@/core/services/reference/ReferenceService/resources/shared'
import type { ReferenceResource } from '@/core/services/reference/ReferenceService/resources/shared'

export const trainings: ReferenceResource = {
  fields: async () => {
    const [functions, dispositifRows] = await Promise.all([
      activeFunctions(),
      prisma.dispositif.findMany({ orderBy: { position: 'asc' } }),
    ])

    return [
      nameField,
      {
        name: 'period',
        kind: 'select',
        label: REFERENCE_FIELD_COPY.period,
        options: toOptions(ACADEMY_PERIOD_REGISTRY),
        mark: 'dot',
        span: 'half',
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
        name: 'summary',
        kind: 'textarea',
        label: REFERENCE_FIELD_COPY.summary,
        maxLength: markdownMaxLength,
      },
      { name: 'mandatory', kind: 'toggle', label: REFERENCE_FIELD_COPY.mandatory },
    ]
  },
  list: async () => {
    const rows = await prisma.training.findMany({
      orderBy: [{ period: 'asc' }, { position: 'asc' }],
      include: { jobFunction: true, dispositif: true, _count: { select: { records: true } } },
    })

    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      hint: row.jobFunction?.name ?? null,
      accent: row.mandatory ? 'brand' : null,
      badges: [
        ...(row.dispositif ? [row.dispositif.name] : []),
        ...(row.period ? [ACADEMY_PERIOD_REGISTRY.label(row.period)] : []),
        ...(row.mandatory ? [REFERENCE_FIELD_COPY.mandatoryBadge] : []),
      ],
      position: row.position,
      usage: row._count.records,
      values: {
        name: row.name,
        period: row.period,
        functionId: row.functionId,
        dispositifId: row.dispositifId,
        summary: row.summary,
        mandatory: row.mandatory,
      },
    }))
  },
  create: async (values) => {
    const row = await prisma.training
      .create({
        data: {
          name: readText(values, 'name') ?? '',
          period: (readText(values, 'period') ?? null) as AcademyPeriodName | null,
          functionId: readText(values, 'functionId'),
          dispositifId: readText(values, 'dispositifId'),
          summary: readText(values, 'summary'),
          mandatory: readFlag(values, 'mandatory'),
          position: await nextPosition(prisma.training),
        },
      })
      .catch(rethrow)

    return trainings.list().then((rows) => rows.find((entry) => entry.id === row.id)!)
  },
  update: async (id, values) => {
    await prisma.training
      .update({
        where: { id },
        data: {
          name: readText(values, 'name') ?? undefined,
          period: (readText(values, 'period') ?? null) as AcademyPeriodName | null,
          functionId: readText(values, 'functionId'),
          dispositifId: readText(values, 'dispositifId'),
          summary: readText(values, 'summary'),
          mandatory: readFlag(values, 'mandatory'),
        },
      })
      .catch(rethrow)

    return trainings.list().then((rows) => rows.find((entry) => entry.id === id)!)
  },
  remove: async (id) => {
    await prisma.training.delete({ where: { id } })
  },
  reorder: (ids) =>
    applyOrder(
      (id, position) => prisma.training.update({ where: { id }, data: { position } }),
      ids
    ),
}
