'use client'

import { useEffect, useState } from 'react'
import type { Editor } from '@tiptap/core'

import { startBlockDrag } from '@/composites/pages/editor/blockMenu'
import { PAGE_EDITOR_COPY } from '@/declarations/pages/copy'
import { ICONS } from '@/declarations/ui/icons'
import { PAGE_EDITOR_UI } from '@/declarations/ui/variants'

export interface BlockHandleProps {
  editor: Editor
  // Positioned frame around the editor
  frame: HTMLElement | null
  onMenu: (blockId: string, origin: { x: number; y: number }) => void
  onInsertBelow: (blockId: string) => void
}

/**
 * Block an element belongs to, an item before its own paragraph
 * @param {EventTarget | null} target - Hovered element
 * @param {HTMLElement} root - Editable root
 * @return {HTMLElement | null} - Block element
 */

const hoveredBlock = (target: EventTarget | null, root: HTMLElement): HTMLElement | null => {
  const element = target instanceof Element ? target.closest<HTMLElement>('[data-id]') : null
  if (!element || !root.contains(element)) return null

  const item = element.parentElement?.closest<HTMLElement>('li[data-id]')
  return item && item.firstElementChild?.contains(element) ? item : element
}

/**
 * Hover handle beside a block: drag to move, click for its menu
 * @param {BlockHandleProps} props - Editor, frame and gestures
 * @return {JSX.Element | null}
 */

export const BlockHandle = ({ editor, frame, onMenu, onInsertBelow }: BlockHandleProps) => {
  const [block, setBlock] = useState<{ id: string; top: number } | null>(null)
  const DragIcon = ICONS.drag
  const AddIcon = ICONS.add

  // Follow the pointer over the blocks
  useEffect(() => {
    if (!frame) return
    const root = editor.view.dom

    const track = (event: MouseEvent) => {
      const element = hoveredBlock(event.target, root)
      const id = element?.dataset.id
      if (!element || !id) return
      const top = element.getBoundingClientRect().top - frame.getBoundingClientRect().top
      setBlock((current) => (current && current.id === id && current.top === top ? current : { id, top }))
    }
    const leave = () => setBlock(null)

    frame.addEventListener('mousemove', track)
    frame.addEventListener('mouseleave', leave)

    return () => {
      frame.removeEventListener('mousemove', track)
      frame.removeEventListener('mouseleave', leave)
    }
  }, [editor, frame])

  if (!block || !editor.isEditable) return null

  return (
    <div className={PAGE_EDITOR_UI.handle} style={{ top: block.top }} contentEditable={false}>
      <button
        type="button"
        aria-label={PAGE_EDITOR_COPY.insert}
        title={PAGE_EDITOR_COPY.insert}
        className={PAGE_EDITOR_UI.handleButton}
        onClick={() => onInsertBelow(block.id)}
      >
        <AddIcon className={PAGE_EDITOR_UI.handleGlyph} aria-hidden="true" />
      </button>
      <button
        type="button"
        draggable
        aria-label={PAGE_EDITOR_COPY.handleLabel}
        title={PAGE_EDITOR_COPY.handleLabel}
        className={PAGE_EDITOR_UI.handleGrip}
        onDragStart={(event) => startBlockDrag(editor, block.id, event.nativeEvent)}
        onClick={(event) => onMenu(block.id, { x: event.clientX, y: event.clientY })}
      >
        <DragIcon className={PAGE_EDITOR_UI.handleGlyph} aria-hidden="true" />
      </button>
    </div>
  )
}
