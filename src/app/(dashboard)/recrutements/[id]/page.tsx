import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageHeader } from '@/components/structures/PageHeader'
import { RecruitmentFile } from '@/composites/recruitment/RecruitmentFile'
import {
  candidateFields,
  commentFields,
  proseFields,
  readSession,
  stepFields,
} from '@/core/services/recruitment/RecruitmentService'
import { linkFields } from '@/core/services/onboarding/IntegrationLinkService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'

/**
 * Name the browser tab after the session
 * @param {Object} context - Route context
 * @param {Promise<{ id: string }>} context.params - Dynamic segments
 * @return {Promise<Metadata>} - Page metadata
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const { scope } = await requirePermission(Permissions.RecruitmentRead)

  try {
    const { summary } = await readSession(id, await scope())

    return { title: `${summary.name} • ${summary.jobFunction.label}` }
  } catch {
    return { title: RECRUITMENT_COPY.title }
  }
}

/**
 * One recruitment session
 * @param {Object} context - Route context
 * @param {Promise<{ id: string }>} context.params - Dynamic segments
 * @return {Promise<JSX.Element>} - Session page
 */

export default async function RecruitmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { access, scope } = await requirePermission(Permissions.RecruitmentRead)

  const detail = await readSession(id, await scope()).catch(() => null)
  if (!detail) notFound()

  const [candidates, steps] = await Promise.all([candidateFields(), stepFields()])

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={detail.summary.name} />
      <RecruitmentFile
        detail={detail}
        candidateFields={candidates}
        stepFields={steps}
        commentFields={commentFields()}
        reviewFields={proseFields('review')}
        instructionFields={proseFields('instructions')}
        linkFields={linkFields()}
        canManage={access.can(Permissions.RecruitmentManage)}
        canWriteCandidates={access.can(Permissions.RecruitmentCandidateWrite)}
        canWriteInstructions={access.can(Permissions.RecruitmentInstructionWrite)}
        canManageLinks={access.can(Permissions.IntegrationManage)}
      />
    </div>
  )
}
