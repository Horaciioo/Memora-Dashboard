import 'server-only'
import type { PermissionHelpers, SessionUser } from '@/types/auth'
import type { HomeTask } from '@/types/personal'
import { Permissions } from '@/utils/constants/permissions'
import { syncSystemTasks } from '@/core/services/personal/SystemTaskService'
import {
  candidateReviewTasks,
  managerTasks,
  reportTasks,
} from '@/core/services/personal/TaskInboxService/manager'
import { reviewTasks, trainingTasks } from '@/core/services/personal/TaskInboxService/academy'
import {
  boardTasks,
  mentionTasks,
  playTasks,
} from '@/core/services/personal/TaskInboxService/activity'

/**
 * Everything waiting on the signed-in member: what the parkour asks of their seat
 * @param {SessionUser} viewer - Signed-in member
 * @param {PermissionHelpers} access - Permission helpers
 * @return {Promise<HomeTask[]>} - Tasks
 */

export const myTasks = async (
  viewer: SessionUser,
  access: PermissionHelpers
): Promise<HomeTask[]> => {
  const [preparation, reviews, trainings, interviews, mentions, reports, play] = await Promise.all([
    access.can(Permissions.AcademyManage) ? managerTasks(viewer, access) : Promise.resolve([]),
    reviewTasks(viewer.id),
    trainingTasks(viewer.id),
    candidateReviewTasks(viewer.id),
    mentionTasks(viewer.id),
    reportTasks(viewer, access),
    playTasks(viewer.id, access),
  ])

  const timeline = [...preparation, ...reviews, ...trainings, ...interviews]
  if (!access.can(Permissions.TaskRead)) return [...mentions, ...reports, ...timeline, ...play]

  // The timeline opens its tasks on the board, ticking one there takes it off the home
  const [done, board] = await Promise.all([
    syncSystemTasks(viewer.id, timeline),
    boardTasks(viewer.id),
  ])

  return [
    ...mentions,
    ...reports,
    ...timeline.filter((task) => !done.has(task.key)),
    ...board,
    ...play,
  ]
}
