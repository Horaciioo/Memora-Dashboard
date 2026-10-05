import { Avatar } from '@/components/elements/display/Avatar'
import { Status } from '@/components/elements/display/Status'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { RECRUITMENT_STATUS_REGISTRY } from '@/declarations/recruitment/registries'
import { accentPaint } from '@/declarations/ui/theme'
import { SESSION_HERO } from '@/declarations/ui/variants'
import type { CandidateView, RecruitmentSummary } from '@/types/recruitment'
import { cn } from '@/utils/classnames'

export interface RecruitmentHeroProps {
  summary: RecruitmentSummary
  candidates: CandidateView[]
  outcomes: { id: string; label: string; accent: string | null }[]
}

/**
 * Header of a session: who it recruits for, where it stands, who carries it, and one bar
 * showing how the candidates are spread over the outcomes. Identifiers and tallies stay out
 * @param {RecruitmentSummary} summary - Session row
 * @param {CandidateView[]} candidates - Applicants held
 * @param {Object[]} outcomes - Outcomes of the results board
 * @return {JSX.Element}
 */

export const RecruitmentHero = ({ summary, candidates, outcomes }: RecruitmentHeroProps) => {
  const status = RECRUITMENT_STATUS_REGISTRY.get(summary.status)

  // Share of the candidates under each outcome
  const parts = [
    ...outcomes.map((outcome) => ({
      id: outcome.id,
      label: outcome.label,
      accent: outcome.accent,
      held: candidates.filter((candidate) => candidate.outcomeId === outcome.id).length,
    })),
    {
      id: 'none',
      label: RECRUITMENT_COPY.noOutcomeLegend,
      accent: 'neutral' as string | null,
      held: candidates.filter((candidate) => candidate.outcomeId === null).length,
    },
  ].filter((part) => part.held > 0)

  return (
    <div className={SESSION_HERO.card}>
      <div>
        <div className={SESSION_HERO.body}>
          <Avatar
            name={summary.youtuber.label}
            src={summary.youtuber.image}
            size="xl"
            className={SESSION_HERO.portrait}
          />
          <div className={SESSION_HERO.facts}>
            <h2 className={SESSION_HERO.title}>{summary.jobFunction.label}</h2>
            <div className={SESSION_HERO.meta}>
              <span>{summary.youtuber.label}</span>
              <Status label={status.label} accent={status.accent} />
            </div>
          </div>
        </div>
      </div>

      {parts.length > 0 && (
        <div className={SESSION_HERO.funnelWrap}>
          <div className={SESSION_HERO.funnel} role="img" aria-label={RECRUITMENT_COPY.funnelTitle}>
            {parts.map((part) => {
              const paint = accentPaint(part.accent)

              return (
                <span
                  key={part.id}
                  title={part.label}
                  className={cn(SESSION_HERO.funnelPart, paint.dot)}
                  style={{ ...paint.style, width: `${(part.held / candidates.length) * 100}%` }}
                />
              )
            })}
          </div>
          <div className={SESSION_HERO.legend}>
            {parts.map((part) => (
              <Status key={part.id} label={part.label} accent={part.accent} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
