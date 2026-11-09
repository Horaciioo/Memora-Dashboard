'use client'

import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'

import { COLOUR_COPY } from '@/declarations/ui/copy'
import { COLOUR_WHEEL_STYLES } from '@/declarations/ui/variants'
import { hexToHsv, hsvToHex, isHexColour } from '@/utils/format/colour'
import type { Hsv } from '@/utils/format/colour'

export interface ColourWheelProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

/**
 * Free colour wheel: hue around, saturation from the centre, brightness below
 * @param {ColourWheelProps} props - Stored colour and handler
 * @return {JSX.Element}
 */

export const ColourWheel = ({ value, onChange, disabled }: ColourWheelProps) => {
  const wheelRef = useRef<HTMLDivElement>(null)
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(isHexColour(value) ? value : '#ffffff'))

  const commit = (next: Hsv) => {
    setHsv(next)
    onChange(hsvToHex(next))
  }

  // Pointer to hue and saturation
  const pick = (event: PointerEvent<HTMLDivElement>) => {
    const box = wheelRef.current?.getBoundingClientRect()
    if (!box || disabled) return
    const x = event.clientX - (box.left + box.width / 2)
    const y = event.clientY - (box.top + box.height / 2)
    const radius = box.width / 2

    commit({
      h: ((Math.atan2(y, x) * 180) / Math.PI + 450) % 360,
      s: Math.min(1, Math.hypot(x, y) / radius),
      v: hsv.v || 1,
    })
  }

  const angle = ((hsv.h - 90) * Math.PI) / 180

  return (
    <div className={COLOUR_WHEEL_STYLES.root}>
      <div
        ref={wheelRef}
        className={COLOUR_WHEEL_STYLES.wheel}
        role="presentation"
        aria-label={COLOUR_COPY.wheel}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          pick(event)
        }}
        onPointerMove={(event) => event.buttons === 1 && pick(event)}
      >
        <span
          className={COLOUR_WHEEL_STYLES.knob}
          style={{
            left: `${50 + Math.cos(angle) * hsv.s * 50}%`,
            top: `${50 + Math.sin(angle) * hsv.s * 50}%`,
            background: hsvToHex({ ...hsv, v: 1 }),
          }}
        />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(hsv.v * 100)}
        disabled={disabled}
        aria-label={COLOUR_COPY.brightness}
        className={COLOUR_WHEEL_STYLES.slider}
        style={{
          background: `linear-gradient(to right, #000, ${hsvToHex({ ...hsv, v: 1 })})`,
        }}
        onChange={(event) => commit({ ...hsv, v: Number(event.target.value) / 100 })}
      />
    </div>
  )
}
