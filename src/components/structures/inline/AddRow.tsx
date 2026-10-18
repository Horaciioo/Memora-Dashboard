'use client'

import { ICONS } from '@/declarations/ui/icons'
import { ADD_ROW_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export type AddTileKind = keyof typeof ADD_ROW_STYLES.tiles

export interface AddRowProps {
  label: string
  disabled?: boolean
  // Stacks the glyph above the label, sized like the card it sits beside
  tile?: AddTileKind
  className?: string
  onClick: () => void
}

/**
 * Dashed creation row closing a non empty collection
 * @param {string} label - Creation label
 * @param {boolean} [disabled] - Member may not write
 * @param {AddTileKind} [tile] - Stacks glyph above label, sized like the sibling card
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
      className={cn(
        ADD_ROW_STYLES.base,
        tile ? ADD_ROW_STYLES.tiles[tile] : ADD_ROW_STYLES.row,
        className
      )}
    >
      <AddIcon className={ADD_ROW_STYLES.icon} aria-hidden="true" />
      {label}
    </button>
  )
}
