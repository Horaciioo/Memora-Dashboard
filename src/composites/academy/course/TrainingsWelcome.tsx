'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
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
import { cn } from '@/utils/classnames'

export interface TrainingsWelcomeProps {
  mandatory: number
  trade: string
}

/**
 * First visit of the trainings page
 * @param {number} mandatory - Mandatory courses of the member
 * @param {string} trade - Platform the member trains for
 * @return {JSX.Element | null}
 */

export const TrainingsWelcome = ({ mandatory, trade }: TrainingsWelcomeProps) => {
  const router = useRouter()
  const { isSaving, run } = useMutation()
  const [index, setIndex] = useState(0)
  const [isClosed, setClosed] = useState(false)

  if (isClosed) return null

  const page = TRAININGS_WELCOME[index]!
  const isLast = index === TRAININGS_WELCOME.length - 1
  const fill = (text: string) =>
    text.replace('{count}', String(mandatory)).replace('{trade}', trade)

  const finish = async () => {
    const saved = await run(() =>
      apiPost(API_ROUTES.seenGuide, { key: GUIDE_KEYS.trainingsWelcome })
    )
    if (!saved) return

    setClosed(true)
    router.refresh()
  }

  return (
    <section className={ABSENCE_WIZARD.root} aria-label={TRAININGS_WELCOME_COPY.label}>
      <ol className={ABSENCE_WIZARD.timeline}>
        {TRAININGS_WELCOME.map((entry, step) => (
          <li key={entry.title} className={TRAININGS_WELCOME_STYLES.step}>
            <span
              className={cn(
                ABSENCE_WIZARD.chip,
                step === index
                  ? ABSENCE_WIZARD.chipCurrent
                  : step < index
                    ? ABSENCE_WIZARD.chipDone
                    : ABSENCE_WIZARD.chipTodo
              )}
            >
              {step < index ? <ICONS.success className={ABSENCE_WIZARD.chipGlyph} /> : step + 1}
            </span>
          </li>
        ))}
      </ol>

      <div className={TRAININGS_WELCOME_STYLES.box}>
        <div key={index} className={TRAININGS_WELCOME_STYLES.page}>
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
        </div>

        <div className={ABSENCE_WIZARD.actions}>
          {index > 0 && (
            <Button variant="ghost" onClick={() => setIndex(index - 1)}>
              {TRAININGS_WELCOME_COPY.previous}
            </Button>
          )}
          {isLast ? (
            <Button variant="primary" isLoading={isSaving} onClick={finish}>
              {TRAININGS_WELCOME_COPY.finish}
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setIndex(index + 1)}>
              {TRAININGS_WELCOME_COPY.next}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
