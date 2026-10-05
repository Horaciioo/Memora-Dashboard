'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { useMutation } from '@/core/hooks/data/useMutation'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { COURSE_COPY } from '@/declarations/academy/copy'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import { ROUTES, TRAININGS_DONE_PARAM } from '@/declarations/navigation'
import { COURSE_PAGES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface CourseOutroProps {
  trainingId: string
}

// Marks of one scale
const MARKS = Array.from({ length: ACADEMY_SETTINGS.feedbackScale }, (_, index) => index + 1)

interface ScaleProps {
  label: string
  low: string
  high: string
  value: number | null
  onPick: (mark: number) => void
}

/**
 * One scale of the review
 * @param {ScaleProps} props - Scale
 * @return {JSX.Element}
 */

const Scale = ({ label, low, high, value, onPick }: ScaleProps) => (
  <fieldset className={COURSE_PAGES.scale}>
    <legend className={COURSE_PAGES.heading}>{label}</legend>
    <div className={COURSE_PAGES.scaleRow}>
      <span className={COURSE_PAGES.scaleEdge}>{low}</span>
      <span className={COURSE_PAGES.scaleDots} role="radiogroup" aria-label={label}>
        {MARKS.map((mark) => (
          <button
            key={mark}
            type="button"
            role="radio"
            aria-checked={value === mark}
            className={cn(COURSE_PAGES.scaleDot, value === mark && COURSE_PAGES.scaleDotPicked)}
            onClick={() => onPick(mark)}
          >
            {mark}
          </button>
        ))}
      </span>
      <span className={COURSE_PAGES.scaleEdge}>{high}</span>
    </div>
  </fieldset>
)

/**
 * Closing page: the end, the review out of ten, the way back
 * @param {string} trainingId - Training identifier
 * @return {JSX.Element}
 */

export const CourseOutro = ({ trainingId }: CourseOutroProps) => {
  const router = useRouter()
  const { isSaving, run } = useMutation()
  const [content, setContent] = useState<number | null>(null)
  const [fluency, setFluency] = useState<number | null>(null)
  const [comment, setComment] = useState('')

  // The review goes first
  const leave = async () => {
    if (content === null || fluency === null) return

    const saved = await run(() =>
      apiPost(API_ROUTES.courseFeedback(trainingId), { content, fluency, comment })
    )
    if (saved) router.push(`${ROUTES.trainings}?${TRAININGS_DONE_PARAM}=${trainingId}`)
  }

  return (
    <article className={COURSE_PAGES.page}>
      <header className={COURSE_PAGES.section}>
        <h2 className={COURSE_PAGES.end}>{COURSE_COPY.endTitle}</h2>
        <p className={COURSE_PAGES.text}>{COURSE_COPY.endBody}</p>
        <p className={COURSE_PAGES.text}>{COURSE_COPY.endReplay}</p>
        <p className={COURSE_PAGES.text}>{COURSE_COPY.endNotified}</p>
      </header>

      <section className={COURSE_PAGES.section}>
        <h3 className={COURSE_PAGES.title}>{COURSE_COPY.feedbackTitle}</h3>
        <p className={COURSE_PAGES.text}>{COURSE_COPY.feedbackLead}</p>
        <p className={COURSE_PAGES.text}>{COURSE_COPY.feedbackHonest}</p>
      </section>

      <Scale
        label={COURSE_COPY.contentScale}
        low={COURSE_COPY.contentLow}
        high={COURSE_COPY.contentHigh}
        value={content}
        onPick={setContent}
      />
      <Scale
        label={COURSE_COPY.fluencyScale}
        low={COURSE_COPY.fluencyLow}
        high={COURSE_COPY.fluencyHigh}
        value={fluency}
        onPick={setFluency}
      />

      <label className={COURSE_PAGES.section}>
        <span className={COURSE_PAGES.heading}>{COURSE_COPY.comment}</span>
        <textarea
          className={COURSE_PAGES.comment}
          placeholder={COURSE_COPY.commentPlaceholder}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
      </label>

      <Button
        variant="primary"
        className={COURSE_PAGES.start}
        disabled={content === null || fluency === null}
        isLoading={isSaving}
        onClick={leave}
      >
        {COURSE_COPY.backToTrainings}
      </Button>
    </article>
  )
}
