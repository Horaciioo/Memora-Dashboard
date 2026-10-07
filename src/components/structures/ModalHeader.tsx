'use client'

import type { ReactNode } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { MODAL_HEADER } from '@/declarations/ui/variants'

export interface ModalHeaderProps {
  titleId: string
  title: ReactNode
  // Glyph beside the title
  icon?: IconName
  onClose: () => void
}

/**
 * Centred title of a modal, glyph above it
 * @param {ModalHeaderProps} props - Title and close handler
 * @return {JSX.Element}
 */

export const ModalHeader = ({ titleId, title, icon, onClose }: ModalHeaderProps) => {
  const Glyph = icon ? ICONS[icon] : null

  return (
    <div className={MODAL_HEADER.root}>
      <Button
        variant="icon"
        icon="close"
        onClick={onClose}
        aria-label={ACTION_COPY.close}
        className={MODAL_HEADER.close}
      />
      {Glyph && (
        <span className={MODAL_HEADER.glyph} aria-hidden="true">
          <Glyph className={MODAL_HEADER.glyphIcon} />
        </span>
      )}
      <h2 id={titleId} className={MODAL_HEADER.title}>
        {title}
      </h2>
    </div>
  )
}
