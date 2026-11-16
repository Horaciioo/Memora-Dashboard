'use client'

import { NavalAutoZoomToggle } from '@/composites/play/naval/NavalAutoZoomToggle'
import { PlayMotionToggle } from '@/composites/play/prefs/PlayMotionToggle'
import { PlayPrefSwitches } from '@/composites/play/prefs/PlayPrefSwitches'
import { PlayVolume } from '@/composites/play/session/PlayVolume'
import { PLAY_GAMES, PLAY_MOBILE_COPY, playGameOfSlug } from '@/declarations/play'
import { PLAY_ONLINE } from '@/declarations/ui/variants'
import { PlayGames } from '@/utils/constants/play'

/**
 * Play settings: sound and heavy animations
 * @param {Object} props - Panel
 * @param {string} [props.gameSlug] - Game played, if any
 * @return {JSX.Element}
 */

export const PlaySettingsPanel = ({ gameSlug }: { gameSlug?: string }) => {
  const game = gameSlug ? playGameOfSlug(gameSlug) : null

  return (
    <div className={PLAY_ONLINE.settings}>
      <section className={PLAY_ONLINE.setting}>
        <h3 className={PLAY_ONLINE.settingTitle}>{PLAY_MOBILE_COPY.sound}</h3>
        <PlayVolume />
      </section>
      <PlayMotionToggle />
      {game && <PlayPrefSwitches game={game} />}
      {gameSlug === PLAY_GAMES.get(PlayGames.Naval).slug && <NavalAutoZoomToggle />}
    </div>
  )
}
