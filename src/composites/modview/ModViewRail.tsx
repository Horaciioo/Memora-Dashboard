'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

import { LIVE_PLATFORM_REGISTRY } from '@/declarations/lives/registries'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { MODVIEW_WINDOWS } from '@/declarations/modview/registries'
import { ROUTES } from '@/declarations/navigation'
import { LEFT_SIDEBAR } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_RAIL } from '@/declarations/ui/variants'
import { useRailSlot } from '@/managers/front-end/RailSlotManager'
import type { ModViewState, ModViewWindow } from '@/types/modview'
import { cn } from '@/utils/classnames'

export interface ModViewRailProps {
  state: ModViewState
  levelName: string | null
  windows: ModViewWindow[]
  hidden: Set<ModViewWindow>
  onToggle: (window: ModViewWindow) => void
}

// Connection dot per state
const STATUS_DOT = {
  connected: MODVIEW_RAIL.dotConnected,
  connecting: MODVIEW_RAIL.dotConnecting,
  disconnected: MODVIEW_RAIL.dotOff,
  scripted: MODVIEW_RAIL.dotScripted,
} as const

/**
 * Live rail, standing where the destinations stand
 * @param {ModViewState} state - Mod View state
 * @param {string | null} levelName - Livecon level in force
 * @param {ModViewWindow[]} windows - Windows of this platform
 * @param {Set<ModViewWindow>} hidden - Windows folded away
 * @param {(window: ModViewWindow) => void} onToggle - Show or hide a window
 * @return {JSX.Element | null}
 */

export const ModViewRail = ({ state, levelName, windows, hidden, onToggle }: ModViewRailProps) => {
  const { slot, claim } = useRailSlot()

  // The rail is ours while the Mod View is open
  useEffect(() => claim(), [claim])

  if (!slot) return null

  const platform = LIVE_PLATFORM_REGISTRY.get(state.platform)
  const PlatformIcon = ICONS[platform.icon]
  const BackIcon = ICONS.back

  return createPortal(
    <div className={MODVIEW_RAIL.root}>
      <Link href={ROUTES.lives} className={MODVIEW_RAIL.back}>
        <BackIcon className={MODVIEW_RAIL.backIcon} aria-hidden="true" />
        {MODVIEW_COPY.back}
      </Link>

      <div className={MODVIEW_RAIL.identity}>
        <PlatformIcon className={MODVIEW_RAIL.platform} aria-label={platform.label} />
        <div className={MODVIEW_RAIL.identityText}>
          <p className={MODVIEW_RAIL.channel}>{state.channel.name}</p>
          <p className={MODVIEW_RAIL.status}>
            <span className={cn(MODVIEW_RAIL.dot, STATUS_DOT[state.connection])} />
            {MODVIEW_COPY[state.connection]}
          </p>
        </div>
      </div>

      {levelName && (
        <p className={MODVIEW_RAIL.livecon}>
          <ICONS.livecon className={MODVIEW_RAIL.liveconIcon} aria-hidden="true" />
          {levelName}
        </p>
      )}

      <nav className={LEFT_SIDEBAR.navGroup} aria-label={MODVIEW_COPY.windows}>
        <p className={LEFT_SIDEBAR.navGroupLabel}>{MODVIEW_COPY.windows}</p>
        {windows.map((window) => {
          const Icon = ICONS[MODVIEW_WINDOWS.get(window).icon]
          const isShown = !hidden.has(window)

          return (
            <button
              key={window}
              type="button"
              aria-pressed={isShown}
              className={cn(
                LEFT_SIDEBAR.navLink,
                isShown ? MODVIEW_RAIL.shown : MODVIEW_RAIL.folded
              )}
              onClick={() => onToggle(window)}
            >
              <Icon className={LEFT_SIDEBAR.navIcon} aria-hidden="true" />
              <span className={LEFT_SIDEBAR.navLabel}>{MODVIEW_WINDOWS.label(window)}</span>
            </button>
          )
        })}
      </nav>
    </div>,
    slot
  )
}
