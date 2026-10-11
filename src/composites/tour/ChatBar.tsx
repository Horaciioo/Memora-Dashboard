import { ChatTimer } from '@/composites/tour/ChatTimer'
import { ThemeIconButton } from '@/components/elements/actions/ThemeIconButton'
import { TOUR_COPY } from '@/declarations/tour/copy'
import { TOUR_CHAT } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface ChatBarProps {
  // What is written in it so far
  draft: string
  // Wait before the next part, nothing when none
  holdMs: number | null
}

/**
 * The member's chat bar, the theme switch on its left and the countdown to the next part on its right: it writes his questions for him, he never types in it
 * @param {ChatBarProps} props - Text written so far and the wait
 * @return {JSX.Element}
 */

export const ChatBar = ({ draft, holdMs }: ChatBarProps) => {
  const isWriting = draft.length > 0

  return (
    <div className={TOUR_CHAT.bar}>
      <ThemeIconButton className={TOUR_CHAT.barTheme} />
      <div className={TOUR_CHAT.barBox} role="group" aria-label={TOUR_COPY.inputLabel}>
        <p className={cn(TOUR_CHAT.barText, !isWriting && TOUR_CHAT.barPlaceholder)}>
          {isWriting ? draft : holdMs ? TOUR_COPY.inputWaiting : TOUR_COPY.inputPlaceholder}
          {isWriting && <span className={TOUR_CHAT.barCaret} aria-hidden="true" />}
        </p>
        {holdMs && <ChatTimer key={holdMs} ms={holdMs} />}
      </div>
    </div>
  )
}
