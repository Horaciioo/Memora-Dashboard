'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import { DetailGrid } from '@/components/structures/DetailGrid'
import { Section } from '@/components/structures/Section'
import { FormDrawer } from '@/components/structures/FormDrawer'
import { HomeTaskDetail } from '@/composites/personal/HomeTaskDetail'
import { CoordinationAnswer } from '@/composites/lives/CoordinationAnswer'
import { HomeTaskGroups } from '@/composites/personal/HomeTaskGroups'
import { HomeTaskStepper } from '@/composites/personal/HomeTaskStepper'
import { useAbsences } from '@/core/hooks/data/useAbsences'
import { useMutation } from '@/core/hooks/data/useMutation'
import { useCopy } from '@/core/hooks/interaction/useCopy'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { PendingRollCall } from '@/core/services/calendar/attendance'
import { ABSENCE_COPY } from '@/declarations/absences/copy'
import { DEPARTURE_COPY } from '@/declarations/academy/parkour'
import { ROUTES } from '@/declarations/navigation'
import { PERSONAL_COPY, PERSONAL_TASK_COPY } from '@/declarations/personal/copy'
import { ICONS } from '@/declarations/ui/icons'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { HOME_FLOW } from '@/declarations/ui/variants'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { CoordinationRequest } from '@/types/lives'
import type { MemberAbsence } from '@/types/members'
import type { HomeEntry, HomeTask } from '@/types/personal'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import type { AbsenceStatusName } from '@/utils/constants/workflow'
import { absenceReasonText, absenceSpan } from '@/utils/format/absences'
import { formatDayTime, formatRelativeDay } from '@/utils/format/dates'

export interface HomeQueueProps {
  absences: MemberAbsence[]
  reviewFields: FieldDefinition[]
  tasks: HomeTask[]
  rollCalls: PendingRollCall[]
  coordination: CoordinationRequest[]
}

/**
 * Everything waiting on the member as one queue: the next thing large with its buttons, the
 * rest underneath, and a click on a line brings it forward
 * @param {MemberAbsence[]} absences - Requests waiting on the viewer
 * @param {FieldDefinition[]} reviewFields - Declarations of the review form
 * @param {HomeTask[]} tasks - Tasks computed server-side
 * @param {PendingRollCall[]} rollCalls - Roll-calls waiting on an answer
 * @param {CoordinationRequest[]} coordination - Requests to coordinate a live
 * @return {JSX.Element}
 */

