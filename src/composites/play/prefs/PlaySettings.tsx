'use client'

import { useState } from 'react'

import { SelectMenu } from '@/components/elements/forms/selects/SelectMenu'
import { GolfPrefToggles } from '@/composites/play/prefs/GolfPrefToggles'
import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { NavalAutoZoomToggle } from '@/composites/play/naval/NavalAutoZoomToggle'
import { PlayGeneralPrefs } from '@/composites/play/prefs/PlayGeneralPrefs'
import { PlayMotionToggle } from '@/composites/play/prefs/PlayMotionToggle'
import { PlayResetPrefs } from '@/composites/play/prefs/PlayResetPrefs'
import { PlayPrefSwitches } from '@/composites/play/prefs/PlayPrefSwitches'
import { PlayVolume } from '@/composites/play/session/PlayVolume'
import { PLAY_HUB_COPY } from '@/declarations/play'
import { PLAY_GAMES } from '@/declarations/play/games'
import { PLAY_PREFS } from '@/declarations/play/prefs'
import { ICONS } from '@/declarations/ui/icons'
import { PLAY_SETTINGS } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

const GENERAL = 'general'

// Games with a switch of their own
const GAMES = PLAY_GAMES.keys.filter(
  (game) => PLAY_PREFS[game] || game === PlayGames.Naval || game === PlayGames.Golf
)

/**
 * Settings of Play: a section list, one panel of grouped rows
 * @return {JSX.Element}
 */

export const PlaySettings = () => {
  const [section, setSection] = useState<PlayGameName | typeof GENERAL>(GENERAL)
  const GeneralIcon = ICONS.settings
  const isGeneral = section === GENERAL

  const group = (title: string, body: React.ReactNode) => (
    <div className={PLAY_SETTINGS.group}>
      <h3 className={PLAY_SETTINGS.title}>{title}</h3>
      {body}
    </div>
  )

  return (
    <div className={PLAY_SETTINGS.layout}>
      <div className={PLAY_SETTINGS.pick}>
        <SelectMenu
          isPlay
          label={PLAY_HUB_COPY.settingsNav}
          options={[
            { value: GENERAL, label: PLAY_HUB_COPY.settingsGeneral, icon: 'settings' },
            ...GAMES.map((game) => ({ value: game, label: PLAY_GAMES.label(game) })),
          ]}
          value={section}
          onChange={(value) => setSection(value as PlayGameName | typeof GENERAL)}
        />
      </div>
      <nav aria-label={PLAY_HUB_COPY.settingsNav} className={PLAY_SETTINGS.nav}>
        <button
          type="button"
          aria-current={isGeneral ? 'page' : undefined}
          className={cn(PLAY_SETTINGS.item, isGeneral && PLAY_SETTINGS.itemOn)}
          onClick={() => setSection(GENERAL)}
        >
          <GeneralIcon className={PLAY_SETTINGS.icon} aria-hidden="true" />
          {PLAY_HUB_COPY.settingsGeneral}
        </button>
        <span className={PLAY_SETTINGS.divider} role="separator" />
        {GAMES.map((game) => (
          <button
            key={game}
            type="button"
            aria-current={section === game ? 'page' : undefined}
            className={cn(PLAY_SETTINGS.item, section === game && PLAY_SETTINGS.itemOn)}
            onClick={() => setSection(game)}
          >
            <PlayGameLogo game={game} className={PLAY_SETTINGS.logo} />
            {PLAY_GAMES.label(game)}
          </button>
        ))}
      </nav>
      <section className={PLAY_SETTINGS.panel}>
        <h2 className={PLAY_SETTINGS.head}>
          {isGeneral ? PLAY_HUB_COPY.settingsGeneral : PLAY_GAMES.label(section)}
        </h2>
        {isGeneral ? (
          <>
            {group(PLAY_HUB_COPY.settingsSound, <PlayVolume />)}
            {group(PLAY_HUB_COPY.settingsMotion, <PlayMotionToggle />)}
            {group(PLAY_HUB_COPY.settingsDisplay, <PlayPrefSwitches />)}
            {group(PLAY_HUB_COPY.settingsNotices, <PlayGeneralPrefs />)}
            {group(PLAY_HUB_COPY.settingsReset, <PlayResetPrefs />)}
          </>
        ) : (
          <>
            {group(PLAY_HUB_COPY.settingsSound, <PlayVolume game={section} />)}
            {group(
              PLAY_HUB_COPY.settingsDisplay,
              <>
                {PLAY_PREFS[section] && <PlayPrefSwitches game={section} hasHudSwitch={false} />}
                {section === PlayGames.Naval && <NavalAutoZoomToggle />}
                {section === PlayGames.Golf && <GolfPrefToggles />}
              </>
            )}
          </>
        )}
      </section>
    </div>
  )
}
