import { MODVIEW_VERB } from '@/declarations/ui/variants'
import type { ModActTone } from '@/types/modview'

export interface ActSentenceProps {
  text: string
  verb: string
  tone: ModActTone
}

/**
 * Sentence with a coloured verb
 * @param {ActSentenceProps} props - Sentence props
 * @return {JSX.Element}
 */

export const ActSentence = ({ text, verb, tone }: ActSentenceProps) => {
  const start = text.indexOf(verb)
  if (start < 0) return <>{text}</>

  return (
    <>
      {text.slice(0, start)}
      <span className={MODVIEW_VERB[tone]}>{verb}</span>
      {text.slice(start + verb.length)}
    </>
  )
}
