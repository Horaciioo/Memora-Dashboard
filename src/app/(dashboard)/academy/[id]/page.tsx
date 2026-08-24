import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/elements/display/Badge'
import { PageHeader } from '@/components/structures/PageHeader'
import { SessionPanel } from '@/composites/academy/SessionPanel'
import { academyScope } from '@/core/services/academy/AcademyScope'
import {
  stepFields,
  juniorCandidates,
  juniorFields,
  readSession,
} from '@/core/services/academy/AcademyService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { toTone } from '@/declarations/ui/theme'
import { PAGE_STYLES } from '@/declarations/ui/variants'
import { Permissions } from '@/utils/constants/permissions'
import { formatDay } from '@/utils/format/dates'

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
  const { session, access } = await requirePermission(Permissions.AcademyRead)

  try {
    const { summary } = await readSession(id, academyScope(session, access))

    return { title: `${summary.function.name} • ${formatDay(summary.startsAt)}` }
  } catch {
    return { title: ACADEMY_COPY.title }
  }
}

/**
 * One academy session, its juniors and its thread
 * @param {Object} context - Route context
 * @param {Promise<{ id: string }>} context.params - Dynamic segments
 * @return {Promise<JSX.Element>} - Session page
 */

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { session, access } = await requirePermission(Permissions.AcademyRead)

  const detail = await readSession(id, academyScope(session, access)).catch(() => null)
  if (!detail) notFound()

  const [juniors, steps, candidates] = await Promise.all([
    juniorFields(id),
    stepFields(id),
    juniorCandidates(id),
  ])

  const jobFunction = detail.summary.function

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        eyebrow={ACADEMY_COPY.confidential}
        title={`${jobFunction.name} • ${formatDay(detail.summary.startsAt)}`}
        lead={detail.summary.summary ?? jobFunction.summary ?? undefined}
        actions={<Badge label={jobFunction.name} tone={toTone(jobFunction.accent, 'brand')} dot />}
      />
      <SessionPanel
        detail={detail}
        juniorFields={juniors}
        stepFields={steps}
        hasCandidates={candidates.length > 0}
        canManage={access.can(Permissions.AcademyManage)}
      />
    </div>
  )
}
