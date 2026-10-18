'use client'

import Link from '@/components/elements/navigation/AppLink'
import { usePathname } from 'next/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { APP_SHELL } from '@/declarations/ui/blocks'
import { RECORD_LABELS, SEGMENT_LABELS, groupLabelOfPath } from '@/declarations/navigation'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { useBreadcrumbOverrides } from '@/managers/front-end'

export interface BreadcrumbsProps {
  // Names the page on screen
  current: string
}

/**
 * Path trail built from the current URL
 * @param {string} current - Label of the last crumb
 * @return {JSX.Element}
 */

export const Breadcrumbs = ({ current }: BreadcrumbsProps) => {
  const pathname = usePathname()
  const overrides = useBreadcrumbOverrides()
  const segments = pathname.split('/').filter((segment) => segment.length > 0)

  // Rebuild each ancestor path so every crumb stays clickable
  const crumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`

    // A raw segment is a record identifier
    const stand = RECORD_LABELS[segments[index - 1]] ?? NAV_COPY.crumbRecord

    return { href, label: overrides[href] ?? SEGMENT_LABELS[segment] ?? stand }
  })

  const Separator = ICONS.next
  const category = groupLabelOfPath(pathname)

  return (
    <nav aria-label={NAV_COPY.breadcrumbs} className={APP_SHELL.breadcrumbs}>
      {category && (
        <span className={APP_SHELL.crumb}>
          <span className={APP_SHELL.crumbCategory}>{category}</span>
          <Separator className={APP_SHELL.crumbSeparator} aria-hidden="true" />
        </span>
      )}
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1

        return (
          <span key={crumb.href} className={APP_SHELL.crumb}>
            {index > 0 && <Separator className={APP_SHELL.crumbSeparator} aria-hidden="true" />}
            {isLast ? (
              <span className={APP_SHELL.crumbCurrent} aria-current="page">
                {overrides[crumb.href] ?? current}
              </span>
            ) : (
              <Link href={crumb.href} className={APP_SHELL.crumbLink}>
                {crumb.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
