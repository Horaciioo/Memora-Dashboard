import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { PageBanner } from '@/components/structures/page/PageBanner'
import { BreadcrumbLabel } from '@/components/tools/BreadcrumbLabel'
import { JuniorFile } from '@/composites/academy/JuniorFile'
import { academyScope, assertJuniorViewer } from '@/core/services/academy/AcademyScope'
import {
  NOTE_FIELDS,
  OBJECTIVE_FIELDS,
  REVIEW_FIELDS,
  juniorFields,
  listJuniorNotes,
  listJuniorObjectives,
  listJuniorSkills,
  listReviews,
  readJunior,
} from '@/core/services/academy/AcademyService'
import { listJuniorComments } from '@/core/services/academy/juniors/CommentService'
import { juniorCourses } from '@/core/services/academy/training/CurriculumService'
import { juniorCandidate } from '@/core/services/academy/juniors/JuniorService'
import { juniorLives } from '@/core/services/academy/parkour/LiveCountService'
import { readParkour } from '@/core/services/academy/parkour/ParkourService'
import { readPeriods } from '@/core/services/academy/parkour/PeriodService'
import { readTimeline } from '@/core/services/academy/parkour/PimTimelineService'
import { readRecordActivity } from '@/core/services/system/ActivityService'
import { commentFields } from '@/core/lib/forms'
import { sessionTitle } from '@/utils/format/academy'
import { MentionMarks } from '@/composites/notifications/MentionMarks'
import { juniorTargetId } from '@/declarations/notifications/targets'
import { requireUser } from '@/core/wrappers/requireUser'
import { GUIDE_PARAMS } from '@/declarations/academy/guides'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { ROUTES } from '@/declarations/navigation'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Name the browser tab after the junior
 * @param {Object} context - Route context
 * @param {Promise<{ juniorId: string }>} context.params - Dynamic segments
 * @return {Promise<Metadata>} - Page metadata
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ juniorId: string }>
}): Promise<Metadata> {
  const { juniorId } = await params
  const { session, access } = await requireUser()

  try {
    const { junior } = await readJunior(juniorId, academyScope(session, access))
    assertJuniorViewer(session, access, junior)

    return { title: junior.displayName }
  } catch {
    return { title: ACADEMY_COPY.fileTitle }
  }
}

/**
 * Individual follow-up file of one junior
 * @param {Object} context - Route context
 * @param {Promise<{ juniorId: string }>} context.params - Dynamic segments
 * @param {Promise<Record<string, string | string[] | undefined>>} context.searchParams - Query
 * @return {Promise<JSX.Element>} - Follow-up file
 */

export default async function JuniorPage({
  params,
  searchParams,
}: {
  params: Promise<{ juniorId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ juniorId }, query] = await Promise.all([params, searchParams])
  const requestedTab = query[GUIDE_PARAMS.tab]
  const { session, access } = await requireUser()

  const canReadAny = access.can(Permissions.AcademyRead)
  const canReadSelf = access.can(Permissions.AcademySelfRead)
  if (!canReadAny && !canReadSelf) redirect(ROUTES.home)

  const scope = academyScope(session, access)
  const found = await readJunior(juniorId, scope).catch(() => null)
  if (!found) notFound()

  // A self-read only viewer never reaches a file other than their own
  assertJuniorViewer(session, access, found.junior)

  const canReadReviews = access.can(Permissions.AcademyReviewRead)
  const canReadNotes = access.can(Permissions.AcademyNoteRead)

  // A junior never reads their own objectives nor the parkour behind them
  const isOwnFile = found.junior.accountId === session.id
  const canReadObjectives = canReadAny && !isOwnFile
  const canReadLogs = access.can(Permissions.WorkLogRead)
  const [
    fields,
    skills,
    notes,
    objectives,
    reviews,
    timeline,
    parkour,
    lives,
    courses,
    periods,
    comments,
    activity,
    candidate,
  ] = await Promise.all([
    juniorFields(found.junior.sessionId),
    listJuniorSkills(juniorId, scope),
    canReadNotes ? listJuniorNotes(juniorId, scope) : Promise.resolve([]),
    canReadObjectives ? listJuniorObjectives(juniorId, scope) : Promise.resolve([]),
    canReadReviews ? listReviews(juniorId, scope) : Promise.resolve([]),
    readTimeline(juniorId, scope),
    canReadObjectives ? readParkour(juniorId, scope) : Promise.resolve(null),
    juniorLives(juniorId, scope),
    juniorCourses(juniorId, scope),
    readPeriods(found.junior.sessionId),
    canReadNotes ? listJuniorComments(juniorId, scope) : Promise.resolve([]),
    canReadLogs ? readRecordActivity('junior', juniorId) : Promise.resolve([]),
    access.can(Permissions.RecruitmentRead) ? juniorCandidate(juniorId) : Promise.resolve(null),
  ])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageBanner title={ACADEMY_COPY.title} isLabel />
      <BreadcrumbLabel label={found.junior.displayName} />
      <MentionMarks target="junior" targetId={juniorTargetId(found.junior.sessionId, juniorId)} />
      <JuniorFile
        rows={{
          junior: found.junior,
          skills,
          notes,
          objectives,
          reviews,
          comments,
        }}
        surroundings={{
          sessionId: found.junior.sessionId,
          sessionTitle: sessionTitle(found.session),
          functionName: found.session.function.name,
          timeline,
          periods,
          parkour,
          lives,
          courses,
          recruitment: candidate
            ? { path: ROUTES.recruitment(candidate.sessionId), name: candidate.sessionName }
            : null,
        }}
        fields={{
          junior: fields,
          note: NOTE_FIELDS,
          objective: OBJECTIVE_FIELDS,
          review: REVIEW_FIELDS,
          comment: commentFields(),
        }}
        can={{
          viewerId: session.id,
          manage: access.can(Permissions.AcademyManage),
          lead: access.isResponsable,
          readLogs: canReadLogs,
          writeSkills: access.can(Permissions.AcademySkillWrite),
          readNotes: canReadNotes,
          writeNotes: access.can(Permissions.AcademyNoteWrite),
          readObjectives: canReadObjectives,
          writeObjectives: access.can(Permissions.AcademyObjectiveWrite),
          readReviews: canReadReviews,
          writeReviews: access.can(Permissions.AcademyReviewWrite),
          validateReviews: access.can(Permissions.AcademyReviewValidate),
        }}
        activity={activity}
        initialTab={typeof requestedTab === 'string' ? requestedTab : undefined}
      />
    </div>
  )
}
