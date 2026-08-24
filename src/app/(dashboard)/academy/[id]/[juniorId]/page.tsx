import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { PageHeader } from '@/components/structures/PageHeader'
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
import { requireUser } from '@/core/wrappers/requireUser'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { ROUTES } from '@/declarations/navigation'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'
import { formatDay } from '@/utils/format/dates'

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
 * @return {Promise<JSX.Element>} - Follow-up file
 */

export default async function JuniorPage({ params }: { params: Promise<{ juniorId: string }> }) {
  const { juniorId } = await params
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

  const [fields, skills, notes, objectives, reviews] = await Promise.all([
    juniorFields(found.junior.sessionId),
    listJuniorSkills(juniorId, scope),
    canReadNotes ? listJuniorNotes(juniorId, scope) : Promise.resolve([]),
    listJuniorObjectives(juniorId, scope),
    canReadReviews ? listReviews(juniorId, scope) : Promise.resolve([]),
  ])

  const jobFunction = found.session.function

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        eyebrow={`${jobFunction.name} • ${formatDay(found.session.startsAt)}`}
        title={found.junior.displayName}
      />
      <JuniorFile
        initialJunior={found.junior}
        initialSkills={skills}
        initialNotes={notes}
        initialObjectives={objectives}
        initialReviews={reviews}
        sessionFunctionName={jobFunction.name}
        juniorFields={fields}
        noteFields={NOTE_FIELDS}
        objectiveFields={OBJECTIVE_FIELDS}
        reviewFields={REVIEW_FIELDS}
        canManage={access.can(Permissions.AcademyManage)}
        canWriteSkills={access.can(Permissions.AcademySkillWrite)}
        canReadNotes={canReadNotes}
        canWriteNotes={access.can(Permissions.AcademyNoteWrite)}
        canWriteObjectives={access.can(Permissions.AcademyObjectiveWrite)}
        canReadReviews={canReadReviews}
        canWriteReviews={access.can(Permissions.AcademyReviewWrite)}
        canValidateReviews={access.can(Permissions.AcademyReviewValidate)}
      />
    </div>
  )
}
