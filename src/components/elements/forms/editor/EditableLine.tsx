'use client'

import { useLayoutEffect, useRef } from 'react'
import type { ClipboardEvent, FormEvent, KeyboardEvent } from 'react'

import { BLOCK_EDITOR } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { caretRect, htmlToLine, lineToHtml, textBeforeCaret } from '@/utils/editor/markdownLine'

// Slash then a query
const SLASH_PATTERN = /(?:^|\s)\/([^/\n]{0,24})$/

// Mod shortcuts
const MARK_SHORTCUTS: Record<string, string> = {
  b: 'bold',
  i: 'italic',
  u: 'underline',
}

export interface EditableLineProps {
  value: string
  // Marks kept
  isRich: boolean
  placeholder: string
  className?: string
  onChange: (value: string) => void
  // True once handled
  onKeyCommand: (event: KeyboardEvent<HTMLDivElement>, line: HTMLDivElement) => boolean
  onSlash: (query: string | null, rect: DOMRect | null) => void
  onPasteLines: (text: string) => void
  lineRef: (node: HTMLDivElement | null) => void
}

/**
 * One editable block line
 * @param {EditableLineProps} props - Value and handlers
 * @return {JSX.Element}
 */

export const EditableLine = ({
  value,
  isRich,
  placeholder,
  className,
  onChange,
  onKeyCommand,
  onSlash,
  onPasteLines,
  lineRef,
}: EditableLineProps) => {
  const node = useRef<HTMLDivElement | null>(null)
  // Last emitted value
  const emitted = useRef<string | null>(null)

  // Outside changes only
  useLayoutEffect(() => {
    const line = node.current
    if (!line || emitted.current === value) return

    if (isRich) line.innerHTML = lineToHtml(value)
    else line.textContent = value

    emitted.current = value
  }, [value, isRich])

  const read = (line: HTMLDivElement) => {
    // Stray break blocks :empty
    if (!line.textContent) line.innerHTML = ''

    const next = isRich ? htmlToLine(line) : (line.textContent ?? '')
    emitted.current = next
    onChange(next)

    const before = textBeforeCaret(line)
    const match = before === null ? null : SLASH_PATTERN.exec(before)
    onSlash(match ? (match[1] ?? '') : null, match ? caretRect() : null)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const line = event.currentTarget
    if (onKeyCommand(event, line)) return

    const command = MARK_SHORTCUTS[event.key.toLowerCase()]
    if (!(event.metaKey || event.ctrlKey) || !command || !isRich) return

    event.preventDefault()
    document.execCommand(command)
  }

  // Several lines become blocks
  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault()
    const text = event.clipboardData.getData('text/plain')

    if (isRich && text.includes('\n')) onPasteLines(text)
    else document.execCommand('insertText', false, text)
  }

  return (
    <div
      ref={(line) => {
        node.current = line
        lineRef(line)
      }}
      role="textbox"
      aria-label={placeholder}
      aria-multiline={!isRich}
      contentEditable={isRich ? true : 'plaintext-only'}
      suppressContentEditableWarning
      spellCheck={isRich}
      data-placeholder={placeholder}
      onInput={(event: FormEvent<HTMLDivElement>) => read(event.currentTarget)}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      className={cn(BLOCK_EDITOR.line, className)}
    />
  )
}
