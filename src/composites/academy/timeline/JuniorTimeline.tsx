'use client'

import { Status } from '@/components/elements/display/Status'
import { PeriodTimeline } from '@/components/structures/data/PeriodTimeline'
import { JuniorStepActions } from '@/composites/academy/timeline/JuniorStepActions'
import { toPeriodGroups } from '@/composites/academy/timeline/toPeriodGroups'
import { useJuniorState } from '@/composites/academy/junior/JuniorFileContext'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { GUIDE_BEACONS } from '@/declarations/academy/guides'
import { STEP_OWNER_REGISTRY } from '@/declarations/academy/registries'
import { TIMELINE_COPY } from '@/declarations/academy/timeline'
import { BEACON_ATTRIBUTE } from '@/declarations/ui/beacons'

/**
 * Journey of the junior cut into periods, the gestures sitting in the moment in course
 * @return {JSX.Element}
 */

export const JuniorTimeline = () => {
  const { timeline, periods } = useJuniorState()

  return (
    <div {...{ [BEACON_ATTRIBUTE]: GUIDE_BEACONS.fsiTimeline }}>
      <PeriodTimeline
        label={ACADEMY_COPY.timelineTab}
        groups={toPeriodGroups(
          timeline.steps,
          (step) => ({
            id: step.key,
            state: step.state,
            icon: step.icon,
            title: step.label,
            lead: step.lead,
            aside: (
              <Status
                label={step.owner ? STEP_OWNER_REGISTRY.label(step.owner) : TIMELINE_COPY.automatic}
                tone="neutral"
              />
            ),
            children:
              step.state === 'current' ? <JuniorStepActions stepKey={step.key} /> : undefined,
          }),
          periods
        )}
      />
    </div>
  )
}
