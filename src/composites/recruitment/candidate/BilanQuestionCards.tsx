'use client'

import { Byline } from '@/components/elements/display/Byline'
import { Markdown } from '@/components/elements/display/Markdown'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { useQuestionnaire } from '@/core/hooks/data/recruitment/useQuestionnaire'
import { groupByPart } from '@/core/lib/recruitment/questionnaire'
import { CANDIDATE_COPY } from '@/declarations/recruitment/candidateCopy'
import { QUESTION_PARTS } from '@/declarations/recruitment/questionnaire'
import { ICONS } from '@/declarations/ui/icons'
import { ILLUSTRATIONS } from '@/declarations/ui/illustrations'
import { BILAN, INTERVIEW } from '@/declarations/ui/variants'
import type { CandidateView } from '@/types/recruitment'
import { cn } from '@/utils/classnames'
import { formatDayTime } from '@/utils/format/dates'
import { AnswerAppreciations } from '@/utils/constants/recruitment'

// Prompt longer than this folds
const LONG_PROMPT = 90

// Glyph and colour of each reaction
const REACTIONS = {
  [AnswerAppreciations.Like]: { icon: 'like', tone: INTERVIEW.liked },
  [AnswerAppreciations.Neutral]: { icon: 'neutral', tone: INTERVIEW.neutral },
  [AnswerAppreciations.Dislike]: { icon: 'dislike', tone: INTERVIEW.disliked },
} as const

export interface BilanQuestionCardsProps {
  candidate: CandidateView
}

/**
 * Commented questions of the interview, by part, as a grid of cards
 * @param {CandidateView} candidate - Applicant interviewed
 * @return {JSX.Element[]}
 */

export const BilanQuestionCards = ({ candidate }: BilanQuestionCardsProps) => {
  const { detail, file } = useRecruitmentState()
  const { youtuber, platform } = detail.summary
  const { picked } = useQuestionnaire(platform, youtuber.label, file.questionKeys, candidate.formal)

  // Questions with nothing under them stay out
  const commented = new Set(candidate.comments.map((entry) => entry.questionKey))
  const parts = groupByPart(picked.filter((question) => commented.has(question.key)))

  if (parts.length === 0) {
    const Figure = ILLUSTRATIONS.notes

    return (
      <div className={BILAN.empty}>
        <Figure className="h-28 w-28" />
        <p>{CANDIDATE_COPY.bilanCommentsEmpty}</p>
      </div>
    )
  }

  return (
    <div className={BILAN.groups}>
      {parts.map(({ part, questions }) => (
        <section key={part} className="flex flex-col gap-3">
          <h3 className={BILAN.groupTitle}>{QUESTION_PARTS[part].label}</h3>
          <div className={BILAN.grid}>
            {questions.map((question) => {
              const reaction = candidate.answers[question.key]?.appreciation
              const Glyph = reaction ? ICONS[REACTIONS[reaction].icon] : null
              const notes = candidate.comments
                .filter((entry) => entry.questionKey === question.key)
                .reverse()

              return (
                <article key={question.key} className={BILAN.card}>
                  <div className={BILAN.cardHead}>
                    {question.prompt.length > LONG_PROMPT ? (
                      <details className={BILAN.cardPrompt}>
                        <summary className={BILAN.cardMore}>
                          {question.prompt.slice(0, LONG_PROMPT)}…
                        </summary>
                        {question.prompt}
                      </details>
                    ) : (
                      <h4 className={BILAN.cardPrompt}>{question.prompt}</h4>
                    )}
                    {Glyph && reaction && (
                      <Glyph
                        className={cn(INTERVIEW.glyphSize, REACTIONS[reaction].tone)}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  {notes.map((note) => (
                    <div key={note.id} className={BILAN.comment}>
                      <span className={BILAN.meta}>
                        <Byline
                          name={note.authorName}
                          avatar={note.authorAvatar}
                          date={formatDayTime(note.createdAt)}
                        />
                      </span>
                      <Markdown source={note.body} mentions />
                    </div>
                  ))}
                </article>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
