import type { ReactNode } from 'react'

import { ICONS } from '@/declarations/ui/icons'
import { INTERVIEW, QUESTION_BODY } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface QuestionFoldProps {
  title: string
  // Driven from outside when given, the browser decides otherwise
  isOpen?: boolean
  // Left aside, the title is struck
  isStruck?: boolean
  onToggle?: () => void
  children: ReactNode
}

/**
 * One folded line, opened to read what hides under it
 * @param {string} title - Line shown while folded
 * @param {boolean} [isOpen] - Open state when driven
 * @param {boolean} [isStruck] - Title struck through
 * @param {() => void} [onToggle] - Called on a press when driven
 * @param {ReactNode} children - Content once unfolded
 * @return {JSX.Element}
 */

export const QuestionFold = ({
  title,
  isOpen,
  isStruck,
  onToggle,
  children,
}: QuestionFoldProps) => {
  const Chevron = ICONS.next

  return (
    <details className={QUESTION_BODY.fold} open={onToggle ? isOpen : undefined}>
      <summary
        className={QUESTION_BODY.foldHead}
        onClick={
          onToggle
            ? (event) => {
                event.preventDefault()
                onToggle()
              }
            : undefined
        }
      >
        <span className={cn(isStruck && INTERVIEW.promptSkipped)}>{title}</span>
        <Chevron className={QUESTION_BODY.foldChevron} aria-hidden="true" />
      </summary>
      <div className={QUESTION_BODY.foldBody}>{children}</div>
    </details>
  )
}
