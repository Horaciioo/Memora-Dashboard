'use client'

import type { ReactNode } from 'react'

import { MentionText } from '@/components/elements/display/MentionText'
import { BrainMark } from '@/components/elements/display/marks/BrainMark'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { ASSISTANT_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface MemoraTurnProps {
  text: string
  // Same speaker as the line above: no portrait, no name
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

export const MemoraTurn = ({ text, isFollow, children }: MemoraTurnProps) => (
  <div className={cn(ASSISTANT_STYLES.memora, !isFollow && ASSISTANT_STYLES.groupBreak)}>
    <span className={ASSISTANT_STYLES.avatar}>
      {!isFollow && <BrainMark motion="idle" className={ASSISTANT_STYLES.avatarMark} />}
    </span>
    <div className={ASSISTANT_STYLES.body}>
      {!isFollow && <span className={ASSISTANT_STYLES.author}>{ASSISTANT_COPY.name}</span>}
      <p className={ASSISTANT_STYLES.line}>
        <MentionText text={text} />
      </p>
      {children}
    </div>
  </div>
)
