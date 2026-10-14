import { totalMinutes } from '@/core/lib/recruitment/questionnaire'
import type { ResolvedQuestion } from '@/core/lib/recruitment/questionnaire'
import type { QuestionPartKey } from '@/declarations/recruitment/questionnaire'
import { QUESTIONNAIRE_COPY } from '@/declarations/recruitment/questionnaireCopy'
import { ICONS } from '@/declarations/ui/icons'
import { INTERVIEW } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface InterviewIntroProps {
  candidateName: string
  parts: { part: QuestionPartKey; questions: ResolvedQuestion[] }[]
}

// Glyphs shown as the interview will show them
const DEMO_GLYPHS = [
  { icon: 'like', tone: INTERVIEW.liked, text: QUESTIONNAIRE_COPY.guideLike },
  { icon: 'neutral', tone: INTERVIEW.neutral, text: QUESTIONNAIRE_COPY.guideNeutral },
  { icon: 'dislike', tone: INTERVIEW.disliked, text: QUESTIONNAIRE_COPY.guideDislike },
  { icon: 'close', tone: INTERVIEW.glyphSkip, text: QUESTIONNAIRE_COPY.guideSkip },
] as const

/**
 * How the interview works: the buttons, the notes, the red questions
 * @param {string} candidateName - Applicant interviewed
 * @param {{ part: QuestionPartKey, questions: ResolvedQuestion[] }[]} parts - Parts to play
 * @return {JSX.Element}
 */

export const InterviewIntro = ({ candidateName, parts }: InterviewIntroProps) => {
  const minutes = totalMinutes(parts.flatMap((group) => group.questions))
  const Cross = ICONS.close

  return (
    <div className={INTERVIEW.intro}>
      <div className={INTERVIEW.introHead}>
        <h2 className={INTERVIEW.partTitle}>{QUESTIONNAIRE_COPY.introTitle}</h2>
        <p className={INTERVIEW.introText}>
          {QUESTIONNAIRE_COPY.introText.replace('{name}', candidateName)}
        </p>
        {minutes > 0 && (
          <span className={INTERVIEW.introTag}>
            {QUESTIONNAIRE_COPY.minutes.replace('{minutes}', String(minutes))}
          </span>
        )}
      </div>

      <div className={INTERVIEW.guide}>
        <section className={INTERVIEW.guideBox}>
          <h3 className={INTERVIEW.guideTitle}>{QUESTIONNAIRE_COPY.guideButtonsTitle}</h3>
          <ul className={INTERVIEW.guideList}>
            {DEMO_GLYPHS.map(({ icon, tone, text }) => {
              const Glyph = ICONS[icon]
              return (
                <li key={icon} className={INTERVIEW.guideItem}>
                  <Glyph className={cn(INTERVIEW.glyphSize, tone)} aria-hidden="true" />
                  {text}
                </li>
              )
            })}
          </ul>
        </section>

        <section className={INTERVIEW.guideBox}>
          <div className={INTERVIEW.guideDemo} aria-hidden="true">
            <span className={INTERVIEW.guideNote}>{QUESTIONNAIRE_COPY.noteAdd}</span>
            <Cross className="size-4 text-[var(--color-ink-subtle)]" />
          </div>
          <h3 className={INTERVIEW.guideTitle}>{QUESTIONNAIRE_COPY.guideNoteTitle}</h3>
          <p className={INTERVIEW.guideText}>{QUESTIONNAIRE_COPY.guideNoteText}</p>
        </section>

        <section className={INTERVIEW.guideBox}>
          <div className={INTERVIEW.guideDemo} aria-hidden="true">
            <span className={cn(INTERVIEW.prompt, INTERVIEW.promptMandatory)}>
              {QUESTIONNAIRE_COPY.guideSample}
            </span>
          </div>
          <h3 className={INTERVIEW.guideTitle}>{QUESTIONNAIRE_COPY.guideMandatoryTitle}</h3>
          <p className={INTERVIEW.guideText}>{QUESTIONNAIRE_COPY.guideMandatoryText}</p>
        </section>
      </div>
    </div>
  )
}
