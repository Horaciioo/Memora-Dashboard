import { Badge } from '@/components/elements/display/Badge'
import { Button } from '@/components/elements/actions/Button'
import { Section } from '@/components/structures/Section'
import { LEGACY_STATUS_REGISTRY } from '@/declarations/academy/registries'
import { MEMBER_COPY } from '@/declarations/members/copy'
import { STAGE_LIST } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import type { IconName } from '@/declarations/ui/icons'
import type { MemberSummary } from '@/types/members'
import { cn } from '@/utils/classnames'
import { LegacyStatuses } from '@/utils/constants/hierarchy'
import { formatDay } from '@/utils/format/dates'

export interface MemberJourneyProps {
  summary: MemberSummary
  onOpen: (href: string) => void
  hrefs: { recruitment: string | null; academy: string | null; legacy: string | null }
}

interface Stage {
  key: string
  title: string
  icon: IconName
  none: string
  open: string
  href: string | null
  note?: string
  status?: { label: string; accent: string | null }
}

/**
 * Journey of a moderator as three stages in the order they were lived through: the
 * application, the Academy follow-up, the Legacy track. A stage they never went through
 * stays drawn as an empty dashed step, so the path always reads end to end
 * @param {MemberSummary} summary - Row of the moderator
 * @param {(href: string) => void} onOpen - Navigates to a stage file
 * @param {Object} hrefs - Destination of each stage
 * @return {JSX.Element}
 */

export const MemberJourney = ({ summary, onOpen, hrefs }: MemberJourneyProps) => {
  const stages: Stage[] = [
    {
      key: 'recruitment',
      title: MEMBER_COPY.stageRecruitment,
      icon: 'recruitment',
      none: MEMBER_COPY.recruitmentNoneDescription,
      open: MEMBER_COPY.recruitmentOpen,
      href: hrefs.recruitment,
    },
    {
      key: 'academy',
      title: MEMBER_COPY.stageAcademy,
      icon: 'academy',
      none: MEMBER_COPY.academyFsiNoneDescription,
      open: MEMBER_COPY.academyFsiOpen,
      href: hrefs.academy,
      note: summary.academyDispositif?.label,
    },
    {
      key: 'legacy',
      title: MEMBER_COPY.stageLegacy,
      icon: 'crown',
      none: MEMBER_COPY.legacyNoneDescription,
      open: MEMBER_COPY.legacyOpen,
      href: hrefs.legacy,
      status: summary.legacyStatus
        ? {
            label: LEGACY_STATUS_REGISTRY.label(summary.legacyStatus),
            accent: LEGACY_STATUS_REGISTRY.get(summary.legacyStatus).accent,
          }
        : undefined,
      note:
        summary.legacyStatus === LegacyStatuses.Running && summary.legacyEndsAt
          ? `${MEMBER_COPY.legacyExempt} ${formatDay(summary.legacyEndsAt)}`
          : undefined,
    },
  ]

  return (
    <Section title={MEMBER_COPY.journeyTitle} description={MEMBER_COPY.journeyLead} raised>
      <ol>
        {stages.map((stage, index) => {
          const Icon = ICONS[stage.icon]
          const reached = stage.href !== null

          return (
            <li key={stage.key} className={STAGE_LIST.stage}>
              {index < stages.length - 1 && (
                <span className={STAGE_LIST.stageRail} aria-hidden="true" />
              )}
              <span className={reached ? STAGE_LIST.stageChip : STAGE_LIST.stageChipOff}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className={STAGE_LIST.stageBody}>
                <span
                  className={cn(
                    STAGE_LIST.stageTitle,
                    !reached && 'text-[var(--color-ink-subtle)]'
                  )}
                >
                  {stage.title}
                </span>
                {reached ? (
                  <div className={STAGE_LIST.stageActions}>
                    {stage.status && (
                      <Badge label={stage.status.label} accent={stage.status.accent} />
                    )}
                    {stage.note && <span className={STAGE_LIST.stageLead}>{stage.note}</span>}
                    <Button icon="forward" onClick={() => onOpen(stage.href!)}>
                      {stage.open}
                    </Button>
                  </div>
                ) : (
                  <span className={STAGE_LIST.stageLead}>{stage.none}</span>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </Section>
  )
}
