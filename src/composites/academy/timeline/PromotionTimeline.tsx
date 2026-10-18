'use client'

import Link from '@/components/elements/navigation/AppLink'

import { Avatar } from '@/components/elements/display/Avatar'
import { Status } from '@/components/elements/display/Status'
import { PeriodTimeline } from '@/components/structures/data/PeriodTimeline'
import { PromotionStepActions } from '@/composites/academy/timeline/PromotionStepActions'
import { toPeriodGroups } from '@/composites/academy/timeline/toPeriodGroups'
import { useSessionState } from '@/composites/academy/session/SessionFileContext'
import type { MilestoneState } from '@/core/lib/academy/parkourTimeline'
import { resolvePromotion } from '@/core/lib/academy/promotionTimeline'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { STEP_OWNER_REGISTRY } from '@/declarations/academy/registries'
import { TIMELINE_COPY } from '@/declarations/academy/timeline'
import type { PimPeriodName } from '@/declarations/academy/timeline'
import { ROUTES } from '@/declarations/navigation'
import type { IconName } from '@/declarations/ui/icons'
import { RECORD_LABEL } from '@/declarations/ui/variants'
import type { StepOwnerName } from '@/utils/constants/hierarchy'
import { FINISHED_RECRUITMENT_STATUSES } from '@/utils/constants/recruitment'

/**
 * Moment of the promotion, with the juniors standing on it
 * @typedef {Object} PromotionMoment
 */

interface PromotionMoment {
  key: string
  period: PimPeriodName
  state: MilestoneState
  icon: IconName
  label: string
  lead: string
  owner: StepOwnerName | null
  here: string[]
}

/**
 * Journey of the whole promotion cut into periods: the campaign, then each moment of the PIM
 * with the juniors standing on it and the gestures waiting there
 * @return {JSX.Element}
 */

export const PromotionTimeline = () => {
  const { detail, session, periods } = useSessionState()
  const { recruitment } = detail.summary
  const byId = new Map(session.juniors.map((junior) => [junior.id, junior]))
  const recruitmentOver = recruitment && FINISHED_RECRUITMENT_STATUSES.includes(recruitment.status)

  const moments: PromotionMoment[] = [
    ...(recruitment
      ? [
          {
            key: 'recruitment',
            period: 'preparation' as const,
            state: recruitmentOver ? ('done' as const) : ('current' as const),
            icon: 'recruitment' as const,
            label: TIMELINE_COPY.recruitmentLabel,
            lead: recruitmentOver
              ? TIMELINE_COPY.recruitmentOver
              : TIMELINE_COPY.recruitmentRunning,
            owner: null,
            here: [],
          },
        ]
      : []),
    ...resolvePromotion(session.juniors).map(({ milestone, state, here }) => ({
      key: milestone.key,
      period: milestone.period,
      state,
      icon: milestone.icon,
      label: milestone.label,
      lead: milestone.lead,
      owner: milestone.owner,
      here,
    })),
  ]

  return (
    <PeriodTimeline
      label={ACADEMY_COPY.tabTimeline}
      groups={toPeriodGroups(
        moments,
        (moment) => ({
          id: moment.key,
          state: moment.state,
          icon: moment.icon,
          title: moment.label,
          lead: moment.lead,
          aside: (
            <Status
              label={
                moment.owner ? STEP_OWNER_REGISTRY.label(moment.owner) : TIMELINE_COPY.automatic
              }
              tone="neutral"
            />
          ),
          children: (
            <>
              {moment.key === 'recruitment' && recruitment && (
                <Link
                  href={ROUTES.recruitment(recruitment.id)}
                  className="text-sm font-semibold underline"
                >
                  {recruitment.name}
                </Link>
              )}
              {moment.here.length > 0 && (
                <span className="flex flex-wrap gap-x-4 gap-y-2">
                  {moment.here.map((id) => {
                    const junior = byId.get(id)!

                    return (
                      <Link
                        key={id}
                        href={ROUTES.junior(detail.summary.id, id)}
                        className={RECORD_LABEL.row}
                      >
                        <Avatar name={junior.displayName} src={junior.avatarUrl} size="xs" />
                        <span className={RECORD_LABEL.name}>{junior.displayName}</span>
                      </Link>
                    )
                  })}
                </span>
              )}
              <PromotionStepActions stepKey={moment.key} here={moment.here} />
            </>
          ),
        }),
        periods
      )}
    />
  )
}
