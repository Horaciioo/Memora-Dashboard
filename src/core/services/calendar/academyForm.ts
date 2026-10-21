import 'server-only'

import { isReviewOpen, REVIEW_PURPOSES, reviewOpensAt } from '@/core/lib/academy/reviewTemplates'
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
} from '@/utils/constants/hierarchy'
import type { AcademyStageName, ReviewStatusName } from '@/utils/constants/hierarchy'
import { EventPurposes } from '@/utils/constants/workflow'
import type { EventPurposeName } from '@/utils/constants/workflow'
import { sessionTitle } from '@/utils/format/academy'
import { formatDay } from '@/utils/format/dates'

/**
 * Junior as the calendar form offers them
 * @typedef {Object} FormJunior
 */

export interface FormJunior {
  id: string
  name: string
  avatar: string | null
  sessionId: string
  trainerId: string | null
  // End of each period of the junior
  dueOne: Date | null
  dueFinal: Date | null
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
      sessionId: row.sessionId,
      trainerId: row.trainerId,
      dueOne: row.reviewOneDueAt,
      dueFinal: row.reviewFinalDueAt,
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
 * Whether a check-in is still before the week it is declared in
 * @param {EventPurposeName} purpose - Template purpose
 * @param {FormJunior} junior - Junior read
 * @return {boolean} - The period of the junior ends in more than a week
 */

const isBeforeWindow = (purpose: EventPurposeName, junior: FormJunior): boolean => {
  if (!REVIEW_PURPOSES.includes(purpose)) return false
  const opensAt = reviewOpensAt(purpose, junior)

  return opensAt !== null && opensAt.getTime() > Date.now()
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

  return !context.juniors.some(
    (junior) => isReviewOpen(purpose, junior) && !isBeforeWindow(purpose, junior)
  )
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
      const early = REVIEW_PURPOSES.includes(purpose) && isBeforeWindow(purpose, junior)
      const open = isReviewOpen(purpose, junior) && !early
      const opensAt = reviewOpensAt(purpose, junior)

      return {
        value: junior.id,
        label: junior.name,
        image: junior.avatar,
        hint: open
          ? junior.promotion
          : early && opensAt
            ? ACADEMY_EVENT_COPY.reviewOpensOn.replace('{date}', formatDay(opensAt))
            : closedHint(purpose, junior),
        disabled: !open,
        owner: templateId,
        alsoOwner: junior.sessionId,
        // Picking the junior hands over their own trainer
        sets: junior.trainerId ? { trainerId: junior.trainerId } : undefined,
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

  const [trainers, actor, sessions, seats, numbers] = await Promise.all([
    teamOptions({ functionName: TRAINER_FUNCTION }),
    prisma.account.findUnique({
      where: { id: actorId },
      select: { displayName: true, avatarUrl: true },
    }),
    // Promotions still to come or under way, never the closed ones
    prisma.academySession.findMany({
      where: {
        status: { notIn: [AcademySessionStatuses.Closed, AcademySessionStatuses.Archived] },
      },
      orderBy: { startsAt: 'desc' },
      select: { id: true, jobFunction: { select: { name: true } } },
    }),
    prisma.academySessionTrainer.findMany({ select: { sessionId: true, accountId: true } }),
    sessionNumbers(),
  ])

  // A trainer is offered under the promotions they train
  const sessionsOf = new Map<string, string[]>()
  for (const seat of seats) {
    sessionsOf.set(seat.accountId, [...(sessionsOf.get(seat.accountId) ?? []), seat.sessionId])
  }
  const trainersOfSession = trainers.map((option) => ({
    ...option,
    owners: sessionsOf.get(option.value) ?? [],
  }))

  // The author is always a choice, whatever function they hold
  const authors =
    actor && !trainers.some((option) => option.value === actorId)
      ? [{ value: actorId, label: actor.displayName, image: actor.avatarUrl }, ...trainersOfSession]
      : trainersOfSession

  const sessionChoices: FieldOption[] = sessions.map((session) => ({
    value: session.id,
    label: sessionTitle({ function: session.jobFunction, number: numbers.get(session.id) ?? 1 }),
    icon: 'academy',
  }))

  const interviews = templatesOf(context, [
    EventPurposes.TrainerInterview,
    EventPurposes.PanelInterview,
  ])

  return [
    {
      name: 'sessionId',
      kind: 'select',
      label: CALENDAR_FIELD_COPY.session,
      info: ACADEMY_EVENT_COPY.sessionInfo,
      options: sessionChoices,
      preset: 'sole',
      mark: 'glyph',
      span: 'half',
      group: FORM_GROUPS.assignment,
      visibleWhen: { field: 'templateId', oneOf: interviews },
    },
    {
      name: 'juniorId',
      kind: 'select',
      label: CALENDAR_FIELD_COPY.junior,
      info: ACADEMY_EVENT_COPY.juniorInfo,
      options: juniorOptions(context),
      ownerField: 'templateId',
      alsoOwnedBy: 'sessionId',
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
      ownerField: 'sessionId',
      preset: 'actor',
      mark: 'avatar',
      span: 'half',
      group: FORM_GROUPS.assignment,
      visibleWhen: { field: 'templateId', oneOf: interviews },
    },
  ]
}
