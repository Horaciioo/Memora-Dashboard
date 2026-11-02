import { COMMENT_THREAD } from '@/declarations/ui/variants'
import { splitMentions } from '@/utils/format/mentions'

export interface MentionTextProps {
  text: string
}

/**
 * Text whose handles are lit, nobody gets notified
 * @param {string} text - Written text
 * @return {JSX.Element}
 */

export const MentionText = ({ text }: MentionTextProps) => (
  <>
    {splitMentions(text).map((piece, index) =>
      piece.isMention ? (
        <mark key={index} className={COMMENT_THREAD.mention}>
          {piece.text}
        </mark>
      ) : (
        piece.text
      )
    )}
  </>
)
