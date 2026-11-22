'use client'

import { NavalAutoZoomToggle } from '@/composites/play/naval/NavalAutoZoomToggle'
import { PlayMotionToggle } from '@/composites/play/prefs/PlayMotionToggle'
import { PlayPrefSwitches } from '@/composites/play/prefs/PlayPrefSwitches'
import { PlayVolume } from '@/composites/play/session/PlayVolume'
import { PLAY_GAMES, PLAY_MOBILE_COPY, playGameOfSlug } from '@/declarations/play'
import { PLAY_PREF } from '@/declarations/ui/variants'
import { PlayGames } from '@/utils/constants/play'

/**
 * Play settings: sound and heavy animations, then the game's own switches
 * @param {Object} props - Panel
 * @param {string} [props.gameSlug] - Game played, if any
 * @return {JSX.Element}
 */

export const PlaySettingsPanel = ({ gameSlug }: { gameSlug?: string }) => {
  const game = gameSlug ? playGameOfSlug(gameSlug) : null

  return (
    <div className={PLAY_PREF.group}>
      <h3 className={PLAY_PREF.title}>{PLAY_MOBILE_COPY.sound}</h3>
      <PlayVolume />
      <PlayMotionToggle />
      {game && <PlayPrefSwitches game={game} />}
      {gameSlug === PLAY_GAMES.get(PlayGames.Naval).slug && <NavalAutoZoomToggle />}
    </div>
  )
}
