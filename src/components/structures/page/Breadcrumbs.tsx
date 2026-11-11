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
import { useBreadcrumbOverrides, useBreadcrumbTabs } from '@/managers/front-end'

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

  const tabs = useBreadcrumbTabs()
  const lastIndex = segments.length - 1

  // Rebuild each ancestor path so every crumb stays clickable
  const items = segments.flatMap((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`

    // A raw segment is a record identifier
    const stand = RECORD_LABELS[segments[index - 1]] ?? NAV_COPY.crumbRecord
    const label =
      index === lastIndex
        ? (overrides[href] ?? current)
        : (overrides[href] ?? SEGMENT_LABELS[segment] ?? stand)

    // Tabs left open on this page follow it, the last one being where the user is
    const open = Object.entries(tabs[href] ?? {}).map(([strip, tab]) => ({
      key: `${href}#${strip}`,
      label: tab.label,
      href,
      isTab: true,
    }))

    return [{ key: href, label, href, isTab: false }, ...open]
  })

  const Separator = ICONS.next
  const category = groupLabelOfPath(pathname)

  // Everything before the last item leads back, tab included
  const trail = [
    ...(category ? [{ label: category }] : []),
    ...items.map((item, index) => ({
      label: item.label,
      href: index === items.length - 1 ? undefined : item.href,
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
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <span key={item.key} className={APP_SHELL.crumb}>
              {index > 0 && <Separator className={APP_SHELL.crumbSeparator} aria-hidden="true" />}
              {isLast ? (
                <span className={APP_SHELL.crumbCurrent} aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className={APP_SHELL.crumbLink}>
                  {item.label}
                </Link>
              )}
            </span>
          )
        })}
      </nav>
    </>
  )
}
