'use client'

import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { ModView } from '@/composites/modview/ModView'
import { useModViewScene } from '@/core/hooks/interaction/useModViewScene'
import { previewPermissions } from '@/core/lib/modview/preview'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type { ReadBlock } from '@/declarations/academy/curriculum/types'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import { COURSE_TOUR } from '@/declarations/ui/variants'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import { cn } from '@/utils/classnames'

// Seat a junior sees the tour from
const JUNIOR_SEAT = 'JUNIOR'

export interface TourBlockProps {
  block: Extract<ReadBlock, { kind: 'tour' }>
}

/**
 * Guided tour of the Mod View: it builds itself, then each part lights up with its bubble,
 * picked from the list or played on its own
 * @param {TourBlockProps} props - Tour declared in code
 * @return {JSX.Element}
 */

export const TourBlock = ({ block }: TourBlockProps) => {
  const { session } = useAuthContext()
  const { driver } = useModViewScene(block.scene, {
    actorName: session?.displayName ?? COURSE_COPY.you,
  })
  const [isBuilt, setBuilt] = useState(false)
  const [active, setActive] = useState<number | null>(null)
  const [isAuto, setAuto] = useState(false)

  // The interface builds itself before the tour starts
  useEffect(() => {
    const timer = window.setTimeout(() => setBuilt(true), ACADEMY_SETTINGS.tourBuildMs)
    return () => window.clearTimeout(timer)
  }, [])

  // Auto mode walks every stop
  useEffect(() => {
    if (!isAuto) return

    const timer = window.setTimeout(
      () => {
        setActive((current) => {
          const next = current === null ? 0 : current + 1
          if (next >= block.stops.length) {
            setAuto(false)
            return null
          }
          return next
        })
      },
      active === null ? 0 : ACADEMY_SETTINGS.tourStepMs
    )

    return () => window.clearTimeout(timer)
  }, [isAuto, active, block.stops.length])

  const stop = active === null ? null : block.stops[active]
  const lit = useMemo(() => ({ ...driver, spotlight: stop?.target ?? null }), [driver, stop])

  return (
    <div className={COURSE_TOUR.root}>
      <p className={COURSE_TOUR.intro}>{block.intro}</p>
      <div className={COURSE_TOUR.toolbar}>
        <Button
          variant={isAuto ? 'secondary' : 'primary'}
          icon={undefined}
          disabled={!isBuilt}
          onClick={() => {
            setActive(null)
            setAuto(!isAuto)
          }}
        >
          {isAuto ? COURSE_COPY.tourStop : COURSE_COPY.tourAuto}
        </Button>
      </div>

      <div className={COURSE_TOUR.layout}>
        <nav className={COURSE_TOUR.list} aria-label={COURSE_COPY.tourList}>
          {block.stops.map((entry, index) => (
            <button
              key={entry.target}
              type="button"
              aria-current={index === active ? 'step' : undefined}
              disabled={!isBuilt}
              className={cn(COURSE_TOUR.stop, index === active && COURSE_TOUR.stopActive)}
              onClick={() => {
                setAuto(false)
                setActive(index === active ? null : index)
              }}
            >
              <span
                aria-hidden="true"
                className={cn(COURSE_TOUR.stopDot, index === active && COURSE_TOUR.stopDotActive)}
              />
              {entry.label}
            </button>
          ))}
        </nav>

        <div className={COURSE_TOUR.stage}>
          {isBuilt ? (
            <ModView
              driver={lit}
              permissions={previewPermissions(JUNIOR_SEAT)}
              panel={null}
              levelName={null}
              embedded
            />
          ) : (
            <div className={COURSE_TOUR.building} aria-hidden="true">
              <div className={COURSE_TOUR.buildingColumn}>
                <span className={COURSE_TOUR.buildingBlock} />
                <span className={COURSE_TOUR.buildingBlock} />
              </div>
              <div className={COURSE_TOUR.buildingColumn}>
                <span className={COURSE_TOUR.buildingBlock} />
              </div>
              <div className={COURSE_TOUR.buildingColumn}>
                <span className={COURSE_TOUR.buildingBlock} />
              </div>
            </div>
          )}

          {stop && (
            <div key={stop.target} className={COURSE_TOUR.bubble} role="status">
              <p className={COURSE_TOUR.bubbleTitle}>{stop.label}</p>
              <p className={COURSE_TOUR.bubbleBody}>{stop.body}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
