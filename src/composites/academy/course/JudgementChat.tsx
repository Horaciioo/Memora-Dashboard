import { ChatLineView } from '@/composites/academy/course/ChatFeed'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type { ChatLine } from '@/declarations/academy/curriculum/types'
import { ICONS } from '@/declarations/ui/icons'
import { COURSE_CHAT, COURSE_JUDGEMENT } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface JudgementChatProps {
  lines: ChatLine[]
  // Lines of the scene on screen
  shown: number
  // Line the viewer answers with once warned
  reply: ChatLine | null
  // What the mod has typed, and the notice left once sent
  typed: string
  notice: string | null
  // The offending line is lit
  isFocused: boolean
}

/**
 * Twitch chat of the case, with the input bar the warning is typed in
 * @param {JudgementChatProps} props - Chat
 * @return {JSX.Element}
 */

export const JudgementChat = ({
  lines,
  shown,
  reply,
  typed,
  notice,
  isFocused,
}: JudgementChatProps) => {
  const NoticeIcon = ICONS.modWarn

  return (
    <figure className={cn(COURSE_CHAT.panel, COURSE_CHAT.twitch)}>
      <figcaption className={cn(COURSE_CHAT.head, COURSE_CHAT.headTwitch)}>
        <span className={COURSE_CHAT.live}>
          <span className={COURSE_CHAT.liveMark} aria-hidden="true" />
          {COURSE_COPY.judgementChat}
        </span>
      </figcaption>
      <div className={COURSE_JUDGEMENT.chatBody} aria-live="polite">
        {lines.slice(0, shown).map((line, index) => (
          <ChatLineView
            key={index}
            line={line}
            surface="twitch"
            arriving
            mark={{ focus: isFocused && line.flagged }}
          />
        ))}
        {notice && (
          <p className={cn(COURSE_JUDGEMENT.notice, COURSE_CHAT.lineIn)}>
            <NoticeIcon className={COURSE_JUDGEMENT.noticeIcon} aria-hidden="true" />
            {notice}
          </p>
        )}
        {reply && <ChatLineView line={reply} surface="twitch" arriving />}
      </div>
      <div className={COURSE_JUDGEMENT.inputBar}>
        <p className={COURSE_JUDGEMENT.input}>
          {typed ? (
            <span>
              {typed}
              <span className={COURSE_JUDGEMENT.caret} aria-hidden="true" />
            </span>
          ) : (
            <span className={COURSE_JUDGEMENT.inputHint}>{COURSE_COPY.judgementInput}</span>
          )}
        </p>
      </div>
    </figure>
  )
}
