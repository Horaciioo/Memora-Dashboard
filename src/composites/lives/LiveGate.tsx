'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { Markdown } from '@/components/elements/display/Markdown'
import { InlineMarkdown } from '@/components/structures/InlineMarkdown'
import { LiveRosterBoard } from '@/composites/lives/LiveRosterBoard'
import { useMutation } from '@/core/hooks/data/useMutation'
import { apiPatch } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { FORM_SETTINGS } from '@/declarations/configurations/settings'
import { LIVE_PAGE_COPY } from '@/declarations/lives/copy'
import { LIVE_GATE } from '@/declarations/ui/variants'
import type { LiveView } from '@/types/lives'

// Read once per live and browser
const readKey = (liveId: string) => `memora:live-instructions:${liveId}`

/**
 * Whether the instructions of a live were already read here
 * @param {string} liveId - Live
 * @return {boolean} - Read
 */

const wasRead = (liveId: string): boolean => {
  try {
    return window.localStorage.getItem(readKey(liveId)) !== null
  } catch {
    return false
  }
}

export interface LiveGateProps {
  live: LiveView
  canEdit: boolean
  // The Mod View
  children: ReactNode
}

/**
 * Instructions of the responsables and the roll-call first
 * @param {LiveView} live - Live
 * @param {boolean} canEdit - Viewer may rewrite the instructions
 * @param {ReactNode} children - Mod View
 * @return {JSX.Element}
 */

export const LiveGate = ({ live, canEdit, children }: LiveGateProps) => {
  const [isOpen, setOpen] = useState(false)
  const [instructions, setInstructions] = useState(live.instructions)
  const { run } = useMutation()

  // A member who already read them goes straight to the Mod View
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (wasRead(live.id)) setOpen(true)
  }, [live.id])

  const open = () => {
    try {
      window.localStorage.setItem(readKey(live.id), new Date().toISOString())
    } catch {
      // Read again next time
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
      <div className="flex flex-col gap-3">
        <Button
          variant="ghost"
          icon="sheet"
          className={LIVE_GATE.reread}
          onClick={() => setOpen(false)}
        >
          {LIVE_PAGE_COPY.reread}
        </Button>
        {children}
      </div>
    )
  }

  return (
    <div className={LIVE_GATE.root}>
      <section className={LIVE_GATE.card}>
        <h2 className={LIVE_GATE.title}>{LIVE_PAGE_COPY.instructionsTitle}</h2>
        <p className={LIVE_GATE.lead}>{LIVE_PAGE_COPY.instructionsLead}</p>
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
        <LiveRosterBoard liveId={live.id} />
      </section>
      <div className={LIVE_GATE.actions}>
        <Button variant="primary" icon="forward" onClick={open}>
          {LIVE_PAGE_COPY.open}
        </Button>
      </div>
    </div>
  )
}
