'use client'

import { useMemo, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { BrainMark } from '@/components/elements/display/marks/BrainMark'
import { RecapLine } from '@/composites/recap/RecapLine'
import { varied } from '@/core/lib/assistant/variants'
import { actionsOf } from '@/core/lib/assistant/scenarios/recap/actions'
import { guideOf } from '@/core/lib/recap/deck'
import type { DeckCard } from '@/core/lib/recap/deck'
import { requestGuide } from '@/core/store/recapGuide'
import { useRecapDeck } from '@/core/store/recapDeck'
import { RECAP_VARIANTS } from '@/declarations/assistant/variants/recap'
import { RECAP_CHAPTERS } from '@/declarations/recap/chapters'
import { RECAP_COPY } from '@/declarations/recap/copy'
import { RECAP_DECK } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface RecapCardProps {
  card: DeckCard
  isCompact?: boolean
}

// What Memora says depends on what she can do here
const voiceOf = (target: string | null, hasActions: boolean): string => {
  if (!hasActions) return varied('card.open', RECAP_VARIANTS.cardOpen)
  if (target === 'task') return varied('card.task', RECAP_VARIANTS.cardTask)
  if (target === 'calendar') return varied('card.event', RECAP_VARIANTS.cardEvent)

  return varied('card.unban', RECAP_VARIANTS.cardUnban)
}

/**
 * One point of the recap, with Memora's line and the gestures she can do for the member
 * @param {DeckCard} card - Point
 * @return {JSX.Element}
 */

export const RecapCard = ({ card, isCompact = false }: RecapCardProps) => {
  const { thread, chapter, key } = card
  const finish = useRecapDeck((state) => state.finish)
  const skip = useRecapDeck((state) => state.skip)
  const [isBusy, setBusy] = useState(false)
  const [isFailed, setFailed] = useState(false)
  const actions = useMemo(
    () => actionsOf(thread.target, thread.targetId),
    [thread.target, thread.targetId]
  )
  const voice = useMemo(
    () => voiceOf(thread.target, actions.length > 0),
    [thread.target, actions.length]
  )

  const run = async (act: () => Promise<void>) => {
    setBusy(true)
    setFailed(false)
    try {
      await act()
      finish(key)
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  // The page opens with the record lit, the card goes once the member handled it there
  const open = async () => {
    const { href, record } = guideOf(card)
    const result = await requestGuide(href, record, thread.subject, false, actions, thread.targetId)

    if (result === 'handled') finish(key)
  }

  return (
    <article
      className={cn(RECAP_DECK.card, isCompact && RECAP_DECK.cardCompact)}
      aria-label={RECAP_CHAPTERS[chapter]}
    >
      <p className={RECAP_DECK.kicker}>{RECAP_CHAPTERS[chapter]}</p>
      <RecapLine thread={thread} showDay onNavigate={() => undefined} />
      {!isCompact && (
        <p className={RECAP_DECK.voice} aria-live="polite">
          <BrainMark className={RECAP_DECK.voiceMark} />
          {voice}
        </p>
      )}
      {isFailed && <p className={RECAP_DECK.error}>{RECAP_COPY.failed}</p>}
      <div className={RECAP_DECK.actions}>
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.tone === 'danger' ? 'danger' : 'success'}
            isLoading={isBusy}
            onClick={() => void run(action.run)}
          >
            {action.label}
          </Button>
        ))}
        <Button variant="secondary" onClick={() => void open()}>
          {RECAP_COPY.open}
        </Button>
        <Button variant="ghost" onClick={() => skip(key)}>
          {RECAP_COPY.skip}
        </Button>
      </div>
    </article>
  )
}
