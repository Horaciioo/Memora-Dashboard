import 'server-only'

import { prisma } from '@/core/lib/db'
import { sessionNumbers } from '@/core/services/academy/sessionView'
import { FORM_GROUPS } from '@/declarations/ui/copy'
import { SEAT_COPY, TEMPORARY_KINDS, TEMPORARY_SEATS } from '@/declarations/members/seats'
import type { FieldDefinition, FieldOption } from '@/types/forms'
import { sessionTitle } from '@/utils/format/academy'
import { FINISHED_RECRUITMENT_STATUSES } from '@/utils/constants/recruitment'
import { AcademySessionStatuses } from '@/utils/constants/hierarchy'

// Promotions past which nothing moves
const ARCHIVED_PROMOTIONS: string[] = [
  AcademySessionStatuses.Closed,
  AcademySessionStatuses.Archived,
]

/**
 * Sessions to seat a recruiter or an observer in, the current ones first
 * @return {Promise<FieldOption[]>} - Options grouped by state
 */

const recruitmentOptions = async (): Promise<FieldOption[]> => {
  const rows = await prisma.recruitmentSession.findMany({
    orderBy: [{ opensAt: 'desc' }, { createdAt: 'desc' }],
    select: { id: true, name: true, status: true, youtuber: { select: { name: true } } },
  })

  return rows.map((row) => ({
    value: row.id,
    label: row.name,
    hint: row.youtuber.name,
    group: FINISHED_RECRUITMENT_STATUSES.includes(row.status)
      ? SEAT_COPY.archivedGroup
      : SEAT_COPY.currentGroup,
  }))
}

/**
 * Promotions to seat a trainer in, the current ones first
 * @return {Promise<FieldOption[]>} - Options grouped by state
 */

const academyOptions = async (): Promise<FieldOption[]> => {
  const [rows, numbers] = await Promise.all([
    prisma.academySession.findMany({
      orderBy: { startsAt: 'desc' },
      select: { id: true, status: true, jobFunction: { select: { name: true } } },
    }),
    sessionNumbers(),
  ])

  return rows.map((row) => ({
    value: row.id,
    label: sessionTitle({ function: row.jobFunction, number: numbers.get(row.id) ?? 1 }),
    group: ARCHIVED_PROMOTIONS.includes(row.status)
      ? SEAT_COPY.archivedGroup
      : SEAT_COPY.currentGroup,
  }))
}

/**
 * Orders the groups, the current sessions before the archived ones
 * @param {FieldOption[]} options - Options grouped by state
 * @return {FieldOption[]} - Same options, current group first
 */

const currentFirst = (options: FieldOption[]): FieldOption[] =>
  [SEAT_COPY.currentGroup, SEAT_COPY.archivedGroup].flatMap((group) =>
    options.filter((option) => option.group === group)
  )

/**
 * Session pickers shown once a temporary function is chosen
 * @param {Map<string, string>} functionIds - Function identifier by name
 * @return {Promise<FieldDefinition[]>} - One select per temporary function
 */

export const temporaryFields = async (
  functionIds: Map<string, string>
): Promise<FieldDefinition[]> => {
  const [recruitment, academy] = await Promise.all([recruitmentOptions(), academyOptions()])

  return TEMPORARY_KINDS.flatMap((kind) => {
    const { field, functionName, family } = TEMPORARY_SEATS[kind]
    const functionId = functionIds.get(functionName)
    if (!functionId) return []

    return [
      {
        name: field,
        kind: 'select',
        label: SEAT_COPY.fieldLabel[kind],
        info: SEAT_COPY.fieldInfo,
        options: currentFirst(family === 'academy' ? academy : recruitment),
        visibleWhen: { field: 'secondaryFunctionIds', includes: functionId },
        span: 'half',
        group: FORM_GROUPS.assignment,
      },
    ]
  })
}
