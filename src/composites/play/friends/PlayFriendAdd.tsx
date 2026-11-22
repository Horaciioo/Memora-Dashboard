'use client'

import { useState } from 'react'

import { PlayRelationKey } from '@/composites/play/friends/PlayRelationKey'
import { PlayAvatar } from '@/composites/play/skin/PlayAvatar'
import { usePlayFriendSearch } from '@/core/hooks/data/play/usePlayFriendSearch'
import { PLAY_FRIENDS_COPY } from '@/declarations/play'
import { PLAY_FRIENDS } from '@/declarations/ui/variants'

/**
 * Field finding players by name, one key adds each
 * @return {JSX.Element}
 */

export const PlayFriendAdd = () => {
  const [term, setTerm] = useState('')
  const { found, isReady, isLoading } = usePlayFriendSearch(term)

  return (
    <div className={PLAY_FRIENDS.section}>
      <input
        type="search"
        value={term}
        placeholder={PLAY_FRIENDS_COPY.search}
        aria-label={PLAY_FRIENDS_COPY.searchLabel}
        className={PLAY_FRIENDS.field}
        onChange={(event) => setTerm(event.target.value)}
      />
      {isReady && (
        <div className={PLAY_FRIENDS.results}>
          {found.length === 0 && !isLoading && (
            <p className={PLAY_FRIENDS.empty}>{PLAY_FRIENDS_COPY.searchEmpty}</p>
          )}
          {found.map((person) => (
            <div key={person.id} className={PLAY_FRIENDS.row}>
              <button type="button" data-play-card={person.id} className={PLAY_FRIENDS.rowWho}>
                <PlayAvatar
                  accountId={person.id}
                  name={person.name}
                  src={person.avatarUrl}
                  size="md"
                />
                <span className={PLAY_FRIENDS.rowName}>{person.name}</span>
              </button>
              <div className={PLAY_FRIENDS.rowActions}>
                <PlayRelationKey
                  isCompact
                  accountId={person.id}
                  relation={person.relation}
                  requestId={person.requestId}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
