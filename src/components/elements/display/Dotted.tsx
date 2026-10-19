import { Fragment } from 'react'
import type { ReactNode } from 'react'

import { DOTTED } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface DottedProps {
  items: (ReactNode | null | undefined | false)[]
  className?: string
}

/**
 * Items of one line split by a small drawn dot, empty ones left out
 * @param {(ReactNode | null | undefined | false)[]} items - Pieces of the line
 * @param {string} [className] - Extra classes
 * @return {JSX.Element}
 */

export const Dotted = ({ items, className }: DottedProps) => (
  <span className={cn(DOTTED.root, className)}>
    {items
      .filter((item) => item !== null && item !== undefined && item !== false && item !== '')
      .map((item, index) => (
        <Fragment key={index}>
          {index > 0 && <span className={DOTTED.dot} aria-hidden="true" />}
          <span>{item}</span>
        </Fragment>
      ))}
  </span>
)

/**
 * One drawn dot between two pieces of inline text
 * @return {JSX.Element}
 */

export const DotMark = () => <span className={DOTTED.mark} aria-hidden="true" />
