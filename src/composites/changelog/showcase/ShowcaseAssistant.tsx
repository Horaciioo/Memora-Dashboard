import { BrainMark } from '@/components/elements/display/marks/BrainMark'
import { ShowcaseReveal } from '@/composites/changelog/showcase/ShowcaseReveal'
import { SHOWCASE_COPY } from '@/declarations/changelog/showcase'
import { ICONS } from '@/declarations/ui/icons'
import { SHOWCASE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface ShowcaseAssistantProps {
  step: number
}

/**
 * Chat, answer, then the absence
 * @param {number} step - Current step
 * @return {JSX.Element}
 */

export const ShowcaseAssistant = ({ step }: ShowcaseAssistantProps) => {
  const AbsenceIcon = ICONS.absences
  const DoneIcon = ICONS.confirm

  return (
    <>
      <ShowcaseReveal isOn={step >= 1} className="self-end">
        <p className={SHOWCASE.userBubble}>{SHOWCASE_COPY.userLine}</p>
      </ShowcaseReveal>

      <ShowcaseReveal isOn={step >= 2} className={SHOWCASE.memoraRow}>
        <BrainMark className={SHOWCASE.brain} motion="idle" />
        <div className={SHOWCASE.memoraBubble}>
          {SHOWCASE_COPY.memoraLine}
          <span className={SHOWCASE.chips}>
            <span className={cn(SHOWCASE.chip, step >= 3 && SHOWCASE.chipOn)}>
              {SHOWCASE_COPY.yes}
            </span>
            <span className={SHOWCASE.chip}>{SHOWCASE_COPY.no}</span>
          </span>
        </div>
      </ShowcaseReveal>

      <ShowcaseReveal isOn={step >= 4} className={SHOWCASE.card}>
        <AbsenceIcon className={SHOWCASE.cardGlyph} aria-hidden="true" />
        {SHOWCASE_COPY.absenceTitle}
        <span className={SHOWCASE.cardTag}>
          <DoneIcon className={SHOWCASE.tagGlyph} aria-hidden="true" />
          {SHOWCASE_COPY.absenceDone}
        </span>
      </ShowcaseReveal>
    </>
  )
}
