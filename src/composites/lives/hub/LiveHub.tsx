'use client'

import { useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { SelectMenu } from '@/components/elements/forms/selects/SelectMenu'
import { PageBanner } from '@/components/structures/page/PageBanner'
import { LiveHubBubble } from '@/composites/lives/hub/LiveHubBubble'
import { LiveHubRecent } from '@/composites/lives/hub/LiveHubRecent'
import { LiveHubStats } from '@/composites/lives/hub/LiveHubStats'
import { LIVE_HUB_COPY } from '@/declarations/lives/hub'
import { LIVE_HUB_STYLES } from '@/declarations/ui/variants'
import type { LiveHubCreator } from '@/types/lives'

export interface LiveHubProps {
  creators: LiveHubCreator[]
  // Creator shown first
  initialId: string | null
}

/**
 * Personal Live page: banner of the creator, the live in a bubble, the member's figures and latest lives
 * @param {LiveHubProps} props - One entry per creator
 * @return {JSX.Element | null}
 */

export const LiveHub = ({ creators, initialId }: LiveHubProps) => {
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
          trailingTools={
            creators.length > 1 && (
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
            )
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
          </div>
          <LiveHubBubble creator={creator} />
        </div>
      </div>

      <div key={`${creator.id}-body`} className={`${LIVE_HUB_STYLES.body} ${LIVE_HUB_STYLES.swap}`}>
        <LiveHubStats figures={creator.figures} />
        <LiveHubRecent lives={creator.recent} />
      </div>
    </div>
  )
}
