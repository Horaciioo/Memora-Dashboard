import { splitLinks } from '@/core/lib/modview/linkify'
import { MODVIEW_CHAT } from '@/declarations/ui/variants'

export interface LinkedTextProps {
  text: string
}

/**
 * Text whose links open in a new tab
 * @param {string} text - Words
 * @return {JSX.Element}
 */

export const LinkedText = ({ text }: LinkedTextProps) => (
  <>
    {splitLinks(text).map((piece, index) =>
      piece.href ? (
        <a
          key={index}
          href={piece.href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className={MODVIEW_CHAT.link}
          onClick={(event) => event.stopPropagation()}
        >
          {piece.text}
        </a>
      ) : (
        piece.text
      )
    )}
  </>
)
