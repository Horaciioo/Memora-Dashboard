'use client'

import { SanctionChip } from '@/composites/academy/course/SanctionChip'
import { useLevelLook } from '@/composites/academy/course/useLevelLook'
import type { ReadBlock } from '@/declarations/academy/curriculum/types'
import { ICONS } from '@/declarations/ui/icons'
import { COURSE_COMPARE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface SanctionCompareProps {
  block: Extract<ReadBlock, { kind: 'sanctionCompare' }>
  // Inside the box of a subject, so no box of its own
  isNested?: boolean
}

/**
 * One offence of the panel side by side at every level: the sanctions harden as the Livecon falls
 * @param {SanctionCompareProps} props - Offence and its levels declared in code
 * @return {JSX.Element}
 */

export const SanctionCompare = ({ block, isNested = false }: SanctionCompareProps) => {
  const look = useLevelLook()
  // Calmest level first
  const levels = [...block.levels].sort((first, second) => second.level - first.level)

  return (
    <div className={cn(COURSE_COMPARE.root, !isNested && COURSE_COMPARE.rootBox)}>
      <p className={COURSE_COMPARE.offense}>{block.offense}</p>
      <div className={COURSE_COMPARE.columns}>
        {levels.map((level) => {
          const { name, icon } = look(level.level)
          const Icon = ICONS[icon]

          return (
            <section key={level.level} className={COURSE_COMPARE.column}>
              <header className={COURSE_COMPARE.head}>
                <Icon className={COURSE_COMPARE.icon} aria-hidden="true" />
                <h3 className={COURSE_COMPARE.name}>{name}</h3>
              </header>
              <div className={COURSE_COMPARE.tiers}>
                {level.tiers.map((tier) => (
                  <div key={tier.condition} className={COURSE_COMPARE.tier}>
                    <span className={COURSE_COMPARE.tierLabel}>{tier.condition}</span>
                    <span className={COURSE_COMPARE.measures}>
                      {tier.measures.map((measure) => (
                        <SanctionChip key={measure} measure={measure} />
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
