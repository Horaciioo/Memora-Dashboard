import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/elements/display/Badge'
import { PageHeader } from '@/components/structures/PageHeader'
import { SessionPanel } from '@/composites/academy/SessionPanel'
import {
  eventFields,
  juniorCandidates,
  juniorFields,
  readSession,
} from '@/core/services/academy/AcademyService'
import { requirePermission } from '@/core/wrappers/requireUser'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { ACADEMY_PROGRAM_REGISTRY } from '@/declarations/academy/registries'
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

  try {
    const { summary } = await readSession(id)

    return {
      title: `${ACADEMY_PROGRAM_REGISTRY.label(summary.program)} • ${formatDay(summary.startsAt)}`,
    }
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
  const { access } = await requirePermission(Permissions.AcademyRead)

  const detail = await readSession(id).catch(() => null)
  if (!detail) notFound()

  const [juniors, events, candidates] = await Promise.all([
    juniorFields(id),
    eventFields(id),
    juniorCandidates(id),
  ])

  const program = ACADEMY_PROGRAM_REGISTRY.get(detail.summary.program)

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        eyebrow={ACADEMY_COPY.confidential}
        title={`${program.label} • ${formatDay(detail.summary.startsAt)}`}
        lead={detail.summary.summary ?? program.summary}
        actions={
          <Badge label={program.label} tone={toTone(program.accent, 'brand')} icon={program.icon} />
        }
      />
      <SessionPanel
        detail={detail}
        juniorFields={juniors}
        eventFields={events}
        hasCandidates={candidates.length > 0}
        canManage={access.can(Permissions.AcademyManage)}
      />
    </div>
  )
}
