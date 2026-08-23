'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { APP_SHELL } from '@/declarations/ui/blocks'
import { SEGMENT_LABELS } from '@/declarations/navigation'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { useBreadcrumbOverrides } from '@/managers/front-end'

/**
 * Path trail built from the current URL, with per-page label overrides
 * @return {JSX.Element | null}
 */

export const Breadcrumbs = () => {
  const pathname = usePathname()
  const overrides = useBreadcrumbOverrides()
  const segments = pathname.split('/').filter((segment) => segment.length > 0)

  // A single segment is a classic list page, the trail only earns its place past it
  if (segments.length <= 1) return null

  // Rebuild each ancestor path so every crumb stays clickable
  const crumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`

    return { href, label: overrides[href] ?? SEGMENT_LABELS[segment] ?? segment }
  })

  const Separator = ICONS.next

  return (
    <nav aria-label={NAV_COPY.breadcrumbs} className={APP_SHELL.breadcrumbs}>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1

        return (
          <span key={crumb.href} className="flex items-center gap-1">
            {index > 0 && <Separator className="h-3 w-3 opacity-60" aria-hidden="true" />}
            {isLast ? (
              <span className={APP_SHELL.crumbCurrent} aria-current="page">
                {crumb.label}
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
