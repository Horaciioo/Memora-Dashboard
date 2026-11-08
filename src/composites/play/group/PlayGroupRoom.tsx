'use client'

import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import AppLink from '@/components/elements/navigation/AppLink'
import { Dialog } from '@/components/structures/overlays/Dialog'
import { PlayGroupChat } from '@/composites/play/group/PlayGroupChat'
import { PlayGroupGames } from '@/composites/play/group/PlayGroupGames'
import { PlayGroupInvite } from '@/composites/play/group/PlayGroupInvite'
import { PlayGroupMembers } from '@/composites/play/group/PlayGroupMembers'
import { PlayGroupName } from '@/composites/play/group/PlayGroupName'
import { PlayGroupSettings } from '@/composites/play/group/PlayGroupSettings'
import { ROUTES } from '@/declarations/navigation'
import { PLAY_GROUP_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { BUTTON_STYLES, PLAY_BOX } from '@/declarations/ui/variants'
import type { PlayGroupView } from '@/types/play'
import { cn } from '@/utils/classnames'

// Phone rubriques, a desktop shows both side by side
const TABS = [
  { value: 'chat', label: PLAY_GROUP_COPY.tabChat },
  { value: 'members', label: PLAY_GROUP_COPY.tabMembers },
] as const

type RoomTab = (typeof TABS)[number]['value']

export interface PlayGroupRoomProps {
  group: PlayGroupView
  viewerId: string
  candidates: { id: string; displayName: string; avatarUrl: string | null }[]
}

/**
 * Group page: members and games left, chat right, one column on a phone
 * @param {PlayGroupRoomProps} props - Group, viewer and people the host can call
 * @return {JSX.Element}
 */

export const PlayGroupRoom = ({ group, viewerId, candidates }: PlayGroupRoomProps) => {
  const [tab, setTab] = useState<RoomTab>('chat')
  const [isSearching, setSearching] = useState(false)
  const [isSettings, setSettings] = useState(false)
  const [isPicking, setPicking] = useState(false)
  const BackIcon = ICONS.playBack
  const AddIcon = ICONS.add
  const SettingsIcon = ICONS.settings

  return (
    <section className={PLAY_BOX.roomStack} aria-label={group.name}>
      <div className={PLAY_BOX.roomHead}>
        <AppLink
          href={ROUTES.playGroup}
          aria-label={PLAY_GROUP_COPY.back}
          className={cn(BUTTON_STYLES.base, BUTTON_STYLES.arcade, PLAY_BOX.roomBack)}
        >
          <BackIcon className={PLAY_BOX.keyIcon} aria-hidden="true" />
          <span className="max-sm:sr-only">{PLAY_GROUP_COPY.back}</span>
        </AppLink>
        <div className={PLAY_BOX.title}>
          <PlayGroupName groupId={group.id} name={group.name} isHost={group.isHost} />
        </div>
        <div className={cn(PLAY_BOX.keys, 'ml-auto')}>
          {group.isHost && (
            <Button
              variant="arcade"
              aria-label={PLAY_GROUP_COPY.searchOpen}
              aria-pressed={isSearching}
              onClick={() => {
                setSettings(false)
                setTab('members')
                setSearching(!isSearching)
              }}
            >
              <AddIcon className={PLAY_BOX.keyIcon} aria-hidden="true" />
              <span className="max-sm:sr-only">{PLAY_GROUP_COPY.invite}</span>
            </Button>
          )}
          <Button
            variant="arcade"
            aria-label={PLAY_GROUP_COPY.settings}
            aria-pressed={isSettings}
            onClick={() => setSettings(!isSettings)}
          >
            <SettingsIcon className={PLAY_BOX.keyIcon} aria-hidden="true" />
            <span className="max-sm:sr-only">{PLAY_GROUP_COPY.settings}</span>
          </Button>
        </div>
      </div>

      {isSettings ? (
        <PlayGroupSettings group={group} viewerId={viewerId} />
      ) : (
        <>
          <div className="lg:hidden">
            <SegmentedControl
              isPlay
              label={PLAY_GROUP_COPY.tabs}
              options={[...TABS]}
              value={tab}
              onChange={setTab}
            />
          </div>
          <div className={PLAY_BOX.roomGrid}>
            <div className={cn(PLAY_BOX.roomSide, tab !== 'members' && 'max-lg:hidden')}>
              {isSearching && group.isHost && (
                <div className={PLAY_BOX.root}>
                  <PlayGroupInvite groupId={group.id} candidates={candidates} />
                </div>
              )}
              <div className={PLAY_BOX.root}>
                <PlayGroupMembers group={group} />
              </div>
            </div>
            <div className={cn(tab !== 'chat' && 'max-lg:hidden')}>
              <PlayGroupChat group={group} onPlay={() => setPicking(true)} />
            </div>
          </div>
        </>
      )}

      <Dialog
        open={isPicking}
        onClose={() => setPicking(false)}
        title={PLAY_GROUP_COPY.games}
        size="xl"
      >
        <PlayGroupGames group={group} onLaunched={() => setPicking(false)} />
      </Dialog>
    </section>
  )
}
