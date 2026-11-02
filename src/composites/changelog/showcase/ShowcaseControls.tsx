import type { ShowcaseClock } from '@/core/hooks/interaction/useShowcaseClock'
import { SHOWCASE_COPY, SHOWCASE_SETTINGS } from '@/declarations/changelog/showcase'
import { ICONS } from '@/declarations/ui/icons'
import { SHOWCASE } from '@/declarations/ui/variants'

export interface ShowcaseControlsProps {
  clock: ShowcaseClock
}

// Time as m:ss
const timeOf = (step: number): string => {
  const seconds = Math.round((step * SHOWCASE_SETTINGS.stepMs) / 1000)

  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

/**
 * Player bar: play, pause or replay, time and progress
 * @param {ShowcaseClock} clock - Clock state
 * @return {JSX.Element}
 */

export const ShowcaseControls = ({ clock }: ShowcaseControlsProps) => {
  const { step, isPaused, isEnded, toggle, seek } = clock
  const Icon = isEnded ? ICONS.refresh : isPaused ? ICONS.mediaPlay : ICONS.mediaPause
  const label = isEnded ? SHOWCASE_COPY.replay : isPaused ? SHOWCASE_COPY.play : SHOWCASE_COPY.pause

  return (
    <div className={SHOWCASE.controls}>
      <div className={SHOWCASE.track}>
        <span
          className={SHOWCASE.fill}
          style={{
            width: `${(step / SHOWCASE_SETTINGS.last) * 100}%`,
            transitionDuration: `${SHOWCASE_SETTINGS.stepMs}ms`,
          }}
        >
          <span className={SHOWCASE.knob} />
        </span>
        <input
          type="range"
          min={0}
          max={SHOWCASE_SETTINGS.last}
          step={1}
          value={step}
          aria-label={SHOWCASE_COPY.seek}
          aria-valuetext={timeOf(step)}
          className={SHOWCASE.seek}
          onChange={(event) => seek(Number(event.target.value))}
        />
      </div>
      <div className={SHOWCASE.barRow}>
        <button
          type="button"
          className={SHOWCASE.control}
          aria-label={label}
          title={label}
          onClick={toggle}
        >
          <Icon className={SHOWCASE.controlGlyph} aria-hidden="true" />
        </button>
        <span className={SHOWCASE.time}>
          {`${timeOf(step)} / ${timeOf(SHOWCASE_SETTINGS.last)}`}
        </span>
      </div>
    </div>
  )
}
