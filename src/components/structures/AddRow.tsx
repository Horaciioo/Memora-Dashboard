'use client'

import { ICONS } from '@/declarations/ui/icons'
import { ADD_ROW_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface AddRowProps {
  label: string
  disabled?: boolean
  // Stacks the glyph above the label, for a grid cell rather than a list row
  tile?: boolean
  className?: string
  onClick: () => void
}

/**
 * Dashed creation row closing a non empty collection, the counterpart of the EmptyState
 * action — a create gesture never sits in the top right of a panel
 * @param {string} label - Creation label
 * @param {boolean} [disabled] - Member may not write
 * @param {boolean} [tile] - Stacks glyph above label
 * @param {string} [className] - Extra classes merged onto the button
 * @param {() => void} onClick - Creation handler
 * @return {JSX.Element}
 */

export const AddRow = ({ label, disabled, tile, className, onClick }: AddRowProps) => {
  const AddIcon = ICONS.add

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(ADD_ROW_STYLES.base, tile && ADD_ROW_STYLES.tile, className)}
    >
      <AddIcon className={ADD_ROW_STYLES.icon} aria-hidden="true" />
      {label}
    </button>
  )
}
