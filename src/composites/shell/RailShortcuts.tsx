'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BEACON_ATTRIBUTE, routeBeacon } from '@/declarations/ui/beacons'
import { LEFT_SIDEBAR } from '@/declarations/ui/blocks'
import { ICONS, type IconName } from '@/declarations/ui/icons'
import { cn } from '@/utils/classnames'

export interface RailShortcut {
  href: string
  label: string
  icon: IconName
}

/**
 * Glyph boxes under the search
 * @param {Object} props - Shortcuts
 * @param {RailShortcut[]} props.items - Destinations
 * @return {JSX.Element}
 */

export const RailShortcuts = ({ items }: { items: RailShortcut[] }) => {
  const pathname = usePathname()

  return (
    <nav className={LEFT_SIDEBAR.shortcuts}>
      {items.map((item) => {
        const Icon = ICONS[item.icon]
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            title={item.label}
            aria-current={isActive ? 'page' : undefined}
            {...{ [BEACON_ATTRIBUTE]: routeBeacon(item.href) }}
            className={cn(LEFT_SIDEBAR.shortcut, isActive && LEFT_SIDEBAR.shortcutActive)}
          >
            <Icon className={LEFT_SIDEBAR.shortcutIcon} aria-hidden="true" />
          </Link>
        )
      })}
    </nav>
  )
}
