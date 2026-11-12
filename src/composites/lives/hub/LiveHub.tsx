'use client'

import { useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { SelectMenu } from '@/components/elements/forms/selects/SelectMenu'
import { PageBanner } from '@/components/structures/page/PageBanner'
import { LivesBoard } from '@/composites/lives/LivesBoard'
import { ModViewDock } from '@/composites/lives/hub/ModViewDock'
import { LiveRing } from '@/composites/lives/hub/LiveRing'
import { LiveHubBubble } from '@/composites/lives/hub/LiveHubBubble'
import { LiveHistory } from '@/composites/lives/hub/LiveHistory'
import { LiveHubStats } from '@/composites/lives/hub/LiveHubStats'
import { LIVE_HUB_COPY } from '@/declarations/lives/hub'
import { LIVE_HUB_STYLES } from '@/declarations/ui/variants'
import type { LiveHubCreator, LiveView } from '@/types/lives'

export interface LiveHubProps {
  creators: LiveHubCreator[]
  // Creator shown first
  initialId: string | null
  past: LiveView[]
  lives: LiveView[]
  recent: LiveView[]
  canAnnounce: boolean
  canReport: boolean
  canCreatorReport: boolean
  canDelete: boolean
}

/**
 * Personal Live page
 * @param {LiveHubProps} props - One entry per creator
 * @return {JSX.Element | null}
 */

export const LiveHub = ({
  creators,
  initialId,
  past,
  lives,
  recent,
  canAnnounce,
  canReport,
  canCreatorReport,
  canDelete,
}: LiveHubProps) => {
  const [picked, setPicked] = useState(initialId ?? creators[0]?.id ?? '')
  const creator = creators.find((entry) => entry.id === picked) ?? creators[0]
  if (!creator) return null

  return (
    <div className={LIVE_HUB_STYLES.wrapper}>
      {/* Banner and body replay their entrance when the creator changes */}
      <div key={creator.id} className={LIVE_HUB_STYLES.fade}>
        <PageBanner
          isBare
          title={LIVE_HUB_COPY.title}
          image={creator.banner}
          showPresence={false}
          trailingTools={
            <>
              {creators.length > 1 && (
                <SelectMenu
                  label={LIVE_HUB_COPY.creatorLabel}
                  value={creator.id}
                  onChange={setPicked}
                  mark="avatar"
                  size="compact"
                  isBare
                  className={LIVE_HUB_STYLES.picker}
                  options={creators.map((entry) => ({
                    value: entry.id,
                    label: entry.name,
                    image: entry.avatarUrl,
                  }))}
                />
              )}
            </>
          }
        />
      </div>

      {/* Portrait below banner */}
      <div className={LIVE_HUB_STYLES.pickerRow}>
        <div className={LIVE_HUB_STYLES.identity}>
          <div className={LIVE_HUB_STYLES.portraitWrap}>
            <Avatar
              name={creator.name}
              src={creator.avatarUrl}
              size="hero"
              className={LIVE_HUB_STYLES.portrait}
            />
            {creator.live?.isOnAir && <LiveRing />}
          </div>
          <LiveHubBubble creator={creator} />
        </div>
      </div>

      <div key={`${creator.id}-body`} className={`${LIVE_HUB_STYLES.body} ${LIVE_HUB_STYLES.swap}`}>
        <LivesBoard
          key={creator.id}
          isEmbedded
          initialLives={lives.filter((live) => live.youtuber.id === creator.id)}
          initialRecent={recent.filter((live) => live.youtuber.id === creator.id)}
          canAnnounce={canAnnounce}
          canReport={canReport}
        />
        <LiveHubStats figures={creator.figures} team={creator.team} />
        <LiveHistory
          past={past.filter((live) => live.youtuber.id === creator.id)}
          moderated={creator.recent}
          canReport={canReport}
          canCreatorReport={canCreatorReport}
          canDelete={canDelete}
        />
      </div>
      <ModViewDock
        creatorId={creator.id}
        accent={creator.accent}
        backdrop={creator.banner ?? creator.avatarUrl}
        isOnAir={creator.live?.isOnAir ?? false}
        lives={lives}
      />
    </div>
  )
}
