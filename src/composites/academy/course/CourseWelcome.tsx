import type { CSSProperties } from 'react'

import { COURSE_COPY } from '@/declarations/academy/copy'
import type { CourseChapter } from '@/declarations/academy/curriculum/types'
import { COURSE_PLAYER } from '@/declarations/ui/variants'
import type { CourseStep } from '@/core/lib/academy/courseSteps'

export interface CourseWelcomeProps {
  chapter: CourseChapter
  steps: CourseStep[]
}

/**
 * Opening screen of a chapter that writes itself line by line
 * @param {CourseWelcomeProps} props - Chapter and its screens
 * @return {JSX.Element}
 */

export const CourseWelcome = ({ chapter, steps }: CourseWelcomeProps) => {
  // Welcome itself is not on the programme
  const programme = steps.filter((step) => !step.welcome)
  const lines = [
    <h3 key="hello" className={COURSE_PLAYER.welcomeHello}>
      {COURSE_COPY.welcomeHello}
    </h3>,
    <p key="today" className={COURSE_PLAYER.welcomeLine}>
      {COURSE_COPY.welcomeToday(chapter.title)}
    </p>,
    <p key="goal" className={COURSE_PLAYER.welcomeLine}>
      {chapter.goal ?? COURSE_COPY.welcomeGoal}
    </p>,
    <ul key="list" className={COURSE_PLAYER.welcomeList} aria-label={COURSE_COPY.welcomeSteps}>
      {programme.map((step) => (
        <li key={step.key} className={COURSE_PLAYER.welcomeChip}>
          {step.label}
        </li>
      ))}
    </ul>,
  ]

  return (
    <div className={COURSE_PLAYER.welcome}>
      {lines.map((line, index) => (
        <div
          key={line.key}
          className={COURSE_PLAYER.reveal}
          style={{ '--i': index * 2 } as CSSProperties}
        >
          {line}
        </div>
      ))}
    </div>
  )
}
