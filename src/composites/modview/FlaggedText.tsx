import type { CSSProperties } from 'react'

import { LinkedText } from '@/composites/modview/LinkedText'
import { MODVIEW_FEED } from '@/declarations/ui/variants'

export interface FlaggedTextProps {
  text: string
  flagged?: string[]
  // Own colour by lowercase word
  tones?: Record<string, string>
  // Colour of the text of some words
  inks?: Record<string, string>
}

// One held word, in its text colour, tinted, or plainly flagged
const Mark = ({
  part,
  tones,
  inks,
}: {
  part: string
  tones?: FlaggedTextProps['tones']
  inks?: FlaggedTextProps['inks']
}) => {
  const key = part.toLowerCase()
  const ink = inks?.[key]
  const tone = ink ? undefined : tones?.[key]
  const className = ink ? MODVIEW_FEED.inked : tone ? MODVIEW_FEED.tinted : MODVIEW_FEED.flagged

  return (
    <mark
      className={className}
      style={ink || tone ? ({ '--tint': ink ?? tone } as CSSProperties) : undefined}
    >
      {part}
    </mark>
  )
}

/**
 * Message text
 * @param {string} text - Message
 * @param {string[]} [flagged] - Held words
 * @param {Record<string, string>} [tones] - Own colour of some words
 * @param {Record<string, string>} [inks] - Text colour of some words
 * @return {JSX.Element}
 */

export const FlaggedText = ({ text, flagged, tones, inks }: FlaggedTextProps) => {
  if (!flagged || flagged.length === 0) return <LinkedText text={text} />

  // Split on every held word
  const escaped = flagged.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const parts = text.split(new RegExp(`(${escaped.join('|')})`, 'gi'))
  const held = new Set(flagged.map((word) => word.toLowerCase()))

  return (
    <>
      {parts.map((part, index) =>
        held.has(part.toLowerCase()) ? (
          <Mark key={index} part={part} tones={tones} inks={inks} />
        ) : (
          <LinkedText key={index} text={part} />
        )
      )}
    </>
  )
}
