import 'server-only'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionHelpers, SessionUser } from '@/types/auth'
import type { Prisma } from '@prisma/client'

/**
 * Who reads the work pages
 * @typedef {Object} WorkViewer
 * @property {string} id - Account identifier
 * @property {boolean} seesAll - Reads every project in the perimeter
 */

export interface WorkViewer {
  id: string
  seesAll: boolean
}

/**
 * Viewer of the work pages
 * @param {SessionUser} session - Signed-in member
 * @param {PermissionHelpers} access - Permission helpers
 * @return {WorkViewer} - Viewer
 */

export const workViewer = (session: SessionUser, access: PermissionHelpers): WorkViewer => ({
  id: session.id,
  seesAll: access.can(Permissions.ProjectReadAll),
})

/**
 * Projects naming the viewer
 * @param {WorkViewer} viewer - Viewer
 * @return {Prisma.ProjectWhereInput} - Project filter
 */

export const projectVisibility = (viewer: WorkViewer): Prisma.ProjectWhereInput =>
  viewer.seesAll
    ? {}
    : {
        OR: [
          { leads: { some: { accountId: viewer.id } } },
          { assistants: { some: { accountId: viewer.id } } },
        ],
      }

/**
 * Tasks the viewer owns or reaches through a project
 * @param {WorkViewer} viewer - Viewer
 * @return {Prisma.TaskWhereInput} - Task filter
 */

export const taskVisibility = (viewer: WorkViewer): Prisma.TaskWhereInput =>
  viewer.seesAll
    ? {}
    : { OR: [{ ownerId: viewer.id }, { project: { is: projectVisibility(viewer) } }] }

/**
 * Meetings the viewer attends or reaches through a project
 * @param {WorkViewer} viewer - Viewer
 * @return {Prisma.MeetingWhereInput} - Meeting filter
 */

export const meetingVisibility = (viewer: WorkViewer): Prisma.MeetingWhereInput =>
  viewer.seesAll
    ? {}
    : {
        OR: [
          { attendees: { some: { accountId: viewer.id } } },
          { project: { is: projectVisibility(viewer) } },
        ],
      }

/**
 * Refuse a project the viewer is not named on
 * @param {string} id - Project identifier
 * @param {WorkViewer} viewer - Viewer
 * @return {Promise<void>} - Throws when hidden
 */

export const assertProjectVisible = async (id: string, viewer: WorkViewer): Promise<void> => {
  const count = await prisma.project.count({ where: { id, ...projectVisibility(viewer) } })
  if (count === 0) throw notFound()
}

/**
 * Refuse a task the viewer cannot reach
 * @param {string} id - Task identifier
 * @param {WorkViewer} viewer - Viewer
 * @return {Promise<void>} - Throws when hidden
 */

export const assertTaskVisible = async (id: string, viewer: WorkViewer): Promise<void> => {
  const count = await prisma.task.count({ where: { id, ...taskVisibility(viewer) } })
  if (count === 0) throw notFound()
}

/**
 * Refuse a meeting the viewer cannot reach
 * @param {string} id - Meeting identifier
 * @param {WorkViewer} viewer - Viewer
 * @return {Promise<void>} - Throws when hidden
 */

export const assertMeetingVisible = async (id: string, viewer: WorkViewer): Promise<void> => {
  const count = await prisma.meeting.count({ where: { id, ...meetingVisibility(viewer) } })
  if (count === 0) throw notFound()
}
