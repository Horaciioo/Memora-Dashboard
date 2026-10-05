'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

import { EditableLine } from '@/components/elements/forms/editor/EditableLine'
import { FormatBar } from '@/components/elements/forms/editor/FormatBar'
import { SlashMenu } from '@/components/elements/forms/editor/SlashMenu'
import { EDITOR_COPY, FORM_COPY } from '@/declarations/ui/copy/forms'
import { SLASH_COMMANDS } from '@/declarations/ui/editor'
import type { SlashCommand } from '@/declarations/ui/editor'
import { BLOCK_EDITOR } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import {
  createBlock,
  parseBlocks,
  readShortcut,
  serializeBlocks,
} from '@/utils/editor/markdownBlocks'
import type { EditorBlock, EditorBlockKind } from '@/utils/editor/markdownBlocks'
import { isCaretAt, placeCaret, placeCaretAt, splitAtCaret } from '@/utils/editor/markdownLine'

export interface MarkdownEditorProps {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  invalid?: boolean
}

// Kinds a new line keeps
const CONTINUED = new Set<EditorBlockKind>(['bullet', 'numbered', 'quote'])

// Shortcut typed at line start
const SHORTCUT_PATTERN = /^(#{1,3}|[-*]|\d+[.)]|>)\s$/

/**
 * Pending caret placement
 * @typedef {Object} FocusTarget
 * @property {string} id - Block key
 * @property {'start' | 'end' | number} at - Edge or offset
 */

interface FocusTarget {
  id: string
  at: 'start' | 'end' | number
}

/**
 * Slash menu state
 * @typedef {Object} SlashState
 * @property {string} blockId - Block typed in
 * @property {string} query - Filter words
 * @property {DOMRect} rect - Caret box
 * @property {number} index - Lit command
 */

interface SlashState {
  blockId: string
  query: string
  rect: DOMRect
  index: number
}

/**
 * Commands matching a query
 * @param {string} query - Typed words
 * @return {SlashCommand[]} - Matches
 */

const filterCommands = (query: string): SlashCommand[] => {
  const needle = query.trim().toLowerCase()
  if (!needle) return SLASH_COMMANDS

  return SLASH_COMMANDS.filter(
    (command) =>
      command.label.toLowerCase().includes(needle) ||
      command.keywords.some((word) => word.includes(needle))
  )
}

/**
 * Notion-like markdown editor
 * @param {string} id - Editor identifier
 * @param {string} value - Stored markdown
 * @param {(value: string) => void} onChange - Markdown handler
 * @param {string} [placeholder] - Empty hint
 * @param {number} [maxLength] - Longest markdown
 * @param {boolean} [invalid] - Rejection border
 * @return {JSX.Element}
 */

export const MarkdownEditor = ({
  id,
  value,
  onChange,
  placeholder,
  maxLength,
  invalid,
}: MarkdownEditorProps) => {
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => parseBlocks(value))
  const [slash, setSlash] = useState<SlashState | null>(null)
  const [format, setFormat] = useState<{ rect: DOMRect; line: HTMLElement } | null>(null)
  const lines = useRef(new Map<string, HTMLDivElement>())
  const pendingFocus = useRef<FocusTarget | null>(null)
  const lastSent = useRef(value)

  // Outside value replaces blocks
  useEffect(() => {
    if (value === lastSent.current) return

    lastSent.current = value
    setBlocks(parseBlocks(value))
  }, [value])

  // Caret after re-render
  useLayoutEffect(() => {
    const target = pendingFocus.current
    if (!target) return

    const line = lines.current.get(target.id)
    if (!line) return

    pendingFocus.current = null
    if (typeof target.at === 'number') placeCaretAt(line, target.at)
    else placeCaret(line, target.at)
  })

  // Every edit goes up
  const commit = useCallback(
    (next: EditorBlock[], focus?: FocusTarget) => {
      if (focus) pendingFocus.current = focus
      setBlocks(next)

      const markdown = serializeBlocks(next)
      lastSent.current = markdown
      onChange(markdown)
    },
    [onChange]
  )

  const indexOf = (blockId: string) => blocks.findIndex((block) => block.id === blockId)

  const updateText = (blockId: string, text: string) => {
    const index = indexOf(blockId)
    const block = blocks[index]
    if (!block) return

    // Markdown shortcut at line start
    if (block.kind === 'paragraph' && SHORTCUT_PATTERN.test(text)) {
      const { kind } = readShortcut(`${text}x`)
      commit(
        blocks.map((row) => (row.id === blockId ? { ...row, kind, text: '' } : row)),
        { id: blockId, at: 'start' }
      )
      return
    }

    // Rule or code fence
    if (block.kind === 'paragraph' && (text === '---' || text === '```')) {
      const kind: EditorBlockKind = text === '---' ? 'rule' : 'code'
      const follower = createBlock('paragraph')
      const replaced = { ...block, kind, text: '' }
      const next = [
        ...blocks.slice(0, index),
        replaced,
        ...(kind === 'rule' ? [follower] : []),
        ...blocks.slice(index + 1),
      ]
      commit(next, { id: kind === 'rule' ? follower.id : block.id, at: 'start' })
      return
    }

    commit(blocks.map((row) => (row.id === blockId ? { ...row, text } : row)))
  }

  const pick = (command: SlashCommand) => {
    if (!slash) return

    const index = indexOf(slash.blockId)
    const block = blocks[index]
    setSlash(null)
    if (!block) return

    // Typed slash removed
    const marker = `/${slash.query}`
    const cut = block.text.lastIndexOf(marker)
    const rest = (
      cut >= 0 ? block.text.slice(0, cut) + block.text.slice(cut + marker.length) : block.text
    ).trim()

    // Empty line converts
    if (rest.length === 0) {
      const converted = { ...block, kind: command.kind, text: '' }
      const follower = createBlock('paragraph')
      const next =
        command.kind === 'rule'
          ? [...blocks.slice(0, index), converted, follower, ...blocks.slice(index + 1)]
          : blocks.map((row) => (row.id === block.id ? converted : row))
      commit(next, { id: command.kind === 'rule' ? follower.id : block.id, at: 'start' })
      return
    }

    const added = createBlock(command.kind)
    const trailing = command.kind === 'rule' ? [createBlock('paragraph')] : []
    const next = [
      ...blocks.slice(0, index),
      { ...block, text: rest },
      added,
      ...trailing,
      ...blocks.slice(index + 1),
    ]
    commit(next, { id: trailing[0]?.id ?? added.id, at: 'start' })
  }

  // Slash menu keys
  const slashKey = (event: KeyboardEvent<HTMLDivElement>, blockId: string): boolean => {
    if (slash?.blockId !== blockId) return false

    const commands = filterCommands(slash.query)
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      const count = Math.max(commands.length, 1)
      setSlash({ ...slash, index: (slash.index + step + count) % count })
      return true
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      const command = commands[slash.index]
      if (command) pick(command)
      return true
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      setSlash(null)
      return true
    }

    return false
  }

  // Enter splits or exits
  const enterKey = (
    event: KeyboardEvent<HTMLDivElement>,
    line: HTMLDivElement,
    index: number
  ): boolean => {
    const block = blocks[index]
    if (!block || event.key !== 'Enter') return false

    // Shift leaves a code block
    if (block.kind === 'code') {
      if (!event.shiftKey) return false
      event.preventDefault()
      const added = createBlock('paragraph')
      commit([...blocks.slice(0, index + 1), added, ...blocks.slice(index + 1)], {
        id: added.id,
        at: 'start',
      })
      return true
    }
    if (event.shiftKey) return false
    event.preventDefault()

    // Empty item leaves the list
    if (CONTINUED.has(block.kind) && block.text.length === 0) {
      commit(
        blocks.map((row) => (row.id === block.id ? { ...row, kind: 'paragraph' } : row)),
        { id: block.id, at: 'start' }
      )
      return true
    }

    const [head, tail] = splitAtCaret(line, true)
    const added = createBlock(CONTINUED.has(block.kind) ? block.kind : 'paragraph', tail)
    commit(
      [...blocks.slice(0, index), { ...block, text: head }, added, ...blocks.slice(index + 1)],
      { id: added.id, at: 'start' }
    )
    return true
  }

  // Backspace unwraps or merges
  const backspaceKey = (
    event: KeyboardEvent<HTMLDivElement>,
    line: HTMLDivElement,
    index: number
  ): boolean => {
    const block = blocks[index]
    const isAtStart = isCaretAt(line, 'start') && window.getSelection()?.isCollapsed
    if (!block || event.key !== 'Backspace' || !isAtStart) return false

    if (block.kind !== 'paragraph') {
      event.preventDefault()
      commit(
        blocks.map((row) => (row.id === block.id ? { ...row, kind: 'paragraph' } : row)),
        { id: block.id, at: 'start' }
      )
      return true
    }

    const previous = blocks[index - 1]
    if (!previous) return false
    event.preventDefault()

    // Rule before is dropped
    if (previous.kind === 'rule') {
      commit(
        blocks.filter((row) => row.id !== previous.id),
        { id: block.id, at: 'start' }
      )
      return true
    }

    const offset = lines.current.get(previous.id)?.textContent?.length ?? 0
    const merged = { ...previous, text: previous.text + block.text }
    commit(
      blocks.flatMap((row) => {
        if (row.id === block.id) return []
        return row.id === previous.id ? [merged] : [row]
      }),
      { id: previous.id, at: offset }
    )
    return true
  }

  // Arrows walk blocks
  const arrowKey = (
    event: KeyboardEvent<HTMLDivElement>,
    line: HTMLDivElement,
    index: number
  ): boolean => {
    const isUp = event.key === 'ArrowUp'
    if (!isUp && event.key !== 'ArrowDown') return false
    if (!isCaretAt(line, isUp ? 'start' : 'end')) return false

    const candidates = isUp ? blocks.slice(0, index).reverse() : blocks.slice(index + 1)
    const target = candidates.find((row) => row.kind !== 'rule')
    const node = target ? lines.current.get(target.id) : undefined
    if (!node) return false

    event.preventDefault()
    placeCaret(node, isUp ? 'end' : 'start')
    return true
  }

  const handleKey =
    (blockId: string) =>
    (event: KeyboardEvent<HTMLDivElement>, line: HTMLDivElement): boolean => {
      const index = indexOf(blockId)
      if (index === -1) return false

      return (
        slashKey(event, blockId) ||
        enterKey(event, line, index) ||
        backspaceKey(event, line, index) ||
        arrowKey(event, line, index)
      )
    }

  const pasteLines = (blockId: string) => (text: string) => {
    const index = indexOf(blockId)
    const pasted = parseBlocks(text)
    const block = blocks[index]
    if (!block) return

    // Empty line is replaced
    const keep = block.text.length > 0 ? [block] : []
    const next = [...blocks.slice(0, index), ...keep, ...pasted, ...blocks.slice(index + 1)]
    commit(next, { id: pasted.at(-1)?.id ?? blockId, at: 'end' })
  }

  const removeRule = (blockId: string) => {
    const index = indexOf(blockId)
    const neighbour = blocks[index + 1] ?? blocks[index - 1]
    const next = blocks.filter((row) => row.id !== blockId)
    commit(
      next.length > 0 ? next : [createBlock('paragraph')],
      neighbour ? { id: neighbour.id, at: 'start' } : undefined
    )
  }

  // Selection opens the format bar
  const readSelection = () => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      setFormat(null)
      return
    }

    const range = selection.getRangeAt(0)
    const holder = range.commonAncestorContainer
    const line = (
      holder instanceof HTMLElement ? holder : holder.parentElement
    )?.closest<HTMLElement>('[data-rich-line]')
    setFormat(line ? { rect: range.getBoundingClientRect(), line } : null)
  }

  const markdownLength = serializeBlocks(blocks).length
  const commands = slash ? filterCommands(slash.query) : []
  // Running number per item
  const numbers = blocks.reduce<number[]>((acc, block, index) => {
    const previous = index > 0 ? (acc[index - 1] ?? 0) : 0
    acc.push(block.kind === 'numbered' ? previous + 1 : 0)
    return acc
  }, [])

  return (
    <div
      id={id}
      className={cn(BLOCK_EDITOR.frame, invalid && BLOCK_EDITOR.frameInvalid)}
      onMouseUp={readSelection}
      onKeyUp={readSelection}
      onBlur={() => setFormat(null)}
    >
      <div className={BLOCK_EDITOR.page}>
        {blocks.map((block, index) => {
          if (block.kind === 'rule') {
            return (
              <button
                key={block.id}
                type="button"
                aria-label={EDITOR_COPY.rule}
                className={BLOCK_EDITOR.rule}
                onKeyDown={(event) => {
                  if (event.key === 'Backspace' || event.key === 'Delete') removeRule(block.id)
                }}
              >
                <hr className={BLOCK_EDITOR.ruleLine} />
              </button>
            )
          }

          return (
            <div
              key={block.id}
              className={cn(BLOCK_EDITOR.row, BLOCK_EDITOR.kinds[block.kind])}
              data-rich-line={block.kind === 'code' ? undefined : true}
            >
              {block.kind === 'bullet' && (
                <span className={BLOCK_EDITOR.bullet} aria-hidden="true" />
              )}
              {block.kind === 'numbered' && (
                <span
                  className={BLOCK_EDITOR.number}
                  aria-hidden="true"
                >{`${numbers[index]}.`}</span>
              )}
              <EditableLine
                value={block.text}
                isRich={block.kind !== 'code'}
                placeholder={(blocks.length === 1 && placeholder) || EDITOR_COPY.placeholder}
                className={BLOCK_EDITOR.lineKinds[block.kind]}
                onChange={(text) => updateText(block.id, text)}
                onKeyCommand={handleKey(block.id)}
                onSlash={(query, rect) =>
                  setSlash(
                    query === null || !rect ? null : { blockId: block.id, query, rect, index: 0 }
                  )
                }
                onPasteLines={pasteLines(block.id)}
                lineRef={(node) => {
                  if (node) lines.current.set(block.id, node)
                  else lines.current.delete(block.id)
                }}
              />
            </div>
          )
        })}
      </div>

      {maxLength !== undefined && markdownLength > maxLength && (
        <div className={BLOCK_EDITOR.footer}>
          <span className={BLOCK_EDITOR.footerOver}>{FORM_COPY.tooLong}</span>
        </div>
      )}

      {slash && (
        <SlashMenu
          commands={commands}
          activeIndex={Math.min(slash.index, Math.max(commands.length - 1, 0))}
          rect={slash.rect}
          onPick={pick}
          onHover={(index) => setSlash({ ...slash, index })}
        />
      )}

      {format && !slash && <FormatBar rect={format.rect} line={format.line} />}
    </div>
  )
}
