'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import AppLink from '@/components/elements/navigation/AppLink'
import { playTabIndexOf, PLAY_TAB_ORDER } from '@/composites/play/mobile/tabs'
import { PlayAppMenu } from '@/composites/play/topbar/PlayAppMenu'
import { PlayBrand } from '@/composites/play/topbar/PlayBrand'
import {
  adminPageOfPath,
  PLAY_SECTIONS,
  type PlayAdminPage,
  type PlayPage,
} from '@/composites/play/topbar/topItems'
import { useGlidePill } from '@/core/hooks/interaction/layout/useGlidePill'
import { useOutsideDismiss } from '@/core/hooks/interaction/layout/overlay/useOutsideDismiss'
import { ROUTES } from '@/declarations/navigation'
import { isPlayGameHubPath, PLAY_HOME_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_TOPBAR } from '@/declarations/ui/variants'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import type { PlayNoticeView, PlayPresence } from '@/types/play'
import { cn } from '@/utils/classnames'
import { Permissions } from '@/utils/constants/permissions'

export interface PlayDeskBarProps {
  invites: PlayNoticeView[]
  presence: PlayPresence | null
  groupCalls: number
}

/**
 * Top bar: app switch, history arrows, page tabs
 * @param {PlayDeskBarProps} props - Waiting calls
 * @return {JSX.Element | null}
 */

export const PlayDeskBar = ({ invites, presence, groupCalls }: PlayDeskBarProps) => {
  const path = usePathname()
  const router = useRouter()
  const [isAppsOpen, setAppsOpen] = useState(false)
  const [spread, setSpread] = useState(0)
  const appsBoundary = useRef<HTMLDivElement>(null)
  const strip = useRef<HTMLDivElement>(null)
  const { can } = useAuthContext()
  const canAdmin = can(Permissions.PlayManage)
  const current = adminPageOfPath(path) ?? PLAY_TAB_ORDER[playTabIndexOf(path)]?.key ?? ''
  const { itemsRef, pillRef } = useGlidePill(current, `${canAdmin}/${spread}`)
  useOutsideDismiss(isAppsOpen, appsBoundary, () => setAppsOpen(false))
  const BackIcon = ICONS.previous
  const ForwardIcon = ICONS.next
  const Chevron = ICONS.expand

  // Tab widths change with the screen, the pill follows
  useEffect(() => {
    const node = strip.current
    if (!node) return

    const observer = new ResizeObserver(() => setSpread(node.offsetWidth))
    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  // Games and their hubs fill the room
  if (path.startsWith(ROUTES.playSession('')) || isPlayGameHubPath(path)) return null

  const hasCall: Partial<Record<string, boolean>> = {
    group: Boolean(presence) || invites.length > 0 || groupCalls > 0,
  }

  const renderTab = ({ key, label, icon, href }: PlayPage | PlayAdminPage) => {
    const Icon = ICONS[icon]
    const isOn = key === current

    return (
      <AppLink
        key={key}
        ref={(node: HTMLAnchorElement | null) => {
          if (node) itemsRef.current.set(key, node)
          else itemsRef.current.delete(key)
        }}
        href={href}
        title={label}
        aria-current={isOn ? 'page' : undefined}
        className={cn('group/tab', PLAY_TOPBAR.tab, isOn && PLAY_TOPBAR.tabOn)}
      >
        <Icon className={PLAY_TOPBAR.icon} aria-hidden="true" />
        <span className={PLAY_TOPBAR.label}>{label}</span>
        {hasCall[key] && <span className={PLAY_TOPBAR.badge} aria-hidden="true" />}
      </AppLink>
    )
  }

  const rule = (key: string) => <span key={key} className={PLAY_TOPBAR.rule} aria-hidden="true" />

  return (
    <nav aria-label={PLAY_HOME_COPY.rail} className={PLAY_TOPBAR.root}>
      <div ref={appsBoundary} className={PLAY_TOPBAR.apps}>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={isAppsOpen}
          aria-label={PLAY_HOME_COPY.apps}
          className={PLAY_TOPBAR.account}
          onClick={() => setAppsOpen((open) => !open)}
        >
          <PlayBrand />
          <Chevron className={PLAY_TOPBAR.chevron} aria-hidden="true" />
        </button>
        {isAppsOpen && <PlayAppMenu onClose={() => setAppsOpen(false)} />}
      </div>
      <button
        type="button"
        aria-label={PLAY_HOME_COPY.back}
        title={PLAY_HOME_COPY.back}
        className={PLAY_TOPBAR.go}
        onClick={() => router.back()}
      >
        <BackIcon className={PLAY_TOPBAR.goIcon} aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={PLAY_HOME_COPY.forward}
        title={PLAY_HOME_COPY.forward}
        className={PLAY_TOPBAR.go}
        onClick={() => router.forward()}
      >
        <ForwardIcon className={PLAY_TOPBAR.goIcon} aria-hidden="true" />
      </button>

      <div ref={strip} className={PLAY_TOPBAR.tabs}>
        <span ref={pillRef} className={PLAY_TOPBAR.pill} aria-hidden="true" />
        {PLAY_SECTIONS.map((section, index) => (
          <Fragment key={section.key}>
            {index > 0 && rule(`rule-${section.key}`)}
            {section.pages.map((entry, at) => (
              <Fragment key={entry.key}>
                {at > 0 && rule(`rule-${entry.key}`)}
                {renderTab(entry)}
              </Fragment>
            ))}
          </Fragment>
        ))}
      </div>
    </nav>
  )
}
