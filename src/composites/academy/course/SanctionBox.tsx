'use client'

import { useEffect, useState } from 'react'

import { ChatLineView } from '@/composites/academy/course/ChatFeed'
import { SanctionChip } from '@/composites/academy/course/SanctionChip'
import { useLevelLook } from '@/composites/academy/course/useLevelLook'
import { useInView } from '@/core/hooks/interaction/useInView'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type { ReadBlock } from '@/declarations/academy/curriculum/types'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import { ICONS } from '@/declarations/ui/icons'
import { COURSE_CHAT, COURSE_SANCTIONBOX } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface SanctionBoxProps {
  block: Extract<ReadBlock, { kind: 'sanctionBox' }>
  // Inside the box of a subject, so no box of its own
  isNested?: boolean
}

/**
 * The sanctions box of the panel for one offence: the Livecon laid over the table falls level by
 * level, slowly, and the table hardens under it. Clicking the Livecon moves it on by hand
 * @param {SanctionBoxProps} props - Offence and its levels declared in code
 * @return {JSX.Element}
 */

export const SanctionBox = ({ block, isNested = false }: SanctionBoxProps) => {
  const look = useLevelLook()
  const [ref, isSeen] = useInView()
  const [active, setActive] = useState(0)
  const [isPinned, setPinned] = useState(false)
  // Calmest level first
  const levels = [...block.levels].sort((first, second) => second.level - first.level)

  // The level falls on its own once on screen, then starts over
  useEffect(() => {
    if (!isSeen || isPinned || levels.length === 0) return

    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % levels.length),
      ACADEMY_SETTINGS.liveconCycleMs
    )

    return () => window.clearInterval(timer)
  }, [isSeen, isPinned, levels.length])

  if (levels.length === 0) return null

  return (
    <div ref={ref} className={cn(COURSE_SANCTIONBOX.root, !isNested && COURSE_SANCTIONBOX.rootBox)}>
      <div className={COURSE_SANCTIONBOX.title}>
        <p className={COURSE_SANCTIONBOX.label}>{COURSE_COPY.sanctionBoxTitle}</p>
        <h3 className={COURSE_SANCTIONBOX.offense}>{block.offense}</h3>
        <figure className={cn(COURSE_CHAT.twitch, COURSE_SANCTIONBOX.example)}>
          <ChatLineView
            line={{ author: 'Foxtrot', text: block.example }}
            surface="twitch"
            arriving={false}
          />
        </figure>
      </div>

      <div className={COURSE_SANCTIONBOX.stage}>
        <button
          type="button"
          aria-label={COURSE_COPY.liveconNext}
          className={COURSE_SANCTIONBOX.badges}
          onClick={() => {
            setPinned(true)
            setActive((index) => (index + 1) % levels.length)
          }}
        >
          {levels.map((level, index) => {
            const { name, icon } = look(level.level)
            const Icon = ICONS[icon]

            return (
              <span
                key={level.level}
                aria-hidden={index !== active}
                className={cn(
                  COURSE_SANCTIONBOX.badge,
                  index !== active && COURSE_SANCTIONBOX.badgeHidden
                )}
              >
                <Icon className={COURSE_SANCTIONBOX.badgeIcon} aria-hidden="true" />
                {name}
              </span>
            )
          })}
        </button>

        <div className={COURSE_SANCTIONBOX.table}>
          <div className={COURSE_SANCTIONBOX.tableHead}>
            <span className={COURSE_SANCTIONBOX.column}>{COURSE_COPY.sanctionTierColumn}</span>
            <span className={COURSE_SANCTIONBOX.column}>{COURSE_COPY.sanctionMeasureColumn}</span>
          </div>
          <div className={COURSE_SANCTIONBOX.rows}>
            {levels.map((level, levelIndex) => {
              const isActive = levelIndex === active

              return (
                <div
                  key={`${level.level}-${isActive}`}
                  aria-hidden={!isActive}
                  className={cn(
                    'col-start-1 row-start-1',
                    !isActive && COURSE_SANCTIONBOX.rowsHidden
                  )}
                >
                  {level.tiers.map((tier, index) => (
                    <div
                      key={tier.condition}
                      className={COURSE_SANCTIONBOX.row}
                      style={{ animationDelay: `calc(var(--motion-stagger) * ${index})` }}
                    >
                      <span className={COURSE_SANCTIONBOX.column}>{tier.condition}</span>
                      <span className={COURSE_SANCTIONBOX.measures}>
                        {tier.measures.map((measure) => (
                          <SanctionChip key={measure} measure={measure} />
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
