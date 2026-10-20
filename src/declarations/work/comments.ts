import { Permissions } from '@/utils/constants/permissions'

/**
 * Records a remark sits on
 * @type {Record<string, { column: string, permission: string }>}
 */

export const WORK_COMMENT_KINDS = {
  project: { column: 'projectId', permission: Permissions.ProjectRead },
  task: { column: 'taskId', permission: Permissions.TaskRead },
  communication: { column: 'communicationId', permission: Permissions.CommunicationRead },
  meeting: { column: 'meetingId', permission: Permissions.MeetingContentRead },
} as const

export type WorkCommentKind = keyof typeof WORK_COMMENT_KINDS

// Kinds in route order
export const WORK_COMMENT_KIND_NAMES = Object.keys(WORK_COMMENT_KINDS) as WorkCommentKind[]
