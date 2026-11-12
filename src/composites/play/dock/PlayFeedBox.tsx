'use client'

import { useState } from 'react'

import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import { PlayBoxSummary } from '@/composites/play/box/PlayBoxSummary'
import { PlayDockNotice } from '@/composites/play/dock/PlayDockNotice'
import { PlayResumeCallout } from '@/composites/play/dock/PlayResumeCallout'
import { PlayHistory } from '@/composites/play/mobile/PlayHistory'
import { PLAY_MOBILE_COPY } from '@/declarations/play'
import { PLAY_BOX, PLAY_DOCK } from '@/declarations/ui/variants'
import type { PlayHistoryEntry, PlayNoticeView, PlayPresence } from '@/types/play'

// Rubriques of the feed
const TABS = [
  { value: 'invites', label: PLAY_MOBILE_COPY.feedTabInvites },
  { value: 'history', label: PLAY_MOBILE_COPY.feedTabHistory },
] as const

type FeedTab = (typeof TABS)[number]['value']

export interface PlayFeedBoxProps {
  presence: PlayPresence | null
  invites: PlayNoticeView[]
  history: PlayHistoryEntry[]
}

/**
 * Feed in its box: the game being played, then last games or invitations
 * @param {PlayFeedBoxProps} props - Presence, news and finished games
 * @return {JSX.Element}
 */

export const PlayFeedBox = ({ presence, invites, history }: PlayFeedBoxProps) => {
  const [tab, setTab] = useState<FeedTab>('invites')
  const [isOpen, setOpen] = useState(true)

  return (
    <>
      {isOpen ? (
        <section className={PLAY_BOX.flat}>
          <SegmentedControl
            isPlay
            label={PLAY_MOBILE_COPY.feedTabs}
            options={[...TABS]}
            value={tab}
            onChange={setTab}
          />
          <div className={PLAY_BOX.body}>
            {tab === 'history' && <PlayHistory entries={history} />}
            {tab === 'invites' &&
              (!presence && invites.length === 0 ? (
                <p className={PLAY_BOX.hint}>{PLAY_MOBILE_COPY.feedInvitesEmpty}</p>
              ) : (
                <div className={PLAY_DOCK.rows}>
                  {presence && <PlayResumeCallout presence={presence} />}
                  {invites.map((notice) => (
                    <PlayDockNotice key={notice.id} notice={notice} />
                  ))}
                </div>
              ))}
          </div>
        </section>
      ) : (
        <PlayBoxSummary
          title={PLAY_MOBILE_COPY.tabFeed}
          label={PLAY_MOBILE_COPY.feedOpen}
          onOpen={() => setOpen(true)}
        />
      )}
    </>
  )
}
