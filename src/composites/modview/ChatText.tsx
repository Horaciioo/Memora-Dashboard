import { FlaggedText } from '@/composites/modview/FlaggedText'
import { LinkedText } from '@/composites/modview/LinkedText'
import { MODVIEW_CHAT } from '@/declarations/ui/variants'
import type { ChatFragment } from '@/types/modview'
import { twitchEmoteUrl } from '@/utils/format/emotes'

export interface ChatTextProps {
  text: string
  fragments?: ChatFragment[]
  flagged?: string[]
}

/**
 * Message body: Twitch emotes as pictures, links opened, held words marked
 * @param {string} text - Message
 * @param {ChatFragment[]} [fragments] - Message cut by the platform
 * @param {string[]} [flagged] - Held words
 * @return {JSX.Element}
 */

export const ChatText = ({ text, fragments, flagged }: ChatTextProps) => {
  // A held line is read word by word
  if ((flagged?.length ?? 0) > 0 || !fragments) return <FlaggedText text={text} flagged={flagged} />

  return (
    <>
      {fragments.map((fragment, index) => {
        if (fragment.type === 'emote' && fragment.emoteId) {
          const animated = fragment.animated ?? false

          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={index}
              src={twitchEmoteUrl(fragment.emoteId, animated)}
              srcSet={`${twitchEmoteUrl(fragment.emoteId, animated)} 1x, ${twitchEmoteUrl(fragment.emoteId, animated, '2.0')} 2x`}
              alt={fragment.text}
              title={fragment.text}
              loading="lazy"
              className={MODVIEW_CHAT.emote}
            />
          )
        }
        if (fragment.type === 'mention') {
          return (
            <span key={index} className={MODVIEW_CHAT.mention}>
              {fragment.text}
            </span>
          )
        }

        return <LinkedText key={index} text={fragment.text} />
      })}
    </>
  )
}
