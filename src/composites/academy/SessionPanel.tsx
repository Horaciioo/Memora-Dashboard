'use client'

import Link from '@/components/elements/navigation/AppLink'
import { ActivityPanel } from '@/components/structures/data/ActivityPanel'
import { FileHead } from '@/components/structures/page/FileHead'
import { FileTabs } from '@/components/structures/page/FileTabs'
import { LaunchPimButton } from '@/composites/academy/LaunchPimButton'
import { DecisionFlow } from '@/composites/academy/review/DecisionFlow'
import { ReviewFlow } from '@/composites/academy/review/ReviewFlow'
import { CalendarTab } from '@/composites/academy/session/CalendarTab'
import { GlossaryTab } from '@/composites/academy/session/GlossaryTab'
import { JuniorsTab } from '@/composites/academy/session/JuniorsTab'
import { OverviewTab } from '@/composites/academy/session/OverviewTab'
import { TimelineTab } from '@/composites/academy/session/TimelineTab'
import { SessionDrawers } from '@/composites/academy/session/SessionDrawers'
import {
  SessionFileProvider,
  useSessionState,
  type SessionCalendar,
  type SessionFields,
  type SessionRights,
} from '@/composites/academy/session/SessionFileContext'
import { CopyInviteLink } from '@/composites/onboarding/CopyInviteLink'
import { decisionQueue, reviewQueue } from '@/core/lib/academy/queues'
import type { ActivityEntry } from '@/core/services/system/ActivityService'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { ROUTES } from '@/declarations/navigation'
import { SESSION_FILE_COPY } from '@/declarations/ui/copy'
import { ICONS, isIconName } from '@/declarations/ui/icons'
import { accentVars } from '@/declarations/ui/theme'
import { FILE_HEAD } from '@/declarations/ui/variants'
import type { PeriodView, SessionDetail } from '@/types/academy'
import type { CommentView } from '@/types/comments'
import { AcademySessionStatuses } from '@/utils/constants/hierarchy'
import { sessionTitle } from '@/utils/format/academy'

/**
 * Head, tabs and flows of the open session
 * @param {Object} props - Component props
 * @param {ActivityEntry[]} props.activity - Journal entries
 * @return {JSX.Element}
 */

const SessionBody = ({ activity }: { activity: ActivityEntry[] }) => {
  const { detail, session, fields, can, flow, setFlow } = useSessionState()
  const { summary } = detail
  const FunctionGlyph =
    summary.function.icon && isIconName(summary.function.icon) ? ICONS[summary.function.icon] : null
  const closeFlow = () => setFlow(null)

  return (
    <div className="flex flex-col gap-8">
      <FileHead
        lead={
          FunctionGlyph && (
            <span className="accent-text" style={accentVars(summary.function.accent)}>
              <FunctionGlyph className={FILE_HEAD.glyph} aria-hidden="true" />
            </span>
          )
        }
        title={sessionTitle(summary)}
        meta={
          summary.recruitment && (
            <span>
              {ACADEMY_COPY.attachedRecruitment} :{' '}
              <Link href={ROUTES.recruitment(summary.recruitment.id)} className="underline">
                {summary.recruitment.name}
              </Link>
            </span>
          )
        }
        actions={
          <>
            {summary.inviteToken && <CopyInviteLink token={summary.inviteToken} />}
            {can.manage && summary.status !== AcademySessionStatuses.Running && (
              <LaunchPimButton
                sessionId={summary.id}
                awaitingRecruitment={summary.awaitingRecruitment}
              />
            )}
          </>
        }
      />

      <FileTabs
        label={ACADEMY_COPY.title}
        tabs={[
          {
            value: 'overview',
            label: SESSION_FILE_COPY.tabOverview,
            icon: 'sheet',
            render: () => <OverviewTab />,
          },
          {
            value: 'timeline',
            label: ACADEMY_COPY.tabTimeline,
            icon: 'clock',
            render: () => <TimelineTab />,
          },
          {
            value: 'juniors',
            label: ACADEMY_COPY.tabJuniors,
            icon: 'members',
            render: () => <JuniorsTab />,
          },
          {
            value: 'calendar',
            label: ACADEMY_COPY.tabCalendar,
            icon: 'meetings',
            render: () => <CalendarTab />,
          },
          {
            value: 'glossary',
            label: ACADEMY_COPY.tabGlossary,
            icon: 'glossary',
            render: () => <GlossaryTab />,
          },
          {
            value: 'logs',
            label: SESSION_FILE_COPY.tabLogs,
            icon: 'history',
            visible: can.readLogs,
            render: () => <ActivityPanel entries={activity} />,
          },
        ]}
      />

      <SessionDrawers />
      {flow === 'reviews' && (
        <ReviewFlow
          queue={reviewQueue(session.juniors, can.viewerId)}
          fields={fields.review}
          onClose={closeFlow}
        />
      )}
      {flow === 'decisions' && (
        <DecisionFlow queue={decisionQueue(session.juniors)} onClose={closeFlow} />
      )}
    </div>
  )
}

export interface SessionPanelProps {
  detail: SessionDetail
  fields: SessionFields
  can: SessionRights
  calendar: SessionCalendar
  periods: PeriodView[]
  comments: CommentView[]
  hasCandidates: boolean
  activity: ActivityEntry[]
}

/**
 * Academy session file: its head, then its tabs
 * @param {SessionDetail} detail - Session resolved server-side
 * @param {SessionFields} fields - Declarations of the forms
 * @param {SessionRights} can - What the viewer may do
 * @param {SessionCalendar} calendar - Calendar window
 * @param {PeriodView[]} periods - Dated periods of the promotion
 * @param {CommentView[]} comments - Remarks left on the promotion
 * @param {boolean} hasCandidates - A moderator may still be taken in
 * @param {ActivityEntry[]} activity - Journal entries
 * @return {JSX.Element}
 */

export const SessionPanel = ({
  detail,
  fields,
  can,
  calendar,
  periods,
  comments,
  hasCandidates,
  activity,
}: SessionPanelProps) => (
  <SessionFileProvider
    detail={detail}
    fields={fields}
    can={can}
    calendar={calendar}
    periods={periods}
    comments={comments}
    hasCandidates={hasCandidates}
  >
    <SessionBody activity={activity} />
  </SessionFileProvider>
)
