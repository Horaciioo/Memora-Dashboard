'use client'

import { usePlayFriends } from '@/core/hooks/data/play/usePlayFriends'
import { PLAY_FRIENDS_COPY } from '@/declarations/play'
import { PLAY_FRIENDS } from '@/declarations/ui/variants'
import type { PlayRelation } from '@/types/play'

// Flat keys of the lists
const FLAT = {
  base: `${PLAY_FRIENDS.small} ${PLAY_FRIENDS.smallGhost}`,
  main: `${PLAY_FRIENDS.small} ${PLAY_FRIENDS.smallMain}`,
}

export interface PlayRelationKeyProps {
  accountId: string
  relation: PlayRelation
  requestId: string | null
  // Short labels, states written plain
  isCompact?: boolean
  // Look of the keys, flat by default
  styles?: { base: string; main: string }
}

/**
 * Keys that move a tie: ask, take back, answer, end
 * @param {PlayRelationKeyProps} props - Tie with a player
 * @return {JSX.Element | null}
 */

export const PlayRelationKey = ({
  accountId,
  relation,
  requestId,
  isCompact,
  styles = FLAT,
}: PlayRelationKeyProps) => {
  const friends = usePlayFriends()
  const key = (label: string, run: () => Promise<boolean>, isMain = false) => (
    <button
      type="button"
      disabled={friends.isSaving}
      className={isMain ? styles.main : styles.base}
      onClick={() => void run()}
    >
      {label}
    </button>
  )

  if (relation === 'self') return null
  if (relation === 'none') {
    return key(
      isCompact ? PLAY_FRIENDS_COPY.addShort : PLAY_FRIENDS_COPY.add,
      () => friends.ask(accountId),
      true
    )
  }
  if (relation === 'incoming' && requestId) {
    return (
      <>
        {key(PLAY_FRIENDS_COPY.accept, () => friends.answer(requestId, true), true)}
        {key(PLAY_FRIENDS_COPY.decline, () => friends.answer(requestId, false))}
      </>
    )
  }
  if (isCompact) {
    return (
      <span className={PLAY_FRIENDS.rowNote}>
        {relation === 'friend' ? PLAY_FRIENDS_COPY.isFriend : PLAY_FRIENDS_COPY.sent}
      </span>
    )
  }

  return key(
    relation === 'friend'
      ? PLAY_FRIENDS_COPY.remove
      : isCompact
        ? PLAY_FRIENDS_COPY.cancelShort
        : PLAY_FRIENDS_COPY.cancel,
    () => friends.remove(accountId, relation === 'friend' ? PLAY_FRIENDS_COPY.removed : undefined)
  )
}
