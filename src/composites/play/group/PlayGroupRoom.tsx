'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import AppLink from '@/components/elements/navigation/AppLink'
import { Tabs } from '@/components/elements/navigation/Tabs'
import { PlayGroupActions } from '@/composites/play/group/PlayGroupActions'
import { PlayGroupChat } from '@/composites/play/group/PlayGroupChat'
import { PlayGroupQuests } from '@/composites/play/group/PlayGroupQuests'
import { PlayGroupName } from '@/composites/play/group/PlayGroupName'
import { PlayGroupSettings } from '@/composites/play/group/PlayGroupSettings'
import { PlayGroupStats } from '@/composites/play/group/PlayGroupStats'
import { PlayGroupTeam } from '@/composites/play/group/PlayGroupTeam'
import { usePlayOnline } from '@/composites/play/mobile/PlayOnline'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage, PLAY_GROUP_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { BUTTON_STYLES, PLAY_CREW } from '@/declarations/ui/variants'
import type { PlayGroupOverview, PlayGroupView } from '@/types/play'
import { cn } from '@/utils/classnames'

type Panel = 'settings' | null

type GroupTab = 'hub' | 'stats' | 'actions'

const TABS = [
  { value: 'hub', label: PLAY_GROUP_COPY.tabHub },
  { value: 'stats', label: PLAY_GROUP_COPY.tabStats },
  { value: 'actions', label: PLAY_GROUP_COPY.tabActions },
] satisfies { value: GroupTab; label: string }[]

export interface PlayGroupRoomProps {
  group: PlayGroupView
  viewerId: string
  overview: PlayGroupOverview
  candidates: { id: string; displayName: string; avatarUrl: string | null }[]
}

/**
 * Group page: members and quests on the left, the chat beside them
 * @param {PlayGroupRoomProps} props - Group, viewer and people the host can call
 * @return {JSX.Element}
 */

export const PlayGroupRoom = ({ group, viewerId, overview, candidates }: PlayGroupRoomProps) => {
  const [tab, setTab] = useState<GroupTab>('hub')
  const [panel, setPanel] = useState<Panel>(null)
  const onlineIds = new Set(usePlayOnline().map((member) => member.accountId))
  const onlineCount = group.members.filter((member) => onlineIds.has(member.accountId)).length
  const BackIcon = ICONS.playBack
  const toggle = (next: Exclude<Panel, null>) => setPanel(panel === next ? null : next)

  return (
    <section className={PLAY_CREW.room} aria-label={group.name}>
      <div className={PLAY_CREW.bar}>
        <AppLink
          href={ROUTES.playGroup}
          aria-label={PLAY_GROUP_COPY.back}
          className={cn(BUTTON_STYLES.base, BUTTON_STYLES.arcadeSmall)}
        >
          <BackIcon className="size-4" aria-hidden="true" />
        </AppLink>
        <div className={PLAY_CREW.barText}>
          <PlayGroupName groupId={group.id} name={group.name} isHost={group.isHost} />
          <span className={PLAY_CREW.barNote}>
            {fillPlayMessage(PLAY_GROUP_COPY.onlineCount, { count: onlineCount })}
          </span>
        </div>
        <Button
          variant="arcadeSmall"
          icon="settings"
          aria-label={PLAY_GROUP_COPY.settings}
          aria-pressed={panel === 'settings'}
          onClick={() => toggle('settings')}
        />
        {panel === 'settings' && <PlayGroupSettings group={group} viewerId={viewerId} />}
      </div>
      {panel && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={PLAY_GROUP_COPY.back}
          className={PLAY_CREW.scrim}
          onClick={() => setPanel(null)}
        />
      )}
      <Tabs
        isPlay
        items={TABS}
        value={tab}
        onChange={(value) => setTab(value as GroupTab)}
        label={PLAY_GROUP_COPY.tabs}
      />
      {tab === 'stats' && <PlayGroupStats group={group} overview={overview} />}
      {tab === 'actions' && <PlayGroupActions actions={overview.actions} />}
      {tab === 'hub' && (
        <div className={PLAY_CREW.body}>
          <aside className={PLAY_CREW.aside}>
            <PlayGroupTeam group={group} onlineIds={onlineIds} candidates={candidates} />
            <PlayGroupQuests group={group} />
          </aside>
          <div className={PLAY_CREW.main}>
            <h2 className={PLAY_CREW.mainTitle}>{PLAY_GROUP_COPY.tabChat}</h2>
            <PlayGroupChat group={group} />
          </div>
        </div>
      )}
    </section>
  )
}
