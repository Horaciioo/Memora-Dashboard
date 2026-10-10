'use client'

import { useEffect, useRef } from 'react'

import { ChatComposer } from '@/composites/tour/ChatComposer'
import { useFocusTrap } from '@/core/hooks/interaction/useFocusTrap'
import { useScrollLock } from '@/core/hooks/interaction/useScrollLock'
import { useWelcomeChat } from '@/core/hooks/interaction/useWelcomeChat'
import type { IntakeAnswers } from '@/core/lib/tour/chat'
import { WELCOME_CHAT } from '@/declarations/tour/chat'
import { TOUR_COPY } from '@/declarations/tour/copy'
import { ICONS } from '@/declarations/ui/icons'
import { TOUR_CHAT } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// The admission cannot be dismissed
const STAY_OPEN = () => undefined

export interface WelcomeChatProps {
  name: string
  onDone: (answers: IntakeAnswers) => void
}

/**
 * Admission as a conversation: Memora writes, sends, then waits for the answer
 * @param {WelcomeChatProps} props - Member and exit
 * @return {JSX.Element}
 */

export const WelcomeChat = ({ name, onDone }: WelcomeChatProps) => {
  const { thread, isTyping, ask, answer } = useWelcomeChat(WELCOME_CHAT, name, onDone)
  const scroller = useRef<HTMLDivElement>(null)
  const trapRef = useFocusTrap(true, STAY_OPEN)
  useScrollLock(true)
  const Mark = ICONS.spark

  // Follow the newest message
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [thread.length, isTyping, ask])

  return (
    <div
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-label={TOUR_COPY.chatLabel}
      className={TOUR_CHAT.root}
    >
      <div className={TOUR_CHAT.column}>
        <div ref={scroller} className={TOUR_CHAT.scroll} aria-live="polite">
          {thread.map((line, index) => {
            const isMemora = line.from === 'memora'
            // One portrait per run of messages
            const showMark = isMemora && thread[index - 1]?.from !== 'memora'

            return (
              <div
                key={index}
                className={cn(TOUR_CHAT.row, isMemora ? TOUR_CHAT.rowMemora : TOUR_CHAT.rowMe)}
              >
                {isMemora && (
                  <span className={TOUR_CHAT.avatar} aria-hidden="true">
                    {showMark && <Mark className={TOUR_CHAT.avatarGlyph} />}
                  </span>
                )}
                <p
                  className={cn(
                    TOUR_CHAT.bubble,
                    isMemora ? TOUR_CHAT.bubbleMemora : TOUR_CHAT.bubbleMe
                  )}
                >
                  {line.text}
                </p>
              </div>
            )
          })}
          {isTyping && (
            <div className={cn(TOUR_CHAT.row, TOUR_CHAT.rowMemora)}>
              <span className={TOUR_CHAT.avatar} aria-hidden="true">
                {thread[thread.length - 1]?.from !== 'memora' && (
                  <Mark className={TOUR_CHAT.avatarGlyph} />
                )}
              </span>
              <span className={TOUR_CHAT.typing} role="status" aria-label={TOUR_COPY.typing}>
                {[0, 1, 2].map((dot) => (
                  <span key={dot} className={TOUR_CHAT.typingDot} />
                ))}
              </span>
            </div>
          )}
        </div>

        {ask && <ChatComposer key={ask} ask={ask} onAnswer={answer} />}
      </div>
    </div>
  )
}
