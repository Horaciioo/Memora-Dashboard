import 'server-only'
import { prisma } from '@/core/lib/db'
import { toOptions } from '@/core/lib/forms/options'
import { readFlag, readNumberValue, readText } from '@/core/lib/forms/values'
import { FORM_SETTINGS, SANCTION_SETTINGS } from '@/declarations/configurations/settings'
import { REFERENCE_FIELD_COPY } from '@/declarations/reference/copy'
import { SANCTION_FIELD_COPY } from '@/declarations/sanctions/copy'
import { SANCTION_KIND_REGISTRY } from '@/declarations/sanctions/registries'
import { SanctionKinds } from '@/utils/constants/moderation'
import type { SanctionKindName } from '@/utils/constants/moderation'
import {
  accentField,
  applyOrder,
  nameField,
  nextPosition,
  rethrow,
} from '@/core/services/reference/ReferenceService/resources/shared'
import type { ReferenceResource } from '@/core/services/reference/ReferenceService/resources/shared'

export const sanctionMeasures: ReferenceResource = {
  fields: async () => [
    nameField,
    {
      name: 'kind',
      kind: 'select',
      label: SANCTION_FIELD_COPY.kind,
      required: true,
      options: toOptions(SANCTION_KIND_REGISTRY),
      mark: 'dot',
      span: 'half',
    },
    accentField,
    {
      name: 'durationMinutes',
      kind: 'number',
      label: SANCTION_FIELD_COPY.duration,
      min: 1,
      max: SANCTION_SETTINGS.maxTimeoutMinutes,
      span: 'half',
      visibleWhen: { field: 'kind', equals: SanctionKinds.Timeout },
    },
    {
      name: 'weight',
      kind: 'number',
      label: SANCTION_FIELD_COPY.weight,
      min: 0,
      max: FORM_SETTINGS.priorityMaxWeight,
      span: 'half',
    },
    { name: 'permanent', kind: 'toggle', label: SANCTION_FIELD_COPY.permanent },
    { name: 'archived', kind: 'toggle', label: REFERENCE_FIELD_COPY.archived },
  ],
  list: async () => {
    const rows = await prisma.sanctionMeasure.findMany({
      orderBy: [{ position: 'asc' }, { weight: 'asc' }],
      include: { _count: { select: { tiers: true } } },
    })

    return rows.map((row) => ({
      id: row.id,
      label: row.name,
      hint: SANCTION_KIND_REGISTRY.label(row.kind),
      accent: row.accent,
      badges: row.archived ? [REFERENCE_FIELD_COPY.archivedBadge] : [],
      position: row.position,
      usage: row._count.tiers,
      values: {
        name: row.name,
        kind: row.kind,
        accent: row.accent,
        durationMinutes: row.durationMinutes,
        weight: row.weight,
        permanent: row.permanent,
        archived: row.archived,
      },
    }))
  },
  create: async (values) => {
    const row = await prisma.sanctionMeasure
      .create({
        data: {
          name: readText(values, 'name') ?? '',
          kind: (readText(values, 'kind') ?? SanctionKinds.Timeout) as SanctionKindName,
          accent: readText(values, 'accent'),
          durationMinutes: readNumberValue(values, 'durationMinutes'),
          weight: readNumberValue(values, 'weight') ?? 0,
          permanent: readFlag(values, 'permanent'),
          archived: readFlag(values, 'archived'),
          position: await nextPosition(prisma.sanctionMeasure),
        },
      })
      .catch(rethrow)

    return sanctionMeasures.list().then((rows) => rows.find((entry) => entry.id === row.id)!)
  },
  update: async (id, values) => {
    await prisma.sanctionMeasure
      .update({
        where: { id },
        data: {
          name: readText(values, 'name') ?? undefined,
          kind: (readText(values, 'kind') ?? undefined) as SanctionKindName | undefined,
          accent: readText(values, 'accent'),
          durationMinutes: readNumberValue(values, 'durationMinutes'),
          weight: readNumberValue(values, 'weight') ?? undefined,
          permanent: readFlag(values, 'permanent'),
          archived: readFlag(values, 'archived'),
        },
      })
      .catch(rethrow)

    return sanctionMeasures.list().then((rows) => rows.find((entry) => entry.id === id)!)
  },
  remove: async (id) => {
    await prisma.sanctionMeasure.delete({ where: { id } })
  },
  reorder: (ids) =>
    applyOrder(
      (id, position) => prisma.sanctionMeasure.update({ where: { id }, data: { position } }),
      ids
    ),
}
