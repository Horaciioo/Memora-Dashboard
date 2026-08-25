'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { LogoutButton } from '@/composites/auth/LogoutButton'
import { SearchLauncher } from '@/composites/search/SearchLauncher'
import { APP_ASSETS, APP_COMPANY, APP_NAME } from '@/declarations/app'
import { NAVIGATION, NavigationViews, ROUTES, matchesNavigation } from '@/declarations/navigation'
import { NAVIGATION_VIEW_REGISTRY } from '@/declarations/access/views'
import { useNavigationViewStore } from '@/core/store/navigationView'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { ACCOUNT_BLOCK, APP_SHELL } from '@/declarations/ui/blocks'
import { NAV_COPY, WIP_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { cn } from '@/utils/classnames'

export interface SidebarNavProps {
  className?: string
  onNavigate: () => void
}

/**
 * Navigation rail — search above the groups, every entry gated by the permission declared
 * beside it, and the signed-in member closing it at the bottom
 * @param {string} [className] - Extra classes merged onto the rail
 * @param {() => void} onNavigate - Called once a link is followed
 * @return {JSX.Element}
 */

export const SidebarNav = ({ className, onNavigate }: SidebarNavProps) => {
  const pathname = usePathname()
  const { can, session, isResponsable } = useAuthContext()
  const { view: stored, setView } = useNavigationViewStore()

  // The store skips synchronous hydration, the rail being server-rendered
  useEffect(() => {
    void useNavigationViewStore.persist.rehydrate()
  }, [])

  // Only the encadrement switches, a moderator never leaves their own view
  const view = isResponsable ? stored : NavigationViews.Moderation
  const nextView =
    view === NavigationViews.Administration
      ? NavigationViews.Moderation
      : NavigationViews.Administration

  return (
    <aside className={cn(APP_SHELL.sidebar, className)} aria-label={NAV_COPY.sidebar}>
      <Link href={ROUTES.dashboard} className={APP_SHELL.brand} onClick={onNavigate}>
        <Image
          src={APP_ASSETS.mark}
          alt={APP_NAME}
          width={32}
          height={32}
          className={APP_SHELL.brandMark}
          priority
        />
        <span className="flex flex-col gap-0.5">
          <span className={APP_SHELL.brandName}>{APP_NAME}</span>
          <span className={APP_SHELL.brandCompany}>{APP_COMPANY}</span>
        </span>
      </Link>

      <div className={APP_SHELL.search}>
        <SearchLauncher />
      </div>

      <nav className={APP_SHELL.nav}>
        {NAVIGATION.filter((group) => group.views.includes(view)).map((group) => {
          const items = group.items.filter(
            (item) =>
              (!item.permission || can(item.permission)) &&
              (!session || matchesNavigation(item.visibleWhen, session))
          )
          if (items.length === 0) return null

          return (
            <div key={group.label} className={APP_SHELL.navGroup}>
              <p className={APP_SHELL.navGroupLabel}>{group.label}</p>
              {items.map((item) => {
                const Icon = ICONS[item.icon]
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(APP_SHELL.navLink, isActive && APP_SHELL.navLinkActive)}
                  >
                    <Icon className={APP_SHELL.navIcon} aria-hidden="true" />
                    {item.label}
                    {item.wip && <span className={APP_SHELL.navBadge}>{WIP_COPY.badge}</span>}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>

      {session && (
        <div className={APP_SHELL.sidebarFooter}>
          <div className={APP_SHELL.accountRow}>
            <Avatar name={session.displayName} src={session.avatarUrl} />
            <span className={APP_SHELL.accountIdentity}>
              <span className={ACCOUNT_BLOCK.name}>{session.displayName}</span>
              <span className={ACCOUNT_BLOCK.meta}>{ROLE_REGISTRY.label(session.role)}</span>
            </span>
            <div className={APP_SHELL.accountControls}>
              {isResponsable && (
                <>
                  <Button
                    variant="icon"
                    icon="flash"
                    aria-label={NAVIGATION_VIEW_REGISTRY.get(nextView).label}
                    title={NAVIGATION_VIEW_REGISTRY.get(nextView).summary}
                    aria-pressed={view === NavigationViews.Administration}
                    onClick={() => setView(nextView)}
                    className={
                      view === NavigationViews.Administration
                        ? APP_SHELL.viewToggleActive
                        : undefined
                    }
                  />
                  <span className={APP_SHELL.accountDivider} aria-hidden="true" />
                </>
              )}
              <Link href={ROUTES.preferences} onClick={onNavigate}>
                <Button variant="icon" icon="settings" aria-label={NAV_COPY.preferences} />
              </Link>
              <span className={APP_SHELL.accountDivider} aria-hidden="true" />
              <LogoutButton iconOnly />
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
