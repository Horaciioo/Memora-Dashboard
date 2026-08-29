'use client'

import { useState } from 'react'
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react'

import { Input } from '@/components/elements/forms/Input'
import { COLOUR_SETTINGS } from '@/declarations/configurations/settings'
import { COLOUR_COPY, PICKER_COPY } from '@/declarations/ui/copy'
import { COLOUR_WHEEL_STYLES, FIELD_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { hexToHsv, hsvToHex, isHexColour, normaliseHex } from '@/utils/format/colour'
import type { ColourHsv } from '@/utils/format/colour'

export interface ColourWheelProps {
  id: string
  label: string
  value: string
  onChange: (value: string | null) => void
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
}

// Angle a fresh wheel opens on, fully saturated and fully lit
const DEFAULT_POSITION: ColourHsv = { hue: 0, saturation: 1, value: 1 }

// Steps one arrow key travels, in degrees of hue and in hundredths of saturation
const HUE_STEP = 6
const SATURATION_STEP = 0.05

// Slider reads brightness in whole percents
const BRIGHTNESS_MAX = 100

// Half a turn, the reference the thumb offsets from
const HALF = 50

/**
 * Hue circle, brightness slider and hexadecimal field, the single colour control of every form
 * @param {string} id - Identifier of the typed field
 * @param {string} label - Accessible name of the wheel
 * @param {string} value - Stored colour
 * @param {(value: string | null) => void} onChange - Colour handler
 * @param {boolean} [disabled] - Blocks the control
 * @param {boolean} [invalid] - Paints the rejection border
 * @param {string} [describedBy] - Identifier of the describing message
 * @return {JSX.Element}
 */

export const ColourWheel = ({
  id,
  label,
  value,
  onChange,
  disabled,
  invalid,
  describedBy,
}: ColourWheelProps) => {
  const [memory, setMemory] = useState<ColourHsv>(DEFAULT_POSITION)
  const [typed, setTyped] = useState<string | null>(null)

  const position = isHexColour(value) ? hexToHsv(value, memory) : memory
  const drawn = hsvToHex(position)

  const commit = (next: ColourHsv) => {
    setMemory(next)
    setTyped(null)
    onChange(hsvToHex(next))
  }

  // Pointer position on the circle, read as an angle and a distance from the centre
  const pickFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const fromCentreX = event.clientX - rect.left - rect.width / 2
    const fromCentreY = event.clientY - rect.top - rect.height / 2
    const radius = Math.min(rect.width, rect.height) / 2

    commit({
      hue: (Math.atan2(fromCentreX, -fromCentreY) * (180 / Math.PI) + 360) % 360,
      saturation: Math.min(1, Math.hypot(fromCentreX, fromCentreY) / radius),
      value: position.value,
    })
  }

  const onWheelPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) return

    event.currentTarget.setPointerCapture(event.pointerId)
    pickFromPointer(event)
  }

  const onWheelPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || !event.currentTarget.hasPointerCapture(event.pointerId)) return

    pickFromPointer(event)
  }

  // Arrows walk the circle, so the wheel is reachable without a pointer
  const onWheelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const hueShift = { ArrowRight: HUE_STEP, ArrowLeft: -HUE_STEP }[event.key]
    const saturationShift = { ArrowUp: SATURATION_STEP, ArrowDown: -SATURATION_STEP }[event.key]
    if (hueShift === undefined && saturationShift === undefined) return

    event.preventDefault()
    commit({
      hue: (position.hue + (hueShift ?? 0) + 360) % 360,
      saturation: Math.min(1, Math.max(0, position.saturation + (saturationShift ?? 0))),
      value: position.value,
    })
  }

  // The typed code only reaches the form once it reads as a colour
  const onTyped = (raw: string) => {
    setTyped(raw)

    const normalised = normaliseHex(raw)
    if (!normalised) return

    setMemory(hexToHsv(normalised, position))
    onChange(normalised)
  }

  const thumbStyle: CSSProperties = {
    left: `${HALF + Math.sin((position.hue * Math.PI) / 180) * position.saturation * HALF}%`,
    top: `${HALF - Math.cos((position.hue * Math.PI) / 180) * position.saturation * HALF}%`,
    backgroundColor: drawn,
  }

  const brightnessStyle: CSSProperties = {
    background: `linear-gradient(to right, black, ${hsvToHex({ ...position, value: 1 })})`,
  }

  const typedInvalid = typed !== null && normaliseHex(typed) === null

  return (
    <div className={cn(COLOUR_WHEEL_STYLES.wrapper, disabled && COLOUR_WHEEL_STYLES.disabled)}>
      <div className={COLOUR_WHEEL_STYLES.board}>
        <div
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={`${label} — ${COLOUR_COPY.wheel}`}
          aria-valuemin={0}
          aria-valuemax={360}
          aria-valuenow={Math.round(position.hue)}
          aria-valuetext={drawn}
          aria-disabled={disabled || undefined}
          className={cn(COLOUR_WHEEL_STYLES.wheel, 'colour-wheel-hue')}
          onPointerDown={onWheelPointerDown}
          onPointerMove={onWheelPointerMove}
          onKeyDown={onWheelKeyDown}
        >
          <span className={cn(COLOUR_WHEEL_STYLES.veil, 'colour-wheel-tint')} aria-hidden="true" />
          <span
            className={COLOUR_WHEEL_STYLES.shade}
            style={{ opacity: 1 - position.value }}
            aria-hidden="true"
          />
          <span className={COLOUR_WHEEL_STYLES.thumb} style={thumbStyle} aria-hidden="true" />
        </div>

        <div className={COLOUR_WHEEL_STYLES.controls}>
          <div className={COLOUR_WHEEL_STYLES.row}>
            <span
              className={COLOUR_WHEEL_STYLES.preview}
              style={{ backgroundColor: drawn }}
              role="img"
              aria-label={`${COLOUR_COPY.preview} ${drawn}`}
            />
            <Input
              id={id}
              value={typed ?? (isHexColour(value) ? value.toUpperCase() : '')}
              placeholder={COLOUR_COPY.hex}
              aria-label={`${label} — ${COLOUR_COPY.hex}`}
              aria-describedby={describedBy}
              invalid={invalid || typedInvalid}
              disabled={disabled}
              className={COLOUR_WHEEL_STYLES.code}
              onChange={(event) => onTyped(event.target.value)}
            />
            <button
              type="button"
              className={FIELD_STYLES.hint}
              disabled={disabled}
              onClick={() => {
                setTyped(null)
                onChange(null)
              }}
            >
              {PICKER_COPY.clear}
            </button>
          </div>

          <input
            type="range"
            min={0}
            max={BRIGHTNESS_MAX}
            value={Math.round(position.value * BRIGHTNESS_MAX)}
            aria-label={`${label} — ${COLOUR_COPY.brightness}`}
            disabled={disabled}
            className={COLOUR_WHEEL_STYLES.slider}
            style={brightnessStyle}
            onChange={(event) =>
              commit({ ...position, value: Number(event.target.value) / BRIGHTNESS_MAX })
            }
          />
        </div>
      </div>

      {COLOUR_SETTINGS.swatches.length > 0 && (
        <div
          className={COLOUR_WHEEL_STYLES.swatches}
          aria-label={COLOUR_COPY.swatches}
          role="group"
        >
          {COLOUR_SETTINGS.swatches.map((swatch) => (
            <button
              key={swatch}
              type="button"
              aria-label={swatch}
              aria-pressed={normaliseHex(value ?? '') === swatch}
              disabled={disabled}
              className={cn(
                COLOUR_WHEEL_STYLES.swatch,
                normaliseHex(value ?? '') === swatch && COLOUR_WHEEL_STYLES.swatchSelected
              )}
              style={{ backgroundColor: swatch }}
              onClick={() => {
                setTyped(null)
                setMemory(hexToHsv(swatch, position))
                onChange(swatch)
              }}
            />
          ))}
        </div>
      )}

      {typedInvalid && <p className={FIELD_STYLES.error}>{COLOUR_COPY.invalid}</p>}
    </div>
  )
}
