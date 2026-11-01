import type { Metadata } from 'next'
import Link from '@/components/elements/navigation/AppLink'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { PageBanner } from '@/components/structures/page/PageBanner'
import { PageView } from '@/composites/pages/view/PageView'
import { readPage, viewerOf } from '@/core/services/pages'
import { optionalUser, requireUser } from '@/core/wrappers/requireUser'
import { ROUTES } from '@/declarations/navigation'
import { PAGES_COPY } from '@/declarations/pages/copy'
import { BUTTON_STYLES, PAGE_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Name the tab after the page, only for who may read it
 * @param {Object} context - Route context
 * @param {Promise<{ id: string }>} context.params - Dynamic segments
 * @return {Promise<Metadata>} - Page metadata
 */

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const session = await optionalUser()
  const page = session ? await readPage((await params).id, viewerOf(session)).catch(() => null) : null

  return { title: page ? page.title || PAGES_COPY.untitled : PAGES_COPY.title }
}

/**
 * One private page
 * @param {Object} context - Route context
 * @param {Promise<{ id: string }>} context.params - Dynamic segments
 * @return {Promise<JSX.Element>} - Page
 */

export default async function PrivatePage({ params }: { params: Promise<{ id: string }> }) {
  const { session } = await requireUser()
  const page = await readPage((await params).id, viewerOf(session)).catch(() => null)

  return (
    <div className={PAGE_STYLES.wrapper}>
      <PageBanner title={PAGES_COPY.title} isLabel isBare image={page?.coverUrl ?? null} />
      {page ? (
        <PageView key={page.id} page={page} accountId={session.id} />
      ) : (
        <EmptyState
          title={PAGES_COPY.notFoundTitle}
          description={PAGES_COPY.notFoundLead}
          action={
            <Link href={ROUTES.pages} className={cn(BUTTON_STYLES.base, BUTTON_STYLES.primary)}>
              {PAGES_COPY.backToPages}
            </Link>
          }
        />
      )}
    </div>
  )
}
