import { FlaggedText } from '@/composites/modview/FlaggedText'
import { useSharedWords } from '@/core/hooks/data/lives/useSharedWords'
import { SHARED_TONE } from '@/declarations/modview/personal'
import { LinkedText } from '@/composites/modview/LinkedText'
import { MODVIEW_CHAT } from '@/declarations/ui/variants'
import type { ChatFragment } from '@/types/modview'
import { twitchEmoteUrl } from '@/utils/format/chat/emotes'

export interface ChatTextProps {
  text: string
  fragments?: ChatFragment[]
  flagged?: string[]
}

/**
 * Message body: Twitch emotes as pictures, links opened, held words marked
 * @param {string} text - Message
 * @param {ChatFragment[]} [fragments] - Message cut by the platform
 * @param {string[]} [flagged] - Held words, shared words coloured
 * @return {JSX.Element}
 */

export const ChatText = ({ text, fragments, flagged }: ChatTextProps) => {
  const { find } = useSharedWords()
  const shared = find(text).map((word) => word.term)

  // A held or shared line is read word by word
  if (shared.length > 0) {
    return (
      <FlaggedText
        text={text}
        flagged={[...(flagged ?? []), ...shared]}
        inks={Object.fromEntries(shared.map((term) => [term.toLowerCase(), SHARED_TONE]))}
      />
    )
  }
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
