'use client'

import { useState } from 'react'

import { PlayRelationKey } from '@/composites/play/friends/PlayRelationKey'
import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import { PLAY_FRIENDS_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_FRIENDS } from '@/declarations/ui/variants'
import type { PlayFriendsState } from '@/types/play'
import { cn } from '@/utils/classnames'

// Keys of a request card
const KEYS = { base: PLAY_FRIENDS.requestKey, main: PLAY_FRIENDS.requestKeyMain }

/**
 * Requests received to answer, then the ones sent
 * @param {Pick<PlayFriendsState, 'incoming' | 'outgoing'>} props - Requests
 * @return {JSX.Element | null}
 */

export const PlayFriendRequests = ({
  incoming,
  outgoing,
}: Pick<PlayFriendsState, 'incoming' | 'outgoing'>) => {
  const [isOpen, setOpen] = useState(false)
  const all = [...incoming, ...outgoing]
  if (all.length === 0) return null

  const [first, ...others] = all
  const Caret = ICONS.playNext
  const note =
    others.length === 0
      ? first.name
      : (others.length === 1 ? PLAY_FRIENDS_COPY.requestsOther : PLAY_FRIENDS_COPY.requestsOthers)
          .replace('{name}', first.name)
          .replace('{count}', String(others.length))

  return (
    <section
      className={cn(PLAY_FRIENDS.section, 'gap-3', PLAY_FRIENDS.requestsDivider)}
      aria-label={PLAY_FRIENDS_COPY.requests}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        className={PLAY_FRIENDS.requestsRow}
        onClick={() => setOpen((open) => !open)}
      >
        <span className={PLAY_FRIENDS.requestsFaces}>
          {all.slice(0, 2).map((request) => (
            <PlayAvatar
              key={request.requestId}
              accountId={request.id}
              name={request.name}
              src={request.avatarUrl}
              size="md"
              className={PLAY_FRIENDS.requestsFace}
            />
          ))}
        </span>
        <span className={PLAY_FRIENDS.requestsText}>
          <span className={PLAY_FRIENDS.rowName}>{PLAY_FRIENDS_COPY.requests}</span>
          <span className={PLAY_FRIENDS.rowNote}>{note}</span>
        </span>
        {incoming.length > 0 && (
          <span className={PLAY_FRIENDS.requestsBadge}>{incoming.length}</span>
        )}
        <Caret
          className={cn(PLAY_FRIENDS.requestsCaret, isOpen && PLAY_FRIENDS.requestsCaretOpen)}
          aria-hidden="true"
        />
      </button>
      {isOpen &&
        all.map((request) => {
          const isIncoming = incoming.includes(request)

          return (
            <div
              key={request.requestId}
              className={cn(PLAY_FRIENDS.request, isIncoming && PLAY_FRIENDS.requestNew)}
            >
              <button type="button" data-play-card={request.id} className={PLAY_FRIENDS.rowWho}>
                <PlayAvatar
                  accountId={request.id}
                  name={request.name}
                  src={request.avatarUrl}
                  size="md"
                />
                <span className={PLAY_FRIENDS.rowText}>
                  <span className={PLAY_FRIENDS.rowName}>{request.name}</span>
                  {!isIncoming && (
                    <span className={PLAY_FRIENDS.rowNote}>{PLAY_FRIENDS_COPY.sent}</span>
                  )}
                </span>
              </button>
              <div className={isIncoming ? PLAY_FRIENDS.requestKeys : PLAY_FRIENDS.requestKeysOne}>
                <PlayRelationKey
                  accountId={request.id}
                  relation={isIncoming ? 'incoming' : 'outgoing'}
                  requestId={request.requestId}
                  styles={KEYS}
                />
              </div>
            </div>
          )
        })}
    </section>
  )
}
