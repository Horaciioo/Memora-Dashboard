import { LinkedText } from '@/composites/modview/LinkedText'
import { MODVIEW_FEED } from '@/declarations/ui/variants'

export interface FlaggedTextProps {
  text: string
  flagged?: string[]
}

/**
 * Message text
 * @param {string} text - Message
 * @param {string[]} [flagged] - Held words
 * @return {JSX.Element}
 */

export const FlaggedText = ({ text, flagged }: FlaggedTextProps) => {
  if (!flagged || flagged.length === 0) return <LinkedText text={text} />

  // Split on every held word
  const escaped = flagged.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const parts = text.split(new RegExp(`(${escaped.join('|')})`, 'gi'))
  const held = new Set(flagged.map((word) => word.toLowerCase()))

  return (
    <>
      {parts.map((part, index) =>
        held.has(part.toLowerCase()) ? (
          <mark key={index} className={MODVIEW_FEED.flagged}>
            {part}
          </mark>
        ) : (
          <LinkedText key={index} text={part} />
        )
      )}
    </>
  )
}
