'use client'

import { PlayPrefSwitches } from '@/composites/play/prefs/PlayPrefSwitches'
import { PLAY_GAMES } from '@/declarations/play/games'
import { PLAY_PREFS } from '@/declarations/play/prefs'
import { PLAY_ONLINE } from '@/declarations/ui/variants'

/**
 * HUD switch, then each game with its own switches
 * @return {JSX.Element}
 */

export const PlayPrefsList = () => (
  <div className={PLAY_ONLINE.settings}>
    <PlayPrefSwitches />
    {PLAY_GAMES.keys
      .filter((game) => PLAY_PREFS[game])
      .map((game) => (
        <div key={game} className={PLAY_ONLINE.settings}>
          <h3 className={PLAY_ONLINE.settingTitle}>{PLAY_GAMES.get(game).label}</h3>
          <PlayPrefSwitches game={game} hasHudSwitch={false} />
        </div>
      ))}
  </div>
)
