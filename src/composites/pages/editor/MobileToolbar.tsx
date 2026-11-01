'use client'

import { useEffect, useState } from 'react'
import type { Editor } from '@tiptap/core'

import { BLOCK_COMMANDS } from '@/composites/pages/editor/commands'
import type { BlockCommandContext } from '@/composites/pages/editor/commands'
import { moveCaretBlock } from '@/composites/pages/editor/extensions'
import { PAGE_BLOCKS } from '@/declarations/pages/blocks'
import { PAGE_EDITOR_COPY } from '@/declarations/pages/copy'
import { MOBILE_TOOLBAR_BLOCKS, PAGE_FORMAT_MARKS } from '@/declarations/pages/editor'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import { PAGE_EDITOR_UI } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface MobileToolbarProps {
  editor: Editor
  context: BlockCommandContext
}

/**
 * Space the on-screen keyboard takes
 * @return {number} - Pixels under the visible area
 */

const useKeyboardInset = (): number => {
  const [inset, setInset] = useState(0)

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) return

    const measure = () => setInset(Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop))
    viewport.addEventListener('resize', measure)
    viewport.addEventListener('scroll', measure)
    measure()

    return () => {
      viewport.removeEventListener('resize', measure)
      viewport.removeEventListener('scroll', measure)
    }
  }, [])

  return inset
}

/**
 * Editing bar above the phone keyboard, in place of hover gestures
 * @param {Editor} editor - Editor
 * @param {BlockCommandContext} context - Command gestures
 * @return {JSX.Element}
 */

export const MobileToolbar = ({ editor, context }: MobileToolbarProps) => {
  const inset = useKeyboardInset()
  const chain = () => editor.chain().focus()
  const markLabel = (name: string) => PAGE_FORMAT_MARKS.find((mark) => mark.name === name)?.label ?? name

  // One row of gestures
  const tools: { id: string; label: string; icon: IconName; isActive?: boolean; run: () => void }[] = [
    { id: 'insert', label: PAGE_EDITOR_COPY.insert, icon: 'add', run: () => chain().insertContent('/').run() },
    ...MOBILE_TOOLBAR_BLOCKS.map((kind) => ({
      id: kind,
      label: PAGE_BLOCKS.get(kind).label,
      icon: PAGE_BLOCKS.get(kind).icon,
      run: () => BLOCK_COMMANDS[kind](editor, context),
    })),
    { id: 'bold', label: markLabel('bold'), icon: 'bold', isActive: editor.isActive('bold'), run: () => chain().toggleBold().run() },
    { id: 'italic', label: markLabel('italic'), icon: 'italic', isActive: editor.isActive('italic'), run: () => chain().toggleItalic().run() },
    { id: 'indent', label: PAGE_EDITOR_COPY.indent, icon: 'indent', run: () => chain().sinkListItem(editor.isActive('taskItem') ? 'taskItem' : 'listItem').run() },
    { id: 'outdent', label: PAGE_EDITOR_COPY.outdent, icon: 'outdent', run: () => chain().liftListItem(editor.isActive('taskItem') ? 'taskItem' : 'listItem').run() },
    { id: 'up', label: PAGE_EDITOR_COPY.moveUp, icon: 'moveUp', run: () => moveCaretBlock(editor, -1) },
    { id: 'down', label: PAGE_EDITOR_COPY.moveDown, icon: 'moveDown', run: () => moveCaretBlock(editor, 1) },
    { id: 'undo', label: PAGE_EDITOR_COPY.undo, icon: 'undo', run: () => chain().undo().run() },
    { id: 'redo', label: PAGE_EDITOR_COPY.redo, icon: 'redo', run: () => chain().redo().run() },
  ]

  return (
    <div role="toolbar" aria-label={PAGE_EDITOR_COPY.toolbarLabel} className={PAGE_EDITOR_UI.mobileBar} style={{ bottom: inset }}>
      <div className={PAGE_EDITOR_UI.mobileTools}>
        {tools.map((tool) => {
          const Glyph = ICONS[tool.icon]

          return (
            <button
              key={tool.id}
              type="button"
              aria-label={tool.label}
              aria-pressed={tool.isActive}
              className={cn(PAGE_EDITOR_UI.mobileButton, tool.isActive && PAGE_EDITOR_UI.formatActive)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={tool.run}
            >
              <Glyph className={PAGE_EDITOR_UI.mobileGlyph} aria-hidden="true" />
            </button>
          )
        })}
      </div>
      <button
        type="button"
        className={PAGE_EDITOR_UI.mobileDone}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => editor.commands.blur()}
      >
        {PAGE_EDITOR_COPY.done}
      </button>
    </div>
  )
}
