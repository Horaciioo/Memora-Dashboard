import 'server-only'

import { isReviewOpen, REVIEW_PURPOSES } from '@/core/lib/academy/reviewTemplates'
import { prisma } from '@/core/lib/db'
import type { AcademyScope } from '@/core/services/academy/AcademyScope'
import { sessionNumbers } from '@/core/services/academy/AcademyService'
import { teamOptions } from '@/core/services/work/shared'
import { ACADEMY_EVENT_COPY, CALENDAR_FIELD_COPY } from '@/declarations/calendar/copy'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import { TRAINER_FUNCTION } from '@/declarations/reference/fixed'
import { FORM_GROUPS } from '@/declarations/ui/copy'
import type { FieldDefinition, FieldOption } from '@/types/forms'
import {
  AcademyJuniorStatuses,
  AcademySessionStatuses,
  AcademyStages,
  MemberRoles,
} from '@/utils/constants/hierarchy'
import type { AcademyStageName, ReviewStatusName } from '@/utils/constants/hierarchy'
import { EventPurposes } from '@/utils/constants/workflow'
import type { EventPurposeName } from '@/utils/constants/workflow'
import { sessionTitle } from '@/utils/format/academy'

/**
 * Junior as the calendar form offers them
 * @typedef {Object} FormJunior
 */

export interface FormJunior {
  id: string
  name: string
  avatar: string | null
  promotion: string
  stage: AcademyStageName
  reviews: { stage: AcademyStageName; status: ReviewStatusName }[]
}

/**
 * What the calendar form needs to know of the academy
 * @typedef {Object} AcademyFormContext
 * @property {Map<string, EventPurposeName>} purposes - Purpose of each academy template
 * @property {FormJunior[]} juniors - Juniors in reach
 */

export interface AcademyFormContext {
  purposes: Map<string, EventPurposeName>
  juniors: FormJunior[]
}

/**
 * Read the academy templates and the juniors a member may plan something for
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<AcademyFormContext>} - Templates and juniors
 */

export const readAcademyForm = async (scope: AcademyScope): Promise<AcademyFormContext> => {
  const [templates, rows, numbers] = await Promise.all([
    prisma.eventTemplate.findMany({
      where: { purpose: { not: null }, archived: false },
      select: { id: true, purpose: true },
    }),
    prisma.academyJunior.findMany({
      where: {
        status: AcademyJuniorStatuses.Active,
        session: {
          ...scope.session,
          status: { in: [AcademySessionStatuses.Open, AcademySessionStatuses.Running] },
        },
        ...scope.juniors,
      },
      include: {
        account: { select: { displayName: true, avatarUrl: true } },
        reviews: { select: { stage: true, status: true } },
        session: { select: { jobFunction: { select: { name: true } } } },
      },
      orderBy: { account: { displayName: 'asc' } },
      take: ACADEMY_SETTINGS.formJuniorsLimit,
    }),
    sessionNumbers(),
  ])

  return {
    purposes: new Map(templates.map((row) => [row.id, row.purpose as EventPurposeName])),
    juniors: rows.map((row) => ({
      id: row.id,
      name: row.account.displayName,
      avatar: row.account.avatarUrl,
      promotion: sessionTitle({
        function: row.session.jobFunction,
        number: numbers.get(row.sessionId) ?? 1,
      }),
      stage: row.stage as AcademyStageName,
      reviews: row.reviews.map((review) => ({
        stage: review.stage as AcademyStageName,
        status: review.status as ReviewStatusName,
      })),
    })),
  }
}

/**
 * Whether a template has no junior left to be planned for
 * @param {AcademyFormContext} context - Templates and juniors
 * @param {string} templateId - Template identifier
 * @return {boolean} - Greyed out
 */

export const isTemplateGreyed = (context: AcademyFormContext, templateId: string): boolean => {
  const purpose = context.purposes.get(templateId)
  if (!purpose || !REVIEW_PURPOSES.includes(purpose)) return false

  return !context.juniors.some((junior) => isReviewOpen(purpose, junior))
}

