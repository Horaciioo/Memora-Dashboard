'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { WelcomeSeal } from '@/composites/welcome/WelcomeSeal'
import { WelcomeStage } from '@/composites/welcome/WelcomeStage'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { useMemoraSpeech } from '@/core/hooks/interaction/scenes/useMemoraSpeech'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { TOUR_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES } from '@/declarations/navigation'
import { WELCOME_COPY } from '@/declarations/onboarding/welcome'
import { TOUR_CHAT } from '@/declarations/ui/variants'
import type { IdentityCheckView } from '@/types/identity'
import { IdentityCheckStatuses } from '@/utils/constants/identity'
import { fillTemplate } from '@/utils/format/strings'

type Phase = 'talking' | 'confirm' | 'pseudo' | 'done' | 'sealed'

export interface WelcomeCheckProps {
  view: IdentityCheckView
}

/**
 * Memora checks the Discord account of an accepted candidate before anything opens
 * @param {IdentityCheckView} view - What the server knows of the check
 * @return {JSX.Element}
 */

export const WelcomeCheck = ({ view }: WelcomeCheckProps) => {
  const router = useRouter()
  const speech = useMemoraSpeech()
  const { isSaving, run } = useMutation()
  const [phase, setPhase] = useState<Phase>('talking')
  const [sessionName, setSessionName] = useState('')
  const started = useRef(false)
  const { say, hear, show } = speech
  const hello = fillTemplate(WELCOME_COPY.hello, { name: view.name })

  // Opens by saying what she found
  useEffect(() => {
    if (started.current) return
    started.current = true

    const open = async () => {
      if (view.status === IdentityCheckStatuses.Escalated) {
        await say([hello, ...WELCOME_COPY.escalated])
        setPhase('done')
      } else if (view.seat) {
        await say([hello, WELCOME_COPY.search])
        show()
        await say([WELCOME_COPY.found])
        setPhase('confirm')
      } else {
        await say([hello, ...WELCOME_COPY.unknown, WELCOME_COPY.pseudoFirst])
        setPhase('pseudo')
      }
    }

    void open()
  }, [view, say, show, hello])

  // The seal plays, then the dashboard opens on the visit
  useEffect(() => {
    if (phase !== 'sealed') return

    const timer = setTimeout(() => router.replace(ROUTES.dashboard), TOUR_SETTINGS.sealMs)

    return () => clearTimeout(timer)
  }, [phase, router])

  const confirm = async () => {
    hear(WELCOME_COPY.yes)
    setPhase('talking')
    await say([WELCOME_COPY.checking])

    const result = await run(() => apiPost<{ sessionName: string }>(API_ROUTES.welcomeConfirm, {}))
    if (!result) {
      await say([WELCOME_COPY.failed])
      setPhase('confirm')
      return
    }

    setSessionName(result.sessionName)
    setPhase('sealed')
  }

  const deny = async () => {
    hear(WELCOME_COPY.no)
    setPhase('talking')
    await say([WELCOME_COPY.pseudo])
    setPhase('pseudo')
  }

  const givePseudo = async (name: string) => {
    hear(name)
    setPhase('talking')

    const result = await run(() =>
      apiPost<{ outcome: 'retry' | 'escalated' }>(API_ROUTES.welcomePseudo, { name })
    )
    if (!result) {
      await say([WELCOME_COPY.failed])
      setPhase('pseudo')
      return
    }

    if (result.outcome === 'retry') {
      await say([WELCOME_COPY.pseudoRetry])
      setPhase('pseudo')
      return
    }

    await say([...WELCOME_COPY.escalated])
    setPhase('done')
  }

  const answers =
    phase === 'confirm' ? (
      <div className={TOUR_CHAT.quick}>
        <Button
          variant="success"
          className={TOUR_CHAT.chip}
          disabled={isSaving}
          onClick={() => void confirm()}
        >
          {WELCOME_COPY.yes}
        </Button>
        <Button
          variant="danger"
          className={TOUR_CHAT.chip}
          disabled={isSaving}
          onClick={() => void deny()}
        >
          {WELCOME_COPY.no}
        </Button>
      </div>
    ) : undefined

  return (
    <WelcomeStage
      speech={speech}
      creator={view.seat?.creator ?? null}
      member={{ name: view.name, discordId: view.discordId, avatarUrl: view.avatarUrl }}
      answers={answers}
      seal={phase === 'sealed' ? <WelcomeSeal sessionName={sessionName} /> : undefined}
      isWriting={phase === 'pseudo'}
      isBusy={isSaving}
      onWrite={(name) => void givePseudo(name)}
    />
  )
}
