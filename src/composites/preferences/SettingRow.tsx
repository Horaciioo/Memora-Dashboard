import type { ReactNode } from 'react'

import { MaturityTag } from '@/components/elements/display/MaturityTag'
import type { MaturityName } from '@/declarations/maturity/registries'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { PREFERENCE_STYLES, SETTINGS_GROUP } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface SettingRowProps {
  icon: IconName
  name: string
  description: string
  maturity?: MaturityName
  children: ReactNode
}

/**
 * One setting: glyph tile, name, line, and its control on the right
 * @param {IconName} icon - Glyph of the setting
 * @param {string} name - Name of the setting
 * @param {string} description - What it changes
 * @param {MaturityName} [maturity] - Lifecycle tag by the name
 * @param {ReactNode} children - Control
 * @return {JSX.Element}
 */

export const SettingRow = ({ icon, name, description, maturity, children }: SettingRowProps) => {
  const Glyph = ICONS[icon]

  return (
    <div className={PREFERENCE_STYLES.row}>
      <span className={SETTINGS_GROUP.tile}>
        <Glyph className={SETTINGS_GROUP.tileGlyph} aria-hidden="true" />
      </span>
      <div className={SETTINGS_GROUP.text}>
        <span className={cn(SETTINGS_GROUP.name, 'flex items-center gap-2')}>
          {name}
          {maturity && <MaturityTag maturity={maturity} interactive={false} compact />}
        </span>
        <span className={SETTINGS_GROUP.description}>{description}</span>
      </div>
      <div className={SETTINGS_GROUP.control}>{children}</div>
    </div>
  )
}
