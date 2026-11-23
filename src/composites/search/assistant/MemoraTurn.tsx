'use client'

import type { ReactNode } from 'react'

import { useWritten } from '@/core/hooks/interaction/scenes/useWritten'
import { mentionLength, mentionPrefix } from '@/utils/format/chat/mentions'
import { MentionText } from '@/components/elements/display/MentionText'
import { BrainMark } from '@/components/elements/display/marks/BrainMark'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { ASSISTANT_STYLES, FLOATING_ADD_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface MemoraTurnProps {
  text: string
  // Same speaker as the line above: no name
  isFollow?: boolean
  children?: ReactNode
}

/**
 * One line from Memora
 * @param {string} text - Line shown
 * @param {boolean} [isFollow] - Continues the previous line
 * @param {ReactNode} [children] - Details and answers
 * @return {JSX.Element}
 */

export const MemoraTurn = ({ text, isFollow, children }: MemoraTurnProps) => {
  const length = mentionLength(text)
  const written = useWritten(length)
  const isDone = written >= length

  return (
    <div className={cn(ASSISTANT_STYLES.memora, !isFollow && ASSISTANT_STYLES.groupBreak)}>
      <span className={ASSISTANT_STYLES.avatar}>
        <BrainMark motion="idle" className={ASSISTANT_STYLES.avatarMark} />
      </span>
      <div className={ASSISTANT_STYLES.body}>
        {!isFollow && <span className={ASSISTANT_STYLES.author}>{ASSISTANT_COPY.name}</span>}
        {text && (
          <p className={ASSISTANT_STYLES.line}>
            <MentionText text={mentionPrefix(text, written)} />
            {!isDone && <span className={FLOATING_ADD_STYLES.chatCaret} aria-hidden="true" />}
          </p>
        )}
        {isDone && children}
      </div>
    </div>
  )
}
