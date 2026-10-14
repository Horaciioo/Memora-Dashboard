'use client'

import { useState } from 'react'

import { Status } from '@/components/elements/display/Status'
import { PercentSlider } from '@/components/elements/forms/PercentSlider'
import { groupSkills } from '@/core/lib/academy/skillGroups'
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
 * Competencies in one box per category, each graded by typing its percentage
 * @param {JuniorSkillView[]} skills - Competency grades
 * @param {boolean} canWrite - Member may grade
 * @param {(skillId: string, percent: number) => void} onGrade - Called with a new grade
 * @return {JSX.Element}
 */

export const SkillGrid = ({ skills, canWrite, onGrade }: SkillGridProps) => {
  // Descriptions unfolded
  const [open, setOpen] = useState<Set<string>>(new Set())
  const Chevron = ICONS.expand

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
              <span className={SKILL_GRID.average}>{`${average}%`}</span>
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
                        {[formatDay(skill.updatedAt), skill.validatorName]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    )}
                    <div className={SKILL_GRID.bar}>
                      <PercentSlider
                        value={skill.percent}
                        max={ACADEMY_SETTINGS.skillMaxPercent}
                        label={`${skill.name} · ${ACADEMY_COPY.skillPercentLabel}`}
                        disabled={!canWrite}
                        onCommit={(percent) => onGrade(skill.skillId, percent)}
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
