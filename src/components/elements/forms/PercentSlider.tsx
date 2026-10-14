'use client'

import { useState } from 'react'

import { PercentInput } from '@/components/elements/forms/PercentInput'
import { PERCENT_SLIDER } from '@/declarations/ui/variants'

export interface PercentSliderProps {
  value: number
  max: number
  label: string
  disabled?: boolean
  onCommit: (value: number) => void
}

/**
 * Notched slider beside its typed percentage
 * @param {number} value - Current percentage
 * @param {number} max - Highest percentage
 * @param {string} label - Accessible name
 * @param {boolean} [disabled] - Blocks both controls
 * @param {(value: number) => void} onCommit - Called with the settled value
 * @return {JSX.Element}
 */

export const PercentSlider = ({ value, max, label, disabled, onCommit }: PercentSliderProps) => {
  // Value while dragging, none at rest
  const [live, setLive] = useState<number | null>(null)
  const shown = live ?? value
  const ratio = (shown / max) * 100

  const settle = () => {
    if (live === null) return

    setLive(null)
    if (live !== value) onCommit(live)
  }

  return (
    <div className={PERCENT_SLIDER.root}>
      <div className={PERCENT_SLIDER.track}>
        <span className={PERCENT_SLIDER.base} />
        <span
          className={PERCENT_SLIDER.fill}
          style={{ width: `${ratio}%`, backgroundSize: `${ratio > 0 ? 10000 / ratio : 100}% 100%` }}
        />
        <input
          type="range"
          min={0}
          max={max}
          step={1}
          value={shown}
          aria-label={label}
          disabled={disabled}
          onChange={(event) => setLive(Number(event.target.value))}
          onPointerUp={settle}
          onKeyUp={settle}
          onBlur={settle}
          className={PERCENT_SLIDER.range}
        />
      </div>
      <PercentInput value={shown} max={max} label={label} disabled={disabled} onCommit={onCommit} />
    </div>
  )
}
