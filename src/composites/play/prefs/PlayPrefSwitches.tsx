'use client'

import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { usePlayPrefsStore } from '@/core/store/play/playPrefs'
import { PLAY_PREFS, PLAY_PREFS_COPY, playPrefId, playPrefInitial } from '@/declarations/play/prefs'
import { PLAY_HUD, PLAY_ONLINE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { PlayGameName } from '@/utils/constants/play'

export interface PlayPrefSwitchesProps {
  // None: the HUD switch alone
  game?: PlayGameName
  // Rows for the HUD card, sections for the settings sheets
  isHud?: boolean
  // Leaves out the HUD switch
  hasHudSwitch?: boolean
}

/**
 * HUD switch then the switches of one game
 * @param {PlayPrefSwitchesProps} props - Game and layout
 * @return {JSX.Element}
 */

export const PlayPrefSwitches = ({
  game,
  isHud = false,
  hasHudSwitch = true,
}: PlayPrefSwitchesProps) => {
  const { isHudHidden, flags, toggleHud, flip } = usePlayPrefsStore()
  const rows = [
    ...(hasHudSwitch
      ? [
          {
            key: 'hud',
            label: PLAY_PREFS_COPY.hud,
            hint: PLAY_PREFS_COPY.hudHint,
            checked: !isHudHidden,
            onChange: toggleHud,
          },
        ]
      : []),
    ...((game && PLAY_PREFS[game]) || []).map((spec) => ({
      key: spec.key,
      label: spec.label,
      hint: spec.hint,
      checked: flags[playPrefId(game!, spec.key)] ?? playPrefInitial(game!, spec.key),
      onChange: () => flip(game!, spec.key),
    })),
  ]

  return rows.map((row) =>
    isHud ? (
      <div key={row.key} className={cn(PLAY_HUD.setting, 'justify-between')} title={row.hint}>
        <span>{row.label}</span>
        <Toggle bare checked={row.checked} onChange={row.onChange} label={row.label} />
      </div>
    ) : (
      <section key={row.key} className={PLAY_ONLINE.setting}>
        <Toggle checked={row.checked} onChange={row.onChange} label={row.label} />
        <p className={PLAY_ONLINE.hint}>{row.hint}</p>
      </section>
    )
  )
}
