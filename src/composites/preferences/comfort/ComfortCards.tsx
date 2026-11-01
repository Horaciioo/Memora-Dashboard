'use client'

import { Picker } from '@/composites/preferences/DisplayPreferences'
import { useComfortStore } from '@/core/store/comfort'
import { COMFORT_SETTINGS } from '@/declarations/preferences/comfort'
import { PICKER_CARD, SETTINGS_GROUP } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface ComfortCardsProps {
  settingKey: 'frame' | 'glass' | 'radius'
}

/**
 * Drawn preview of one value of a cards setting
 * @param {string} settingKey - Setting
 * @param {string} value - Value previewed
 * @return {JSX.Element}
 */

const Preview = ({
  settingKey,
  value,
}: {
  settingKey: ComfortCardsProps['settingKey']
  value: string
}) => {
  if (settingKey === 'frame')
    return <span data-frame-preview={value} className={SETTINGS_GROUP.previewFrame} />
  if (settingKey === 'radius')
    return <span data-radius-preview={value} className={SETTINGS_GROUP.previewRadius} />

  return (
    <span className={SETTINGS_GROUP.previewGround}>
      <span
        className={cn(
          SETTINGS_GROUP.previewCard,
          value === 'glass' ? 'card-surface' : 'bg-[var(--color-surface)]'
        )}
      />
    </span>
  )
}

/**
 * Values of a setting as cards, each drawn with what it does
 * @param {ComfortCardsProps} props - Setting shown
 * @return {JSX.Element}
 */

export const ComfortCards = ({ settingKey }: ComfortCardsProps) => {
  const current = useComfortStore((state) => state.values[settingKey])
  const setValue = useComfortStore((state) => state.setValue)
  const setting = COMFORT_SETTINGS[settingKey]
  const entries = Object.entries(setting.options)

  return (
    <Picker title={setting.label} columns={entries.length === 2 ? 'two' : 'three'}>
      {entries.map(([value, label]) => (
        <button
          key={value}
          type="button"
          aria-pressed={current === value}
          onClick={() => setValue(settingKey, value)}
          className={cn(
            PICKER_CARD.option,
            'justify-start',
            current === value && PICKER_CARD.active
          )}
        >
          <Preview settingKey={settingKey} value={value} />
          <span className={PICKER_CARD.label}>{label}</span>
        </button>
      ))}
    </Picker>
  )
}
