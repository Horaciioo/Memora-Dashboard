'use client'

import type { Editor } from '@tiptap/core'
import { NodeSelection } from '@tiptap/pm/state'

import { PAGE_FORMAT_MARKS } from '@/declarations/pages/editor'
import { PAGE_EDITOR_COPY } from '@/declarations/pages/copy'
import { ICONS } from '@/declarations/ui/icons'
import { BLOCK_EDITOR, PAGE_EDITOR_UI } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PageFormatBarProps {
  editor: Editor
  onLink: () => void
}

/**
 * Marks over the selected text
 * @param {Editor} editor - Editor
 * @param {() => void} onLink - Asks for an address
 * @return {JSX.Element | null}
 */

export const PageFormatBar = ({ editor, onLink }: PageFormatBarProps) => {
  const { from, to, empty } = editor.state.selection
  if (empty || editor.isActive('codeBlock') || editor.state.selection instanceof NodeSelection)
    return null

  const start = editor.view.coordsAtPos(from)
  const end = editor.view.coordsAtPos(to)
  const LinkIcon = ICONS.link

  return (
    <div
      role="toolbar"
      aria-label={PAGE_EDITOR_COPY.formatLabel}
      className={BLOCK_EDITOR.formatBar}
      style={{
        left: (start.left + end.right) / 2,
        top: Math.max(BLOCK_EDITOR.menuGapPx, start.top - BLOCK_EDITOR.formatBarHeightPx),
      }}
      onMouseDown={(event) => event.preventDefault()}
    >
      {PAGE_FORMAT_MARKS.map((mark) => {
        const Glyph = ICONS[mark.icon]

        return (
          <button
            key={mark.name}
            type="button"
            aria-label={mark.label}
            aria-pressed={editor.isActive(mark.name)}
            title={mark.label}
            className={cn(
              BLOCK_EDITOR.formatButton,
              editor.isActive(mark.name) && PAGE_EDITOR_UI.formatActive
            )}
            onClick={() => editor.chain().focus().toggleMark(mark.name).run()}
          >
            <Glyph className={BLOCK_EDITOR.formatGlyph} aria-hidden="true" />
          </button>
        )
      })}
      <button
        type="button"
        aria-label={PAGE_EDITOR_COPY.linkLabel}
        aria-pressed={editor.isActive('link')}
        title={PAGE_EDITOR_COPY.linkLabel}
        className={cn(
          BLOCK_EDITOR.formatButton,
          editor.isActive('link') && PAGE_EDITOR_UI.formatActive
        )}
        onClick={onLink}
      >
        <LinkIcon className={BLOCK_EDITOR.formatGlyph} aria-hidden="true" />
      </button>
    </div>
  )
}
