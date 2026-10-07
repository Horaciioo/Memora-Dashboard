'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useFreshRelease } from '@/core/hooks/data/useFreshRelease'
import { ROUTES } from '@/declarations/navigation'
import { BEACON_ATTRIBUTE, routeBeacon } from '@/declarations/ui/beacons'
import { LEFT_SIDEBAR } from '@/declarations/ui/blocks'
import type { IconName } from '@/declarations/ui/icons'
import { railIcon } from '@/declarations/ui/railIcons'
import { cn } from '@/utils/classnames'

export interface RailShortcut {
  href: string
  label: string
  icon: IconName
}

/**
 * Glyph boxes under the search, the news one turns gold while a note is unread
 * @param {Object} props - Shortcuts
 * @param {RailShortcut[]} props.items - Destinations
 * @return {JSX.Element}
 */

export const RailShortcuts = ({ items }: { items: RailShortcut[] }) => {
  const pathname = usePathname()
  const { isFresh } = useFreshRelease()

  return (
    <nav className={LEFT_SIDEBAR.shortcuts}>
      {items.map((item) => {
        const Icon = railIcon(item.icon)
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            title={item.label}
            aria-current={isActive ? 'page' : undefined}
            {...{ [BEACON_ATTRIBUTE]: routeBeacon(item.href) }}
            className={cn(
              LEFT_SIDEBAR.shortcut,
              isActive && LEFT_SIDEBAR.shortcutActive,
              isFresh && item.href === ROUTES.changelog && LEFT_SIDEBAR.shortcutFresh
            )}
          >
            <Icon className={LEFT_SIDEBAR.shortcutIcon} aria-hidden="true" />
          </Link>
        )
      })}
    </nav>
  )
}
