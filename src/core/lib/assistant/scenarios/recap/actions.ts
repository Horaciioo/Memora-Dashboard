import { apiPatch, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { GuideAction } from '@/core/store/recapGuide'
import { RECAP_ACTION_COPY as COPY } from '@/declarations/assistant/scenarios/recapActions'
import type { NotificationTargetName } from '@/declarations/notifications/targets'
import { AttendanceStatuses } from '@/utils/constants/workflow'

/**
 * What Memora offers to do in the member's place for one record
 * @param {NotificationTargetName | null} target - Kind of record
 * @param {string | null} id - Record
 * @return {GuideAction[]} - Gestures, none when the record only needs a look
 */

export const actionsOf = (
  target: NotificationTargetName | null,
  id: string | null
): GuideAction[] => {
  if (!target || !id) return []

  if (target === 'task') {
    return [
      {
        label: COPY.taskDone,
        tone: 'success',
        run: async () => void (await apiPatch(API_ROUTES.taskDone(id), { done: true })),
      },
    ]
  }

  if (target === 'calendar') {
    const answer = (status: string) => async () =>
      void (await apiPost(API_ROUTES.calendarEntryAttendance(id), { status }))

    return [
      { label: COPY.present, tone: 'success', run: answer(AttendanceStatuses.Present) },
      { label: COPY.absent, tone: 'danger', run: answer(AttendanceStatuses.Absent) },
    ]
  }

  if (target === 'unbanRequest') {
    return [
      {
        label: COPY.take,
        tone: 'success',
        run: async () => void (await apiPost(API_ROUTES.unbanRequestAction(id, 'take'), {})),
      },
    ]
  }

  return []
}
