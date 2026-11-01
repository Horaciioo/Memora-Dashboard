'use client'

import type { ReactNode } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { SHARE_PANEL_STYLES } from '@/declarations/ui/variants'

export interface ShareRowProps {
  name: string
  image?: string | null
  // Glyph in place of a portrait
  icon?: IconName
  hint?: string | null
  control: ReactNode
}

/**
 * One audience of a page and its level
 * @param {ShareRowProps} props - Audience and control
 * @return {JSX.Element}
 */

export const ShareRow = ({ name, image, icon, hint, control }: ShareRowProps) => {
  const Glyph = icon ? ICONS[icon] : null

  return (
    <li className={SHARE_PANEL_STYLES.row}>
      {Glyph ? (
        <span className={SHARE_PANEL_STYLES.rowTile}>
          <Glyph className={SHARE_PANEL_STYLES.rowGlyph} aria-hidden="true" />
        </span>
      ) : (
        <Avatar name={name} src={image ?? null} size="xs" />
      )}
      <span className={SHARE_PANEL_STYLES.rowText}>
        <span className={SHARE_PANEL_STYLES.name}>{name}</span>
        {hint && <span className={SHARE_PANEL_STYLES.hint}>{hint}</span>}
      </span>
      {control}
    </li>
  )
}
