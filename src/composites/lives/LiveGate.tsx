'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Avatar } from '@/components/elements/display/Avatar'
import { Markdown } from '@/components/elements/display/Markdown'
import { SeatNote } from '@/composites/lives/LiveCoordinator'
import { LivePresenceChoice } from '@/composites/lives/LivePresenceChoice'
import type { PresenceDecision } from '@/composites/lives/LivePresenceChoice'
import { gateState } from '@/core/lib/lives/gate'
import { Dialog } from '@/components/structures/overlays/Dialog'
import { InlineMarkdown } from '@/components/structures/inline/InlineMarkdown'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiPatch, apiPost } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_PAGE_COPY } from '@/declarations/lives/copy'
import { ROUTES } from '@/declarations/navigation'
import { LIVE_GATE } from '@/declarations/ui/variants'
import type { LiveCoordinatorSeat, LivePerson, LiveView } from '@/types/lives'

// Opens the instructions again from inside the Mod View
const RereadContext = createContext<(() => void) | null>(null)

/**
 * Gesture that brings the instructions back, none outside a gate
 * @return {(() => void) | null}
 */

export const useReread = (): (() => void) | null => useContext(RereadContext)

export interface LiveGateProps {
  live: LiveView
  canEdit: boolean
  // The Mod View
  children: ReactNode
}

/**
 * Recap of the live read before the Mod View
 * @param {LiveView} live - Live
 * @param {boolean} canEdit - Viewer may rewrite the instructions
 * @param {ReactNode} children - Mod View
 * @return {JSX.Element}
 */

export const LiveGate = ({ live, canEdit, children }: LiveGateProps) => {
  const [isOpen, setOpen] = useState(false)
  const [instructions, setInstructions] = useState(live.instructions)
  const { run, isSaving } = useMutation()

  const router = useRouter()
  const client = useQueryClient()

  // Everyone says whether they stay before the Mod View
  const [decision, setDecision] = useState<PresenceDecision | null>(null)
  const canOpen = decision !== null || gateState(live, new Date()) === 'answered'

  const open = async () => {
    // Hours already given stand, nothing to send
    if (decision) {
      const hours = decision.to
        ? { from: decision.from ?? new Date().toISOString(), to: decision.to }
        : {}
      const done = await run(() =>
        apiPost(API_ROUTES.liveRoster(live.id), { status: decision.status, ...hours })
      )
      if (!done) return

      await client.invalidateQueries({ queryKey: QUERY_KEYS.liveRoster(live.id) })
    }
    setOpen(true)
  }

  const save = async (value: string) => {
    const saved = await run(
      () => apiPatch<LiveView>(API_ROUTES.liveInstructions(live.id), { instructions: value }),
      LIVE_PAGE_COPY.instructionsSaved
    )
    if (saved) setInstructions(saved.instructions)

    return saved !== null
  }

  if (isOpen) {
    return (
      <RereadContext.Provider value={() => setOpen(false)}>
        <div className={LIVE_GATE.screen}>{children}</div>
      </RereadContext.Provider>
    )
  }

  const group = (label: string, rows: { person: LivePerson; seat?: LiveCoordinatorSeat }[]) => (
    <section className={LIVE_GATE.group}>
      <h3 className={LIVE_GATE.label}>{label}</h3>
      {rows.length === 0 ? (
        <p className={LIVE_GATE.lead}>{LIVE_PAGE_COPY.recapNobody}</p>
      ) : (
        <ul className={LIVE_GATE.people}>
          {rows.map(({ person, seat }) => (
            <li key={person.id} className={LIVE_GATE.person}>
              <Avatar name={person.name} src={person.avatar} size="sm" />
              <span className={LIVE_GATE.personText}>
                <span className={LIVE_GATE.personName}>{person.name}</span>
                {seat && <SeatNote seat={seat} />}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )

  return (
    <Dialog
      open
      size="xl"
      title={LIVE_PAGE_COPY.recapTitle}
      description={LIVE_PAGE_COPY.recapLead}
      onClose={() => router.push(ROUTES.lives)}
      footer={
        <Button
          variant="primary"
          icon="forward"
          disabled={!canOpen}
          isLoading={isSaving}
          onClick={() => void open()}
        >
          {LIVE_PAGE_COPY.open}
        </Button>
      }
    >
      <div className={LIVE_GATE.body}>
        <div className={LIVE_GATE.side}>
          <section className={LIVE_GATE.group}>
            <h3 className={LIVE_GATE.label}>{LIVE_PAGE_COPY.recapLive}</h3>
            <p className={LIVE_GATE.creator}>{live.title}</p>
          </section>
          {group(
            LIVE_PAGE_COPY.recapResponsables,
            live.responsables.map((person) => ({ person }))
          )}
          {group(
            LIVE_PAGE_COPY.recapCoordinators,
            live.coordinators.map((seat) => ({ person: seat.person, seat }))
          )}
        </div>
        <div className={LIVE_GATE.divider} role="separator" />
        <section className={LIVE_GATE.instructions}>
          <h3 className={LIVE_GATE.label}>{LIVE_PAGE_COPY.instructionsTitle}</h3>
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
          <LivePresenceChoice live={live} decision={decision} onDecide={setDecision} />
        </section>
      </div>
    </Dialog>
  )
}
