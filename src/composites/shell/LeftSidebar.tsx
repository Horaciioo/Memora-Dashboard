'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { rememberSidebarFold } from '@/core/lib/shell/fold'
import { APP_ASSETS, APP_COMPANY, APP_NAME } from '@/declarations/app'
import { ROUTES, visibleNavGroups } from '@/declarations/navigation'
import { LEFT_SIDEBAR } from '@/declarations/ui/blocks'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import type { NavigationViewName } from '@/declarations/navigation'
import { cn } from '@/utils/classnames'

export interface LeftSidebarProps {
  view: NavigationViewName
  // Read off the fold cookie server-side
  initialCollapsed: boolean
}

/**
 * Destinations of the signed-in member
 * @param {NavigationViewName} view - View resolved server-side
 * @param {boolean} initialCollapsed - Fold remembered by the browser
 * @return {JSX.Element}
 */

export const LeftSidebar = ({ view, initialCollapsed }: LeftSidebarProps) => {
  const pathname = usePathname()
  const { can, session } = useAuthContext()
  const [isCollapsed, setCollapsed] = useState(initialCollapsed)

  const FoldIcon = ICONS[isCollapsed ? 'railOpen' : 'railClose']
  const foldLabel = isCollapsed ? NAV_COPY.expandSidebar : NAV_COPY.collapseSidebar

  const fold = () => {
    const folded = !isCollapsed

    setCollapsed(folded)
    rememberSidebarFold(folded)
  }

  return (
    <div className={LEFT_SIDEBAR.dock}>
      <aside
        aria-label={NAV_COPY.sidebar}
        className={cn(
          LEFT_SIDEBAR.rail,
          isCollapsed ? LEFT_SIDEBAR.railCollapsed : LEFT_SIDEBAR.railExpanded
        )}
      >
        <Link href={ROUTES.dashboard} className={LEFT_SIDEBAR.brand}>
          <Image
            src={APP_ASSETS.wordmark}
            alt={`${APP_COMPANY} ${APP_NAME}`}
            width={168}
            height={59}
            priority
            className={cn(
              LEFT_SIDEBAR.brandLogo,
              isCollapsed ? LEFT_SIDEBAR.brandLogoCollapsed : LEFT_SIDEBAR.brandLogoExpanded
            )}
          />
        </Link>

        <span className={LEFT_SIDEBAR.brandRule} aria-hidden="true" />

        <nav className={LEFT_SIDEBAR.nav}>
          {visibleNavGroups(view, session, can).map((group) => (
            <div key={group.label} className={LEFT_SIDEBAR.navGroup}>
              {isCollapsed && <span className={LEFT_SIDEBAR.navGroupRule} aria-hidden="true" />}
              <p
                className={
                  isCollapsed ? LEFT_SIDEBAR.navGroupLabelFolded : LEFT_SIDEBAR.navGroupLabel
                }
              >
                {group.label}
              </p>

              {group.items.map((item) => {
                const Icon = ICONS[item.icon]
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      LEFT_SIDEBAR.navLink,
                      isCollapsed ? LEFT_SIDEBAR.navLinkCollapsed : LEFT_SIDEBAR.navLinkExpanded,
                      isActive && LEFT_SIDEBAR.navLinkActive
                    )}
                  >
                    <Icon
                      className={cn(LEFT_SIDEBAR.navIcon, isActive && LEFT_SIDEBAR.navIconActive)}
                      aria-hidden="true"
                    />
                    <span
                      className={
                        isCollapsed
                          ? LEFT_SIDEBAR.navLabelFolded
                          : cn(LEFT_SIDEBAR.navLabel, isActive && LEFT_SIDEBAR.navLabelActive)
                      }
                    >
                      {item.label}
                    </span>
                    {item.maturity && !isCollapsed && (
                      <MaturityTag
                        maturity={item.maturity}
                        interactive={false}
                        className={LEFT_SIDEBAR.navMaturity}
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <button
          type="button"
          onClick={fold}
          title={foldLabel}
          aria-label={foldLabel}
          aria-expanded={!isCollapsed}
          className={LEFT_SIDEBAR.fold}
        >
          <FoldIcon className={LEFT_SIDEBAR.foldIcon} aria-hidden="true" />
        </button>
      </aside>
    </div>
  )
}
