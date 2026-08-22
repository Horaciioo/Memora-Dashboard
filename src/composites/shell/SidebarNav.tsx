'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { APP_ASSETS, APP_COMPANY, APP_NAME } from '@/declarations/app'
import { NAVIGATION, ROUTES } from '@/declarations/navigation'
import { APP_SHELL } from '@/declarations/ui/blocks'
import { NAV_COPY, WIP_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { cn } from '@/utils/classnames'

export interface SidebarNavProps {
  className?: string
  onNavigate: () => void
}

/**
 * Navigation rail, every entry gated by the permission declared beside it
 * @param {string} [className] - Extra classes merged onto the rail
 * @param {() => void} onNavigate - Called once a link is followed
 * @return {JSX.Element}
 */

export const SidebarNav = ({ className, onNavigate }: SidebarNavProps) => {
  const pathname = usePathname()
  const { can } = useAuthContext()

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
      <nav className={APP_SHELL.nav}>
        {NAVIGATION.map((group) => {
          const items = group.items.filter((item) => !item.permission || can(item.permission))
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
    </aside>
  )
}
