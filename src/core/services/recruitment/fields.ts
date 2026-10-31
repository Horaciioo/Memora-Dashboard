import { prisma } from '@/core/lib/db'
import { activeFunctions } from '@/core/services/reference/lookups'
import { functionOptions, toOptions } from '@/core/lib/forms/options'
import type { AccessScope } from '@/core/services/auth/ScopeService'
import { memberOptions, teamOptions, youtuberOptions } from '@/core/services/work/shared'
import { JUNIOR_FUNCTION_OF, RECRUITER_FUNCTION } from '@/declarations/reference/fixed'
import { ACADEMY_SETTINGS, FORM_SETTINGS } from '@/declarations/configurations/settings'
import { RECRUITMENT_FIELD_COPY } from '@/declarations/recruitment/copy'
import { OUTCOME_GROUPS } from '@/declarations/recruitment/outcomes'
import {
  RECRUITMENT_PERIOD_TIMES,
  RECRUITMENT_OWNER_REGISTRY,
  RECRUITMENT_STATUS_REGISTRY,
} from '@/declarations/recruitment/registries'
import type { FieldDefinition, FieldOption } from '@/types/forms'
import { MemberRoles } from '@/utils/constants/hierarchy'
import { RecruitmentStatuses } from '@/utils/constants/recruitment'

const { shortTextMaxLength, longTextMaxLength, markdownMaxLength, noteMaxLength } = FORM_SETTINGS

import 'server-only'

