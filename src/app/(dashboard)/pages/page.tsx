import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { PagesHome } from '@/composites/pages/home/PagesHome'
import { requireUser } from '@/core/wrappers/requireUser'
import { PAGES_COPY } from '@/declarations/pages/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'

export const metadata: Metadata = { title: PAGES_COPY.title }

/**
 * Private space: templates, own and shared pages, search
 * @return {Promise<JSX.Element>} - Index
 */

export default async function PagesIndex() {
  await requireUser()

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={PAGES_COPY.title} heroDescription={PAGES_COPY.heroDescription} />
      <PagesHome />
    </div>
  )
}
