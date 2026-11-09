import 'server-only'
import { prisma } from '@/core/lib/db'
import { activeFunctions, activeYoutubers } from '@/core/services/reference/lookups'
import { functionOptions, rowsToOptions, toOptions } from '@/core/lib/forms/options'
import { readFlag, readNumberValue, readText } from '@/core/lib/forms/values'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import { REFERENCE_FIELD_COPY } from '@/declarations/reference/copy'
import { RECRUITMENT_FIELD_COPY, RECRUITMENT_FILTER_COPY } from '@/declarations/recruitment/copy'
import { RECRUITMENT_OWNER_REGISTRY } from '@/declarations/recruitment/registries'
import { RecruitmentOwners } from '@/utils/constants/recruitment'
import type { RecruitmentOwnerName } from '@/utils/constants/recruitment'
import {
  applyOrder,
  longTextMaxLength,
  nextPosition,
  rethrow,
  shortTextMaxLength,
} from '@/core/services/reference/ReferenceService/resources/shared'
import type { ReferenceResource } from '@/core/services/reference/ReferenceService/resources/shared'

export const recruitmentStepTemplates: ReferenceResource = {
  fields: async () => {
    const [creators, functions] = await Promise.all([activeYoutubers(), activeFunctions()])

    return [
      {
        name: 'title',
        kind: 'text',
        label: RECRUITMENT_FIELD_COPY.title,
        required: true,
        maxLength: shortTextMaxLength,
      },
      {
        name: 'offset',
        kind: 'number',
        label: RECRUITMENT_FIELD_COPY.offset,
        required: true,
        min: ACADEMY_SETTINGS.stepOffsetMin,
        max: ACADEMY_SETTINGS.stepOffsetMax,
        span: 'half',
      },
      {
        name: 'owner',
        kind: 'select',
        label: RECRUITMENT_FIELD_COPY.owner,
        required: true,
        options: toOptions(RECRUITMENT_OWNER_REGISTRY),
        mark: 'glyph',
        span: 'half',
      },
      {
        name: 'youtuberId',
        kind: 'select',
        label: RECRUITMENT_FIELD_COPY.youtuber,
        options: rowsToOptions(creators),
        mark: 'avatar',
        span: 'half',
      },
      {
        name: 'functionId',
        kind: 'select',
        label: RECRUITMENT_FIELD_COPY.jobFunction,
        options: functionOptions(functions),
        span: 'half',
      },
      {
        name: 'description',
        kind: 'textarea',
        label: RECRUITMENT_FIELD_COPY.description,
        maxLength: longTextMaxLength,
      },
      { name: 'required', kind: 'toggle', label: RECRUITMENT_FIELD_COPY.mandatory },
      { name: 'archived', kind: 'toggle', label: REFERENCE_FIELD_COPY.archived },
    ]
  },
  list: async () => {
    const rows = await prisma.recruitmentStepTemplate.findMany({
      orderBy: [{ offset: 'asc' }, { position: 'asc' }],
      include: { youtuber: true, jobFunction: true },
    })

    return rows.map((row) => ({
      id: row.id,
      label: row.title,
      hint: row.description,
      accent: RECRUITMENT_OWNER_REGISTRY.get(row.owner).accent,
      badges: [
        `${REFERENCE_FIELD_COPY.offset} ${row.offset >= 0 ? '+' : ''}${row.offset}`,
        RECRUITMENT_OWNER_REGISTRY.label(row.owner),
        row.youtuber?.name ?? RECRUITMENT_FILTER_COPY.allYoutubers,
        row.jobFunction?.name ?? RECRUITMENT_FILTER_COPY.allFunctions,
        ...(row.required ? [REFERENCE_FIELD_COPY.mandatoryBadge] : []),
        ...(row.archived ? [REFERENCE_FIELD_COPY.archivedBadge] : []),
      ],
      position: row.position,
      usage: 0,
      values: {
        title: row.title,
        offset: row.offset,
        owner: row.owner,
        youtuberId: row.youtuberId,
        functionId: row.functionId,
        description: row.description,
        required: row.required,
        archived: row.archived,
      },
    }))
  },
  create: async (values) => {
    const row = await prisma.recruitmentStepTemplate
      .create({
        data: {
          title: readText(values, 'title') ?? '',
          offset: readNumberValue(values, 'offset') ?? 0,
          owner: (readText(values, 'owner') ??
            RecruitmentOwners.Responsable) as RecruitmentOwnerName,
          youtuberId: readText(values, 'youtuberId'),
          functionId: readText(values, 'functionId'),
          description: readText(values, 'description'),
          required: readFlag(values, 'required'),
          archived: readFlag(values, 'archived'),
          position: await nextPosition(prisma.recruitmentStepTemplate),
        },
      })
      .catch(rethrow)

    return recruitmentStepTemplates
      .list()
      .then((rows) => rows.find((entry) => entry.id === row.id)!)
  },
  update: async (id, values) => {
    await prisma.recruitmentStepTemplate
      .update({
        where: { id },
        data: {
          title: readText(values, 'title') ?? undefined,
          offset: readNumberValue(values, 'offset') ?? undefined,
          owner: (readText(values, 'owner') ?? undefined) as RecruitmentOwnerName | undefined,
          youtuberId: readText(values, 'youtuberId'),
          functionId: readText(values, 'functionId'),
          description: readText(values, 'description'),
          required: readFlag(values, 'required'),
          archived: readFlag(values, 'archived'),
        },
      })
      .catch(rethrow)

    return recruitmentStepTemplates.list().then((rows) => rows.find((entry) => entry.id === id)!)
  },
  remove: async (id) => {
    await prisma.recruitmentStepTemplate.delete({ where: { id } })
  },
  reorder: (ids) =>
    applyOrder(
      (id, position) =>
        prisma.recruitmentStepTemplate.update({ where: { id }, data: { position } }),
      ids
    ),
}
