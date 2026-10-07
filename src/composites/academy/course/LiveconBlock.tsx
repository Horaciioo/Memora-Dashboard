'use client'

import { useEffect, useState } from 'react'

import { useCourseContext } from '@/composites/academy/course/CourseContextProvider'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type { ReadBlock } from '@/declarations/academy/curriculum/types'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import { ICONS, isIconName } from '@/declarations/ui/icons'
import { COURSE_LIVECON } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Calmest first
const SHADES = [
  { border: COURSE_LIVECON.calm, fill: COURSE_LIVECON.calmFill },
  { border: COURSE_LIVECON.watch, fill: COURSE_LIVECON.watchFill },
  { border: COURSE_LIVECON.crisis, fill: COURSE_LIVECON.crisisFill },
]

export interface LiveconBlockProps {
  block: Extract<ReadBlock, { kind: 'livecon' }>
}

/**
 * Livecon levels one after the other
 * @param {LiveconBlockProps} props - Levels declared in code
 * @return {JSX.Element}
 */

export const LiveconBlock = ({ block }: LiveconBlockProps) => {
  const { livecon } = useCourseContext()
  const [active, setActive] = useState(0)
  const [isPinned, setPinned] = useState(false)

  // Levels calmest first
  const stops = block.stops.map((stop) => ({
    stop,
    level: livecon.find((entry) => entry.level === stop.level) ?? null,
  }))

  // The level slides down on its own until one is picked
  useEffect(() => {
    if (isPinned || stops.length === 0) return

    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % stops.length),
      ACADEMY_SETTINGS.liveconCycleMs
    )
    return () => window.clearInterval(timer)
  }, [isPinned, stops.length])

  const current = stops[active]
  // A few offences of the panel at the level on display
  const samples = (current?.level?.samples ?? []).slice(0, ACADEMY_SETTINGS.courseSampleOffenses)
  const shade = SHADES[Math.min(active, SHADES.length - 1)]!

  return (
    <div className={COURSE_LIVECON.root}>
      <div className={COURSE_LIVECON.levels}>
        {stops.map(({ stop, level }, index) => {
          const Icon = ICONS[level?.icon && isIconName(level.icon) ? level.icon : 'livecon']
          const tone = SHADES[Math.min(index, SHADES.length - 1)]!

          return (
            <button
              key={stop.level}
              type="button"
              aria-pressed={index === active}
              className={cn(
                COURSE_LIVECON.level,
                index === active && [COURSE_LIVECON.levelActive, tone.border]
              )}
              onClick={() => {
                setPinned(true)
                setActive(index)
              }}
            >
              <Icon className={COURSE_LIVECON.levelIcon} aria-hidden="true" />
              <span className={COURSE_LIVECON.levelBody}>
                <span className={COURSE_LIVECON.levelName}>
                  {level?.name ?? COURSE_COPY.liveconLevel(stop.level)}
                </span>
                <span className={COURSE_LIVECON.levelText}>{stop.text}</span>
                {index === active &&
                  stop.notes?.map((note) => (
                    <span key={note} className={COURSE_LIVECON.levelNote}>
                      {note}
                    </span>
                  ))}
              </span>
            </button>
          )
        })}
      </div>

      {current && (
        <section key={current.stop.level} className={cn(COURSE_LIVECON.panel, shade.border)}>
          <header className={COURSE_LIVECON.panelHead}>
            <ICONS.sanctionsPanel className={COURSE_LIVECON.panelIcon} aria-hidden="true" />
            <span className={COURSE_LIVECON.panelTitle}>
              {COURSE_COPY.liveconPanel(current.level?.name ?? '')}
            </span>
          </header>
          {samples.length === 0 ? (
            <p className={COURSE_LIVECON.empty}>{COURSE_COPY.liveconNoPanel}</p>
          ) : (
            samples.map((sample) => (
              <div key={sample.offense} className={COURSE_LIVECON.sample}>
                <span className={COURSE_LIVECON.sampleName}>{sample.offense}</span>
                <span className={COURSE_LIVECON.measures}>
                  {sample.measures.map((measure) => (
                    <span key={measure} className={cn(COURSE_LIVECON.measure, shade.fill)}>
                      {measure}
                    </span>
                  ))}
                </span>
              </div>
            ))
          )}
        </section>
      )}
    </div>
  )
}
