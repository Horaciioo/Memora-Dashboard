'use client'

import Link from '@/components/elements/navigation/AppLink'
import { ROUTES } from '@/declarations/navigation'
import { PAGES_COPY } from '@/declarations/pages/copy'
import { ICONS } from '@/declarations/ui/icons'
import { PAGES_HOME_STYLES } from '@/declarations/ui/variants'
import { formatSince } from '@/utils/format/dates'

export interface PageListProps {
  pages: { id: string; title: string; icon: string | null; hint?: string; updatedAt?: string }[]
}

/**
 * Plain list of page links
 * @param {PageListProps} props - Pages
 * @return {JSX.Element}
 */

export const PageList = ({ pages }: PageListProps) => {
  const PageIcon = ICONS.page

  return (
    <ul className={PAGES_HOME_STYLES.list}>
      {pages.map((page) => (
        <li key={page.id}>
          <Link href={ROUTES.page(page.id)} className={PAGES_HOME_STYLES.row}>
            {page.icon ? (
              <span className={PAGES_HOME_STYLES.rowEmoji} aria-hidden="true">
                {page.icon}
              </span>
            ) : (
              <PageIcon className={PAGES_HOME_STYLES.rowGlyph} aria-hidden="true" />
            )}
            <span className={PAGES_HOME_STYLES.rowBody}>
              <span className={PAGES_HOME_STYLES.rowTitle}>
                {page.title || PAGES_COPY.untitled}
              </span>
              {page.hint && <span className={PAGES_HOME_STYLES.rowHint}>{page.hint}</span>}
            </span>
            {page.updatedAt && (
              <span className={PAGES_HOME_STYLES.rowDate}>{formatSince(page.updatedAt)}</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  )
}
