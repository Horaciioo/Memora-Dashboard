import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BreadcrumbLabel } from '@/components/tools/BreadcrumbLabel'
import { InterviewFlow } from '@/composites/recruitment/interview/InterviewFlow'
import { loadRecruitment } from '@/core/services/recruitment/FileLoader'
import { requireRecruitment } from '@/core/wrappers/requireRecruitment'
import { APP_ENVIRONMENT } from '@/declarations/system/environments'
import { CANDIDATE_COPY } from '@/declarations/recruitment/candidateCopy'

export const metadata: Metadata = { title: CANDIDATE_COPY.interview }

/**
 * Interview of one candidate, part by part
 * @param {Object} context - Route context
 * @param {Promise<{ id: string, candidatId: string }>} context.params - Dynamic segments
 * @return {Promise<JSX.Element>} - Interview page
 */

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ id: string; candidatId: string }>
}) {
  const { id, candidatId } = await params
  const loaded = await loadRecruitment(id, await requireRecruitment(id))
  const candidate = loaded?.detail.candidates.find((entry) => entry.id === candidatId)
  if (!loaded || !candidate) notFound()

  const { detail, fields, can } = loaded

  return (
    <>
      <BreadcrumbLabel label={candidate.name} />
      <InterviewFlow
        detail={detail}
        fields={fields}
        can={can}
        candidateId={candidatId}
        showsDevExercises={APP_ENVIRONMENT === 'dev'}
      />
    </>
  )
}
