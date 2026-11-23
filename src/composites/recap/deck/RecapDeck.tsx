'use client'

import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { BrainMark } from '@/components/elements/display/marks/BrainMark'
import { RecapAbsenceCard } from '@/composites/recap/deck/RecapAbsenceCard'
import { RecapCard } from '@/composites/recap/deck/RecapCard'
import { clearPendingRecap } from '@/core/lib/recap/client'
import { cardsOf } from '@/core/lib/recap/deck'
import type { DeckCard } from '@/core/lib/recap/deck'
import { useRecapDeck } from '@/core/store/recapDeck'
import { useRecapStore } from '@/core/store/recap'
import { RECAP_COPY } from '@/declarations/recap/copy'
import { RECAP_DECK } from '@/declarations/ui/variants'
import { useFeatures } from '@/managers/front-end/FeaturesManager'
import { fillTemplate } from '@/utils/format/strings'

// Cards a list shows at once, the rest comes on demand
const LIST_STEP = 6

// Time the "all done" line stays before the deck leaves
const DONE_MS = 4000

const cardOf = (card: DeckCard, isCompact = false) =>
  card.isAbsences ? (
    <RecapAbsenceCard key={card.key} card={card} isCompact={isCompact} />
  ) : (
    <RecapCard key={card.key} card={card} isCompact={isCompact} />
  )

/**
 * What the member missed, one card per point, on top of the Home until it is handled
 * @return {JSX.Element | null}
 */

export const RecapDeck = () => {
  const { isOpen: isFeatureOpen } = useFeatures()
  const recap = useRecapStore((state) => state.recap)
  const isShown = useRecapStore((state) => state.isOpen)
  const { done, skipped, isFolded, open, fold, clear } = useRecapDeck()
  const [isListed, setListed] = useState(false)
  const [shown, setShown] = useState(LIST_STEP)

  useEffect(() => {
    if (recap) open(recap.since)
  }, [recap, open])

  const cards = useMemo(() => cardsOf(recap, done, skipped), [recap, done, skipped])

  const isDone = Boolean(recap) && isShown && cards.length === 0

  // Everything handled, the deck says so then leaves and the kept window goes with it
  useEffect(() => {
    if (!isDone) return

    const timer = window.setTimeout(() => {
      clearPendingRecap()
      clear()
      useRecapStore.getState().hide()
    }, DONE_MS)

    return () => window.clearTimeout(timer)
  }, [isDone, clear])

  if (!isFeatureOpen('recap') || !recap || !isShown) return null

  if (isDone) {
    return (
      <div className={RECAP_DECK.done} role="status">
        <BrainMark className={RECAP_DECK.markGlyph} />
        {RECAP_COPY.deckDone}
      </div>
    )
  }

  if (isFolded) {
    return (
      <button type="button" className={RECAP_DECK.folded} onClick={() => fold(false)}>
        <BrainMark className={RECAP_DECK.markGlyph} />
        {fillTemplate(RECAP_COPY.deckFolded, { count: String(cards.length) })}
      </button>
    )
  }

  return (
    <section className={RECAP_DECK.deck} aria-label={RECAP_COPY.deckTitle}>
      {isListed ? (
        <div className={RECAP_DECK.list}>
          {cards.slice(0, shown).map((card) => cardOf(card, true))}
          {cards.length > shown && (
            <Button variant="ghost" onClick={() => setShown((current) => current + LIST_STEP)}>
              {RECAP_COPY.deckMore}
            </Button>
          )}
          <Button variant="ghost" onClick={() => setListed(false)}>
            {RECAP_COPY.deckStack}
          </Button>
        </div>
      ) : (
        <div className={RECAP_DECK.stack}>
          {cards.length > 2 && <span className={RECAP_DECK.ghostFar} aria-hidden="true" />}
          {cards.length > 1 && <span className={RECAP_DECK.ghost} aria-hidden="true" />}
          {cardOf(cards[0])}
        </div>
      )}
    </section>
  )
}
