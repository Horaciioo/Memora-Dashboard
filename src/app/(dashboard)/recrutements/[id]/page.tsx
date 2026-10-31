import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageBanner } from '@/components/structures/page/PageBanner'
import { BreadcrumbLabel } from '@/components/tools/BreadcrumbLabel'
import { MentionMarks } from '@/composites/notifications/MentionMarks'
import { RecruitmentFile } from '@/composites/recruitment/RecruitmentFile'
import { loadRecruitment } from '@/core/services/recruitment/FileLoader'
import { readSession } from '@/core/services/recruitment'
import { requireRecruitment } from '@/core/wrappers/requireRecruitment'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'

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
  const { perimeter } = await requireRecruitment(id)

  try {
    const { summary } = await readSession(id, perimeter)

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
  const loaded = await loadRecruitment(id, await requireRecruitment(id))
  if (!loaded) notFound()

  const { detail, fields, can, activity } = loaded

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageBanner title={RECRUITMENT_COPY.title} isLabel image={detail.summary.youtuberBanner} />
      <BreadcrumbLabel label={detail.summary.name} />
      <MentionMarks target="recruitment" targetId={id} />
      <RecruitmentFile detail={detail} activity={activity} fields={fields} can={can} />
    </div>
  )
}
