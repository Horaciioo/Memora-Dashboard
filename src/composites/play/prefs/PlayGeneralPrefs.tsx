'use client'

import { PlayPrefRow } from '@/composites/play/prefs/PlayPrefRow'
import { usePlayPrefsStore } from '@/core/store/play/playPrefs'
import { PLAY_HUB_COPY } from '@/declarations/play'

/**
 * Invitation bubbles and count sounds
 * @return {JSX.Element}
 */

export const PlayGeneralPrefs = () => {
  const { isInviteHidden, isCountdownOff, toggleInvites, toggleCountdown } = usePlayPrefsStore()

  return (
    <>
      <PlayPrefRow
        label={PLAY_HUB_COPY.settingsInvites}
        hint={PLAY_HUB_COPY.settingsInvitesHint}
        checked={!isInviteHidden}
        onChange={toggleInvites}
      />
      <PlayPrefRow
        label={PLAY_HUB_COPY.settingsCountdown}
        hint={PLAY_HUB_COPY.settingsCountdownHint}
        checked={!isCountdownOff}
        onChange={toggleCountdown}
      />
    </>
  )
}
