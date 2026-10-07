'use client'

import { Markdown } from '@/components/elements/display/Markdown'
import { useInView } from '@/core/hooks/interaction/useInView'
import type { ReadBlock } from '@/declarations/academy/curriculum/types'
import { ICONS } from '@/declarations/ui/icons'
import { COURSE_PILLARS, COURSE_READ, COURSE_TONES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface PillarsBlockProps {
  block: Extract<ReadBlock, { kind: 'pillars' }>
}

// Place of each card in the pile
const SLOTS = [
  {
    place: COURSE_PILLARS.first,
    hidden: COURSE_PILLARS.firstHidden,
    shown: COURSE_PILLARS.firstShown,
  },
  {
    place: COURSE_PILLARS.second,
    hidden: COURSE_PILLARS.secondHidden,
    shown: COURSE_PILLARS.secondShown,
  },
]

/**
 * Two reasons as cards piled up, then slid apart over each other
 * @param {PillarsBlockProps} props - Cards declared in code
 * @return {JSX.Element}
 */

export const PillarsBlock = ({ block }: PillarsBlockProps) => {
  const [ref, isSeen] = useInView()

  return (
    <section className={COURSE_PILLARS.root}>
      <h2 className={COURSE_READ.heading}>{block.title}</h2>
      <Markdown source={block.intro} className={cn(COURSE_READ.text, COURSE_PILLARS.text)} />

      <div ref={ref} className={COURSE_PILLARS.stage}>
        {block.items.slice(0, SLOTS.length).map((item, index) => {
          const Icon = ICONS[item.icon]
          const slot = SLOTS[index]!

          return (
            <article
              key={item.label}
              className={cn(COURSE_PILLARS.card, slot.place, isSeen ? slot.shown : slot.hidden)}
            >
              <header className={COURSE_PILLARS.head}>
                <span className={cn(COURSE_PILLARS.chip, COURSE_TONES[item.tone])}>
                  <Icon className={COURSE_PILLARS.icon} aria-hidden="true" />
                </span>
                <h3 className={COURSE_PILLARS.label}>{item.label}</h3>
              </header>
              <Markdown source={item.text} className={COURSE_PILLARS.body} />
            </article>
          )
        })}
      </div>

      <Markdown source={block.outro} className={cn(COURSE_READ.text, COURSE_PILLARS.text)} />
    </section>
  )
}
