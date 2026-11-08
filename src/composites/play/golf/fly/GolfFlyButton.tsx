'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

import { GOLF_BOARD_COPY } from '@/declarations/play/golf/copy'
import { GOLF_COURSES } from '@/declarations/play/golf/courses'
import { ICONS } from '@/declarations/ui/icons'
import { GOLF_FLY } from '@/declarations/ui/variants'

// Three loaded only when a flight opens
const GolfFlyScene = dynamic(() => import('@/composites/play/golf/fly/GolfFlyScene'), {
  ssr: false,
})

/**
 * Orange zap opening a free flight over a whole map, for play managers
 * @return {JSX.Element}
 */

export const GolfFlyButton = () => {
  const [course, setCourse] = useState<string | null>(null)
  const ZapIcon = ICONS.golfZap

  return (
    <>
      <button
        type="button"
        className={GOLF_FLY.open}
        aria-label={GOLF_BOARD_COPY.flyOpen}
        title={GOLF_BOARD_COPY.flyOpen}
        onClick={() => setCourse(GOLF_COURSES.keys[0])}
      >
        <ZapIcon className={GOLF_FLY.openIcon} aria-hidden="true" />
      </button>
      {course && (
        <div className={GOLF_FLY.root} role="dialog" aria-label={GOLF_BOARD_COPY.flyOpen}>
          <div className={GOLF_FLY.canvas}>
            <GolfFlyScene course={course} />
          </div>
          <div className={GOLF_FLY.bar}>
            <select
              className={GOLF_FLY.select}
              aria-label={GOLF_BOARD_COPY.flyMap}
              value={course}
              onChange={(event) => setCourse(event.target.value)}
            >
              {GOLF_COURSES.keys.map((key) => (
                <option key={key} value={key} className={GOLF_FLY.option}>
                  {GOLF_COURSES.get(key).label}
                </option>
              ))}
            </select>
            <p className={GOLF_FLY.hint}>{GOLF_BOARD_COPY.flyHint}</p>
            <button type="button" className={GOLF_FLY.close} onClick={() => setCourse(null)}>
              {GOLF_BOARD_COPY.flyClose}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
