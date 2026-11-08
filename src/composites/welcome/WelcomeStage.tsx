'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

import { ChatPanel } from '@/composites/tour/chat/ChatPanel'
import { TourFrame } from '@/composites/tour/TourFrame'
import { WelcomeBar } from '@/composites/welcome/WelcomeBar'
import { WelcomeIdentity } from '@/composites/welcome/WelcomeIdentity'
import type { ThreadIdentity } from '@/composites/welcome/WelcomeIdentity'
import type { MemoraSpeech } from '@/core/hooks/interaction/scenes/useMemoraSpeech'
import { WELCOME_COPY } from '@/declarations/onboarding/welcome'
import { TOUR_CHAT } from '@/declarations/ui/variants'
import type { TourCreator } from '@/types/tour'

// Nothing to wait for here
const NOTHING = () => undefined

export interface WelcomeStageProps {
  speech: MemoraSpeech
  creator: TourCreator | null
  // The person talking to Memora
  member: ThreadIdentity | null
  // Answers waiting under the last line
  answers?: ReactNode
  // Replaces the talk once it is done
  seal?: ReactNode
  // The bar is open to the person's words
  isWriting?: boolean
  isBusy?: boolean
  onWrite?: (text: string) => void
}

/**
 * The tour's frame holding a talk with Memora: her lines, the answers under them, the bar
 * @param {WelcomeStageProps} props - Talk, creator, answers and bar
 * @return {JSX.Element}
 */

export const WelcomeStage = ({
  speech,
  creator,
  member,
  answers,
  seal,
  isWriting = false,
  isBusy = false,
  onWrite = NOTHING,
}: WelcomeStageProps) => {
  const follow = useRef<HTMLDivElement>(null)

  // Follow the newest message
  useEffect(() => {
    follow.current?.scrollTo({ top: follow.current.scrollHeight, behavior: 'smooth' })
  }, [speech.thread.length, speech.isTyping, answers])

  return (
    <TourFrame label={WELCOME_COPY.chatLabel} tabTitle={WELCOME_COPY.tabTitle} creator={creator}>
      {seal ?? (
        <>
          <div className={TOUR_CHAT.viewport}>
            <div className={TOUR_CHAT.track}>
              <ChatPanel
                lines={speech.thread}
                name={member?.name ?? ''}
                avatarUrl={member?.avatarUrl ?? null}
                isTyping={speech.isTyping}
                isHidden={false}
                scrollRef={follow}
                onReady={NOTHING}
                identity={member && <WelcomeIdentity identity={member} />}
              >
                {answers}
              </ChatPanel>
            </div>
          </div>
          <WelcomeBar isOpen={isWriting} isBusy={isBusy} onSend={onWrite} />
        </>
      )}
    </TourFrame>
  )
}
