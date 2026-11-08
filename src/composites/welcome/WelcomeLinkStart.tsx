'use client'

import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { WelcomeStage } from '@/composites/welcome/WelcomeStage'
import { useMemoraSpeech } from '@/core/hooks/interaction/scenes/useMemoraSpeech'
import { API_ROUTES } from '@/core/lib/api/routes'
import { ROUTES } from '@/declarations/navigation'
import { WELCOME_COPY } from '@/declarations/onboarding/welcome'
import { TOUR_CHAT } from '@/declarations/ui/variants'
import type { TourCreator } from '@/types/tour'

/**
 * What the link leads to
 * @type {'ready' | 'refused' | 'dead'}
 */

export type WelcomeLinkState = 'ready' | 'refused' | 'dead'

export interface WelcomeLinkStartProps {
  token: string
  state: WelcomeLinkState
  creator: TourCreator | null
}

// What Memora says first, per state
const OPENING: Record<WelcomeLinkState, string> = {
  ready: WELCOME_COPY.linkHello,
  refused: WELCOME_COPY.linkRefused,
  dead: WELCOME_COPY.linkDead,
}

/**
 * Memora welcomes someone arriving with the link a Responsable generated
 * @param {string} token - Link token
 * @param {WelcomeLinkState} state - Link state
 * @param {TourCreator | null} creator - Creator whose face the frame shows
 * @return {JSX.Element}
 */

export const WelcomeLinkStart = ({ token, state, creator }: WelcomeLinkStartProps) => {
  const speech = useMemoraSpeech()
  const [isReady, setReady] = useState(false)
  const started = useRef(false)
  const { say } = speech

  // Says why they are here, or why it failed
  useEffect(() => {
    if (started.current) return
    started.current = true

    void say([OPENING[state]]).then(() => setReady(true))
  }, [say, state])

  const answers = isReady ? (
    <div className={TOUR_CHAT.quick}>
      {state === 'dead' ? (
        <Button className={TOUR_CHAT.chip} onClick={() => window.location.assign(ROUTES.login)}>
          {WELCOME_COPY.back}
        </Button>
      ) : (
        <Button
          variant="primary"
          icon="discord"
          className={TOUR_CHAT.chip}
          onClick={() => window.location.assign(API_ROUTES.welcomeDiscord(token))}
        >
          {WELCOME_COPY.connect}
        </Button>
      )}
    </div>
  ) : undefined

  return <WelcomeStage speech={speech} creator={creator} member={null} answers={answers} />
}
