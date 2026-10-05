'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import { DetailGrid } from '@/components/structures/DetailGrid'
import { Drawer } from '@/components/structures/Drawer'
import { Section } from '@/components/structures/Section'
import { FormDrawer } from '@/components/structures/FormDrawer'
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
import { DEPARTURE_TASK, HOME_FLOW, TASK_LIST } from '@/declarations/ui/variants'
import type { FieldDefinition, FormValues } from '@/types/forms'
import type { MemberAbsence } from '@/types/members'
import type { HomeEntry, HomeTask } from '@/types/personal'
import { AbsenceStatuses } from '@/utils/constants/workflow'
import type { AbsenceStatusName } from '@/utils/constants/workflow'
import { absenceReasonText, absenceSpan } from '@/utils/format/absences'
import { formatDay, formatDayTime, formatRelativeDay } from '@/utils/format/dates'

export interface HomeQueueProps {
  absences: MemberAbsence[]
  reviewFields: FieldDefinition[]
  tasks: HomeTask[]
  rollCalls: PendingRollCall[]
}

/**
 * Everything waiting on the member as one queue: the next thing large with its buttons, the
 * rest underneath, and a click on a line brings it forward
 * @param {MemberAbsence[]} absences - Requests waiting on the viewer
 * @param {FieldDefinition[]} reviewFields - Declarations of the review form
 * @param {HomeTask[]} tasks - Tasks computed server-side
 * @param {PendingRollCall[]} rollCalls - Roll-calls waiting on an answer
 * @return {JSX.Element}
 */

export const HomeQueue = ({ absences, reviewFields, tasks, rollCalls }: HomeQueueProps) => {
  const { absences: requests, isSaving, issues, clearIssues, review } = useAbsences(absences)
  const [reviewing, setReviewing] = useState<{
    absence: MemberAbsence
    status: AbsenceStatusName
  } | null>(null)
  const [opened, setOpened] = useState<HomeTask | null>(null)
  const router = useRouter()
  const copy = useCopy(DEPARTURE_COPY.copied)
  const { isSaving: isPublishing, run } = useMutation()

  // A published announcement leaves the queue
  const publish = async (id: string) => {
    const done = await run(() => apiPost(API_ROUTES.departure(id), {}), DEPARTURE_COPY.published)
    if (!done) return

    setOpened(null)
    router.refresh()
  }
  const [pickedKey, setPickedKey] = useState<string | null>(null)

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
          title: PERSONAL_COPY.absenceTitle.replace('{name}', absence.memberName),
          meta: `${span.days} ${span.month}`,
          note: absenceReasonText(absence),
          due: null,
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
      title: task.title,
      meta: task.context,
      note: null,
      due: task.dueAt ? formatRelativeDay(task.dueAt) : null,
      actions: [
        {
          id: 'open',
          label: PERSONAL_TASK_COPY.open,
          variant: 'primary',
          onSelect: () => setOpened(task),
        },
      ],
    }))

    return [...asked, ...calls, ...todo]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests, rollCalls, tasks])

  const picked = entries.find((entry) => entry.key === pickedKey) ?? null
  const CrossIcon = ICONS.waiting
  const CheckIcon = ICONS.picked
  const ChevronIcon = ICONS.next

  // One way in goes straight there
  const soleAction = (entry: HomeEntry) => (entry.actions.length === 1 ? entry.actions[0] : null)

  const openEntry = (entry: HomeEntry) => {
    const action = soleAction(entry)
    if (action) action.onSelect?.()
    else setPickedKey(entry.key)
  }

  const renderRow = (entry: HomeEntry) => {
    const href = soleAction(entry)?.href

    const body = (
      <>
        <CrossIcon className={HOME_FLOW.todoMark} aria-hidden="true" />
        <span className={HOME_FLOW.todoBody}>
          <span className={HOME_FLOW.todoLabel}>{entry.title}</span>
          {entry.meta && <span className={HOME_FLOW.todoMeta}>{entry.meta}</span>}
        </span>
        {entry.due && <span className={HOME_FLOW.todoDue}>{entry.due}</span>}
        <ChevronIcon className={HOME_FLOW.todoChevron} aria-hidden="true" />
      </>
    )

    return (
      <li key={entry.key} className={HOME_FLOW.todoItem}>
        {href ? (
          <Link href={href} className={HOME_FLOW.todoRow}>
            {body}
          </Link>
        ) : (
          <button type="button" className={HOME_FLOW.todoRow} onClick={() => openEntry(entry)}>
            {body}
          </button>
        )}
      </li>
    )
  }

  return (
    <>
      <Section title={PERSONAL_COPY.todoTitle} padded>
        {entries.length === 0 ? (
          <div className={HOME_FLOW.rest}>
            <CheckIcon className={HOME_FLOW.restMark} aria-hidden="true" />
            <p>{PERSONAL_COPY.calmTodoTitle}</p>
          </div>
        ) : (
          <ul className={HOME_FLOW.todoList}>{entries.map(renderRow)}</ul>
        )}
      </Section>

      {picked && (
        <Drawer
          open
          onClose={() => setPickedKey(null)}
          title={picked.title}
          icon={picked.icon ?? 'waiting'}
          subheader={picked.meta}
          footer={
            <div className={DEPARTURE_TASK.actions}>
              {picked.actions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant}
                  onClick={() => {
                    setPickedKey(null)
                    action.onSelect?.()
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          }
        >
          {picked.note && (
            <DetailGrid entries={[{ label: ABSENCE_COPY.reasonTitle, value: picked.note }]} />
          )}
        </Drawer>
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

      {opened && (
        <Drawer
          open
          onClose={() => setOpened(null)}
          title={opened.title}
          icon={opened.icon}
          subheader={opened.context}
          footer={
            opened.announcement ? (
              <div className={DEPARTURE_TASK.actions}>
                <Button
                  variant="secondary"
                  icon="copy"
                  onClick={() => void copy(opened.announcement?.body ?? '')}
                >
                  {DEPARTURE_COPY.copy}
                </Button>
                <Button
                  variant="primary"
                  icon="confirm"
                  isLoading={isPublishing}
                  onClick={() => void publish(opened.announcement?.id ?? '')}
                >
                  {DEPARTURE_COPY.publish}
                </Button>
              </div>
            ) : (
              <Link href={opened.href}>
                <Button variant="primary" icon="forward">
                  {opened.destinationLabel ? PERSONAL_TASK_COPY.go : PERSONAL_TASK_COPY.goPlain}
                </Button>
              </Link>
            )
          }
        >
          <div className={TASK_LIST.drawer}>
            <DetailGrid
              entries={[
                { label: PERSONAL_TASK_COPY.what, value: opened.description },
                // An announcement is done here
                ...(opened.announcement
                  ? []
                  : [
                      { label: PERSONAL_TASK_COPY.where, value: opened.destinationLabel },
                      {
                        label: PERSONAL_TASK_COPY.due,
                        value: opened.dueAt ? formatDay(opened.dueAt) : undefined,
                      },
                    ]),
              ]}
            />
            {opened.announcement && (
              <pre className={DEPARTURE_TASK.body}>{opened.announcement.body}</pre>
            )}
            {opened.guide && (
              <div className="flex flex-col gap-2">
                <span className={TASK_LIST.group}>{PERSONAL_TASK_COPY.guideTitle}</span>
                <Markdown source={opened.guide} />
              </div>
            )}
          </div>
        </Drawer>
      )}
    </>
  )
}
