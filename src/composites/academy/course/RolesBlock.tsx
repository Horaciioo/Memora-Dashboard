'use client'

import { Markdown } from '@/components/elements/display/Markdown'
import { useInView } from '@/core/hooks/interaction/useInView'
import type { ReadBlock, RoleRule, RoleSide } from '@/declarations/academy/curriculum/types'
import { COURSE_READ, COURSE_RULES, COURSE_TONES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface RolesBlockProps {
  block: Extract<ReadBlock, { kind: 'roles' }>
}

// Where a box is centred, in percent of the width
const SIDE_CENTRES: Record<RoleSide, number> = { left: 27.5, center: 50, right: 72.5 }

/**
 * One box and the line that leads to it
 * @param {Object} props - Row
 * @return {JSX.Element}
 */

const RoleStep = ({ row, from }: { row: RoleRule; from?: RoleSide }) => {
  const [ref, isSeen] = useInView()

  return (
    <div className={cn(COURSE_RULES.item, COURSE_RULES[row.side])}>
      {from && (
        <div
          className={cn(COURSE_RULES.link, !isSeen && COURSE_RULES.linkHidden)}
          aria-hidden="true"
        >
          <svg className="size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              className={COURSE_RULES.linkPath}
              vectorEffect="non-scaling-stroke"
              d={`M${SIDE_CENTRES[from]} 8 C${SIDE_CENTRES[from]} 50 ${SIDE_CENTRES[row.side]} 40 ${SIDE_CENTRES[row.side]} 82`}
            />
          </svg>
          <svg
            className={COURSE_RULES.linkArrow}
            style={{ left: `${SIDE_CENTRES[row.side]}%` }}
            viewBox="0 0 16 16"
          >
            <path d="M3 5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      <div ref={ref} className={cn(COURSE_RULES.box, !isSeen && COURSE_RULES.boxHidden)}>
        <p className={cn(COURSE_RULES.roleBadge, COURSE_TONES[row.tone])}>{row.label}</p>
        <div className={COURSE_RULES.card}>
          <Markdown source={row.text} className={COURSE_RULES.text} />
        </div>
      </div>
    </div>
  )
}

/**
 * What each role does: boxes stepping down the page, each shown once reached
 * @param {RolesBlockProps} props - Rows declared in code
 * @return {JSX.Element}
 */

export const RolesBlock = ({ block }: RolesBlockProps) => (
  <section className={COURSE_READ.section}>
    <h2 className={COURSE_READ.heading}>{block.title}</h2>
    <div className={COURSE_RULES.rows}>
      {block.rows.map((row, index) => (
        <RoleStep key={row.label} row={row} from={block.rows[index - 1]?.side} />
      ))}
    </div>
  </section>
)
