import type { PermissionHelpers } from '@/types/auth'
import type { MeetingDetail, MeetingSummary, ProjectDetail } from '@/types/work'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Strip the written content of a meeting
 * @param {MeetingSummary} meeting - Meeting card
 * @param {boolean} readsContent - Viewer may read what was written
 * @return {MeetingSummary} - Card without introduction, outro and minutes
 */

export const hideMeetingContent = (
  meeting: MeetingSummary,
  readsContent: boolean
): MeetingSummary =>
  readsContent
    ? meeting
    : {
        ...meeting,
        introduction: null,
        outro: null,
        minutes: null,
        values: { ...meeting.values, introduction: null, outro: null, minutes: null },
      }

/**
 * Strip a meeting file down to what the viewer may read
 * @param {MeetingDetail} detail - Meeting file
 * @param {PermissionHelpers} access - Permission helpers
 * @return {MeetingDetail} - Redacted file
 */

export const redactMeeting = (detail: MeetingDetail, access: PermissionHelpers): MeetingDetail => {
  const readsContent = access.can(Permissions.MeetingContentRead)

  return {
    summary: hideMeetingContent(detail.summary, readsContent),
    topics: readsContent ? detail.topics : [],
  }
}

/**
 * Strip a project file down to what the viewer may read
 * @param {ProjectDetail} detail - Project file
 * @param {PermissionHelpers} access - Permission helpers
 * @return {ProjectDetail} - Redacted file
 */

export const redactProject = (detail: ProjectDetail, access: PermissionHelpers): ProjectDetail => {
  const readsContent = access.can(Permissions.MeetingContentRead)

  return {
    summary: detail.summary,
    communications: access.can(Permissions.CommunicationRead) ? detail.communications : [],
    tasks: access.can(Permissions.TaskRead) ? detail.tasks : [],
    meetings: access.can(Permissions.MeetingRead)
      ? detail.meetings.map((meeting) => hideMeetingContent(meeting, readsContent))
      : [],
  }
}
