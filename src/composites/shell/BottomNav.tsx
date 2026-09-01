'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { MoreSheet } from '@/composites/shell/MoreSheet'
import { SearchLauncher } from '@/composites/search/SearchLauncher'
import { mobileNavigation, visibleNavGroups } from '@/declarations/navigation'
import type { NavigationItem } from '@/declarations/navigation'
import { BOTTOM_NAV_MAX_PRIMARY } from '@/declarations/ui/responsive'
import { MOBILE_NAV } from '@/declarations/ui/blocks'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import type { ViewContext } from '@/types/access'
import { cn } from '@/utils/classnames'

export interface BottomNavProps {
  viewContext: ViewContext
}

/**
 * Floating nav pill of the mobile shell, Accueil always centred, white icons turning
 * pink on the page in force
 * @param {ViewContext} viewContext - View resolved server-side
 * @return {JSX.Element}
 */

export const BottomNav = ({ viewContext }: BottomNavProps) => {
  const pathname = usePathname()
  const { can, session } = useAuthContext()
  const [isMoreOpen, setMoreOpen] = useState(false)
  const MoreIcon = ICONS.more

  const { home, primary } = mobileNavigation(viewContext.view, session, can, BOTTOM_NAV_MAX_PRIMARY)
  const shown = new Set(
    [home, ...primary]
      .filter((item): item is NavigationItem => item !== null)
      .map((item) => item.href)
  )

  const reachableCount = visibleNavGroups(viewContext.view, session, can).reduce(
    (count, group) => count + group.items.length,
    0
  )
  const hasMore = reachableCount > shown.size

  // Accueil always sits between the two halves of the primary destinations
  const half = Math.ceil(primary.length / 2)
  const ordered = [...primary.slice(0, half), ...(home ? [home] : []), ...primary.slice(half)]

  const renderLink = (item: NavigationItem) => {
    const Icon = ICONS[item.icon]
    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

    return (
      <Link
        key={item.href}
        href={item.href}
        aria-label={item.label}
        aria-current={isActive ? 'page' : undefined}
        className={MOBILE_NAV.link}
      >
        <Icon
          className={cn(MOBILE_NAV.icon, isActive ? MOBILE_NAV.iconActive : MOBILE_NAV.iconIdle)}
          aria-hidden="true"
        />
      </Link>
    )
  }

  return (
    <>
      <SearchLauncher iconOnly className={cn(MOBILE_NAV.fab, MOBILE_NAV.fabLeft)} />

      <nav aria-label={NAV_COPY.sidebar} className={MOBILE_NAV.bar}>
        {ordered.map(renderLink)}
      </nav>

      {hasMore && (
        <button
          type="button"
          aria-label={NAV_COPY.openMore}
          onClick={() => setMoreOpen(true)}
          className={cn(MOBILE_NAV.fab, MOBILE_NAV.fabRight)}
        >
          <MoreIcon className={MOBILE_NAV.icon} aria-hidden="true" />
        </button>
      )}

      <MoreSheet
        open={isMoreOpen}
        viewContext={viewContext}
        shown={shown}
        onClose={() => setMoreOpen(false)}
      />
    </>
  )
}
