import 'server-only'

import { prisma } from '@/core/lib/db'
import { activeFunctions } from '@/core/services/reference/lookups'
import { functionOptions, rowsToOptions, toOptions } from '@/core/lib/forms/options'
import { teamOptions, withSeated } from '@/core/services/work/shared'
import { REFERENT_FUNCTION } from '@/declarations/reference/fixed'
import { ACADEMY_FIELD_COPY } from '@/declarations/academy/copy'
import {
  ACADEMY_STAGE_REGISTRY,
  ACADEMY_SESSION_STATUS_REGISTRY,
  NOTE_KIND_REGISTRY,
  OBJECTIVE_STATUS_REGISTRY,
  REVIEW_ADVICE_REGISTRY,
} from '@/declarations/academy/registries'
import { ACADEMY_SETTINGS, FORM_SETTINGS } from '@/declarations/configurations/settings'
import type { FieldDefinition, FieldOption } from '@/types/forms'
import { GONE_MEMBER_STATUSES, AcademyStages } from '@/utils/constants/hierarchy'

// Stages an actual voice check-in is written for
const REVIEW_STAGES = [
  AcademyStages.ReviewOne,
  AcademyStages.ReviewFinal,
  AcademyStages.Bonus,
] as const

const REVIEW_STAGE_OPTIONS: FieldOption[] = REVIEW_STAGES.map((stage) => ({
  value: stage,
  label: ACADEMY_STAGE_REGISTRY.label(stage),
}))

/**
 * Build the session form declarations
 * @param {string} [youtuberId] - Creator of the linked campaign, narrowing the referents
 * @param {string[]} [keptReferents] - Referents already seated, whatever their function now
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const sessionFields = async (
  youtuberId?: string,
  keptReferents: string[] = []
): Promise<FieldDefinition[]> => {
  const [referents, functions] = await Promise.all([
    teamOptions({ functionName: REFERENT_FUNCTION, youtuberId }).then((options) =>
      withSeated(options, keptReferents)
    ),
    activeFunctions(),
  ])

  return [
    {
      name: 'functionId',
      kind: 'select',
      label: ACADEMY_FIELD_COPY.function,
      required: true,
      options: functionOptions(functions),
      mark: 'dot',
      span: 'half',
    },
    {
      name: 'status',
      kind: 'select',
      label: ACADEMY_FIELD_COPY.status,
      required: true,
      options: toOptions(ACADEMY_SESSION_STATUS_REGISTRY),
      mark: 'dot',
      span: 'half',
    },
    {
      name: 'period',
      kind: 'daterange',
      dayOnly: true,
      label: ACADEMY_FIELD_COPY.period,
      hint: ACADEMY_FIELD_COPY.periodHint,
      required: true,
    },
    {
      name: 'referentIds',
      kind: 'multiselect',
      label: ACADEMY_FIELD_COPY.referents,
      options: referents,
    },
  ]
}

/**
 * Build the junior form declarations
 * @param {string} sessionId - Session identifier
 * @return {Promise<FieldDefinition[]>} - Field declarations
 */

export const juniorFields = async (sessionId: string): Promise<FieldDefinition[]> => {
  const [candidates, referents, dispositifs] = await Promise.all([
    juniorCandidates(sessionId),
    teamOptions({ functionName: REFERENT_FUNCTION }),
    prisma.dispositif.findMany({ orderBy: { position: 'asc' } }),
  ])

  return [
    {
      name: 'accountId',
      kind: 'select',
      label: ACADEMY_FIELD_COPY.account,
      required: true,
      options: candidates,
    },
    {
      name: 'referentId',
      kind: 'select',
      label: ACADEMY_FIELD_COPY.referent,
      options: referents,
      span: 'half',
    },
    {
      name: 'dispositifId',
      kind: 'select',
      label: ACADEMY_FIELD_COPY.dispositif,
      required: true,
      options: rowsToOptions(dispositifs),
      span: 'half',
    },
    {
      name: 'bonusLives',
      kind: 'number',
      label: ACADEMY_FIELD_COPY.bonusLives,
      hint: ACADEMY_FIELD_COPY.bonusLivesHint,
      min: 0,
      max: ACADEMY_SETTINGS.bonusMaxLives,
    },
  ]
}

