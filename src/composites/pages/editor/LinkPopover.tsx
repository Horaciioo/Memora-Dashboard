'use client'

import { useState } from 'react'
import type { Editor } from '@tiptap/core'

import { normalizeHref } from '@/core/lib/pages'
import { PAGE_EDITOR_COPY } from '@/declarations/pages/copy'
import { BLOCK_EDITOR, PAGE_EDITOR_UI } from '@/declarations/ui/variants'

export interface LinkPopoverProps {
  editor: Editor
  onClose: () => void
}

/**
 * Address field for a link on the selection or at the caret
 * @param {Editor} editor - Editor
 * @param {() => void} onClose - Closes the field
 * @return {JSX.Element}
 */

export const LinkPopover = ({ editor, onClose }: LinkPopoverProps) => {
  const [value, setValue] = useState(String(editor.getAttributes('link').href ?? ''))
  const [isInvalid, setInvalid] = useState(false)
  const { from, to, empty } = editor.state.selection
  const caret = editor.view.coordsAtPos(from)

  const apply = () => {
    // Empty field removes the link
    if (!value.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return onClose()
    }

    const href = normalizeHref(value)
    if (!href) return setInvalid(true)

    const chain = editor.chain().focus()
    if (empty) chain.insertContent({ type: 'text', text: href, marks: [{ type: 'link', attrs: { href } }] }).run()
    else chain.setTextSelection({ from, to }).extendMarkRange('link').setLink({ href }).run()
    onClose()
  }

  return (
    <div className={PAGE_EDITOR_UI.linkPopover} style={{ left: caret.left, top: caret.bottom + BLOCK_EDITOR.menuGapPx }}>
      <label className={PAGE_EDITOR_UI.linkLabel} htmlFor="page-link-input">
        {PAGE_EDITOR_COPY.linkPrompt}
      </label>
      <input
        id="page-link-input"
        ref={(node) => node?.focus()}
        value={value}
        inputMode="url"
        aria-invalid={isInvalid}
        aria-describedby={isInvalid ? 'page-link-error' : undefined}
        className={PAGE_EDITOR_UI.linkInput}
        onChange={(event) => {
          setValue(event.target.value)
          setInvalid(false)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            apply()
          }
          if (event.key === 'Escape') onClose()
        }}
        onBlur={onClose}
      />
      {isInvalid && (
        <p id="page-link-error" role="alert" className={PAGE_EDITOR_UI.linkError}>
          {PAGE_EDITOR_COPY.linkInvalid}
        </p>
      )}
    </div>
  )
}
