'use client'

import { EDITOR_COPY } from '@/declarations/ui/copy/forms'
import { FORMAT_MARKS } from '@/declarations/ui/editor'
import { ICONS } from '@/declarations/ui/icons'
import { BLOCK_EDITOR } from '@/declarations/ui/variants'

export interface FormatBarProps {
  // Selection box
  rect: DOMRect
  // Line to resync
  line: HTMLElement
}

/**
 * Marks over a selection
 * @param {DOMRect} rect - Selection box
 * @param {HTMLElement} line - Holding line
 * @return {JSX.Element}
 */

export const FormatBar = ({ rect, line }: FormatBarProps) => (
  <div
    role="toolbar"
    aria-label={EDITOR_COPY.formatLabel}
    className={BLOCK_EDITOR.formatBar}
    style={{
      left: rect.left + rect.width / 2,
      top: Math.max(BLOCK_EDITOR.menuGapPx, rect.top - BLOCK_EDITOR.formatBarHeightPx),
    }}
    // Selection stays put
    onMouseDown={(event) => event.preventDefault()}
  >
    {FORMAT_MARKS.map((mark) => {
      const Glyph = ICONS[mark.icon]

      return (
        <button
          key={mark.command}
          type="button"
          aria-label={mark.label}
          title={mark.label}
          className={BLOCK_EDITOR.formatButton}
          onClick={() => {
            document.execCommand(mark.command)
            line.dispatchEvent(new Event('input', { bubbles: true }))
          }}
        >
          <Glyph className={BLOCK_EDITOR.formatGlyph} aria-hidden="true" />
        </button>
      )
    })}
  </div>
)
