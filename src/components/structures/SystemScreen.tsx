import type { ReactNode } from 'react'

import { SYSTEM_SCREEN } from '@/declarations/ui/blocks'

export interface SystemScreenProps {
  // Code or exclamation
  word: string
  title: string
  description: string
  action: ReactNode
  // Incident reference
  reference?: string
  // Outside the shell
  framed?: boolean
  // Word struck like a tilted stamp
  stamped?: boolean
}

/**
 * App's own answer screen
 * @param {string} word - Giant word
 * @param {string} title - Headline
 * @param {string} description - One line
 * @param {ReactNode} action - Way out
 * @param {string} [reference] - Incident reference
 * @param {boolean} [framed] - Draws its frame
 * @param {boolean} [stamped] - Tilted stamp word
 * @return {JSX.Element}
 */

export const SystemScreen = ({
  word,
  title,
  description,
  action,
  reference,
  framed,
  stamped,
}: SystemScreenProps) => (
  <main className={framed ? SYSTEM_SCREEN.stage : SYSTEM_SCREEN.inset}>
    <div className={SYSTEM_SCREEN.column}>
      <p className={stamped ? SYSTEM_SCREEN.stampWord : SYSTEM_SCREEN.word} aria-hidden="true">
        {word}
      </p>
      <h1 className={SYSTEM_SCREEN.title}>{title}</h1>
      <p className={SYSTEM_SCREEN.description}>{description}</p>
      {reference && <p className={SYSTEM_SCREEN.reference}>{reference}</p>}
      <div className={SYSTEM_SCREEN.action}>{action}</div>
    </div>
  </main>
)
