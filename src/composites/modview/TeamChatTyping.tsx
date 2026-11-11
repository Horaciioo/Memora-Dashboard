import { TEAM_CHAT_COPY as COPY } from '@/declarations/lives/teamChat'
import { MODVIEW_TEAM_CHAT as STYLES } from '@/declarations/ui/variants'

export interface TeamChatTypingProps {
  names: string[]
}

/**
 * Line telling who is writing, three dots hopping one after the other
 * @param {TeamChatTypingProps} props - Typing props
 * @return {JSX.Element}
 */

export const TeamChatTyping = ({ names }: TeamChatTypingProps) => {
  if (!names.length) return <div className={STYLES.typing} />
  const text = (names.length === 1 ? COPY.typingOne : COPY.typingMany).replace(
    '{names}',
    names.join(', ')
  )

  return (
    <div className={STYLES.typing} role="status" aria-label={COPY.typingAria}>
      <span className={STYLES.typingDots} aria-hidden="true">
        <span className="replica-typing-dot" />
        <span className="replica-typing-dot" />
        <span className="replica-typing-dot" />
      </span>
      <span className="truncate">{text}</span>
    </div>
  )
}
