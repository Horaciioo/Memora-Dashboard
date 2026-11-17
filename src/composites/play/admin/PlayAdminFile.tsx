'use client'

import { useState } from 'react'

import { Tabs } from '@/components/elements/navigation/Tabs'
import AppLink from '@/components/elements/navigation/AppLink'
import { ActivityTimeline } from '@/components/structures/data/ActivityTimeline'
import { PlayAdminOverview } from '@/composites/play/admin/PlayAdminOverview'
import { PlayAdminPanel } from '@/composites/play/member/PlayAdminPanel'
import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import { fillPlayMessage } from '@/declarations/play'
import { PLAY_BOARD_ADMIN_COPY as COPY, PLAY_MEMBER_COPY } from '@/declarations/play/admin'
import { ROUTES } from '@/declarations/navigation'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS, type IconName } from '@/declarations/ui/icons'
import { PLAY_ADMIN } from '@/declarations/ui/variants'
import type { ActivityEntry } from '@/core/services/system/ActivityService'
import type { PlayAdminState } from '@/types/play'

// Rubriques of a player file, the last but one is the dangerous one
const TABS: { value: string; label: string; icon: IconName; danger?: boolean }[] = [
  { value: 'info', label: COPY.tabInfo, icon: 'sheet' },
  { value: 'progress', label: COPY.tabProgress, icon: 'path' },
  { value: 'actions', label: COPY.tabActions, icon: 'alert', danger: true },
  { value: 'journal', label: COPY.tabJournal, icon: 'history' },
]

export interface PlayAdminFileProps {
  player: { accountId: string; name: string; avatarUrl: string | null }
  state: PlayAdminState
  journal: ActivityEntry[]
}

/**
 * File of one player, laid out like a moderator file: identity rail beside a glyph tab strip, Play data only
 * @param {PlayAdminFileProps} props - Player, state and journal
 * @return {JSX.Element}
 */

export const PlayAdminFile = ({ player, state, journal }: PlayAdminFileProps) => {
  const [tab, setTab] = useState('info')
  const { global } = state
  const CopyIcon = ICONS.copy
  const BackIcon = ICONS.back

  return (
    <div className={PLAY_ADMIN.page}>
      <div className={PLAY_ADMIN.fileBar}>
        <AppLink href={ROUTES.playAdmin} className={PLAY_ADMIN.back}>
          <BackIcon className={PLAY_ADMIN.backGlyph} aria-hidden="true" />
          {COPY.back}
        </AppLink>
        <Tabs isPlay centered label={COPY.fileLabel} value={tab} onChange={setTab} items={TABS} />
        <AppLink href={ROUTES.playAdmin} className={PLAY_ADMIN.backInline}>
          <BackIcon className={PLAY_ADMIN.backGlyph} aria-hidden="true" />
          {COPY.back}
        </AppLink>
      </div>
      <div className={PLAY_ADMIN.file}>
        <div className={PLAY_ADMIN.railStack}>
          <aside className={PLAY_ADMIN.rail} aria-label={player.name}>
            <div className={PLAY_ADMIN.railHead}>
              <PlayAvatar
                accountId={player.accountId}
                name={player.name}
                src={player.avatarUrl}
                size="lg"
              />
              <h2 className={PLAY_ADMIN.railName}>{player.name}</h2>
              <span className={PLAY_ADMIN.railLevel}>
                {fillPlayMessage(PLAY_MEMBER_COPY.level, { level: global.level.level })}
              </span>
              {state.ban && <span className={PLAY_ADMIN.cardBanned}>{COPY.banned}</span>}
            </div>
            <div className={PLAY_ADMIN.railBody}>
              <div className={PLAY_ADMIN.railGroup}>
                <span className={PLAY_ADMIN.railGroupTitle}>{COPY.railId}</span>
                <button
                  type="button"
                  title={ACTION_COPY.copyId}
                  aria-label={ACTION_COPY.copyId}
                  onClick={() => void navigator.clipboard.writeText(player.accountId)}
                  className={PLAY_ADMIN.railId}
                >
                  <span className="min-w-0 flex-1">{player.accountId}</span>
                  <CopyIcon className="size-4 shrink-0" aria-hidden="true" />
                </button>
              </div>
            </div>
          </aside>
        </div>

        <div className={PLAY_ADMIN.main}>
          {tab === 'info' ? (
            <PlayAdminOverview state={state} />
          ) : tab !== 'journal' ? (
            <PlayAdminPanel
              key={tab}
              memberId={player.accountId}
              initial={state}
              only={tab === 'actions' ? ['actions', 'access'] : 'progress'}
            />
          ) : journal.length === 0 ? (
            <p className={PLAY_ADMIN.empty}>{PLAY_MEMBER_COPY.logsEmptyTitle}</p>
          ) : (
            <div className={PLAY_ADMIN.overviewBox}>
              <ActivityTimeline entries={journal} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
