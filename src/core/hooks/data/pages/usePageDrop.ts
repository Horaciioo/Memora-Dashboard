'use client'

import { useCallback } from 'react'

import { useDragAndDrop } from '@/core/hooks/interaction/gestures/useDragAndDrop'
import type { DragAndDrop, DraggedItem } from '@/core/hooks/interaction/gestures/useDragAndDrop'
import type { PageActions } from '@/core/hooks/data/pages/usePageActions'
import type { PageCategories } from '@/core/hooks/data/pages/usePageCategories'

/**
 * Container of pages outside any category
 * @type {string}
 */

export const LOOSE_CONTAINER = 'loose'

/**
 * Origin of a dragged category
 * @type {string}
 */

export const CATEGORY_ORIGIN = 'categories'

/**
 * Drag pages between categories, and categories among themselves
 * @param {PageCategories} categories - Category gestures
 * @param {PageActions['move']} move - Page move
 * @return {DragAndDrop} - Drag state and props
 */

export const usePageDrop = (
  { categories, reorder }: Pick<PageCategories, 'categories' | 'reorder'>,
  move: PageActions['move']
): DragAndDrop => {
  const onMove = useCallback(
    (item: DraggedItem, container: string, index: number) => {
      // A category lands where the target one stands
      if (item.from === CATEGORY_ORIGIN) {
        const position = categories.findIndex((category) => category.id === container)
        if (position >= 0 && container !== item.id) void reorder(item.id, position)

        return
      }

      // A page joins the category, or leaves them all
      const categoryId = container === LOOSE_CONTAINER ? null : container
      void move(item.id, { parentId: null, categoryId, position: index })
    },
    [categories, move, reorder]
  )

  return useDragAndDrop(onMove)
}
