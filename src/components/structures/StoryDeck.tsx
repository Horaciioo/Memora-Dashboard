'use client'

import type { ReactNode } from 'react'
import { Button } from '@/components/elements/actions/Button'
import { useFocusTrap } from '@/core/hooks/interaction/useFocusTrap'
import { useScrollLock } from '@/core/hooks/interaction/useScrollLock'
import { useSwipe } from '@/core/hooks/interaction/useSwipe'
import { ACTION_COPY } from '@/declarations/ui/copy'
import { STORY_DECK } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface StoryDeckLabels {
  next: string
  previous: string
  finish: string
}

export interface StoryDeckProps {
  label: string
  count: number
  index: number
  onIndex: (index: number) => void
  onFinish: () => void
  onSkip: () => void
  labels: StoryDeckLabels
  isFinishing?: boolean
  // Content of the open card
  children: ReactNode
}

/**
 * Full-screen cards opened one after the other, tapped or swiped
 * @param {StoryDeckProps} props - Position, handlers and the open card
 * @return {JSX.Element}
 */

export const StoryDeck = ({
  label,
  count,
  index,
  onIndex,
  onFinish,
  onSkip,
  labels,
  isFinishing,
  children,
}: StoryDeckProps) => {
  const containerRef = useFocusTrap(true, onSkip)
  useScrollLock(true)

  const isLast = index === count - 1
  const next = () => (isLast ? onFinish() : onIndex(index + 1))
  const back = () => onIndex(Math.max(index - 1, 0))

  const { handlers, axisStyle } = useSwipe({
    axis: 'x',
    onSwipe: (direction) => (direction === 'left' ? next() : direction === 'right' && back()),
  })

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className={STORY_DECK.root}
      style={axisStyle}
      {...handlers}
    >
      <div className={STORY_DECK.column}>
        <div className={STORY_DECK.top}>
          <div className={STORY_DECK.progress} aria-hidden="true">
            {Array.from({ length: count }, (_, step) => (
              <span
                key={step}
                className={cn(
                  STORY_DECK.segment,
                  step <= index ? STORY_DECK.segmentDone : STORY_DECK.segmentIdle
                )}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            icon="close"
            className={STORY_DECK.skip}
            onClick={onSkip}
            aria-label={ACTION_COPY.close}
          />
        </div>

        <div key={index} className={STORY_DECK.card}>
          {children}
        </div>

        <div className={STORY_DECK.actions}>
          <Button variant="ghost" className={STORY_DECK.back} disabled={index === 0} onClick={back}>
            {labels.previous}
          </Button>
          <Button
            variant="primary"
            className={STORY_DECK.next}
            isLoading={isLast && isFinishing}
            onClick={next}
          >
            {isLast ? labels.finish : labels.next}
          </Button>
        </div>
      </div>
    </div>
  )
}
