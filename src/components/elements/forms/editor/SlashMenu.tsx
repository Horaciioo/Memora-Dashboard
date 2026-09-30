'use client'

import { EDITOR_COPY } from '@/declarations/ui/copy/forms'
import type { SlashCommand } from '@/declarations/ui/editor'
import { ICONS } from '@/declarations/ui/icons'
import { BLOCK_EDITOR } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface SlashMenuProps {
  commands: SlashCommand[]
  activeIndex: number
  // Caret box
  rect: DOMRect
  onPick: (command: SlashCommand) => void
  onHover: (index: number) => void
}

/**
 * Block menu above the caret
 * @param {SlashMenuProps} props - Commands and handlers
 * @return {JSX.Element}
 */

export const SlashMenu = ({ commands, activeIndex, rect, onPick, onHover }: SlashMenuProps) => (
  <div
    role="listbox"
    aria-label={EDITOR_COPY.slashLabel}
    className={BLOCK_EDITOR.slashPanel}
    style={{ left: rect.left, bottom: window.innerHeight - rect.top + BLOCK_EDITOR.menuGapPx }}
    // Caret stays put
    onMouseDown={(event) => event.preventDefault()}
  >
    {commands.length === 0 && <p className={BLOCK_EDITOR.slashEmpty}>{EDITOR_COPY.slashEmpty}</p>}

    {commands.map((command, index) => {
      const isActive = index === activeIndex
      const Glyph = ICONS[command.icon]

      return (
        <button
          key={command.kind}
          type="button"
          role="option"
          aria-selected={isActive}
          ref={(node) => {
            if (isActive) node?.scrollIntoView({ block: 'nearest' })
          }}
          onMouseEnter={() => onHover(index)}
          onClick={() => onPick(command)}
          className={cn(
            BLOCK_EDITOR.slashItem,
            isActive ? BLOCK_EDITOR.slashItemActive : BLOCK_EDITOR.slashItemIdle
          )}
        >
          <span className={BLOCK_EDITOR.slashTile}>
            <Glyph className={BLOCK_EDITOR.slashGlyph} aria-hidden="true" />
          </span>
          <span className={BLOCK_EDITOR.slashBody}>
            <span className={BLOCK_EDITOR.slashLabelText}>{command.label}</span>
            <span className={BLOCK_EDITOR.slashHint}>{command.description}</span>
          </span>
        </button>
      )
    })}
  </div>
)
