import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/PageHeader'
import { MarshaGuide } from '@/composites/moderation/MarshaGuide'
import { courseHrefFor } from '@/core/services/academy/CurriculumService'
import { requireUser } from '@/core/wrappers/requireUser'
import { MARSHA_COPY } from '@/declarations/marsha/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'

export const metadata: Metadata = { title: MARSHA_COPY.title }

/**
 * Marsha Bot handbook
 * @return {Promise<JSX.Element>} - Handbook page
 */

export default async function MarshaPage() {
  const { session } = await requireUser()

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={MARSHA_COPY.title} />
      <MarshaGuide trainingHref={await courseHrefFor(session, 'marsha-bot')} />
    </div>
  )
}
