'use client'

import { useCallback, useState } from 'react'

import { StoryDeck } from '@/components/structures/StoryDeck'
import { NotifyDemo } from '@/composites/tour/NotifyDemo'
import { TourLoader } from '@/composites/tour/TourLoader'
import { WELCOME_DECK } from '@/declarations/tour/deck'
import { TOUR_COPY } from '@/declarations/tour/copy'
import { ICONS } from '@/declarations/ui/icons'
import { ABSENCE_WIZARD, TRAININGS_WELCOME_STYLES } from '@/declarations/ui/variants'

export interface WelcomeDeckProps {
  onFinish: () => void
}

// Labels of the buttons under the cards
const LABELS = {
  next: TOUR_COPY.deckNext,
  previous: TOUR_COPY.deckPrevious,
  finish: TOUR_COPY.deckFinish,
}

/**
 * Presentation of Memora as full-screen cards, the last one gets the visit ready
 * @param {WelcomeDeckProps} props - Exit
 * @return {JSX.Element}
 */

export const WelcomeDeck = ({ onFinish }: WelcomeDeckProps) => {
  const [index, setIndex] = useState(0)
  const [isReady, setReady] = useState(false)
  const markReady = useCallback(() => setReady(true), [])

  const page = WELCOME_DECK[index]!

  return (
    <StoryDeck
      label={TOUR_COPY.deckLabel}
      count={WELCOME_DECK.length}
      index={index}
      onIndex={setIndex}
      onFinish={() => isReady && onFinish()}
      onSkip={onFinish}
      isFinishing={!isReady}
      labels={LABELS}
    >
      <h2 className={ABSENCE_WIZARD.stageTitle}>{page.title}</h2>

      {page.body?.map((paragraph) => (
        <p key={paragraph} className={TRAININGS_WELCOME_STYLES.text}>
          {paragraph}
        </p>
      ))}

      {page.rows && (
        <ul className={TRAININGS_WELCOME_STYLES.rows}>
          {page.rows.map((row) => {
            const Glyph = ICONS[row.glyph]

            return (
              <li key={row.text} className={TRAININGS_WELCOME_STYLES.row}>
                <Glyph className={TRAININGS_WELCOME_STYLES.glyph} aria-hidden="true" />
                <p className={TRAININGS_WELCOME_STYLES.text}>{row.text}</p>
              </li>
            )
          })}
        </ul>
      )}

      {page.scene === 'notify' && <NotifyDemo />}
      {page.scene === 'loading' && <TourLoader onReady={markReady} />}
    </StoryDeck>
  )
}
