'use client'

import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { NavalAutoZoomToggle } from '@/composites/play/naval/NavalAutoZoomToggle'
import { PlayVolume } from '@/composites/play/session/PlayVolume'
import { usePlayMotionStore } from '@/core/store/play/playMotion'
import { PLAY_GAMES, PLAY_MOBILE_COPY } from '@/declarations/play'
import { PLAY_ONLINE } from '@/declarations/ui/variants'
import { PlayGames } from '@/utils/constants/play'

/**
 * Play settings: sound and heavy animations
 * @param {Object} props - Panel
 * @param {string} [props.gameSlug] - Game played, if any
 * @return {JSX.Element}
 */

export const PlaySettingsPanel = ({ gameSlug }: { gameSlug?: string }) => {
  const { isLight, toggle } = usePlayMotionStore()

  return (
    <div className={PLAY_ONLINE.settings}>
      <section className={PLAY_ONLINE.setting}>
        <h3 className={PLAY_ONLINE.settingTitle}>{PLAY_MOBILE_COPY.sound}</h3>
        <PlayVolume />
      </section>
      <section className={PLAY_ONLINE.setting}>
        <Toggle checked={!isLight} onChange={toggle} label={PLAY_MOBILE_COPY.heavyMotion} />
        <p className={PLAY_ONLINE.hint}>{PLAY_MOBILE_COPY.heavyMotionHint}</p>
      </section>
      {gameSlug === PLAY_GAMES.get(PlayGames.Naval).slug && <NavalAutoZoomToggle />}
    </div>
  )
}
