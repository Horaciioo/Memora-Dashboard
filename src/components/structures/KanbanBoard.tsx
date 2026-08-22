'use client'

import type { ReactNode } from 'react'
import { Badge } from '@/components/elements/display/Badge'
import { useDragAndDrop } from '@/core/hooks/interaction/useDragAndDrop'
import { BOARD_STYLES } from '@/declarations/ui/variants'
import { toTone } from '@/declarations/ui/theme'
import { useMenu, type MenuItem } from '@/managers/front-end'
import { cn } from '@/utils/classnames'

/**
 * Column of a board
 * @typedef {Object} BoardColumn
 * @property {string} id - Column identifier
 * @property {string} label - Column label
 * @property {string | null} accent - Colour token
 */

export interface BoardColumn {
  id: string
  label: string
  accent: string | null
}

/**
 * Card of a board
 * @typedef {Object} BoardItem
 * @property {string} id - Card identifier
 * @property {string | null} columnId - Column the card sits in
 */

export interface BoardItem {
  id: string
  columnId: string | null
}

export interface KanbanBoardProps<T extends BoardItem> {
  columns: BoardColumn[]
  items: T[]
  renderCard: (item: T) => ReactNode
  onMove: (itemId: string, columnId: string, index: number) => void
  onOpen?: (item: T) => void
  cardMenu?: (item: T) => MenuItem[]
  emptyColumn: string
  canMove: boolean
}

/**
 * Column board whose cards move between columns by dragging, each card answering the
 * right click menu it was given
 * @param {BoardColumn[]} columns - Columns in display order
 * @param {T[]} items - Cards, grouped by their columnId
 * @param {(item: T) => ReactNode} renderCard - Card renderer
 * @param {(itemId: string, columnId: string, index: number) => void} onMove - Drop handler
 * @param {(item: T) => void} [onOpen] - Called on click and on Enter
 * @param {(item: T) => MenuItem[]} [cardMenu] - Entries of the right click menu
 * @param {string} emptyColumn - Line shown inside an empty column
 * @param {boolean} canMove - Member may drag cards
 * @return {JSX.Element}
 */

export const KanbanBoard = <T extends BoardItem>({
  columns,
  items,
  renderCard,
  onMove,
  onOpen,
  cardMenu,
  emptyColumn,
  canMove,
}: KanbanBoardProps<T>) => {
  const { contextMenu } = useMenu()
  const { over, itemProps, containerProps } = useDragAndDrop((item, container, index) =>
    onMove(item.id, container, index)
  )

  return (
    <div className={BOARD_STYLES.scroller}>
      {columns.map((column) => {
        const cards = items.filter((item) => item.columnId === column.id)
        const tone = toTone(column.accent, 'neutral')

        return (
          <section key={column.id} className={BOARD_STYLES.column}>
            <header className={BOARD_STYLES.columnHead}>
              <span className={BOARD_STYLES.columnTitle}>
                <Badge label={column.label} tone={tone} dot />
              </span>
              <span className={BOARD_STYLES.count}>{cards.length}</span>
            </header>
            <div
              className={cn(BOARD_STYLES.body, over === column.id && 'is-drop-target')}
              {...(canMove ? containerProps(column.id) : {})}
            >
              {cards.length === 0 && (
                <p className="px-2 py-6 text-center text-xs text-[var(--color-ink-subtle)] italic">
                  {emptyColumn}
                </p>
              )}
              {cards.map((item, index) => (
                <article
                  key={item.id}
                  data-drop-index={index}
                  tabIndex={onOpen ? 0 : undefined}
                  onClick={onOpen ? () => onOpen(item) : undefined}
                  onKeyDown={
                    onOpen
                      ? (event) => {
                          if (event.key === 'Enter') onOpen(item)
                        }
                      : undefined
                  }
                  onContextMenu={cardMenu ? contextMenu(cardMenu(item)) : undefined}
                  className={BOARD_STYLES.card}
                  {...(canMove ? itemProps({ id: item.id, from: column.id }) : {})}
                >
                  {renderCard(item)}
                </article>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
