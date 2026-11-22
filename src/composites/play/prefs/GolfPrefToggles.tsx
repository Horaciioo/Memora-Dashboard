'use client'

import { PlayPrefRow } from '@/composites/play/prefs/PlayPrefRow'
import { useGolfPrefsStore } from '@/core/store/play/golfPrefs'
import type { GolfPrefs } from '@/core/store/play/golfPrefs'
import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'

// Display switches, in card order
const SWITCHES: { key: keyof GolfPrefs; label: string }[] = [
  { key: 'showPlayers', label: GOLF_BOARD_COPY.showPlayers },
  { key: 'hasTrails', label: GOLF_BOARD_COPY.trails },
  { key: 'hasMist', label: GOLF_BOARD_COPY.mist },
  { key: 'hasSpecks', label: GOLF_BOARD_COPY.specks },
  { key: 'isLight', label: GOLF_BOARD_COPY.light },
]

/**
 * Golf display switches, the ones of its in-game card
 * @return {JSX.Element}
 */

export const GolfPrefToggles = () => {
  const prefs = useGolfPrefsStore()

  return SWITCHES.map(({ key, label }) => (
    <PlayPrefRow key={key} label={label} checked={prefs[key]} onChange={() => prefs.flip(key)} />
  ))
}
