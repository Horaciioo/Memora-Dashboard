'use client'

import { useCallback } from 'react'

import { WelcomeChat } from '@/composites/tour/chat/WelcomeChat'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiPatch } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { IntakeAnswers } from '@/core/lib/tour/chat'
import { useTour } from '@/managers/front-end/TourManager'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'

// Answers that only routed the talk
const ROUTING_ANSWERS = [
  'colorBlind',
  'colorFit',
  'instagram',
  'hurdle',
  'detail',
  'examples',
  'written',
]

/**
 * First connection: one conversation with Memora, then the pages
 * @return {JSX.Element}
 */

export const WelcomeFlow = () => {
  const { session } = useAuthContext()
  const { creator, socialFields, finishIntro } = useTour()
  const { run } = useMutation()

  // Answers go to the account before the pages start
  const save = useCallback(
    async (answers: IntakeAnswers) => {
      // The colour answer only routed the talk, the mode itself is kept by the display preferences
      const kept = Object.fromEntries(
        Object.entries(answers).filter(([key]) => !ROUTING_ANSWERS.includes(key))
      )

      if (Object.keys(kept).length > 0) {
        await run(() => apiPatch(API_ROUTES.tourIntake, kept))
      }

      finishIntro()
    },
    [run, finishIntro]
  )

  return (
    <WelcomeChat
      name={session?.displayName ?? ''}
      avatarUrl={session?.avatarUrl ?? null}
      creator={creator}
      socialFields={socialFields}
      onDone={save}
    />
  )
}
