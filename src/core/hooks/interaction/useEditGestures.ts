'use client'

import { useCallback } from 'react'
import type { HTMLAttributes, KeyboardEvent, MouseEvent } from 'react'

import { ACTION_COPY } from '@/declarations/ui/copy'
import { useMenu } from '@/managers/front-end'
import type { MenuItem } from '@/managers/front-end'

// Descendants keeping their own click
const OWN_CLICK = 'button, a, input, textarea, select, [role="button"]'

/**
 * What a record surface offers
 * @typedef {Object} EditGestureOptions
 * @property {boolean} canEdit - Member may write the record
 * @property {() => void} onEdit - Opens the edit form
 * @property {() => void} [onRemove] - Asks to drop the record
 * @property {boolean} [canRemove] - Dropping is allowed
 * @property {string} [label] - Title of the menu
 * @property {MenuItem[]} [extra] - Entries added before the edit one
 */

export interface EditGestureOptions {
  canEdit: boolean
  onEdit: () => void
  onRemove?: () => void
  canRemove?: boolean
  label?: string
  extra?: MenuItem[]
}

/**
 * Spread on a record surface
 * @return {(options: EditGestureOptions) => HTMLAttributes<HTMLElement>} - Builder of the props
 */

export const useEditGestures = (): ((
  options: EditGestureOptions
) => HTMLAttributes<HTMLElement>) => {
  const { contextMenu } = useMenu()

  return useCallback(
    ({ canEdit, onEdit, onRemove, canRemove = canEdit, label, extra = [] }) => {
      if (!canEdit && !canRemove) return {}

      const items: MenuItem[] = [
        ...extra,
        { id: 'edit', label: ACTION_COPY.edit, icon: 'edit', disabled: !canEdit, onSelect: onEdit },
        ...(onRemove
          ? [
              {
                id: 'delete',
                label: ACTION_COPY.delete,
                icon: 'remove' as const,
                danger: true,
                separatorBefore: true,
                disabled: !canRemove,
                onSelect: onRemove,
              },
            ]
          : []),
      ]

      return {
        onContextMenu: contextMenu(items, label),
        ...(canEdit && {
          tabIndex: 0,
          onClick: (event: MouseEvent<HTMLElement>) => {
            if ((event.target as HTMLElement).closest(OWN_CLICK)) return
            onEdit()
          },
          onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
            if (event.key === 'Enter' && event.target === event.currentTarget) onEdit()
          },
        }),
      }
    },
    [contextMenu]
  )
}
