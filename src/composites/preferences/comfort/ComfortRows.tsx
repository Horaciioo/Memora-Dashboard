'use client'

import { SegmentedControl } from '@/components/elements/actions/SegmentedControl'
import { SettingRow } from '@/composites/preferences/SettingRow'
import { useComfortStore } from '@/core/store/comfort'
import { COMFORT_SETTINGS } from '@/declarations/preferences/comfort'
import type { ComfortKey } from '@/declarations/preferences/comfort'
import { PREFERENCE_STYLES } from '@/declarations/ui/variants'

export interface ComfortRowsProps {
  keys: readonly ComfortKey[]
}

/**
 * One row per interface setting, its values as a segmented control
 * @param {ComfortKey[]} keys - Settings to list
 * @return {JSX.Element}
 */

export const ComfortRows = ({ keys }: ComfortRowsProps) => {
  const values = useComfortStore((state) => state.values)
  const setValue = useComfortStore((state) => state.setValue)

  return (
    <div className={PREFERENCE_STYLES.rows}>
      {keys.map((key) => {
        const setting = COMFORT_SETTINGS[key]

        return (
          <SettingRow
            key={key}
            icon={setting.icon}
            name={setting.label}
            description={setting.description}
          >
            <SegmentedControl
              label={setting.label}
              value={String(values[key])}
              onChange={(value) => setValue(key, value)}
              options={Object.entries(setting.options).map(([value, label]) => ({ value, label }))}
            />
          </SettingRow>
        )
      })}
    </div>
  )
}
