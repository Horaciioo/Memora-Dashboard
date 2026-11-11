'use client'

import { useState } from 'react'

import { NexusOutput } from '@/composites/nexus/NexusOutput'
import { NexusTrace } from '@/composites/nexus/NexusTrace'
import { copyText } from '@/composites/nexus/NexusOutput/format'
import { NEXUS_TERMINAL_COPY } from '@/declarations/nexus/terminal'
import { ICONS } from '@/declarations/ui/icons'
import { NEXUS_STYLES } from '@/declarations/ui/variants'
import type { NexusBlock, NexusTone } from '@/types/nexus'
import { cn } from '@/utils/classnames'

// Glyph and colour of a level
const TONES: Record<NexusTone, { icon: keyof typeof ICONS; style: string }> = {
  info: { icon: 'info', style: NEXUS_STYLES.levelInfo },
  warning: { icon: 'warning', style: NEXUS_STYLES.levelWarning },
  error: { icon: 'danger', style: NEXUS_STYLES.levelError },
  success: { icon: 'success', style: NEXUS_STYLES.levelSuccess },
}

export interface NexusBlockViewProps {
  block: NexusBlock
  onConfirm: (block: NexusBlock, retyped?: string) => void
  onCancel: (id: number) => void
  needsRetype: boolean
}

/**
 * One command and its reply
 * @param {NexusBlockViewProps} props - Block props
 * @return {JSX.Element}
 */

export const NexusBlockView = ({
  block,
  onConfirm,
  onCancel,
  needsRetype,
}: NexusBlockViewProps) => {
  const [isCopied, setCopied] = useState(false)
  const [retyped, setRetyped] = useState('')
  const tone = block.error ? TONES.error : TONES[block.reply?.level ?? 'info']
  const ToneIcon = ICONS[tone.icon]

  const copy = () => {
    if (!block.reply) return
    void navigator.clipboard
      .writeText(copyText(block.reply.output.value))
      .then(() => setCopied(true))
      .catch(() => undefined)
  }

  return (
    <article className={NEXUS_STYLES.block}>
      <div className={NEXUS_STYLES.blockHead}>
        <span className={NEXUS_STYLES.echo}>
          <span className={NEXUS_STYLES.echoMark}>{NEXUS_TERMINAL_COPY.prompt}</span>{' '}
          {block.input.replace(/^\$/, '')}
        </span>
        {block.reply && block.reply.durationMs > 0 && (
          <span className={NEXUS_STYLES.meta}>{block.reply.durationMs} ms</span>
        )}
        {block.reply && (
          <button type="button" className={NEXUS_STYLES.action} onClick={copy}>
            {isCopied ? NEXUS_TERMINAL_COPY.copied : NEXUS_TERMINAL_COPY.copy}
          </button>
        )}
      </div>
      {block.trace && <NexusTrace lines={block.trace} />}
      {block.error && (
        <p className={cn(NEXUS_STYLES.levelRow, tone.style)} role="alert">
          <ToneIcon className={NEXUS_STYLES.levelIcon} aria-hidden="true" />
          {block.error}
        </p>
      )}
      {block.reply && (
        <div className={tone.style}>
          <NexusOutput form={block.reply.output.form} value={block.reply.output.value} />
        </div>
      )}
      {block.state === 'previewed' && (
        <div className={NEXUS_STYLES.confirmRow}>
          {needsRetype && (
            <input
              className={NEXUS_STYLES.confirmInput}
              value={retyped}
              placeholder={NEXUS_TERMINAL_COPY.retype}
              aria-label={NEXUS_TERMINAL_COPY.retype}
              onChange={(event) => setRetyped(event.target.value)}
            />
          )}
          <button
            type="button"
            className={NEXUS_STYLES.actionFilled}
            disabled={needsRetype && !retyped}
            onClick={() => onConfirm(block, needsRetype ? retyped : undefined)}
          >
            {NEXUS_TERMINAL_COPY.confirm}
          </button>
          <button type="button" className={NEXUS_STYLES.action} onClick={() => onCancel(block.id)}>
            {NEXUS_TERMINAL_COPY.cancel}
          </button>
        </div>
      )}
    </article>
  )
}