export const HomeQueue = ({
  absences,
  reviewFields,
  tasks,
  rollCalls,
  coordination,
}: HomeQueueProps) => {
  const { absences: requests, isSaving, issues, clearIssues, review } = useAbsences(absences)
  const [reviewing, setReviewing] = useState<{
    absence: MemberAbsence
    status: AbsenceStatusName
  } | null>(null)
  const router = useRouter()
  const copy = useCopy(DEPARTURE_COPY.copied)
  const { run } = useMutation()

  // A published announcement leaves the queue
  const publish = async (id: string) => {
    const done = await run(() => apiPost(API_ROUTES.departure(id), {}), DEPARTURE_COPY.published)
    if (!done) return

    router.refresh()
  }
  const [step, setStep] = useState<{ group: string; index: number } | null>(null)

  const openReview = (absence: MemberAbsence, status: AbsenceStatusName) => {
    clearIssues()
    setReviewing({ absence, status })
  }

  // Requests first since a teammate waits on them
  const entries = useMemo<HomeEntry[]>(() => {
    const asked = requests
      .filter((absence) => absence.status === AbsenceStatuses.Pending)
      .map<HomeEntry>((absence) => {
        const span = absenceSpan(absence.startDate, absence.endDate)

        return {
          key: `absence:${absence.id}`,
          icon: 'absences',
          emoji: null,
          group: 'absence',
          title: PERSONAL_COPY.absenceTitle.replace('{name}', absence.memberName),
          meta: `${span.days} ${span.month}`,
          note: absenceReasonText(absence),
          due: null,
          detail: (
            <DetailGrid
              entries={[{ label: ABSENCE_COPY.reasonTitle, value: absenceReasonText(absence) }]}
            />
          ),
          actions: [
            {
              id: 'approve',
              label: ABSENCE_COPY.approve,
              variant: 'primary',
              onSelect: () => openReview(absence, AbsenceStatuses.Approved),
            },
            {
              id: 'refuse',
              label: ABSENCE_COPY.refuse,
              variant: 'secondary',
              onSelect: () => openReview(absence, AbsenceStatuses.Refused),
            },
          ],
        }
      })

    const calls = rollCalls.map<HomeEntry>((call) => ({
      key: `call:${call.eventId}`,
      icon: 'meetings',
      emoji: call.emoji,
      group: 'call',
      title: call.title,
      meta: `${PERSONAL_COPY.attendanceKind}, ${formatDayTime(call.startsAt)}`,
      note: null,
      due: formatRelativeDay(call.startsAt),
      actions: [
        {
          id: 'answer',
          label: PERSONAL_COPY.attendanceAnswer,
          variant: 'primary',
          href: ROUTES.calendarEvent(call.eventId),
        },
      ],
    }))

    const todo = tasks.map<HomeEntry>((task) => ({
      key: task.key,
      icon: task.icon,
      emoji: null,
      group: task.kind,
      title: task.title,
      meta: task.context,
      note: null,
      due: task.dueAt ? formatRelativeDay(task.dueAt) : null,
      detail: <HomeTaskDetail task={task} />,
      actions: task.announcement
        ? [
            {
              id: 'copy',
              label: DEPARTURE_COPY.copy,
              variant: 'secondary',
              onSelect: () => void copy(task.announcement?.body ?? ''),
            },
            {
              id: 'publish',
              label: DEPARTURE_COPY.publish,
              variant: 'primary',
              onSelect: () => void publish(task.announcement?.id ?? ''),
            },
          ]
        : [
            {
              id: 'go',
              label: task.destinationLabel ? PERSONAL_TASK_COPY.go : PERSONAL_TASK_COPY.goPlain,
              variant: 'primary',
              href: task.href,
            },
          ],
    }))

    const coords = coordination.map<HomeEntry>((request) => ({
      key: `coordination:${request.liveId}`,
      icon: 'coordinator',
      emoji: null,
      group: 'coordination',
      title: PERSONAL_TASK_COPY.coordinationTitle.replace('{creator}', request.creator),
      meta: formatDayTime(request.startsAt),
      note: null,
      due: formatRelativeDay(request.startsAt),
      actions: [],
      detail: <CoordinationAnswer request={request} />,
    }))

    return [...coords, ...asked, ...calls, ...todo]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests, rollCalls, tasks, coordination])

  const CheckIcon = ICONS.picked

  // A task treated here stays on the list, struck through, until the page is left
  const [seen, setSeen] = useState<HomeEntry[]>(entries)
  const fresh = entries.filter((entry) => !seen.some((known) => known.key === entry.key))
  if (fresh.length > 0) setSeen([...seen, ...fresh])
  const doneKeys = new Set(
    seen
      .filter((known) => !entries.some((entry) => entry.key === known.key))
      .map((known) => known.key)
  )
  const stepped = step === null ? [] : entries.filter((entry) => entry.group === step.group)

  return (
    <>
      <Section title={PERSONAL_COPY.todoTitle} bare>
        {seen.length === 0 && entries.length === 0 ? (
          <div className={HOME_FLOW.rest}>
            <CheckIcon className={HOME_FLOW.restMark} aria-hidden="true" />
            <p>{PERSONAL_COPY.calmTodoTitle}</p>
          </div>
        ) : (
          <HomeTaskGroups
            entries={[...seen.filter((known) => doneKeys.has(known.key)), ...entries]}
            doneKeys={doneKeys}
            onWalk={(group) => setStep({ group, index: 0 })}
          />
        )}
      </Section>

      {step !== null && stepped.length > 0 && (
        <HomeTaskStepper
          group={step.group}
          entries={stepped}
          index={step.index}
          onIndex={(index) => setStep({ group: step.group, index })}
          onClose={() => setStep(null)}
          hidden={reviewing !== null}
        />
      )}

      <FormDrawer
        subject={FORM_SUBJECTS.absence}
        open={reviewing !== null}
        title={ABSENCE_COPY.reviewTitle}
        description={
          reviewing
            ? `${reviewing.absence.memberName}, ${absenceSpan(reviewing.absence.startDate, reviewing.absence.endDate).days}`
            : ''
        }
        fields={reviewFields}
        issues={issues}
        isSaving={isSaving}
        submitVerb={
          reviewing?.status === AbsenceStatuses.Approved
            ? ABSENCE_COPY.approve
            : ABSENCE_COPY.refuse
        }
        onSubmit={async (values: FormValues) => {
          const saved = await review(reviewing!.absence.id, reviewing!.status, values)
          if (saved) setReviewing(null)

          return saved
        }}
        onClose={() => setReviewing(null)}
      />
    </>
  )
}
