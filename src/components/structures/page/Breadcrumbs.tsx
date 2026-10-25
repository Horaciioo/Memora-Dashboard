'use client'

import Link from '@/components/elements/navigation/AppLink'
import { usePathname } from 'next/navigation'
import { useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { MobileCrumbs } from '@/components/structures/page/MobileCrumbs'
import { TOP_BAR_CRUMBS_HOST_ID } from '@/declarations/ui/banners'
import { ICONS } from '@/declarations/ui/icons'
import { APP_SHELL } from '@/declarations/ui/blocks'
import { RECORD_LABELS, SEGMENT_LABELS, groupLabelOfPath } from '@/declarations/navigation'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { useBreadcrumbOverrides } from '@/managers/front-end'

export interface BreadcrumbsProps {
  // Names the page on screen
  current: string
}

// The host never changes under a mounted page
const subscribeNothing = () => () => {}

/**
 * Path trail built from the current URL
 * @param {string} current - Label of the last crumb
 * @return {JSX.Element}
 */

export const Breadcrumbs = ({ current }: BreadcrumbsProps) => {
  const pathname = usePathname()
  const overrides = useBreadcrumbOverrides()
  // The top bar of a phone carries the trail beside the menu, found once mounted
  const host = useSyncExternalStore(
    subscribeNothing,
    () => document.getElementById(TOP_BAR_CRUMBS_HOST_ID),
    () => null
  )
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

  const trail = [
    ...(category ? [{ label: category }] : []),
    ...crumbs.map((crumb, index) => ({
      href: index === crumbs.length - 1 ? undefined : crumb.href,
      label: index === crumbs.length - 1 ? (overrides[crumb.href] ?? current) : crumb.label,
    })),
  ]

  return (
    <>
      {host && createPortal(<MobileCrumbs trail={trail} />, host)}
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
    </>
  )
}
