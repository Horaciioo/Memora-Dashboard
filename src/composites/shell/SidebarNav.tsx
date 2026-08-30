'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { LogoutButton } from '@/composites/auth/LogoutButton'
import { NotificationsBell } from '@/composites/notifications/NotificationsBell'
import { SearchLauncher } from '@/composites/search/SearchLauncher'
import { APP_ASSETS, APP_COMPANY, APP_NAME } from '@/declarations/app'
import { NAVIGATION, NavigationViews, ROUTES, matchesNavigation } from '@/declarations/navigation'
import { NAVIGATION_VIEW_REGISTRY } from '@/declarations/access/views'
import { useNavigationViewStore } from '@/core/store/navigationView'
import { APP_SHELL } from '@/declarations/ui/blocks'
import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { NAV_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { cn } from '@/utils/classnames'

export interface SidebarNavProps {
  className?: string
  unreadCount: number
  onNavigate: () => void
}

/**
 * Navigation rail
 * @param {string} [className] - Extra classes merged onto the rail
 * @param {number} unreadCount - Unopened notifications resolved server-side
 * @param {() => void} onNavigate - Called once a link is followed
 * @return {JSX.Element}
 */

export const SidebarNav = ({ className, unreadCount, onNavigate }: SidebarNavProps) => {
  const pathname = usePathname()
  const { can, session, isResponsable } = useAuthContext()
  const { view: stored, setView } = useNavigationViewStore()

  // The store skips synchronous hydration
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
          src={APP_ASSETS.wordmark}
          alt={`${APP_COMPANY} ${APP_NAME}`}
          width={168}
          height={59}
          className={APP_SHELL.brandLogo}
          priority
        />
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
                    <Icon
                      className={cn(APP_SHELL.navIcon, isActive && APP_SHELL.navIconActive)}
                      aria-hidden="true"
                    />
                    <span className={cn(APP_SHELL.navLabel, isActive && APP_SHELL.navLabelActive)}>
                      {item.label}
                    </span>
                    {item.maturity && (
                      <MaturityTag
                        maturity={item.maturity}
                        interactive={false}
                        className="ml-auto"
                      />
                    )}
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
            <div className={cn(APP_SHELL.accountControls, APP_SHELL.accountControlsLeft)}>
              {isResponsable && (
                <>
                  <Link href={ROUTES.preferences} onClick={onNavigate}>
                    <Button
                      variant="icon"
                      icon="settings"
                      aria-label={NAV_COPY.preferences}
                      title={NAV_COPY.preferences}
                    />
                  </Link>
                  <span className={APP_SHELL.accountDivider} aria-hidden="true" />
                </>
              )}
              <NotificationsBell initialUnread={unreadCount} />
            </div>

            <Link
              href={ROUTES.preferences}
              onClick={onNavigate}
              aria-label={NAV_COPY.account}
              className={APP_SHELL.accountAvatar}
            >
              <Avatar name={session.displayName} src={session.avatarUrl} size="md" />
            </Link>

            <div className={cn(APP_SHELL.accountControls, APP_SHELL.accountControlsRight)}>
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
              <LogoutButton iconOnly />
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
