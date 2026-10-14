import 'server-only'

import { commentFields } from '@/core/lib/forms/commentFields'

import { linkFields } from '@/core/services/onboarding/IntegrationLinkService'
import { observerFields } from '@/core/services/recruitment/ObserverService'
import {
  candidateFields,
  proseFields,
  readSession,
  sessionFields,
  stepFields,
} from '@/core/services/recruitment/RecruitmentService'
import { markMentionsRead } from '@/core/services/system/NotificationService'
import { readRecordActivity } from '@/core/services/system/ActivityService'
import type { ActivityEntry } from '@/core/services/system/ActivityService'
import { JOURNAL_FILES } from '@/core/services/system/FileJournal'
import type { RecruitmentGuard } from '@/core/wrappers/requireRecruitment'
import type { RecruitmentDetail, RecruitmentFields, RecruitmentRights } from '@/types/recruitment'
import { Permissions } from '@/utils/constants/permissions'

/**
 * One recruitment file as a page renders it
 * @typedef {Object} LoadedRecruitment
 * @property {RecruitmentDetail} detail - Session in full
 * @property {RecruitmentFields} fields - Declarations of the forms
 * @property {RecruitmentRights} can - What the viewer may do
 * @property {ActivityEntry[]} activity - Journal entries
 */

export interface LoadedRecruitment {
  detail: RecruitmentDetail
  fields: RecruitmentFields
  can: RecruitmentRights
  activity: ActivityEntry[]
}

/**
 * Load a recruitment file with its forms and rights
 * @param {string} id - Session identifier
 * @param {RecruitmentGuard} guard - Guarded viewer
 * @return {Promise<LoadedRecruitment | null>} - File, or null when out of reach
 */

export const loadRecruitment = async (
  id: string,
  { session, access, perimeter, observing }: RecruitmentGuard
): Promise<LoadedRecruitment | null> => {
  const detail = await readSession(id, perimeter).catch(() => null)
  if (!detail) return null

  // Opening the file is seeing what named the viewer
  await markMentionsRead(session.id, 'recruitment', id)

  // An observer never writes nor reads the journal
  const allowed = (permission: Parameters<typeof access.can>[0]) =>
    !observing && access.can(permission)
  const canReadLogs = allowed(Permissions.WorkLogRead)

  const [candidate, step, sessionForm, observer, activity] = await Promise.all([
    candidateFields(),
    stepFields(),
    sessionFields(perimeter, String(detail.summary.values.youtuberId)),
    observerFields(),
    canReadLogs ? readRecordActivity(JOURNAL_FILES.Recruitment, id) : Promise.resolve([]),
  ])

  return {
    detail,
    activity,
    fields: {
      session: sessionForm,
      candidate,
      step,
      comment: commentFields(),
      review: proseFields('review'),
      instruction: proseFields('instructions'),
      link: linkFields(),
      observer,
    },
    can: {
      manage: allowed(Permissions.RecruitmentManage),
      writeCandidates: allowed(Permissions.RecruitmentCandidateWrite),
      writeInstructions: allowed(Permissions.RecruitmentInstructionWrite),
      manageLinks: allowed(Permissions.IntegrationManage),
      readLogs: canReadLogs,
      observing,
      viewerId: session.id,
    },
  }
}
