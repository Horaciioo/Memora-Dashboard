'use client'

import { useSearchParams } from 'next/navigation'

import { MyDay } from '@/composites/recruitment/file/MyDay'
import { MyDecisions } from '@/composites/recruitment/file/MyDecisions'
import { MyInterviewsBox } from '@/composites/recruitment/file/MyInterviewsBox'
import { MyMetrics } from '@/composites/recruitment/file/MyMetrics'
import { useRecruitmentState } from '@/composites/recruitment/file/RecruitmentFileContext'
import { useServerNow } from '@/core/hooks/interaction/state/useServerNow'
import { DEMO_METRICS, demoVerdicts } from '@/core/lib/recruitment/demoMetrics'
import { meMetrics } from '@/core/lib/recruitment/meMetrics'
import { myInterviews } from '@/core/lib/recruitment/mySchedule'
import { interviewerStats } from '@/core/lib/recruitment/interviewerStats'
import { RECRUITMENT_COPY } from '@/declarations/recruitment/copy'
import { MY_DAY } from '@/declarations/ui/variants'

export interface MeTabProps {
  serverTime: string
}

/**
 * Interviews, observations and figures of the viewer
 * @param {string} serverTime - Server time at load
 * @return {JSX.Element}
 */

export const MeTab = ({ serverTime }: MeTabProps) => {
  const { detail, file, can } = useRecruitmentState()
  const now = useServerNow(serverTime)
  const isDemo = useSearchParams().has('demo') && process.env.NODE_ENV !== 'production'

  // Both seats can belong to one person
  const led = myInterviews(file.candidates, can.viewerId, 'recruiters')
  const watched = myInterviews(file.candidates, can.viewerId, 'observers')

  const verdicts = isDemo
    ? demoVerdicts(detail.outcomes)
    : interviewerStats(led, now, detail.outcomes).verdicts
  const metrics = isDemo ? DEMO_METRICS : meMetrics(led, watched, detail.outcomes, can.viewerId)

  return (
    <div className="flex flex-col gap-10">
      <div className={MY_DAY.row}>
        <MyDay candidates={[...led, ...watched]} now={now} />
        <MyDecisions outcomes={detail.outcomes} verdicts={verdicts} />
      </div>
      {(led.length > 0 || watched.length === 0) && (
        <MyInterviewsBox
          title={RECRUITMENT_COPY.myInterviews}
          empty={RECRUITMENT_COPY.myInterviewsEmpty}
          seat="recruiters"
          candidates={led}
          now={now}
        />
      )}
      {watched.length > 0 && (
        <MyInterviewsBox
          title={RECRUITMENT_COPY.myObservations}
          empty={RECRUITMENT_COPY.myObservationsEmpty}
          seat="observers"
          candidates={watched}
          now={now}
        />
      )}
      <MyMetrics metrics={metrics} isObserver={isDemo || can.isObserver} />
    </div>
  )
}
