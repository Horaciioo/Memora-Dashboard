import 'server-only'

import { commentFields } from '@/core/lib/forms/commentFields'

import { bannedIdentifiers } from '@/core/services/recruitment/BanService'
import { isObserver } from '@/core/services/recruitment/ObserverReader'
import { maskForObserver } from '@/core/services/recruitment/ObserverMask'
import { linkFields } from '@/core/services/onboarding/IntegrationLinkService'
import {
  candidateFields,
  proseFields,
  readSession,
  sessionFields,
  stepFields,
} from '@/core/services/recruitment'
import { readRecordTreeActivity } from '@/core/services/system/ActivityService'
import type { ActivityEntry } from '@/core/services/system/ActivityService'
import { JOURNAL_FILES } from '@/core/services/system/FileJournal'
import type { RecruitmentGuard } from '@/core/wrappers/requireRecruitment'
import type { RecruitmentDetail, RecruitmentFields, RecruitmentRights } from '@/types/recruitment'
import { LEADERSHIP_ROLES } from '@/utils/constants/hierarchy'
import { Permissions } from '@/utils/constants/permissions'

/**
 * One recruitment file as a page renders it
 * @typedef {Object} LoadedRecruitment
 * @property {RecruitmentDetail} detail - Session in full
 * @property {RecruitmentFields} fields - Declarations of the forms
 * @property {RecruitmentRights} can - What the viewer may do
 * @property {ActivityEntry[]} activity - Journal entries
 * @property {string} serverTime - Server clock at load
 */

export interface LoadedRecruitment {
  detail: RecruitmentDetail
  fields: RecruitmentFields
  can: RecruitmentRights
  activity: ActivityEntry[]
  serverTime: string
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
  const read = await readSession(id, perimeter).catch(() => null)
  if (!read) return null

  // An observer never gets a way to reach a candidate, nor reads the remarks
  const detail = observing
    ? { ...read, comments: [], candidates: read.candidates.map(maskForObserver) }
    : read

  // An observer never writes nor reads the journal
  const allowed = (permission: Parameters<typeof access.can>[0]) =>
    !observing && access.can(permission)
  // Responsables and above only
  const canReadLogs =
    allowed(Permissions.WorkLogRead) && (session.isRoot || LEADERSHIP_ROLES.includes(session.role))

  const seated = await isObserver(id, session.id)

  // Anyone already seated stays valid and shown, whatever their function now
  const keptObservers = [
    ...(detail.summary.values.observerIds as string[]),
    ...detail.candidates.flatMap((candidate) => candidate.observers.map((seat) => seat.id)),
  ]

  const [candidate, step, sessionForm, activity] = await Promise.all([
    candidateFields(String(detail.summary.values.youtuberId), keptObservers),
    stepFields(),
    sessionFields(perimeter, String(detail.summary.values.youtuberId), keptObservers),
    canReadLogs
      ? readRecordTreeActivity(
          JOURNAL_FILES.Recruitment,
          id,
          JOURNAL_FILES.Candidate,
          detail.candidates.map((candidate) => candidate.id)
        )
      : Promise.resolve([]),
  ])

  return {
    // Only those who manage read who is barred
    detail: allowed(Permissions.RecruitmentManage)
      ? { ...detail, bannedIds: await bannedIdentifiers() }
      : detail,
    activity,
    serverTime: new Date().toISOString(),
    fields: {
      session: sessionForm,
      candidate,
      step,
      comment: commentFields(),
      review: proseFields('review'),
      instruction: proseFields('instructions'),
      link: linkFields(),
    },
    can: {
      manage: allowed(Permissions.RecruitmentManage),
      writeCandidates: allowed(Permissions.RecruitmentCandidateWrite),
      writeInstructions: allowed(Permissions.RecruitmentInstructionWrite),
      manageLinks: allowed(Permissions.IntegrationManage),
      readLogs: canReadLogs,
      observing,
      canObserve: observing || access.can(Permissions.RecruitmentObserve) || seated,
      isObserver: seated,
      viewerId: session.id,
    },
  }
}
