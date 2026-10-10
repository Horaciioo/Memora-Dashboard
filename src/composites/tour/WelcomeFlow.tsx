'use client'

import { useCallback, useState } from 'react'

import { WelcomeChat } from '@/composites/tour/WelcomeChat'
import { WelcomeDeck } from '@/composites/tour/WelcomeDeck'
import { useMutation } from '@/core/hooks/data/useMutation'
import { apiPatch } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { IntakeAnswers } from '@/core/lib/tour/chat'
import { useTour } from '@/managers/front-end/TourManager'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'

/**
 * First connection: the admission chat, then the presentation
 * @return {JSX.Element}
 */

export const WelcomeFlow = () => {
  const { session } = useAuthContext()
  const { finishIntro } = useTour()
  const { run } = useMutation()
  const [isChatDone, setChatDone] = useState(false)

  // Answers go to the account before the presentation starts
  const save = useCallback(
    async (answers: IntakeAnswers) => {
      if (Object.keys(answers).length > 0) {
        await run(() => apiPatch(API_ROUTES.tourIntake, answers))
      }

      setChatDone(true)
    },
    [run]
  )

  if (isChatDone) return <WelcomeDeck onFinish={finishIntro} />

  return <WelcomeChat name={session?.displayName ?? ''} onDone={save} />
}
