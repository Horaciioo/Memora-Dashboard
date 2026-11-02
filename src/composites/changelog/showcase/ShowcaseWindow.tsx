import type { ReactNode } from 'react'

import { Skeleton } from '@/components/elements/feedback/Skeleton'
import { SHOWCASE_SKELETONS } from '@/declarations/changelog/showcase'
import { SEGMENT_LABELS } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { SHOWCASE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface ShowcaseWindowProps {
  active: 'absences' | 'pages'
  children: ReactNode
}

// Row slots of skeleton
const slots = (count: number) => Array.from({ length: count }, (_, index) => index)

/**
 * Mock app: real entries in the rail, the rest in skeleton
 * @param {'absences' | 'pages'} active - Lit entry
 * @param {ReactNode} children - Page content
 * @return {JSX.Element}
 */

export const ShowcaseWindow = ({ active, children }: ShowcaseWindowProps) => {
  const AbsenceIcon = ICONS.absences
  const PageIcon = ICONS.page

  return (
    <>
      <aside className={SHOWCASE.side} aria-hidden="true">
        {slots(SHOWCASE_SKELETONS.side).map((slot) => (
          <Skeleton key={slot} shape="row" className={SHOWCASE.sideBone} />
        ))}
        <span className={cn(SHOWCASE.sideRow, active === 'absences' && SHOWCASE.sideRowOn)}>
          <AbsenceIcon className={SHOWCASE.sideGlyph} />
          {SEGMENT_LABELS.absences}
        </span>
        {slots(SHOWCASE_SKELETONS.sideAfter).map((slot) => (
          <Skeleton key={slot} shape="row" className={SHOWCASE.sideBone} />
        ))}
        <span className={cn(SHOWCASE.sideRow, active === 'pages' && SHOWCASE.sideRowOn)}>
          <PageIcon className={SHOWCASE.sideGlyph} />
          {SEGMENT_LABELS.pages}
        </span>
      </aside>
      <div className={SHOWCASE.main}>{children}</div>
    </>
  )
}
