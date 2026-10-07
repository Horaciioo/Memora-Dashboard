'use client'

import { useEffect, useState } from 'react'

import { Markdown } from '@/components/elements/display/Markdown'
import { useInView } from '@/core/hooks/interaction/useInView'
import type { ReadBlock } from '@/declarations/academy/curriculum/types'
import { ICONS } from '@/declarations/ui/icons'
import { COURSE_READ, COURSE_SEVERITY } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface SeverityBlockProps {
  block: Extract<ReadBlock, { kind: 'severity' }>
}

// Wait before the first criterion weighs in, then between two
const FIRST_MS = 900
const STEP_MS = 1300

/**
 * A gauge from patience to firmness: each criterion weighs in on its own and pushes the needle,
 * a click adds or removes one by hand
 * @param {SeverityBlockProps} props - Criteria declared in code
 * @return {JSX.Element}
 */

export const SeverityBlock = ({ block }: SeverityBlockProps) => {
  const [ref, isSeen] = useInView()
  const [lit, setLit] = useState<number[]>([])
  const [isPinned, setPinned] = useState(false)
  const total = block.criteria.length

  // Criteria weigh in one by one
  useEffect(() => {
    if (!isSeen || isPinned) return

    const timers = block.criteria.map((_, index) =>
      window.setTimeout(
        () => setLit((current) => [...new Set([...current, index])]),
        FIRST_MS + index * STEP_MS
      )
    )

    return () => timers.forEach(window.clearTimeout)
  }, [isSeen, isPinned, block.criteria])

  const toggle = (index: number) => {
    setPinned(true)
    setLit((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index]
    )
  }

  return (
    <section className={COURSE_SEVERITY.root}>
      <h2 className={COURSE_READ.heading}>{block.title}</h2>
      <Markdown source={block.intro} className={cn(COURSE_READ.text, COURSE_SEVERITY.text)} />

      <div ref={ref} className={COURSE_SEVERITY.stage}>
        <div className={COURSE_SEVERITY.gauge}>
          <p className={COURSE_SEVERITY.ends}>
            <span className={COURSE_SEVERITY.calm}>{block.ends.calm}</span>
            <span className={COURSE_SEVERITY.firm}>{block.ends.firm}</span>
          </p>
          <div className="py-4">
            <div className={COURSE_SEVERITY.track}>
              <span
                className={COURSE_SEVERITY.needle}
                style={{ left: `${(lit.length / total) * 100}%` }}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        <div className={COURSE_SEVERITY.cards}>
          {block.criteria.map((criterion, index) => {
            const Icon = ICONS[criterion.icon]
            const isLit = lit.includes(index)

            return (
              <button
                key={criterion.label}
                type="button"
                aria-pressed={isLit}
                className={cn(COURSE_SEVERITY.card, isLit && COURSE_SEVERITY.cardLit)}
                onClick={() => toggle(index)}
              >
                <span className={cn(COURSE_SEVERITY.chip, isLit && COURSE_SEVERITY.chipLit)}>
                  <Icon className={COURSE_SEVERITY.icon} aria-hidden="true" />
                </span>
                <span className={COURSE_SEVERITY.label}>{criterion.label}</span>
                <span className={COURSE_SEVERITY.body}>{criterion.text}</span>
              </button>
            )
          })}
        </div>
      </div>

      <Markdown source={block.outro} className={cn(COURSE_READ.text, COURSE_SEVERITY.text)} />
    </section>
  )
}
