'use client'

import { Fragment } from 'react'

import { Toggle } from '@/components/elements/forms/inputs/Toggle'
import { SelectMenu } from '@/components/elements/forms/selects/SelectMenu'
import { useModPreferences } from '@/core/hooks/interaction/state/moderation/useModPreferences'
import { MODVIEW_ACTION_COPY } from '@/declarations/modview/actionCopy'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import {
  CHAT_OPTIONS,
  DENSITIES,
  PAUSE_MODES,
  TEXT_SIZES,
  TOOLS_POSITIONS,
} from '@/declarations/modview/registries'
import { MODVIEW_SETTINGS } from '@/declarations/ui/variants'
import type { ModPreferences } from '@/types/modview'

// Options of a choice menu
const optionsOf = (registry: {
  keys: readonly string[]
  label: (key: never) => string
}): { value: string; label: string }[] =>
  registry.keys.map((value) => ({ value, label: registry.label(value as never) }))

const PAUSE_OPTIONS = optionsOf(PAUSE_MODES)
const POSITION_OPTIONS = optionsOf(TOOLS_POSITIONS)
const SIZE_OPTIONS = optionsOf(TEXT_SIZES)
const DENSITY_OPTIONS = optionsOf(DENSITIES)

/**
 * Display choices of the chat, tried live until saved
 * @return {JSX.Element}
 */

export const PreferencesPanel = () => {
  const { preferences, preview } = useModPreferences()

  // A choice menu sits at the end of its row
  const choice = (
    label: string,
    options: { value: string; label: string }[],
    value: string,
    onChange: (value: string) => void
  ) => (
    <li className={MODVIEW_SETTINGS.row}>
      <span>{label}</span>
      <span className={MODVIEW_SETTINGS.choice}>
        <SelectMenu options={options} value={value} label={label} onChange={onChange} />
      </span>
    </li>
  )

  const toggle = (label: string, checked: boolean, onChange: (checked: boolean) => void) => (
    <li className={MODVIEW_SETTINGS.row}>
      <span>{label}</span>
      <Toggle bare checked={checked} label={label} onChange={onChange} />
    </li>
  )

  return (
    <div className={MODVIEW_SETTINGS.groups}>
      <ul className={MODVIEW_SETTINGS.list}>
        {CHAT_OPTIONS.keys.map((key) => (
          <Fragment key={key}>
            {toggle(CHAT_OPTIONS.label(key), preferences[key], (checked) =>
              preview({ [key]: checked })
            )}
          </Fragment>
        ))}
        {toggle(MODVIEW_ACTION_COPY.confirmHarsh, preferences.confirmHarsh, (confirmHarsh) =>
          preview({ confirmHarsh })
        )}
      </ul>
      <ul className={MODVIEW_SETTINGS.list}>
        {choice(MODVIEW_COPY.preferencesText, SIZE_OPTIONS, preferences.textSize, (value) =>
          preview({ textSize: value as ModPreferences['textSize'] })
        )}
        {choice(MODVIEW_COPY.preferencesDensity, DENSITY_OPTIONS, preferences.density, (value) =>
          preview({ density: value as ModPreferences['density'] })
        )}
        {choice(MODVIEW_COPY.preferencesPause, PAUSE_OPTIONS, preferences.pauseMode, (value) =>
          preview({ pauseMode: value as ModPreferences['pauseMode'] })
        )}
        {choice(
          MODVIEW_ACTION_COPY.placementHead,
          POSITION_OPTIONS,
          preferences.toolsPosition,
          (value) => preview({ toolsPosition: value as ModPreferences['toolsPosition'] })
        )}
      </ul>
    </div>
  )
}
