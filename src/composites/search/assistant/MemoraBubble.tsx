'use client'

import { useEffect, useRef, useState } from 'react'

import { BrainMark } from '@/components/elements/display/marks/BrainMark'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import { ICONS } from '@/declarations/ui/icons'
import { ASSISTANT_BUBBLE_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface MemoraBubbleProps {
  text: string
  // Called once the bubble has grown into the page
  onEnter: () => void
}

/**
 * Memora asking, bottom centre
 * @param {string} text - One sentence
 * @param {() => void} onEnter - Arrow clicked
 * @return {JSX.Element}
 */

export const MemoraBubble = ({ text, onEnter }: MemoraBubbleProps) => {
  const ArrowGlyph = ICONS.forward
  const [isGrown, setGrown] = useState(false)
  const timer = useRef<number>(0)

  // Pending growth dies with the bubble
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const enter = () => {
    if (isGrown) return

    setGrown(true)
    timer.current = window.setTimeout(onEnter, ASSISTANT_SETTINGS.bubbleGrowMs)
  }

  return (
    <div
      role="status"
      className={cn(ASSISTANT_BUBBLE_STYLES.root, isGrown && ASSISTANT_BUBBLE_STYLES.rootGrown)}
    >
      <BrainMark motion="idle" className={ASSISTANT_BUBBLE_STYLES.mark} />
      <p className={cn(ASSISTANT_BUBBLE_STYLES.line, isGrown && ASSISTANT_BUBBLE_STYLES.lineGrown)}>
        {text}
      </p>
      <button
        type="button"
        aria-label={ASSISTANT_COPY.name}
        onClick={enter}
        className={ASSISTANT_BUBBLE_STYLES.enter}
      >
        <ArrowGlyph className={ASSISTANT_BUBBLE_STYLES.enterGlyph} aria-hidden="true" />
      </button>
    </div>
  )
}
