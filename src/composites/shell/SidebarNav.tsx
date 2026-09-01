'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { LogoutButton } from '@/composites/auth/LogoutButton'
import { NotificationsBell } from '@/composites/notifications/NotificationsBell'
import { SearchLauncher } from '@/composites/search/SearchLauncher'
import { CreatorSelect } from '@/composites/shell/CreatorSelect'
import { switchView } from '@/app/(dashboard)/actions'
import { APP_ASSETS, APP_COMPANY, APP_NAME } from '@/declarations/app'
import { ROUTES, visibleNavGroups } from '@/declarations/navigation'
import { NAVIGATION_VIEW_REGISTRY } from '@/declarations/access/views'
import { APP_SHELL } from '@/declarations/ui/blocks'
import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { NAV_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { TONE_VARS } from '@/declarations/ui/theme'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import type { ViewContext } from '@/types/access'
import { cn } from '@/utils/classnames'

export interface SidebarNavProps {
  className?: string
  unreadCount: number
  viewContext: ViewContext
  onNavigate: () => void
}

/**
 * Navigation rail
 * @param {string} [className] - Extra classes merged onto the rail
 * @param {number} unreadCount - Unopened notifications resolved server-side
 * @param {ViewContext} viewContext - View resolved server-side
 * @param {() => void} onNavigate - Called once a link is followed
 * @return {JSX.Element}
 */

export const SidebarNav = ({
  className,
  unreadCount,
  viewContext,
  onNavigate,
}: SidebarNavProps) => {
  const pathname = usePathname()
  const { can, session, isResponsable } = useAuthContext()
  const [isSwitching, startSwitching] = useTransition()

  const { view, available } = viewContext
  const meta = NAVIGATION_VIEW_REGISTRY.get(view)
  const Flash = ICONS.flash

  // The lightning walks the reachable views in order, wrapping back to the base one
  const nextView = available[(available.indexOf(view) + 1) % available.length]
  const nextMeta = NAVIGATION_VIEW_REGISTRY.get(nextView)
  const isWidened = available.indexOf(view) > 0

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

      {isWidened && (
        <div
          className={APP_SHELL.viewRibbon}
          style={{ '--view': TONE_VARS[meta.tone] } as React.CSSProperties}
        >
          <span className={APP_SHELL.viewRibbonLabel}>{meta.label}</span>
        </div>
      )}

      {isWidened && viewContext.creators.length > 0 && (
        <CreatorSelect
          creators={viewContext.creators}
          activeYoutuberId={viewContext.activeYoutuberId}
        />
      )}

      <nav className={APP_SHELL.nav}>
        {visibleNavGroups(view, session, can).map((group) => (
          <div key={group.label} className={APP_SHELL.navGroup}>
            <p className={APP_SHELL.navGroupLabel}>{group.label}</p>
            {group.items.map((item) => {
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
                    <MaturityTag maturity={item.maturity} interactive={false} className="ml-auto" />
                  )}
                </Link>
              )
            })}
          </div>
        ))}
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
              {available.length > 1 && (
                <>
                  <button
                    type="button"
                    disabled={isSwitching}
                    aria-label={nextMeta.label}
                    title={`${nextMeta.label} — ${nextMeta.summary}`}
                    aria-pressed={isWidened}
                    onClick={() => startSwitching(() => void switchView(nextView))}
                    style={{ '--bolt': TONE_VARS[meta.tone] } as React.CSSProperties}
                    className={APP_SHELL.viewToggle}
                  >
                    <Flash className={APP_SHELL.viewToggleIcon} aria-hidden="true" />
                  </button>
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
