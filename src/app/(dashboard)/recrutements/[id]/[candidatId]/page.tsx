import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageBanner } from '@/components/structures/page/PageBanner'
import { BreadcrumbLabel } from '@/components/tools/BreadcrumbLabel'
import { MentionMarks } from '@/composites/notifications/MentionMarks'
import { CandidateFile } from '@/composites/recruitment/candidate/CandidateFile'
import { loadRecruitment } from '@/core/services/recruitment/FileLoader'
import { readSession } from '@/core/services/recruitment'
import { readRecordActivity } from '@/core/services/system/ActivityService'
import { JOURNAL_FILES } from '@/core/services/system/FileJournal'
import { requireRecruitment } from '@/core/wrappers/requireRecruitment'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'

type CandidateParams = Promise<{ id: string; candidatId: string }>

/**
 * Name the browser tab after the candidate
 * @param {Object} context - Route context
 * @param {CandidateParams} context.params - Dynamic segments
 * @return {Promise<Metadata>} - Page metadata
 */

export async function generateMetadata({ params }: { params: CandidateParams }): Promise<Metadata> {
  const { id, candidatId } = await params
  const { perimeter } = await requireRecruitment(id)

  try {
    const { candidates } = await readSession(id, perimeter)
    const candidate = candidates.find((entry) => entry.id === candidatId)

    return { title: candidate?.name ?? RECRUITMENT_COPY.title }
  } catch {
    return { title: RECRUITMENT_COPY.title }
  }
}

/**
 * One candidate of a recruitment session
 * @param {Object} context - Route context
 * @param {CandidateParams} context.params - Dynamic segments
 * @return {Promise<JSX.Element>} - Candidate page
 */

export default async function CandidatePage({ params }: { params: CandidateParams }) {
  const { id, candidatId } = await params
  const loaded = await loadRecruitment(id, await requireRecruitment(id))
  const candidate = loaded?.detail.candidates.find((entry) => entry.id === candidatId)
  if (!loaded || !candidate) notFound()

  const { detail, fields, can } = loaded
  const activity = can.readLogs ? await readRecordActivity(JOURNAL_FILES.Candidate, candidatId) : []

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageBanner title={RECRUITMENT_COPY.title} isLabel image={detail.summary.youtuberBanner} />
      <BreadcrumbLabel label={candidate.name} />
      <MentionMarks target="recruitment" targetId={id} />
      <CandidateFile
        detail={detail}
        fields={fields}
        can={can}
        candidateId={candidatId}
        activity={activity}
      />
    </div>
  )
}
