import { ICONS } from '@/declarations/ui/icons'
import { ChatFeed } from '@/composites/academy/course/ChatFeed'
import type { ChatLine } from '@/declarations/academy/curriculum/types'
import { EXERCISE_PUBLIC_COPY } from '@/declarations/recruitment/exerciseCopy'
import { EXERCISE_PUBLIC } from '@/declarations/ui/variants'

export interface TwitchStageProps {
  lines: ChatLine[]
}

/**
 * Whole Twitch page: the stream on the left, the chat playing on the right
 * @param {TwitchStageProps} props - Component props
 * @return {JSX.Element}
 */

export const TwitchStage = ({ lines }: TwitchStageProps) => {
  const PlayGlyph = ICONS.stream

  return (
    <div className={EXERCISE_PUBLIC.twitch}>
      <div className={EXERCISE_PUBLIC.twitchVideo}>
        <span className={EXERCISE_PUBLIC.twitchLive}>{EXERCISE_PUBLIC_COPY.streamTitle}</span>
        <PlayGlyph className={EXERCISE_PUBLIC.twitchPlay} aria-hidden="true" />
        <span aria-hidden="true" />
      </div>
      <div className={EXERCISE_PUBLIC.twitchChat}>
        <div className="min-h-0 flex-1">
          <ChatFeed
            surface="twitch"
            lines={lines}
            caption={EXERCISE_PUBLIC_COPY.chatTitle}
            autoplay
            fill
          />
        </div>
        <div className={EXERCISE_PUBLIC.twitchInput} aria-hidden="true">
          {EXERCISE_PUBLIC_COPY.chatInput}
        </div>
      </div>
    </div>
  )
}
