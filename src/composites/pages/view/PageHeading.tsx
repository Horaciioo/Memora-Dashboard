'use client'

import Link from '@/components/elements/navigation/AppLink'
import { EditableHeading } from '@/components/structures/inline/EditableHeading'
import { usePageMeta } from '@/core/hooks/data/pages'
import { levelAllows } from '@/core/lib/pages'
import { ROUTES } from '@/declarations/navigation'
import { PAGES_COPY } from '@/declarations/pages/copy'
import { PAGE_VIEW_STYLES } from '@/declarations/ui/variants'
import type { PageDetail } from '@/types/pages'

export interface PageHeadingProps {
  page: PageDetail
}

/**
 * Trail, emoji and title of a page
 * @param {PageDetail} page - Page
 * @return {JSX.Element}
 */

export const PageHeading = ({ page }: PageHeadingProps) => {
  const { rename, setIcon } = usePageMeta(page.id)
  const canWrite = levelAllows(page.level, 'write') && !page.trashedAt

  return (
    <div className={PAGE_VIEW_STYLES.heading}>
      {page.trail.length > 0 && (
        <nav aria-label={PAGES_COPY.title} className={PAGE_VIEW_STYLES.trail}>
          <ol className={PAGE_VIEW_STYLES.trailList}>
            {page.trail.map((crumb) => (
              <li key={crumb.id} className={PAGE_VIEW_STYLES.trailItem}>
                <Link href={ROUTES.page(crumb.id)} className={PAGE_VIEW_STYLES.trailLink}>
                  {crumb.icon && <span aria-hidden="true">{crumb.icon}</span>}
                  {crumb.title || PAGES_COPY.untitled}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <EditableHeading
        value={page.title || PAGES_COPY.untitled}
        glyph={page.icon}
        disabled={!canWrite}
        onCommit={rename}
        onGlyphCommit={canWrite ? setIcon : undefined}
      />
    </div>
  )
}
