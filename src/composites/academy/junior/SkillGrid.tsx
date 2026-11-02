'use client'

import { Dotted } from '@/components/elements/display/Dotted'
import { useState } from 'react'

import { Status } from '@/components/elements/display/Status'
import { StarRating } from '@/components/elements/forms/inputs/StarRating'
import { groupSkills } from '@/core/lib/academy/skillGroups'
import { percentToStars, starsToPercent } from '@/core/lib/academy/skillStars'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import { ICONS } from '@/declarations/ui/icons'
import { SKILL_GRID } from '@/declarations/ui/variants'
import type { JuniorSkillView } from '@/types/academy'
import { cn } from '@/utils/classnames'
import { formatDay } from '@/utils/format/dates'

export interface SkillGridProps {
  skills: JuniorSkillView[]
  canWrite: boolean
  onGrade: (skillId: string, percent: number) => void
}

/**
 * Competencies in one box per category, each graded in stars
 * @param {JuniorSkillView[]} skills - Competency grades
 * @param {boolean} canWrite - Member may grade
 * @param {(skillId: string, percent: number) => void} onGrade - Called with a new grade
 * @return {JSX.Element}
 */

export const SkillGrid = ({ skills, canWrite, onGrade }: SkillGridProps) => {
  // Descriptions unfolded
  const [open, setOpen] = useState<Set<string>>(new Set())
  const Chevron = ICONS.expand
  const { skillMaxPercent: maxPercent, skillStars: stars } = ACADEMY_SETTINGS

  const toggle = (skillId: string) =>
    setOpen((current) => {
      const next = new Set(current)
      if (!next.delete(skillId)) next.add(skillId)

      return next
    })

  return (
    <div className={SKILL_GRID.root}>
      {groupSkills(skills).map((group) => {
        const average = Math.round(
          group.items.reduce((sum, skill) => sum + skill.percent, 0) / group.items.length
        )

        return (
          <article key={group.id} className={SKILL_GRID.box}>
            <header className={SKILL_GRID.head}>
              <h3 className={SKILL_GRID.title}>
                <Status label={group.name} accent={group.accent} />
              </h3>
              <StarRating
                isSmall
                disabled
                value={percentToStars(average, maxPercent, stars)}
                count={stars}
                label={`${group.name}, ${ACADEMY_COPY.skillStarsLabel}`}
              />
            </header>
            {group.items.map((skill) => {
              const isOpen = open.has(skill.skillId)

              return (
                <div key={skill.skillId} className={SKILL_GRID.row}>
                  <div className={SKILL_GRID.line}>
                    {skill.description ? (
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-label={skill.name}
                        onClick={() => toggle(skill.skillId)}
                        className={SKILL_GRID.toggle}
                      >
                        <Chevron
                          className={cn(SKILL_GRID.toggleGlyph, isOpen && SKILL_GRID.toggleOpen)}
                          aria-hidden="true"
                        />
                      </button>
                    ) : (
                      <span className={SKILL_GRID.toggleSpacer} aria-hidden="true" />
                    )}
                    <span className={SKILL_GRID.name}>{skill.name}</span>
                    {skill.updatedAt && (
                      <span className={SKILL_GRID.stamp}>
                        <Dotted items={[formatDay(skill.updatedAt), skill.validatorName]} />
                      </span>
                    )}
                    <div className={SKILL_GRID.bar}>
                      <StarRating
                        value={percentToStars(skill.percent, maxPercent, stars)}
                        count={stars}
                        label={`${skill.name}, ${ACADEMY_COPY.skillStarsLabel}`}
                        disabled={!canWrite}
                        onCommit={(count) =>
                          onGrade(skill.skillId, starsToPercent(count, maxPercent, stars))
                        }
                      />
                    </div>
                  </div>
                  {skill.description && isOpen && (
                    <p className={SKILL_GRID.description}>{skill.description}</p>
                  )}
                </div>
              )
            })}
          </article>
        )
      })}
    </div>
  )
}
