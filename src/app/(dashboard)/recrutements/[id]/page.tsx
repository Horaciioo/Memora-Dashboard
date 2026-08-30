import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/elements/display/Badge'
import { PageHeader } from '@/components/structures/PageHeader'
import { RecruitmentFile } from '@/composites/recruitment/RecruitmentFile'
import {
  candidateFields,
  commentFields,
  proseFields,
  readSession,
  stepFields,
} from '@/core/services/recruitment/RecruitmentService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { RECRUITMENT_STATUS_REGISTRY } from '@/declarations/recruitment/registries'
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
 * One recruitment session, its candidates, its script and its results
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
  const status = RECRUITMENT_STATUS_REGISTRY.get(detail.summary.status)

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        title={detail.summary.name}
        lead={detail.summary.summary ?? undefined}
        actions={
          <span className="flex flex-wrap items-center gap-2">
            <Badge
              label={detail.summary.youtuber.label}
              accent={detail.summary.youtuber.accent}
              tone={'info'}
              icon="youtuber"
            />
            <Badge
              label={detail.summary.jobFunction.label}
              accent={detail.summary.jobFunction.accent}
              tone={'brand'}
              dot
            />
            <Badge label={status.label} accent={status.accent} tone={'neutral'} dot />
          </span>
        }
      />
      <RecruitmentFile
        detail={detail}
        candidateFields={candidates}
        stepFields={steps}
        commentFields={commentFields()}
        reviewFields={proseFields('review')}
        instructionFields={proseFields('instructions')}
        canManage={access.can(Permissions.RecruitmentManage)}
        canWriteCandidates={access.can(Permissions.RecruitmentCandidateWrite)}
        canWriteInstructions={access.can(Permissions.RecruitmentInstructionWrite)}
      />
    </div>
  )
}
