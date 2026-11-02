'use client'

import { filterBlocks, PAGE_BLOCKS } from '@/declarations/pages/blocks'
import type { PageBlockKind } from '@/declarations/pages/blocks'
import { PAGE_EDITOR_COPY } from '@/declarations/pages/copy'
import { ICONS } from '@/declarations/ui/icons'
import { BLOCK_EDITOR } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface SlashMenuProps {
  query: string
  activeIndex: number
  // Caret box
  rect: { left: number; top: number; bottom: number }
  onPick: (kind: PageBlockKind) => void
  onHover: (index: number) => void
}

/**
 * Filterable block menu under the caret
 * @param {SlashMenuProps} props - Query, lit row and handlers
 * @return {JSX.Element}
 */

export const PageSlashMenu = ({ query, activeIndex, rect, onPick, onHover }: SlashMenuProps) => {
  const kinds = filterBlocks(query)
  // Opens upward near the bottom of the screen
  const isUp = rect.bottom > window.innerHeight * 0.6

  return (
    <div
      role="listbox"
      id="page-slash-menu"
      aria-label={PAGE_EDITOR_COPY.slashLabel}
      className={BLOCK_EDITOR.slashPanel}
      style={
        isUp
          ? { left: rect.left, bottom: window.innerHeight - rect.top + BLOCK_EDITOR.menuGapPx }
          : { left: rect.left, top: rect.bottom + BLOCK_EDITOR.menuGapPx }
      }
      onMouseDown={(event) => event.preventDefault()}
    >
      {kinds.length === 0 && (
        <p className={BLOCK_EDITOR.slashEmpty}>{PAGE_EDITOR_COPY.slashEmpty}</p>
      )}

      {kinds.map((kind, index) => {
        const block = PAGE_BLOCKS.get(kind)
        const Glyph = ICONS[block.icon]
        const isActive = index === activeIndex

        return (
          <button
            key={kind}
            id={`page-slash-${kind}`}
            type="button"
            role="option"
            aria-selected={isActive}
            ref={(node) => {
              if (isActive) node?.scrollIntoView({ block: 'nearest' })
            }}
            onMouseEnter={() => onHover(index)}
            onClick={() => onPick(kind)}
            className={cn(
              BLOCK_EDITOR.slashItem,
              isActive ? BLOCK_EDITOR.slashItemActive : BLOCK_EDITOR.slashItemIdle
            )}
          >
            <span className={BLOCK_EDITOR.slashTile}>
              <Glyph className={BLOCK_EDITOR.slashGlyph} aria-hidden="true" />
            </span>
            <span className={BLOCK_EDITOR.slashBody}>
              <span className={BLOCK_EDITOR.slashLabelText}>{block.label}</span>
              <span className={BLOCK_EDITOR.slashHint}>
                {block.shortcut ? `${block.description} ${block.shortcut}` : block.description}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
