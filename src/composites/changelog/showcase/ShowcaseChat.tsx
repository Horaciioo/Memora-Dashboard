import { BrainMark } from '@/components/elements/display/marks/BrainMark'
import { SHOWCASE_COPY, SHOWCASE_STEPS } from '@/declarations/changelog/showcase'
import { ABSENCE_COPY } from '@/declarations/absences/copy'
import { ASSISTANT_COPY } from '@/declarations/assistant/copy'
import { ABSENCE_SCENARIO_COPY } from '@/declarations/assistant/scenarios/absence'
import { ICONS } from '@/declarations/ui/icons'
import { ASSISTANT_STYLES, FLOATING_ADD_STYLES, SHOWCASE } from '@/declarations/ui/variants'

export interface ShowcaseChatProps {
  step: number
}

/**
 * Memora's chat as members see it, answering an absence
 * @param {number} step - Current step
 * @return {JSX.Element}
 */

export const ShowcaseChat = ({ step }: ShowcaseChatProps) => {
  const AbsenceIcon = ICONS.absences
  const SendIcon = ICONS.next

  return (
    <div className={SHOWCASE.chat}>
      <header className={FLOATING_ADD_STYLES.chatHead}>
        <span className={FLOATING_ADD_STYLES.chatHeadMark}>
          <BrainMark className={FLOATING_ADD_STYLES.chatHeadGlyph} motion="idle" />
        </span>
        <span className={FLOATING_ADD_STYLES.chatHeadName}>{ASSISTANT_COPY.name}</span>
      </header>

      <div className={SHOWCASE.chatThread}>
        {step >= SHOWCASE_STEPS.question && (
          <div className={ASSISTANT_STYLES.memora}>
            <span className={ASSISTANT_STYLES.avatar}>
              <BrainMark className={ASSISTANT_STYLES.avatarMark} motion="idle" />
            </span>
            <div className={ASSISTANT_STYLES.body}>
              <span className={ASSISTANT_STYLES.author}>{ASSISTANT_COPY.name}</span>
              <p className={ASSISTANT_STYLES.line}>{ABSENCE_SCENARIO_COPY.period}</p>
            </div>
          </div>
        )}
        {step >= SHOWCASE_STEPS.reply && (
          <p className={ASSISTANT_STYLES.mine}>{SHOWCASE_COPY.period}</p>
        )}
        {step >= SHOWCASE_STEPS.done && (
          <div className={ASSISTANT_STYLES.memora}>
            <span className={ASSISTANT_STYLES.avatar}>
              <BrainMark className={ASSISTANT_STYLES.avatarMark} motion="idle" />
            </span>
            <div className={ASSISTANT_STYLES.body}>
              <span className={ASSISTANT_STYLES.author}>{ASSISTANT_COPY.name}</span>
              <p className={ASSISTANT_STYLES.line}>{ABSENCE_SCENARIO_COPY.done}</p>
              <span className={SHOWCASE.chatCard}>
                <AbsenceIcon className={ASSISTANT_STYLES.linkGlyph} aria-hidden="true" />
                {SHOWCASE_COPY.period}
                <span className={SHOWCASE.rowMeta}>{ABSENCE_COPY.statusPending}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      <div className={FLOATING_ADD_STYLES.chatBar}>
        <span className={FLOATING_ADD_STYLES.chatInput}>
          <span className={SHOWCASE.rowMeta}>{ASSISTANT_COPY.answerPlaceholder}</span>
        </span>
        <span className={FLOATING_ADD_STYLES.chatSend}>
          <SendIcon className={SHOWCASE.chatSendGlyph} aria-hidden="true" />
        </span>
      </div>
    </div>
  )
}
