'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { AddRow } from '@/components/structures/inline/AddRow'
import { useIsMobileShell, useMediaQuery } from '@/core/hooks/interaction/layout/useBreakpoint'
import { useDragAndDrop } from '@/core/hooks/interaction/gestures/useDragAndDrop'
import { SELECTABLE_ATTRIBUTE, useMarquee } from '@/core/hooks/interaction/gestures/useMarquee'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { ICONS } from '@/declarations/ui/icons'
import { accentVars } from '@/declarations/ui/theme'
import { BOARD_STYLES } from '@/declarations/ui/variants'
import { useMenu, type MenuItem } from '@/managers/front-end'
import { COARSE_POINTER_QUERY } from '@/declarations/ui/responsive'
import type { WorkflowPhaseName } from '@/utils/constants/workflow'
import { cn } from '@/utils/classnames'

/**
 * Column of a board
 * @typedef {Object} BoardColumn
 * @property {string} id - Column identifier
 * @property {string} label - Column label
 * @property {string | null} accent - Colour token
 * @property {WorkflowPhaseName} [phase] - Lifecycle bucket
 */

export interface BoardColumn {
  id: string
  label: string
  accent: string | null
  phase?: WorkflowPhaseName
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
  addLabel: string
  canCreate: boolean
  onCreate: (columnId: string) => void
  canMove: boolean
  // Narrows which cards may be dragged
  canMoveItem?: (item: T) => boolean
  // Washes each column and its cards in the column accent
  tintByColumn?: boolean
  // Ids of the selected cards
  selection?: string[]
  // Cards that may join a selection, none when absent
  canSelectItem?: (item: T) => boolean
  onToggle?: (item: T) => void
  // Marquee result, additive when a modifier key was held
  onSelectMany?: (ids: string[], additive: boolean) => void
}

/**
 * Column board whose cards move between columns by dragging
 * @param {BoardColumn[]} columns - Columns in display order
 * @param {T[]} items - Cards
 * @param {(item: T) => ReactNode} renderCard - Card renderer
 * @param {(itemId: string, columnId: string, index: number) => void} onMove - Drop handler
 * @param {(item: T) => void} [onOpen] - Called on click and on Enter
 * @param {(item: T) => MenuItem[]} [cardMenu] - Entries of the right click menu
 * @param {string} addLabel - Label of the creation row
 * @param {boolean} canCreate - Member may add a card
 * @param {(columnId: string) => void} onCreate - Called with the column the row sits under
 * @param {boolean} canMove - Member may drag cards
 * @param {(item: T) => boolean} [canMoveItem] - Narrows which cards may be dragged
 * @param {boolean} [tintByColumn] - Washes columns and cards in the column accent
 * @param {string[]} [selection] - Ids of the selected cards
 * @param {(item: T) => boolean} [canSelectItem] - Cards that may join a selection
 * @param {(item: T) => void} [onToggle] - Adds or drops one card from the selection
 * @param {(ids: string[], additive: boolean) => void} [onSelectMany] - Marquee result
 * @return {JSX.Element}
 */

