'use client'

import { BrainMark } from '@/components/elements/display/marks/BrainMark'
import { ASSISTANT_INTRO_COPY } from '@/declarations/assistant/copy'
import { ASSISTANT_STYLES, FLOATING_ADD_STYLES } from '@/declarations/ui/variants'

/**
 * Memora's dots while she writes the next line
 * @return {JSX.Element}
 */

export const MemoraTyping = () => (
  <div className={ASSISTANT_STYLES.memora}>
    <span className={ASSISTANT_STYLES.avatar}>
      <BrainMark motion="idle" className={ASSISTANT_STYLES.avatarMark} />
    </span>
    <span
      className={FLOATING_ADD_STYLES.chatTyping}
      role="status"
      aria-label={ASSISTANT_INTRO_COPY.typing}
    >
      {[0, 1, 2].map((dot) => (
        <span key={dot} className={FLOATING_ADD_STYLES.chatTypingDot} />
      ))}
    </span>
  </div>
)
