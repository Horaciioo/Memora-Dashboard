'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import { DetailGrid } from '@/components/structures/data/DetailGrid'
import { Section } from '@/components/structures/page/Section'
import { FormDrawer } from '@/components/structures/overlays/FormDrawer'
import { HomeFacts } from '@/composites/personal/HomeFacts'
import { HomeTaskDetail } from '@/composites/personal/HomeTaskDetail'
import { AttendanceHoursDialog } from '@/composites/calendar/AttendanceHoursDialog'
import { CoordinationAnswer } from '@/composites/lives/CoordinationAnswer'
import { HomeTaskGroups } from '@/composites/personal/HomeTaskGroups'
import { HomeTaskStepper } from '@/composites/personal/HomeTaskStepper'
import { useCoordinationReply } from '@/core/hooks/data/lives/useCoordinationReply'
import type { CoordinationWindow } from '@/core/hooks/data/lives/useCoordinationReply'
import { useAbsences } from '@/core/hooks/data/people/useAbsences'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { useCopy } from '@/core/hooks/interaction/state/useCopy'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { PendingRollCall } from '@/core/services/calendar/attendance'
import { CALENDAR_COPY } from '@/declarations/calendar/copy'
import { ABSENCE_COPY } from '@/declarations/absences/copy'
import { DEPARTURE_COPY } from '@/declarations/academy/parkour'
import { LIVE_COORDINATION_COPY } from '@/declarations/lives/copy'
import { PERSONAL_COPY, PERSONAL_TASK_COPY } from '@/declarations/personal/copy'
import { TASK_GROUPS } from '@/declarations/personal/groups'
import { ICONS } from '@/declarations/ui/icons'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { HOME_FLOW } from '@/declarations/ui/variants'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { CoordinationRequest } from '@/types/lives'
import type { MemberAbsence } from '@/types/members'
import type { HomeEntry, HomeTask } from '@/types/personal'
import { AbsenceStatuses, AttendanceStatuses } from '@/utils/constants/workflow'
import type { AbsenceStatusName, AttendanceStatusName } from '@/utils/constants/workflow'
import { absenceReasonText, absenceSpan } from '@/utils/format/absences'
import { initialHours } from '@/utils/format/hours'
import {
  formatClock,
  formatDay,
  formatDayTime,
  formatRelativeDay,
  toDateTimeInput,
} from '@/utils/format/dates'

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
  // A roll-call answered here leaves the queue
  const answerCall = async (
    call: PendingRollCall,
    status: AttendanceStatusName,
    hours?: { from: string; to: string }
  ) => {
    setAskingCall(null)
    const done = await run(
      () => apiPost(API_ROUTES.calendarEntryAttendance(call.eventId), { status, ...hours }),
      PERSONAL_COPY.attendanceAnswered
    )
    if (!done) return

    router.refresh()
  }
  // Live roll-call whose hours are being asked
  const [askingCall, setAskingCall] = useState<PendingRollCall | null>(null)
  const [step, setStep] = useState<{ group: string; index: number } | null>(null)

  const openReview = (absence: MemberAbsence, status: AbsenceStatusName) => {
    clearIssues()
    setReviewing({ absence, status })
  }

  // Hours each coordination request is answered with, the live's own until edited
  const { reply } = useCoordinationReply()
  const [windows, setWindows] = useState<Record<string, CoordinationWindow>>({})
  const windowOf = (request: CoordinationRequest): CoordinationWindow =>
    windows[request.liveId] ?? {
      from: toDateTimeInput(request.startsAt),
      to: request.endsAt ? toDateTimeInput(request.endsAt) : '',
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
              variant: 'danger',
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
      heroTitle: (
        <span className="font-medium [&>strong]:font-extrabold">
          {PERSONAL_COPY.attendanceAskedBefore}
          <strong>{PERSONAL_COPY.attendanceAskedStrong}</strong>
          {PERSONAL_COPY.attendanceAskedAfter.replace('{day}', formatDay(call.startsAt))}
          <strong>{formatClock(call.startsAt)}</strong> ?
        </span>
      ),
      detail: (
        <HomeFacts
          title={PERSONAL_COPY.callInfos}
          facts={[
            { icon: 'tasks', text: call.title },
            { icon: 'meetings', text: formatDay(call.startsAt) },
            {
              icon: 'clock',
              text: call.endsAt
                ? `${formatClock(call.startsAt)} → ${formatClock(call.endsAt)}`
                : formatClock(call.startsAt),
            },
          ]}
        />
      ),
      actions: [
        {
          id: 'present',
          label: CALENDAR_COPY.respondPresent,
          variant: 'primary',
          onSelect: () =>
            call.asksHours
              ? setAskingCall(call)
              : void answerCall(call, AttendanceStatuses.Present),
        },
        {
          id: 'absent',
          label: CALENDAR_COPY.respondAbsent,
          variant: 'danger',
          onSelect: () => void answerCall(call, AttendanceStatuses.Absent),
        },
      ],
    }))

    const todo = tasks.map<HomeEntry>((task) => ({
      key: task.key,
      icon: task.icon,
      emoji: null,
      group: task.kind,
      title: task.title,
      // A PIM step lists its context as facts in the detail
      meta: TASK_GROUPS[task.kind]?.pim ? null : task.context,
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
      detail: (
        <CoordinationAnswer
          request={request}
          window={windowOf(request)}
          onChange={(next) => setWindows((current) => ({ ...current, [request.liveId]: next }))}
        />
      ),
      actions: [
        {
          id: 'accept',
          label: LIVE_COORDINATION_COPY.accept,
          variant: 'primary',
          line: 'save',
          onSelect: () => void reply(request, true, windowOf(request)),
        },
        {
          id: 'decline',
          label: LIVE_COORDINATION_COPY.decline,
          variant: 'danger',
          line: 'cancel',
          onSelect: () => void reply(request, false, windowOf(request)),
        },
      ],
      hero: {
        title: LIVE_COORDINATION_COPY.hero,
        backdrop: request.banner,
        avatar: request.avatar,
        name: request.creator,
      },
    }))

    return [...coords, ...asked, ...calls, ...todo]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests, rollCalls, tasks, coordination, windows])

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
          hidden={reviewing !== null || askingCall !== null}
        />
      )}

      {askingCall && (
        <AttendanceHoursDialog
          initial={initialHours(null, askingCall)}
          onConfirm={(hours) => void answerCall(askingCall, AttendanceStatuses.Present, hours)}
          onClose={() => setAskingCall(null)}
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
