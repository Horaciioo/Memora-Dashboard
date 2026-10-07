import { useLevelLook } from '@/composites/academy/course/useLevelLook'
import type { ReadBlock } from '@/declarations/academy/curriculum/types'
import { ICONS } from '@/declarations/ui/icons'
import { COURSE_READ, COURSE_RULES } from '@/declarations/ui/variants'

export interface RulesBlockProps {
  block: Extract<ReadBlock, { kind: 'rules' }>
}

/**
 * What the moderation does at each Livecon level: one box each, the level laid over its top edge
 * @param {RulesBlockProps} props - Rows declared in code
 * @return {JSX.Element}
 */

export const RulesBlock = ({ block }: RulesBlockProps) => {
  const look = useLevelLook()

  return (
    <section className={COURSE_READ.section}>
      <h2 className={COURSE_READ.heading}>{block.title}</h2>
      <div className={COURSE_RULES.rows}>
        {[...block.rows]
          .sort((first, second) => second.level - first.level)
          .map((row) => {
            const { name, icon } = look(row.level)
            const Icon = ICONS[icon]

            return (
              <div key={row.level} className={COURSE_RULES.row}>
                <p className={COURSE_RULES.badge}>
                  <Icon className={COURSE_RULES.badgeIcon} aria-hidden="true" />
                  {name}
                </p>
                <p className={COURSE_RULES.card}>
                  <span className={COURSE_RULES.text}>{row.text}</span>
                </p>
              </div>
            )
          })}
      </div>
    </section>
  )
}
