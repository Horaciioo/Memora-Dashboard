'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { ChatComposer } from '@/composites/tour/chat/ChatComposer'
import { ChatBar } from '@/composites/tour/chat/ChatBar'
import { ChatPanel } from '@/composites/tour/chat/ChatPanel'
import { TourFrame } from '@/composites/tour/TourFrame'
import { WelcomeTimeline } from '@/composites/tour/WelcomeTimeline'
import { useWelcomeChat } from '@/core/hooks/interaction/scenes/useWelcomeChat'
import type { IntakeAnswers } from '@/core/lib/tour/chat'
import { WELCOME_CHAT } from '@/declarations/tour/chat'
import type { ChatStage } from '@/declarations/tour/chat'
import { TOUR_COPY, TOUR_STAGES } from '@/declarations/tour/copy'
import { TOUR_CHAT } from '@/declarations/ui/variants'
import type { FieldDefinition } from '@/types/forms'
import type { TourCreator } from '@/types/tour'

export interface WelcomeChatProps {
  name: string
  avatarUrl: string | null
  creator: TourCreator | null
  socialFields: FieldDefinition[]
  onDone: (answers: IntakeAnswers) => void
}

/**
 * Welcome as one conversation: the creator's portrait on the left, Memora talking on the right, every question asked in the thread
 * @param {WelcomeChatProps} props - Member, creator and exit
 * @return {JSX.Element}
 */

export const WelcomeChat = ({
  name,
  avatarUrl,
  creator,
  socialFields,
  onDone,
}: WelcomeChatProps) => {
  const { thread, isTyping, ask, stage, draft, holdMs, answer } = useWelcomeChat(
    WELCOME_CHAT,
    { name, creator: creator?.name ?? null },
    onDone
  )
  const follow = useRef<HTMLDivElement>(null)
  const [isReady, setReady] = useState(false)
  // A done part a member went back to read, forgotten once the talk moves on
  const [looking, setLooking] = useState<{ from: ChatStage; index: number } | null>(null)
  const markReady = useCallback(() => setReady(true), [])

  const current = TOUR_STAGES.findIndex((step) => step.key === stage)
  const shown = looking?.from === stage ? looking.index : current

  // Follow the newest message
  useEffect(() => {
    follow.current?.scrollTo({ top: follow.current.scrollHeight, behavior: 'smooth' })
  }, [thread.length, isTyping, ask, stage])

  return (
    <TourFrame label={TOUR_COPY.chatLabel} tabTitle={TOUR_COPY.tabTitle} creator={creator}>
      <WelcomeTimeline
        current={current}
        shown={shown}
        onShow={(index) => setLooking({ from: stage, index })}
      />

      {/* Each part is its own conversation, the next one slides in from the right */}
      <div className={TOUR_CHAT.viewport}>
        <div
          className={TOUR_CHAT.track}
          style={{
            transform: `translateX(-${(shown * 100) / TOUR_STAGES.length}%)`,
            width: `${TOUR_STAGES.length * 100}%`,
          }}
        >
          {TOUR_STAGES.map((step, index) => (
            <ChatPanel
              key={step.key}
              lines={thread.filter((line) => line.stage === step.key)}
              name={name}
              avatarUrl={avatarUrl}
              isTyping={isTyping && index === current}
              isHidden={index !== shown}
              scrollRef={index === current ? follow : undefined}
              onReady={markReady}
            >
              {ask && index === current && (
                <ChatComposer
                  key={ask}
                  ask={ask}
                  socialFields={socialFields}
                  isLocked={ask === 'ready' && !isReady}
                  onAnswer={answer}
                />
              )}
            </ChatPanel>
          ))}
        </div>
      </div>

      <ChatBar
        draft={draft}
        holdMs={holdMs}
        ask={ask}
        onSend={(text) => answer(text, { written: true })}
      />
    </TourFrame>
  )
}
