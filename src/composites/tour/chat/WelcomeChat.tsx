'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

import { MemoraMark } from '@/components/elements/display/marks/MemoraMark'
import { ChatComposer } from '@/composites/tour/chat/ChatComposer'
import { ChatBar } from '@/composites/tour/chat/ChatBar'
import { ChatPanel } from '@/composites/tour/chat/ChatPanel'
import { WelcomeTimeline } from '@/composites/tour/WelcomeTimeline'
import { useFocusTrap } from '@/core/hooks/interaction/layout/useFocusTrap'
import { useScrollLock } from '@/core/hooks/interaction/layout/useScrollLock'
import { useWelcomeChat } from '@/core/hooks/interaction/scenes/useWelcomeChat'
import type { IntakeAnswers } from '@/core/lib/tour/chat'
import { TOUR_SETTINGS } from '@/declarations/configurations/settings'
import { WELCOME_CHAT } from '@/declarations/tour/chat'
import type { ChatStage } from '@/declarations/tour/chat'
import { TOUR_COPY, TOUR_STAGES } from '@/declarations/tour/copy'
import { TOUR_CHAT } from '@/declarations/ui/variants'
import type { FieldDefinition } from '@/types/forms'
import type { TourCreator } from '@/types/tour'

// The admission cannot be dismissed
const STAY_OPEN = () => undefined

// Geometry of the portrait and of the window, as the page frame does it
const STAGE_VARS = {
  '--tour-inset': `${TOUR_SETTINGS.paneInsetPx}px`,
  '--tour-photo': `calc((100vw - ${TOUR_SETTINGS.paneInsetPx * 3}px) * ${TOUR_SETTINGS.photoSharePercent / 100})`,
} as CSSProperties

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
  const trapRef = useFocusTrap(true, STAY_OPEN)
  const [isReady, setReady] = useState(false)
  // A done part a member went back to read, forgotten once the talk moves on
  const [looking, setLooking] = useState<{ from: ChatStage; index: number } | null>(null)
  const markReady = useCallback(() => setReady(true), [])
  useScrollLock(true)

  // The banner suits the tall frame, the logo only stands in without one
  const portrait = creator?.bannerUrl ?? creator?.avatarUrl ?? null

  const current = TOUR_STAGES.findIndex((step) => step.key === stage)
  const shown = looking?.from === stage ? looking.index : current

  // Follow the newest message
  useEffect(() => {
    follow.current?.scrollTo({ top: follow.current.scrollHeight, behavior: 'smooth' })
  }, [thread.length, isTyping, ask, stage])

  return (
    <div
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-label={TOUR_COPY.chatLabel}
      className={TOUR_CHAT.root}
      style={STAGE_VARS}
    >
      <figure className={TOUR_CHAT.figure}>
        {portrait ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={portrait} alt="" className={TOUR_CHAT.figureImage} />
            <span className={TOUR_CHAT.figureShade} aria-hidden="true" />
          </>
        ) : (
          <span className={TOUR_CHAT.figureFallback} aria-hidden="true">
            <MemoraMark className={TOUR_CHAT.figureGlyph} />
          </span>
        )}
        {creator && <figcaption className={TOUR_CHAT.figureName}>{creator.name}</figcaption>}
      </figure>

      <div className={TOUR_CHAT.tabRail} aria-hidden="true">
        <p className={TOUR_CHAT.tab}>
          {[...TOUR_COPY.tabTitle].map((letter, index) => (
            <span key={index} className={TOUR_CHAT.tabLetter}>
              {letter}
            </span>
          ))}
        </p>
      </div>

      <div className={TOUR_CHAT.window}>
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
      </div>
    </div>
  )
}