/**
 * Reason a check-in is shut for a junior
 * @param {EventPurposeName} purpose - Template purpose
 * @param {FormJunior} junior - Junior read
 * @return {string} - Hint shown under the greyed junior
 */

const closedHint = (purpose: EventPurposeName, junior: FormJunior): string =>
  purpose === EventPurposes.ReviewFinal &&
  !junior.reviews.some((review) => review.stage === AcademyStages.ReviewOne)
    ? ACADEMY_EVENT_COPY.reviewWaitsFirst
    : ACADEMY_EVENT_COPY.reviewDone

/**
 * Juniors offered by each academy template, greyed when its check-in no longer applies
 * @param {AcademyFormContext} context - Templates and juniors
 * @return {FieldOption[]} - One option per junior and template
 */

const juniorOptions = (context: AcademyFormContext): FieldOption[] =>
  [...context.purposes].flatMap(([templateId, purpose]) =>
    context.juniors.map((junior) => {
      const open = isReviewOpen(purpose, junior)

      return {
        value: junior.id,
        label: junior.name,
        image: junior.avatar,
        hint: open ? junior.promotion : closedHint(purpose, junior),
        disabled: !open,
        owner: templateId,
      }
    })
  )

/**
 * Templates standing for a purpose
 * @param {AcademyFormContext} context - Templates and juniors
 * @param {EventPurposeName[]} purposes - Purposes looked for
 * @return {string[]} - Template identifiers
 */

const templatesOf = (context: AcademyFormContext, purposes: EventPurposeName[]): string[] =>
  [...context.purposes].filter(([, purpose]) => purposes.includes(purpose)).map(([id]) => id)

/**
 * Fields the academy templates add to the calendar form
 * @param {AcademyFormContext} context - Templates and juniors
 * @param {string} actorId - Member filling the form
 * @return {Promise<FieldDefinition[]>} - Junior, trainer and responsables
 */

export const academyFields = async (
  context: AcademyFormContext,
  actorId: string
): Promise<FieldDefinition[]> => {
  if (context.purposes.size === 0) return []

  const [trainers, responsables, actor] = await Promise.all([
    teamOptions({ functionName: TRAINER_FUNCTION }),
    teamOptions({ role: MemberRoles.Responsable }),
    prisma.account.findUnique({
      where: { id: actorId },
      select: { displayName: true, avatarUrl: true },
    }),
  ])

  // The author is always a choice, whatever function they hold
  const authors =
    actor && !trainers.some((option) => option.value === actorId)
      ? [{ value: actorId, label: actor.displayName, image: actor.avatarUrl }, ...trainers]
      : trainers

  const interviews = templatesOf(context, [
    EventPurposes.TrainerInterview,
    EventPurposes.PanelInterview,
  ])

  return [
    {
      name: 'juniorId',
      kind: 'select',
      label: CALENDAR_FIELD_COPY.junior,
      info: ACADEMY_EVENT_COPY.juniorInfo,
      options: juniorOptions(context),
      ownerField: 'templateId',
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
      visibleWhen: { field: 'templateId', oneOf: [...context.purposes.keys()] },
    },
    {
      name: 'trainerId',
      kind: 'select',
      label: CALENDAR_FIELD_COPY.trainer,
      info: ACADEMY_EVENT_COPY.trainerInfo,
      options: authors,
      preset: 'actor',
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
      visibleWhen: { field: 'templateId', oneOf: interviews },
    },
    {
      name: 'responsableIds',
      kind: 'multiselect',
      label: CALENDAR_FIELD_COPY.responsables,
      info: ACADEMY_EVENT_COPY.responsablesInfo,
      options: responsables,
      ownerField: 'youtuberId',
      mark: 'avatar',
      group: FORM_GROUPS.assignment,
      visibleWhen: {
        field: 'templateId',
        oneOf: templatesOf(context, [EventPurposes.PanelInterview]),
      },
    },
  ]
}
