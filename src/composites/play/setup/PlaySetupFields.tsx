'use client'

import type { ReactNode } from 'react'

import { InfoHint } from '@/components/elements/feedback/InfoHint'
import { ICONS } from '@/declarations/ui/icons'
import { FIELD_STYLES } from '@/declarations/ui/variants'
import type { PlaySetupStyles } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Section title with its hint, a control on the right
 * @param {Object} props - Section
 * @param {PlaySetupStyles} props.styles - Game classes
 * @param {string} props.title - Title
 * @param {string} [props.hint] - Hint
 * @param {ReactNode} [props.aside] - Right control
 * @param {ReactNode} [props.children] - Body
 * @return {JSX.Element}
 */

export const SetupSection = ({
  styles,
  title,
  hint,
  aside,
  children,
}: {
  styles: PlaySetupStyles
  title: string
  hint?: string
  aside?: ReactNode
  children?: ReactNode
}) => (
  <section className={FIELD_STYLES.wrapper}>
    <div className={styles.head}>
      <span className={FIELD_STYLES.labelRow}>
        <span className={FIELD_STYLES.label}>{title}</span>
        {hint && <InfoHint text={hint} align="start" />}
      </span>
      {aside}
    </div>
    {children}
  </section>
)

/**
 * Minus, value, plus
 * @param {Object} props - Stepper
 * @param {PlaySetupStyles} props.styles - Game classes
 * @param {number} props.value - Value
 * @param {{ min: number, max: number }} props.range - Bounds
 * @param {(value: number) => void} props.onChange - New value
 * @param {{ less: string, more: string }} props.labels - Button names
 * @param {boolean} [props.disabled] - Locked
 * @param {string} [props.display] - Value in words
 * @param {number} [props.step] - Gap per click
 * @return {JSX.Element}
 */

export const SetupStepper = ({
  styles,
  value,
  range,
  onChange,
  labels,
  disabled = false,
  display,
  step = 1,
}: {
  styles: PlaySetupStyles
  value: number
  range: { min: number; max: number }
  onChange: (value: number) => void
  labels: { less: string; more: string }
  disabled?: boolean
  display?: string
  step?: number
}) => {
  const LessIcon = ICONS.playLess
  const MoreIcon = ICONS.playAdd

  return (
    <div className={styles.stepper}>
      <button
        type="button"
        className={styles.step}
        disabled={disabled || value <= range.min}
        aria-label={labels.less}
        onClick={() => onChange(Math.max(range.min, value - step))}
      >
        <LessIcon className={styles.stepIcon} aria-hidden="true" />
      </button>
      <span className={styles.stepValue}>{display ?? value}</span>
      <button
        type="button"
        className={styles.step}
        disabled={disabled || value >= range.max}
        aria-label={labels.more}
        onClick={() => onChange(Math.min(range.max, value + step))}
      >
        <MoreIcon className={styles.stepIcon} aria-hidden="true" />
      </button>
    </div>
  )
}

/**
 * Letter tiles, on or off, with all and none shortcuts
 * @param {Object} props - Letters
 * @param {PlaySetupStyles} props.styles - Game classes
 * @param {string[]} props.alphabet - Every letter
 * @param {string[]} props.value - Picked letters
 * @param {(letters: string[]) => void} props.onChange - New pick
 * @param {{ all: string, none: string }} props.labels - Shortcut names
 * @return {JSX.Element}
 */

export const SetupLetters = ({
  styles,
  alphabet,
  value,
  onChange,
  labels,
}: {
  styles: PlaySetupStyles
  alphabet: string[]
  value: string[]
  onChange: (letters: string[]) => void
  labels: { all: string; none: string }
}) => {
  // Alphabet order kept
  const flip = (letter: string) =>
    onChange(
      value.includes(letter)
        ? value.filter((entry) => entry !== letter)
        : alphabet.filter((entry) => entry === letter || value.includes(entry))
    )

  return (
    <>
      <div className={styles.letters}>
        {alphabet.map((letter) => (
          <button
            key={letter}
            type="button"
            aria-pressed={value.includes(letter)}
            className={cn(styles.letter, value.includes(letter) && styles.letterOn)}
            onClick={() => flip(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
      <div className={styles.quick}>
        <button type="button" className={styles.quickButton} onClick={() => onChange(alphabet)}>
          {labels.all}
        </button>
        <button type="button" className={styles.quickButton} onClick={() => onChange([])}>
          {labels.none}
        </button>
      </div>
    </>
  )
}

/**
 * One choice among a few, as chips
 * @param {Object} props - Chips
 * @param {PlaySetupStyles} props.styles - Game classes
 * @param {{ value: T, label: string }[]} props.options - Choices
 * @param {T} props.value - Picked
 * @param {(value: T) => void} props.onChange - New pick
 * @return {JSX.Element}
 */

export const SetupChips = <T extends string | number>({
  styles,
  options,
  value,
  onChange,
}: {
  styles: PlaySetupStyles
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) => (
  <div className={styles.chips}>
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        aria-pressed={option.value === value}
        className={cn(styles.chip, option.value === value && styles.chipOn)}
        onClick={() => onChange(option.value)}
      >
        {option.label}
      </button>
    ))}
  </div>
)