/**
 * Declarations of the session form
 * @param {AccessScope} scope - Perimeter
 * @param {string} [youtuberId] - Creator of an existing session, narrowing the team pickers
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const sessionFields = async (
  scope: AccessScope,
  youtuberId?: string
): Promise<FieldDefinition[]> => {
  const [creators, functions, responsables, recruiters, observers, links] = await Promise.all([
    youtuberOptions(scope),
    activeFunctions(),
    teamOptions({ role: MemberRoles.Responsable, youtuberId, withGlobal: true }),
    teamOptions({ functionName: RECRUITER_FUNCTION, youtuberId, withGlobal: true }),
    memberOptions(),
    prisma.youtuberFunction.findMany({ select: { youtuberId: true, functionId: true } }),
  ])

  // Creators each function is held for
  const creatorsOfFunction = new Map<string, string[]>()
  for (const link of links) {
    creatorsOfFunction.set(link.functionId, [
      ...(creatorsOfFunction.get(link.functionId) ?? []),
      link.youtuberId,
    ])
  }

  return [
    {
      name: 'youtuberId',
      kind: 'select',
      label: RECRUITMENT_FIELD_COPY.youtuber,
      required: true,
      options: creators,
      mark: 'avatar',
      span: 'half',
    },
    {
      name: 'functionId',
      kind: 'select',
      label: RECRUITMENT_FIELD_COPY.jobFunction,
      required: true,
      // A campaign looks for a trade, the recruits join as Junior of it afterwards
      options: functionOptions(
        functions.filter((row) => Object.hasOwn(JUNIOR_FUNCTION_OF, row.name))
      ).map((option) => ({
        ...option,
        owners: creatorsOfFunction.get(option.value) ?? [],
      })),
      ownerField: 'youtuberId',
      mark: 'glyph',
      span: 'half',
    },
    {
      name: 'status',
      kind: 'select',
      label: RECRUITMENT_FIELD_COPY.status,
      required: true,
      options: toOptions(RECRUITMENT_STATUS_REGISTRY).map((option) => ({
        ...option,
        isDefault: option.value === RecruitmentStatuses.Draft,
      })),
      preset: 'default',
      mark: 'dot',
      span: 'half',
    },
    {
      name: 'period',
      kind: 'daterange',
      label: RECRUITMENT_FIELD_COPY.period,
      preset: 'nextWeek',
      withTime: true,
      defaultTimes: [...RECRUITMENT_PERIOD_TIMES],
      required: true,
    },
    {
      name: 'responsableIds',
      kind: 'multiselect',
      label: RECRUITMENT_FIELD_COPY.responsables,
      options: responsables,
      ownerField: 'youtuberId',
      defaultFromOwner: true,
      mark: 'avatar',
    },
    {
      name: 'recruiterIds',
      kind: 'multiselect',
      label: RECRUITMENT_FIELD_COPY.recruiters,
      options: recruiters,
      ownerField: 'youtuberId',
      mark: 'avatar',
    },
    {
      name: 'observerIds',
      kind: 'multiselect',
      label: RECRUITMENT_FIELD_COPY.observers,
      options: observers,
      mark: 'avatar',
    },
    {
      name: 'summary',
      kind: 'textarea',
      label: RECRUITMENT_FIELD_COPY.summary,
      maxLength: longTextMaxLength,
    },
  ]
}

/**
 * Declarations of the candidate form
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const candidateFields = async (): Promise<FieldDefinition[]> => {
  const [members, outcomes] = await Promise.all([
    memberOptions(),
    prisma.recruitmentOutcome.findMany({
      where: { archived: false },
      orderBy: { position: 'asc' },
    }),
  ])

  // Observers may sit in even while absent
  const seats: FieldOption[] = members.map((option) => ({
    value: option.value,
    label: option.label,
    image: option.image,
  }))

  return [
    {
      name: 'discordId',
      kind: 'discord',
      label: RECRUITMENT_FIELD_COPY.discordId,
      required: true,
      span: 'half',
    },
    {
      name: 'displayName',
      kind: 'text',
      label: RECRUITMENT_FIELD_COPY.displayName,
      info: RECRUITMENT_FIELD_COPY.displayNameInfo,
      maxLength: shortTextMaxLength,
      span: 'half',
    },
    {
      name: 'formId',
      kind: 'text',
      label: RECRUITMENT_FIELD_COPY.formId,
      maxLength: shortTextMaxLength,
      span: 'half',
    },
    {
      name: 'recruiterId',
      kind: 'select',
      label: RECRUITMENT_FIELD_COPY.recruiter,
      options: members,
      mark: 'avatar',
      span: 'half',
    },
    {
      name: 'interviewAt',
      kind: 'datetime',
      label: RECRUITMENT_FIELD_COPY.interviewAt,
      span: 'half',
    },
    {
      name: 'observerIds',
      kind: 'multiselect',
      label: RECRUITMENT_FIELD_COPY.observers,
      options: seats,
      mark: 'avatar',
    },
    {
      name: 'outcomeId',
      kind: 'select',
      label: RECRUITMENT_FIELD_COPY.outcome,
      options: outcomes.map((row) => ({
        value: row.id,
        label: row.name,
        accent: row.accent ?? undefined,
        group: row.isTerminal ? OUTCOME_GROUPS.final : OUTCOME_GROUPS.ongoing,
      })),
      mark: 'dot',
      span: 'half',
    },
    {
      name: 'attended',
      kind: 'toggle',
      label: RECRUITMENT_FIELD_COPY.attended,
      span: 'half',
    },
  ]
}

/**
 * Declarations of the timeline step form
 * @return {FieldDefinition[]} - Field declarations
 */

export const stepFields = (): FieldDefinition[] => [
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
    name: 'scheduledAt',
    kind: 'date',
    label: RECRUITMENT_FIELD_COPY.scheduledAt,
    span: 'half',
  },
  {
    name: 'required',
    kind: 'toggle',
    label: RECRUITMENT_FIELD_COPY.mandatory,
    span: 'half',
  },
  {
    name: 'notes',
    kind: 'textarea',
    label: RECRUITMENT_FIELD_COPY.notes,
    maxLength: noteMaxLength,
  },
]

/**
 * Declarations of the written trace forms
 * @param {'review' | 'instructions'} kind - Which trace is edited
 * @return {FieldDefinition[]} - Field declarations
 */

export const proseFields = (kind: 'review' | 'instructions'): FieldDefinition[] => [
  {
    name: kind,
    kind: 'markdown',
    label: kind === 'review' ? RECRUITMENT_FIELD_COPY.review : RECRUITMENT_FIELD_COPY.instructions,
    maxLength: markdownMaxLength,
  },
]
