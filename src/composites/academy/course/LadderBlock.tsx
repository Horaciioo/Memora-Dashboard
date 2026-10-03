'use client'

import type { CSSProperties } from 'react'
import { Fragment } from 'react'

import { useCourseContext } from '@/composites/academy/course/CourseContextProvider'
import { COURSE_COPY } from '@/declarations/academy/copy'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import type { HierarchyRung, ReadBlock } from '@/declarations/academy/curriculum/types'
import { COURSE_LADDER } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Colour of each rung, top to bottom
const RUNG_PAINT: Record<HierarchyRung['source'], string> = {
  admins: COURSE_LADDER.top,
  responsables: COURSE_LADDER.middle,
  coordinator: COURSE_LADDER.bottom,
}

export interface LadderBlockProps {
  block: Extract<ReadBlock, { kind: 'hierarchy' }>
}

/**
 * Decision ladder, its names read from the accounts, landing rung by rung
 * @param {LadderBlockProps} props - Ladder declared in code
 * @return {JSX.Element}
 */

export const LadderBlock = ({ block }: LadderBlockProps) => {
  const { ladder } = useCourseContext()

  const namesOf = (rung: HierarchyRung): string[] =>
    rung.source === 'coordinator' ? [rung.label] : ladder[rung.source]

  return (
    <figure className={COURSE_LADDER.root} aria-label={COURSE_COPY.ladder}>
      {block.rungs.map((rung, index) => {
        const names = namesOf(rung)

        return (
          <Fragment key={rung.source}>
            {index > 0 && <span className={COURSE_LADDER.link} aria-hidden="true" />}
            <div
              className={COURSE_LADDER.rung}
              style={
                {
                  '--rung-delay': `${index * ACADEMY_SETTINGS.ladderRungDelayMs}ms`,
                } as CSSProperties
              }
            >
              {rung.source !== 'coordinator' && (
                <span className={COURSE_LADDER.label}>{rung.label}</span>
              )}
              {names.length === 0 ? (
                <span className={COURSE_LADDER.empty}>{COURSE_COPY.ladderEmpty}</span>
              ) : (
                <span className={COURSE_LADDER.names}>
                  {names.map((name) => (
                    <span key={name} className={cn(COURSE_LADDER.name, RUNG_PAINT[rung.source])}>
                      {name}
                    </span>
                  ))}
                </span>
              )}
            </div>
          </Fragment>
        )
      })}
    </figure>
  )
}
