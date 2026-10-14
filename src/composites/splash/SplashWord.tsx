import type { CSSProperties } from 'react'

import { APP_NAME } from '@/declarations/app'
import { SPLASH } from '@/declarations/ui/blocks'
import { SPLASH_LETTER_COLORS } from '@/declarations/ui/splash'

// Letters of the name
const LETTERS = Array.from(APP_NAME)

/**
 * Letters, each on its own beat
 * @return {JSX.Element[]}
 */

const letters = () =>
  LETTERS.map((letter, index) => (
    <span
      key={index}
      className={SPLASH.letter}
      style={
        {
          '--i': index,
          '--c': SPLASH_LETTER_COLORS[index % SPLASH_LETTER_COLORS.length],
        } as CSSProperties
      }
    >
      {letter}
    </span>
  ))

/**
 * Name that fills with colour
 * @return {JSX.Element}
 */

export const SplashWord = () => (
  <span className={SPLASH.word}>
    <span className="flex">{letters()}</span>
    <span className={SPLASH.wordFill}>{letters()}</span>
  </span>
)
