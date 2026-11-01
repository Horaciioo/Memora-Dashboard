'use client'

import { useState } from 'react'

import { useActionMenu } from '@/core/hooks/interaction/layout/useActionMenu'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { SANCTION_COPY } from '@/declarations/sanctions/copy'
import { SANCTION_DETECTION_COPY } from '@/declarations/sanctions/detection'
import { SANCTION_GRAVITY_REGISTRY } from '@/declarations/sanctions/registries'
import { ICONS } from '@/declarations/ui/icons'
import { accentPaint, accentVars } from '@/declarations/ui/theme'
import { SANCTION_PANEL } from '@/declarations/ui/variants'
import type { SanctionOffenseCard } from '@/types/sanctions'
import { cn } from '@/utils/classnames'

export interface OffenseBoxProps {
  offense: SanctionOffenseCard
  canManage: boolean
  onOpen: () => void
  onRename: (name: string) => Promise<boolean>
  onRemove: () => void
}

/**
 * First step of the ladder and a quiet note when nothing detects the offence
 * @param {Object} props - Offence
 * @param {SanctionOffenseCard} props.offense - Offence
 * @return {JSX.Element}
 */

const BoxFoot = ({ offense }: { offense: SanctionOffenseCard }) => {
  const Detection = ICONS.blockedTerms
  const measures = offense.firstRung?.measures ?? []

  return (
    <span className={SANCTION_PANEL.cardFoot}>
      {measures.length > 0 ? (
        <span className={SANCTION_PANEL.cardStep}>
          {measures.map((measure) => (
            <span
              key={measure.id}
              className={accentPaint(measure.accent).text}
              style={accentPaint(measure.accent).style}
            >
              {measure.name}
            </span>
          ))}
        </span>
      ) : (
        <span className={SANCTION_PANEL.cardMuted}>{SANCTION_DETECTION_COPY.noRung}</span>
      )}
      {offense.keywords.length === 0 && (
        <span className={SANCTION_PANEL.cardMuted}>
          <Detection className={SANCTION_PANEL.cardIcon} aria-hidden="true" />
          {SANCTION_DETECTION_COPY.noDetection}
        </span>
      )}
    </span>
  )
}

/**
 * One offence as a box
 * @param {OffenseBoxProps} props - Offence
 * @return {JSX.Element}
 */

export const OffenseBox = ({ offense, canManage, onOpen, onRename, onRemove }: OffenseBoxProps) => {
  const [renaming, setRenaming] = useState(false)
  const [draft, setDraft] = useState(offense.name)
  const gravity = SANCTION_GRAVITY_REGISTRY.get(offense.gravity)

  const menu = useActionMenu(
    canManage
      ? [
          { id: 'open', label: SANCTION_COPY.open, icon: 'forward', onSelect: onOpen },
          {
            id: 'rename',
            label: SANCTION_COPY.rename,
            icon: 'edit',
            onSelect: () => {
              setDraft(offense.name)
              setRenaming(true)
            },
          },
          {
            id: 'remove',
            label: SANCTION_COPY.remove,
            icon: 'remove',
            danger: true,
            separatorBefore: true,
            onSelect: onRemove,
          },
        ]
      : []
  )

  const commit = async () => {
    const next = draft.trim()
    if (next && next !== offense.name) await onRename(next)
    setRenaming(false)
  }

  // A box being renamed holds a field
  if (renaming) {
    return (
      <div className={SANCTION_PANEL.card} style={accentVars(gravity.accent)}>
        <input
          ref={(node) => node?.focus()}
          value={draft}
          maxLength={FORM_SETTINGS.titleMaxLength}
          aria-label={SANCTION_COPY.rename}
          className={SANCTION_PANEL.cardInput}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void commit()
            if (event.key === 'Escape') setRenaming(false)
          }}
        />
        <BoxFoot offense={offense} />
      </div>
    )
  }

  return (
    <button
      type="button"
      className={cn(SANCTION_PANEL.card)}
      style={accentVars(gravity.accent)}
      onClick={onOpen}
      onContextMenu={menu.onContextMenu}
    >
      <span className={SANCTION_PANEL.cardName}>{offense.name}</span>
      <BoxFoot offense={offense} />
    </button>
  )
}
