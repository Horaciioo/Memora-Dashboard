'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import AppLink from '@/components/elements/navigation/AppLink'
import { adminPageOfPath, PLAY_ADMIN_PAGES } from '@/composites/play/topbar/topItems'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_SECTION_COPY } from '@/declarations/play'
import { PLAY_CONFIG_COPY } from '@/declarations/play/config'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_ADMIN } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Room of the administration: its own sidebar, the page beside it
 * @param {Object} props - Room
 * @param {ReactNode} props.children - Administration page
 * @return {JSX.Element}
 */

export const PlayAdminRoom = ({ children }: { children: ReactNode }) => {
  const current = adminPageOfPath(usePathname())
  const BackIcon = ICONS.previous

  return (
    <div className={PLAY_ADMIN.room}>
      <nav aria-label={PLAY_SECTION_COPY.admin} className={PLAY_ADMIN.side}>
        <AppLink href={ROUTES.play} className={PLAY_ADMIN.sideBack}>
          <BackIcon className={PLAY_ADMIN.sideIcon} aria-hidden="true" />
          {PLAY_CONFIG_COPY.sidebarBack}
        </AppLink>
        <span className={PLAY_ADMIN.sideRule} aria-hidden="true" />
        <p className={PLAY_ADMIN.sideTitle}>{PLAY_CONFIG_COPY.sidebarTitle}</p>
        {PLAY_ADMIN_PAGES.map(({ key, label, icon, href }) => {
          const Icon = ICONS[icon]

          return (
            <AppLink
              key={key}
              href={href}
              aria-current={key === current ? 'page' : undefined}
              className={cn(PLAY_ADMIN.sideItem, key === current && PLAY_ADMIN.sideItemOn)}
            >
              <Icon className={PLAY_ADMIN.sideIcon} aria-hidden="true" />
              {label}
            </AppLink>
          )
        })}
      </nav>
      <div className={PLAY_ADMIN.main}>
        <AppLink href={ROUTES.play} className={PLAY_ADMIN.phoneBack}>
          <BackIcon className={PLAY_ADMIN.sideIcon} aria-hidden="true" />
          {PLAY_CONFIG_COPY.sidebarBack}
        </AppLink>
        {children}
      </div>
    </div>
  )
}
