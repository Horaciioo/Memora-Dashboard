'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

import type { PageOption } from '@/components/structures/page/PageOptions'
import { MobileModProvider, MobileSlotProvider } from '@/composites/modview/mobile/MobileContext'
import { MobileFeedPage } from '@/composites/modview/mobile/MobileFeedPage'
import { MobileHeader } from '@/composites/modview/mobile/MobileHeader'
import { MobileLivePage } from '@/composites/modview/mobile/MobileLivePage'
import { MobileSettingsPage } from '@/composites/modview/mobile/MobileSettingsPage'
import { TEAM_CHAT_ENABLED } from '@/declarations/lives/teamChat'
import { MobileRosterPage, MobileTeamOffline, MobileTeamPage } from '@/composites/modview/mobile/MobileTeamPage'
import type { MobileTeamPageProps } from '@/composites/modview/mobile/MobileTeamPage'
import { useSnapPager } from '@/composites/modview/mobile/useSnapPager'
import type { SuggestionListProps } from '@/composites/modview/SuggestionList'
import type { ActRunner, GateCheck } from '@/composites/modview/types'
import { useModPreferences } from '@/core/hooks/interaction/state/moderation/useModPreferences'
import { roleOf, TEAM_ROLES } from '@/declarations/modview/roles'
import { MODVIEW_MOBILE_COPY as COPY } from '@/declarations/modview/mobile'
import type { IconName } from '@/declarations/ui/icons'
import { MODVIEW_MOBILE } from '@/declarations/ui/variants'
import { useFeatures } from '@/managers/front-end/FeaturesManager'
import type { MobilePageKey, ModViewState, ModViewWindow } from '@/types/modview'

// Title and glyph of each page
const PAGE_TITLES: Record<MobilePageKey, string> = {
  settings: COPY.pageSettings,
  team: COPY.pageTeam,
  live: COPY.pageLive,
  feed: COPY.pageFeed,
}
const PAGE_ICONS: Record<MobilePageKey, IconName> = {
  settings: 'settingsLine',
  team: 'teamChat',
  live: 'stream',
  feed: 'modActions',
}

const TeamPage = TEAM_CHAT_ENABLED ? MobileTeamPage : MobileRosterPage

export interface MobileModViewProps {
  state: ModViewState
  gate: GateCheck
  onAct: ActRunner
  // Windows this platform and seat can open
  windows: ModViewWindow[]
  render: (id: ModViewWindow) => ReactNode
  suggest: SuggestionListProps
  // Viewer dossier, laid over the pages
  viewerCard: ReactNode
  options: PageOption[]
  team?: Omit<MobileTeamPageProps, 'isOpen' | 'isRosterOpen' | 'onRosterClose'>
  leaveLiveId?: string
  endLiveId?: string
  // Nothing on air: the settings come first
  isWatchOnly: boolean
}

/**
 * Mod View of a phone: one page at a time, slid left and right around the live chat
 * @param {MobileModViewProps} props - Mod View props
 * @return {JSX.Element | null}
 */

export const MobileModView = ({
  state,
  gate,
  onAct,
  windows,
  render,
  suggest,
  viewerCard,
  options,
  team,
  leaveLiveId,
  endLiveId,
  isWatchOnly,
}: MobileModViewProps) => {
  const { preferences } = useModPreferences()
  const { isOpen } = useFeatures()
  // Pages switched off in the console drop out, the live page stays as fallback
  const order = useMemo(() => {
    const open = preferences.pageOrder.filter((page) => isOpen(`lives.modview.${page}`))
    return open.length ? open : (['live'] as MobilePageKey[])
  }, [preferences.pageOrder, isOpen])
  const at = (page: MobilePageKey) => order.indexOf(page)
  const { ref, index, onScroll, goTo, jumpTo } = useSnapPager(
    Math.max(0, at(isWatchOnly ? 'settings' : 'live'))
  )
  const [isRosterOpen, setRosterOpen] = useState(false)
  const viewerRole = team
    ? roleOf(
        team.seats.members.find((member) => member.id === team.viewerId)?.rank,
        team.coordinatorIds.includes(team.viewerId)
      )
    : null
  const [slot, setSlot] = useState<HTMLElement | null>(null)

  // A new order keeps the open page in view
  const lastOrder = useRef(order)
  useLayoutEffect(() => {
    if (lastOrder.current === order) return
    const key = lastOrder.current[index]
    lastOrder.current = order
    if (key) jumpTo(order.indexOf(key))
  }, [order, index, jumpTo])

  // A dossier opens over the live page, wherever the touch came from
  useEffect(() => {
    if (viewerCard && order.includes('live')) goTo(order.indexOf('live'))
  }, [viewerCard, goTo, order])

  const feed = {
    automod: windows.includes('automod') ? render('automod') : undefined,
    modActions: render('modActions'),
  }

  const current = order[index] ?? 'live'
  const pages: Record<MobilePageKey, ReactNode> = {
    settings: (
      <MobileSettingsPage
        options={options}
        endLiveId={endLiveId}
        liveId={leaveLiveId ?? null}
        state={state}
        gate={gate}
        onAct={onAct}
      />
    ),
    team: team ? (
      <TeamPage
        {...team}
        isOpen={current === 'team'}
        isRosterOpen={isRosterOpen}
        onRosterClose={() => setRosterOpen(false)}
      />
    ) : (
      <MobileTeamOffline />
    ),
    live: (
      <MobileLivePage
        state={state}
        gate={gate}
        onAct={onAct}
        suggest={suggest}
        chat={render('chat')}
      />
    ),
    feed: <MobileFeedPage windows={feed} />,
  }

  return createPortal(
    <MobileModProvider value>
      <div className={MODVIEW_MOBILE.root}>
        <MobileHeader
          title={PAGE_TITLES[current] ?? COPY.pageLive}
          icon={PAGE_ICONS[current] ?? 'stream'}
          onTeam={team && TEAM_CHAT_ENABLED && current === 'team' ? () => setRosterOpen(true) : undefined}
          teamTone={viewerRole ? TEAM_ROLES[viewerRole].glyph : undefined}
          slotRef={setSlot}
          leaveLiveId={leaveLiveId}
        />
        <div ref={ref} className={MODVIEW_MOBILE.pager} onScroll={onScroll}>
          {order.map((page) => (
            <section key={page} className={MODVIEW_MOBILE.page} aria-label={PAGE_TITLES[page]}>
              <MobileSlotProvider value={{ slot, isActive: current === page }}>
                {pages[page]}
              </MobileSlotProvider>
            </section>
          ))}
        </div>
        {viewerCard}
      </div>
    </MobileModProvider>,
    document.body
  )
}
