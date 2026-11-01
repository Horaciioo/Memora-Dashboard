import type { Metadata } from 'next'
import { PageHeader } from '@/components/structures/page/PageHeader'
import { PageTrash } from '@/composites/pages/home/PageTrash'
import { listTrash, viewerOf } from '@/core/services/pages'
import { requireUser } from '@/core/wrappers/requireUser'
import { PAGES_COPY } from '@/declarations/pages/copy'
import { PAGE_STYLES } from '@/declarations/ui/variants'

export const metadata: Metadata = { title: PAGES_COPY.trashTitle }

/**
 * Trashed pages the member may restore
 * @return {Promise<JSX.Element>} - Trash
 */

export default async function PagesTrash() {
  const { session } = await requireUser()

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageHeader title={PAGES_COPY.trashTitle} heroDescription={PAGES_COPY.trashLead} />
      <PageTrash initial={await listTrash(viewerOf(session))} />
    </div>
  )
}
