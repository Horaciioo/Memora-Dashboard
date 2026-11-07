import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { PageRegistry } from '@/composites/system/pages/PageRegistry'
import { listPageRegistry } from '@/core/services/pages'
import { requireSystem } from '@/core/wrappers/requireUser'
import { PAGE_REGISTRY_COPY } from '@/declarations/pages/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'

export const metadata: Metadata = { title: PAGE_REGISTRY_COPY.title }

/**
 * Every private page, titles and access only
 * @return {Promise<JSX.Element>} - Registry
 */

export default async function SystemPagesRegistry() {
  await requireSystem()

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader
        title={PAGE_REGISTRY_COPY.title}
        heroDescription={PAGE_REGISTRY_COPY.heroDescription}
      />
      <PageRegistry rows={await listPageRegistry()} />
    </div>
  )
}
