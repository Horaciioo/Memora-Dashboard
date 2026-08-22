'use client'

import { useCallback, useState } from 'react'
import type { DragEvent } from 'react'

// Payload key of the dragged item
const TRANSFER_KEY = 'application/x-memora-item'

/**
 * Item currently held by the pointer
 * @typedef {Object} DraggedItem
 * @property {string} id - Item identifier
 * @property {string} from - Container the item started in
 */

export interface DraggedItem {
  id: string
  from: string
}

/**
 * Handlers wiring one board to drag and drop
 * @typedef {Object} DragAndDrop
 * @property {DraggedItem | null} dragged - Item being moved
 * @property {string | null} over - Container under the pointer
 * @property {(item: DraggedItem) => object} itemProps - Props of a draggable item
 * @property {(container: string) => object} containerProps - Props of a drop container
 */

export interface DragAndDrop {
  dragged: DraggedItem | null
  over: string | null
  itemProps: (item: DraggedItem) => {
    draggable: true
    onDragStart: (event: DragEvent<HTMLElement>) => void
    onDragEnd: () => void
  }
  containerProps: (container: string) => {
    onDragOver: (event: DragEvent<HTMLElement>) => void
    onDragLeave: () => void
    onDrop: (event: DragEvent<HTMLElement>) => void
  }
}

/**
 * Wire drag and drop between containers
 * @param {(item: DraggedItem, container: string, index: number) => void} onMove - Drop handler
 * @return {DragAndDrop} - Drag state and props
 */

export const useDragAndDrop = (
  onMove: (item: DraggedItem, container: string, index: number) => void
): DragAndDrop => {
  const [dragged, setDragged] = useState<DraggedItem | null>(null)
  const [over, setOver] = useState<string | null>(null)

  const itemProps = useCallback(
    (item: DraggedItem) => ({
      draggable: true as const,
      onDragStart: (event: DragEvent<HTMLElement>) => {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData(TRANSFER_KEY, JSON.stringify(item))
        setDragged(item)
      },
      onDragEnd: () => {
        setDragged(null)
        setOver(null)
      },
    }),
    []
  )

  const containerProps = useCallback(
    (container: string) => ({
      onDragOver: (event: DragEvent<HTMLElement>) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
        setOver(container)
      },
      onDragLeave: () => setOver((current) => (current === container ? null : current)),
      onDrop: (event: DragEvent<HTMLElement>) => {
        event.preventDefault()

        // Read the payload back, falling back on component state
        const raw = event.dataTransfer.getData(TRANSFER_KEY)
        const item: DraggedItem | null = raw ? (JSON.parse(raw) as DraggedItem) : dragged

        setDragged(null)
        setOver(null)

        if (!item) return

        // Position is derived from the card the pointer landed on
        const target = (event.target as HTMLElement).closest('[data-drop-index]')
        const index = target
          ? Number(target.getAttribute('data-drop-index'))
          : Number.MAX_SAFE_INTEGER

        onMove(item, container, index)
      },
    }),
    [dragged, onMove]
  )

  return { dragged, over, itemProps, containerProps }
}