/**
 * Declarations of the voice check-in form
 * @type {FieldDefinition[]}
 */

export const REVIEW_FIELDS: FieldDefinition[] = [
  {
    name: 'stage',
    kind: 'select',
    label: ACADEMY_FIELD_COPY.reviewStage,
    required: true,
    options: REVIEW_STAGE_OPTIONS,
    mark: 'dot',
    span: 'half',
  },
  {
    name: 'heldAt',
    kind: 'date',
    label: ACADEMY_FIELD_COPY.heldAt,
    required: true,
    span: 'half',
  },
  {
    name: 'durationMinutes',
    kind: 'number',
    label: ACADEMY_FIELD_COPY.durationMinutes,
    required: true,
    min: FORM_SETTINGS.meetingMinDuration,
    max: FORM_SETTINGS.meetingMaxDuration,
    span: 'half',
  },
  {
    name: 'advice',
    kind: 'select',
    label: ACADEMY_FIELD_COPY.advice,
    required: true,
    options: toOptions(REVIEW_ADVICE_REGISTRY),
    mark: 'dot',
    span: 'half',
    // The first check-in carries no advice
    visibleWhen: { field: 'stage', oneOf: [AcademyStages.ReviewFinal, AcademyStages.Bonus] },
  },
  {
    name: 'feeling',
    kind: 'textarea',
    label: ACADEMY_FIELD_COPY.feeling,
    maxLength: FORM_SETTINGS.noteMaxLength,
  },
  {
    name: 'summary',
    kind: 'markdown',
    label: ACADEMY_FIELD_COPY.reviewSummary,
    required: true,
    maxLength: FORM_SETTINGS.markdownMaxLength,
  },
]

/**
 * Declarations of the FSI note form
 * @type {FieldDefinition[]}
 */

export const NOTE_FIELDS: FieldDefinition[] = [
  {
    name: 'stage',
    kind: 'select',
    label: ACADEMY_FIELD_COPY.noteStage,
    required: true,
    options: toOptions(ACADEMY_STAGE_REGISTRY),
    mark: 'dot',
    span: 'half',
  },
  {
    name: 'kind',
    kind: 'select',
    label: ACADEMY_FIELD_COPY.noteKind,
    required: true,
    options: toOptions(NOTE_KIND_REGISTRY),
    mark: 'dot',
    span: 'half',
  },
  {
    name: 'body',
    kind: 'textarea',
    label: ACADEMY_FIELD_COPY.noteBody,
    required: true,
    maxLength: FORM_SETTINGS.noteMaxLength,
  },
]

/**
 * Declarations of the personal objective form
 * @type {FieldDefinition[]}
 */

export const OBJECTIVE_FIELDS: FieldDefinition[] = [
  {
    name: 'title',
    kind: 'text',
    label: ACADEMY_FIELD_COPY.objectiveTitle,
    required: true,
    maxLength: FORM_SETTINGS.titleMaxLength,
  },
  {
    name: 'dueAt',
    kind: 'date',
    label: ACADEMY_FIELD_COPY.objectiveDueAt,
    span: 'half',
  },
  {
    name: 'status',
    kind: 'select',
    label: ACADEMY_FIELD_COPY.objectiveStatus,
    required: true,
    options: toOptions(OBJECTIVE_STATUS_REGISTRY),
    mark: 'dot',
    span: 'half',
  },
  {
    name: 'description',
    kind: 'textarea',
    label: ACADEMY_FIELD_COPY.objectiveDescription,
    maxLength: FORM_SETTINGS.longTextMaxLength,
  },
]

/**
 * Read the moderators a session may still take in
 * @param {string} sessionId - Session identifier
 * @return {Promise<FieldOption[]>} - Select options
 */

export const juniorCandidates = async (sessionId: string): Promise<FieldOption[]> => {
  const accounts = await prisma.account.findMany({
    where: {
      status: { notIn: GONE_MEMBER_STATUSES },
      academyJuniors: { none: { sessionId } },
    },
    orderBy: { displayName: 'asc' },
  })

  return accounts.map((account) => ({ value: account.id, label: account.displayName }))
}
