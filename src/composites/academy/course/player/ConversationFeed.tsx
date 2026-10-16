'use client'

import { useEffect, useRef, useState } from 'react'

import { Markdown } from '@/components/elements/display/Markdown'
import { CONVERSATION_ROLES } from '@/declarations/academy/conversation'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type { ConversationLine } from '@/declarations/academy/curriculum/types'
import { COURSE_CHAT, COURSE_CONVERSATION, COURSE_TONE_TEXT } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface ConversationFeedProps {
  lines: ConversationLine[]
  // Bubbles on screen
  shown: number
}

/**
 * Handover as chat bubbles, scrolling up as new ones arrive
 * @param {ConversationFeedProps} props - Lines
 * @return {JSX.Element}
 */

export const ConversationFeed = ({ lines, shown }: ConversationFeedProps) => {
  const scroller = useRef<HTMLDivElement>(null)
  const [isScrolled, setScrolled] = useState(false)

  // Follow the newest bubble
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [shown])

  return (
    <div className={cn(COURSE_CONVERSATION.column, isScrolled && COURSE_CONVERSATION.columnFaded)}>
      <div
        ref={scroller}
        className={COURSE_CONVERSATION.scroll}
        onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 8)}
      >
        <ol className={COURSE_CONVERSATION.list} aria-live="polite">
          {lines.slice(0, shown).map((line, index) => {
            const speaker = CONVERSATION_ROLES[line.from]
            const listener = CONVERSATION_ROLES[line.to]

            return (
              <li key={index} className={cn(COURSE_CONVERSATION.line, COURSE_CHAT.lineIn)}>
                <p className={COURSE_CONVERSATION.label}>
                  <span className={COURSE_TONE_TEXT[speaker.tone]}>{speaker.label}</span>{' '}
                  {COURSE_COPY.conversationTo}{' '}
                  <span className={COURSE_TONE_TEXT[listener.tone]}>{listener.label}</span>
                </p>
                <div className={COURSE_CONVERSATION.bubble}>
                  <Markdown source={line.text} />
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
