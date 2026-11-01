'use client'

import type { ReactNode } from 'react'

import { BrainMark } from '@/components/elements/display/marks/BrainMark'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { ASSISTANT_STYLES } from '@/declarations/ui/variants'

export interface MemoraTurnProps {
  text: string
  children?: ReactNode
}

/**
 * One line from Memora
 * @param {string} text - Line shown
 * @param {ReactNode} [children] - Details and answers
 * @return {JSX.Element}
 */

export const MemoraTurn = ({ text, children }: MemoraTurnProps) => (
  <div className={ASSISTANT_STYLES.memora}>
    <span className={ASSISTANT_STYLES.avatar}>
      <BrainMark motion="idle" className={ASSISTANT_STYLES.avatarMark} />
    </span>
    <div className={ASSISTANT_STYLES.body}>
      <span className={ASSISTANT_STYLES.author}>{ASSISTANT_COPY.name}</span>
      <p className={ASSISTANT_STYLES.line}>{text}</p>
      {children}
    </div>
  </div>
)
