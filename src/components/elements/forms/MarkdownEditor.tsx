'use client'

import { useRef, useState } from 'react'
import { Markdown } from '@/components/elements/display/Markdown'
import { EDITOR_COPY } from '@/declarations/ui/copy/forms'
import { ICONS, type IconName } from '@/declarations/ui/icons'
import { EDITOR_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * One toolbar button and the markers it wraps the selection in
 * @typedef {Object} EditorTool
 * @property {IconName} icon - Icon key
 * @property {string} label - Accessible label
 * @property {string} before - Inserted before the selection
 * @property {string} [after] - Inserted after the selection
 * @property {boolean} [separatorBefore] - Draws a rule before the button
 */

interface EditorTool {
  icon: IconName
  label: string
  before: string
  after?: string
  separatorBefore?: boolean
}

/**
 * Discord flavoured markers offered by the toolbar
 * @type {EditorTool[]}
 */

const TOOLS: EditorTool[] = [
  { icon: 'bold', label: EDITOR_COPY.bold, before: '**', after: '**' },
  { icon: 'italic', label: EDITOR_COPY.italic, before: '*', after: '*' },
  { icon: 'underline', label: EDITOR_COPY.underline, before: '__', after: '__' },
  { icon: 'strike', label: EDITOR_COPY.strike, before: '~~', after: '~~' },
  { icon: 'heading', label: EDITOR_COPY.heading, before: '## ', separatorBefore: true },
  { icon: 'quote', label: EDITOR_COPY.quote, before: '> ' },
  { icon: 'bulletList', label: EDITOR_COPY.list, before: '- ' },
  { icon: 'orderedList', label: EDITOR_COPY.orderedList, before: '1. ' },
  { icon: 'code', label: EDITOR_COPY.code, before: '`', after: '`', separatorBefore: true },
  { icon: 'codeBlock', label: EDITOR_COPY.codeBlock, before: '```\n', after: '\n```' },
  { icon: 'link', label: EDITOR_COPY.link, before: '[', after: '](https://)' },
  { icon: 'hidden', label: EDITOR_COPY.spoiler, before: '||', after: '||' },
]

export interface MarkdownEditorProps {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  invalid?: boolean
}

/**
 * Markdown field with a marker toolbar and a live preview of the Discord rendering
 * @param {string} id - Identifier of the textarea
 * @param {string} value - Raw markdown
 * @param {(value: string) => void} onChange - Markdown handler
 * @param {string} [placeholder] - Placeholder of the textarea
 * @param {number} [maxLength] - Longest accepted text
 * @param {boolean} [invalid] - Paints the rejection border
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
  const [isPreview, setPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const applyTool = (tool: EditorTool) => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Wrap the selection, or drop the markers at the caret
    const { selectionStart, selectionEnd } = textarea
    const selected = value.slice(selectionStart, selectionEnd)
    const after = tool.after ?? ''
    const next = `${value.slice(0, selectionStart)}${tool.before}${selected}${after}${value.slice(selectionEnd)}`

    onChange(next)

    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(
        selectionStart + tool.before.length,
        selectionStart + tool.before.length + selected.length
      )
    })
  }

  return (
    <div className={cn(EDITOR_STYLES.frame, invalid && 'border-[var(--color-danger)]')}>
      <div className={EDITOR_STYLES.toolbar}>
        {TOOLS.map((tool) => {
          const Icon = ICONS[tool.icon]

          return (
            <span key={tool.label} className="flex items-center">
              {tool.separatorBefore && <span className={EDITOR_STYLES.divider} />}
              <button
                type="button"
                title={tool.label}
                aria-label={tool.label}
                disabled={isPreview}
                className={EDITOR_STYLES.tool}
                onClick={() => applyTool(tool)}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </span>
          )
        })}
        <button
          type="button"
          onClick={() => setPreview((preview) => !preview)}
          className={cn(EDITOR_STYLES.tool, 'ml-auto w-auto gap-1.5 px-2 text-xs')}
        >
          {isPreview ? EDITOR_COPY.write : EDITOR_COPY.preview}
        </button>
      </div>
      {isPreview ? (
        value.trim().length > 0 ? (
          <Markdown source={value} className={EDITOR_STYLES.preview} />
        ) : (
          <p className={cn(EDITOR_STYLES.preview, 'text-[var(--color-ink-subtle)] italic')}>
            {EDITOR_COPY.empty}
          </p>
        )
      ) : (
        <textarea
          id={id}
          ref={textareaRef}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={EDITOR_STYLES.textarea}
        />
      )}
      <div className={EDITOR_STYLES.footer}>
        <span>{isPreview ? EDITOR_COPY.preview : EDITOR_COPY.write}</span>
        <span>
          {value.length}
          {maxLength !== undefined && ` / ${maxLength}`} {EDITOR_COPY.counter}
        </span>
      </div>
    </div>
  )
}