export const KanbanBoard = <T extends BoardItem>({
  columns,
  items,
  renderCard,
  onMove,
  onOpen,
  cardMenu,
  addLabel,
  canCreate,
  onCreate,
  canMove,
  canMoveItem,
  tintByColumn,
  selection = [],
  canSelectItem,
  onToggle,
  onSelectMany,
}: KanbanBoardProps<T>) => {
  const { contextMenu } = useMenu()
  // Lanes folded on a phone, the first one open
  const [opened, setOpened] = useState<Set<string>>(
    () => new Set(columns[0] ? [columns[0].id] : [])
  )
  const isMobile = useIsMobileShell()
  const ChevronIcon = ICONS.expand
  // A finger cannot drag a card across lanes, the menu moves it instead
  const isTouch = useMediaQuery(COARSE_POINTER_QUERY)
  const { over, itemProps, containerProps } = useDragAndDrop((item, container, index) =>
    onMove(item.id, container, index)
  )

  const marquee = useMarquee(Boolean(onSelectMany), (ids, additive) =>
    onSelectMany?.(ids, additive)
  )

  // A modifier key, or a selection under way, turns a click into a pick
  const activate = (item: T, additive: boolean) => {
    if (onToggle && (canSelectItem?.(item) ?? true) && (additive || selection.length > 0))
      onToggle(item)
    else onOpen?.(item)
  }

  const toggleColumn = (id: string) =>
    setOpened((current) => {
      const next = new Set(current)

      if (next.has(id)) next.delete(id)
      else next.add(id)

      return next
    })

  const menuOf = (item: T, current: string): MenuItem[] => [
    ...(cardMenu?.(item) ?? []),
    ...(isTouch && canMove && (canMoveItem?.(item) ?? true)
      ? columns
          .filter((column) => column.id !== current)
          .map((column, index) => ({
            id: `move-${column.id}`,
            label: ACTION_COPY.moveTo.replace('{column}', column.label),
            icon: 'forward' as const,
            separatorBefore: index === 0,
            onSelect: () => onMove(item.id, column.id, Number.MAX_SAFE_INTEGER),
          }))
      : []),
  ]

  return (
    <div className={BOARD_STYLES.scroller} onPointerDown={marquee.onPointerDown}>
      {marquee.rect && <div className={BOARD_STYLES.marquee} style={marquee.rect} />}
      {columns.map((column) => {
        const cards = items.filter((item) => item.columnId === column.id)
        const isOpen = opened.has(column.id)

        // Both surfaces read the same --accent
        const accentStyle = tintByColumn ? accentVars(column.accent) : undefined

        return (
          <section
            key={column.id}
            style={accentStyle}
            className={cn(
              BOARD_STYLES.column,
              BOARD_STYLES.columnShown,
              tintByColumn && BOARD_STYLES.columnTint
            )}
          >
            <header className={BOARD_STYLES.columnHead}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => toggleColumn(column.id)}
                className={BOARD_STYLES.columnToggle}
              >
                <span className={BOARD_STYLES.columnTitle}>{column.label}</span>
                <ChevronIcon
                  className={cn(BOARD_STYLES.columnChevron, !isOpen && '-rotate-90')}
                  aria-hidden="true"
                />
              </button>
            </header>
            <div className="fold fold-wide" data-open={isOpen} inert={isMobile && !isOpen}>
              <div>
                <div
                  className={cn(BOARD_STYLES.body, over === column.id && 'is-drop-target')}
                  {...(canMove ? containerProps(column.id) : {})}
                >
                  {cards.map((item, index) => (
                    <article
                      key={item.id}
                      data-drop-index={index}
                      {...(onToggle && (canSelectItem?.(item) ?? true)
                        ? { [SELECTABLE_ATTRIBUTE]: item.id }
                        : {})}
                      tabIndex={onOpen || onToggle ? 0 : undefined}
                      onClick={
                        onOpen || onToggle
                          ? (event) =>
                              activate(item, event.ctrlKey || event.metaKey || event.shiftKey)
                          : undefined
                      }
                      onKeyDown={
                        onOpen || onToggle
                          ? (event) => {
                              if (event.key === 'Enter') activate(item, event.shiftKey)
                            }
                          : undefined
                      }
                      onContextMenu={
                        cardMenu || isTouch ? contextMenu(menuOf(item, column.id)) : undefined
                      }
                      style={accentStyle}
                      data-picked={selection.includes(item.id) || undefined}
                      className={cn(
                        BOARD_STYLES.card,
                        tintByColumn ? BOARD_STYLES.cardTint : BOARD_STYLES.cardGlass,
                        selection.includes(item.id) && BOARD_STYLES.cardSelected
                      )}
                      {...(canMove && !isTouch && (canMoveItem?.(item) ?? true)
                        ? itemProps({ id: item.id, from: column.id })
                        : {})}
                    >
                      {renderCard(item)}
                    </article>
                  ))}
                  {canCreate && <AddRow label={addLabel} onClick={() => onCreate(column.id)} />}
                </div>
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}
