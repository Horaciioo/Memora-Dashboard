'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { StoryDeck } from '@/components/structures/StoryDeck'
import { useMutation } from '@/core/hooks/data/useMutation'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import {
  GUIDE_KEYS,
  TRAININGS_WELCOME,
  TRAININGS_WELCOME_COPY,
} from '@/declarations/academy/welcome'
import { ICONS } from '@/declarations/ui/icons'
import { ABSENCE_WIZARD, TRAININGS_WELCOME_STYLES } from '@/declarations/ui/variants'
import { useTour } from '@/managers/front-end/TourManager'

export interface TrainingsWelcomeProps {
  mandatory: number
  trade: string
}

/**
 * First visit of the trainings page, told as full-screen cards
 * @param {number} mandatory - Mandatory courses of the member
 * @param {string} trade - Platform the member trains for
 * @return {JSX.Element | null}
 */

export const TrainingsWelcome = ({ mandatory, trade }: TrainingsWelcomeProps) => {
  const router = useRouter()
  const { isSaving, run } = useMutation()
  const [index, setIndex] = useState(0)
  const [isClosed, setClosed] = useState(false)
  // The first visit already walks through this page
  const { isTouring } = useTour()

  if (isClosed || isTouring) return null

  const page = TRAININGS_WELCOME[index]!
  const fill = (text: string) =>
    text.replace('{count}', String(mandatory)).replace('{trade}', trade)

  // Seen for good only once the last card is reached
  const finish = async () => {
    const saved = await run(() =>
      apiPost(API_ROUTES.seenGuide, { key: GUIDE_KEYS.trainingsWelcome })
    )
    if (!saved) return

    setClosed(true)
    router.refresh()
  }

  return (
    <StoryDeck
      label={TRAININGS_WELCOME_COPY.label}
      count={TRAININGS_WELCOME.length}
      index={index}
      onIndex={setIndex}
      onFinish={finish}
      onSkip={() => setClosed(true)}
      isFinishing={isSaving}
      labels={TRAININGS_WELCOME_COPY}
    >
      <h2 className={ABSENCE_WIZARD.stageTitle}>{page.title}</h2>

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

      {page.body?.map((paragraph) => (
        <p key={paragraph} className={TRAININGS_WELCOME_STYLES.text}>
          {fill(paragraph)}
        </p>
      ))}
    </StoryDeck>
  )
}
