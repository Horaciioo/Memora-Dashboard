import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { FeatureConsole } from '@/composites/system/features/FeatureConsole'
import { listFeatureRows } from '@/core/services/features'
import { requireRoot } from '@/core/wrappers/requireUser'
import { FEATURE_COPY } from '@/declarations/features/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'

export const metadata: Metadata = { title: FEATURE_COPY.title }

/**
 * Switches of every page, game and system
 * @return {Promise<JSX.Element>} - Features console
 */

export default async function FeaturesPage() {
  await requireRoot()

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={FEATURE_COPY.title} heroDescription={FEATURE_COPY.heroDescription} />
      <FeatureConsole initialRows={await listFeatureRows()} />
    </div>
  )
}
