'use client'

import Link from '@/components/elements/navigation/AppLink'
import { usePathname } from 'next/navigation'
import { useFreshRelease } from '@/core/hooks/data/system/useFreshRelease'
import { ROUTES } from '@/declarations/navigation'
import { BEACON_ATTRIBUTE, routeBeacon } from '@/declarations/ui/beacons'
import { LEFT_SIDEBAR } from '@/declarations/ui/blocks'
import type { IconName } from '@/declarations/ui/icons'
import { railIcon } from '@/declarations/ui/railIcons'
import { TOUR_RAIL } from '@/declarations/ui/variants'
import { LiveStatuses } from '@/utils/constants/lives'
import type { LiveBeacon } from '@/types/lives'
import { cn } from '@/utils/classnames'

export interface RailShortcut {
  href: string
  label: string
  icon: IconName
}

/**
 * Glyph boxes under the search, an unread note shines gold
 * @param {Object} props - Shortcuts
 * @param {RailShortcut[]} props.items - Destinations
 * @param {boolean} [props.isUnlocking] - The first visit is adding them one by one
 * @param {LiveBeacon | null} [props.live] - Open lives, the Live box turns red while one is on air
 * @return {JSX.Element}
 */

export const RailShortcuts = ({
  items,
  isUnlocking,
  live,
}: {
  items: RailShortcut[]
  isUnlocking?: boolean
  live?: LiveBeacon | null
}) => {
  const pathname = usePathname()
  const { isFresh } = useFreshRelease()
  const isOnAir = live?.status === LiveStatuses.Live

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
              isFresh && item.href === ROUTES.changelog && LEFT_SIDEBAR.shortcutFresh,
              isOnAir && item.href === ROUTES.lives && LEFT_SIDEBAR.shortcutLive,
              isUnlocking && TOUR_RAIL.unlock
            )}
          >
            <Icon className={LEFT_SIDEBAR.shortcutIcon} aria-hidden="true" />
          </Link>
        )
      })}
    </nav>
  )
}
