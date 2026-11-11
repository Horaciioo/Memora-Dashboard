'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import { LiveGateStepper } from '@/composites/lives/LiveGateStepper'
import { LiveGateTeam } from '@/composites/lives/LiveGateTeam'
import { LivePresenceChoice } from '@/composites/lives/LivePresenceChoice'
import type { PresenceDecision } from '@/composites/lives/LivePresenceChoice'
import { Dialog } from '@/components/structures/overlays/Dialog'
import { InlineMarkdown } from '@/components/structures/inline/InlineMarkdown'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiPatch, apiPost } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_PAGE_COPY } from '@/declarations/lives/copy'
import { ROUTES } from '@/declarations/navigation'
import { PAGINATION_COPY } from '@/declarations/ui/copy'
import { LIVE_GATE } from '@/declarations/ui/variants'
import type { LiveView } from '@/types/lives'

const RereadContext = createContext<(() => void) | null>(null)

export const useReread = (): (() => void) | null => useContext(RereadContext)

export interface LiveGateProps {
  live: LiveView
  canEdit: boolean
  children: ReactNode
}

/**
 * Live entry gate
 * @param {LiveGateProps} props - Gate props
 * @return {JSX.Element} - Entry flow
 */

export const LiveGate = ({ live, canEdit, children }: LiveGateProps) => {
  const [isOpen, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [instructions, setInstructions] = useState(live.instructions)
  const [decision, setDecision] = useState<PresenceDecision | null>(null)
  const { run, isSaving } = useMutation()
  const router = useRouter()
  const client = useQueryClient()

  const save = async (value: string) => {
    const saved = await run(
      () => apiPatch<LiveView>(API_ROUTES.liveInstructions(live.id), { instructions: value }),
      LIVE_PAGE_COPY.instructionsSaved
    )
    if (saved) setInstructions(saved.instructions)

    return saved !== null
  }

  const enter = async () => {
    if (decision) {
      const hours = decision.to
        ? { from: decision.from ?? new Date().toISOString(), to: decision.to }
        : {}
      const saved = await run(() =>
        apiPost(API_ROUTES.liveRoster(live.id), { status: decision.status, ...hours })
      )
      if (!saved) return
      await client.invalidateQueries({ queryKey: QUERY_KEYS.liveRoster(live.id) })
    }
    setOpen(true)
  }

  if (isOpen) {
    return (
      <RereadContext.Provider value={() => setOpen(false)}>
        <div className={LIVE_GATE.screen}>{children}</div>
      </RereadContext.Provider>
    )
  }

  return (
    <Dialog
      open
      size="lg"
      title={LIVE_PAGE_COPY.recapTitle}
      description={LIVE_PAGE_COPY.recapLead}
      onClose={() => router.push(ROUTES.lives)}
    >
      <div className={LIVE_GATE.body}>
        <LiveGateStepper
          steps={LIVE_PAGE_COPY.steps}
          current={step}
          label={LIVE_PAGE_COPY.recapTitle}
        />

        {step === 0 && (
          <section className={LIVE_GATE.instructions}>
            <h3 className={LIVE_GATE.heading}>{LIVE_PAGE_COPY.instructionsTitle}</h3>
            <div className={LIVE_GATE.instructionsBox}>
              {canEdit ? (
                <InlineMarkdown
                  id={`live-instructions-${live.id}`}
                  value={instructions}
                  placeholder={LIVE_PAGE_COPY.instructionsEmpty}
                  maxLength={FORM_SETTINGS.markdownMaxLength}
                  onCommit={save}
                />
              ) : instructions ? (
                <Markdown source={instructions} />
              ) : (
                <p className={LIVE_GATE.lead}>{LIVE_PAGE_COPY.instructionsEmpty}</p>
              )}
            </div>
          </section>
        )}

        {step === 1 && <LiveGateTeam live={live} />}

        {step === 2 && (
          <LivePresenceChoice live={live} decision={decision} onDecide={setDecision} />
        )}

        <div className={LIVE_GATE.footer}>
          {step > 0 && (
            <Button
              className="mr-auto"
              disabled={isSaving}
              onClick={() => setStep((current) => current - 1)}
            >
              {PAGINATION_COPY.previous}
            </Button>
          )}
          {step < LIVE_PAGE_COPY.steps.length - 1 ? (
            <Button
              variant="primary"
              icon="forward"
              onClick={() => setStep((current) => current + 1)}
            >
              {LIVE_PAGE_COPY.next}
            </Button>
          ) : (
            <Button
              variant="primary"
              icon="forward"
              isLoading={isSaving}
              onClick={() => void enter()}
            >
              {LIVE_PAGE_COPY.enter}
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  )
}
