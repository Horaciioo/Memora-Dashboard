'use client'

import { useState } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { CreatorLabel } from '@/components/elements/display/RecordLabel'
import { Status } from '@/components/elements/display/Status'
import { Button } from '@/components/elements/actions/Button'
import { FileTabs } from '@/components/structures/page/FileTabs'
import { CandidateBack } from '@/composites/recruitment/candidate/CandidateBack'
import { Section } from '@/components/structures/page/Section'
import { ActivityTimeline } from '@/components/structures/data/ActivityTimeline'
import type { DetailEntry } from '@/components/structures/data/DetailGrid'
import { UnbanAnswers } from '@/composites/unban/detail/UnbanAnswers'
import { UnbanVotes } from '@/composites/unban/requests/UnbanVotes'
import { DecisionDrawer } from '@/composites/unban/requests/DecisionDrawer'
import type { DecisionKind } from '@/composites/unban/requests/DecisionDrawer'
import { WorkComments } from '@/composites/work/WorkComments'
import { useBreadcrumbLabel } from '@/managers/front-end/BreadcrumbManager'
import { useUnbanRequest } from '@/core/hooks/data/unban/useUnbanRequest'
import { UnbanActions } from '@/core/lib/unban/actions'
import type { UnbanActionName } from '@/core/lib/unban/actions'
import { ROUTES } from '@/declarations/navigation'
import { UNBAN_COPY } from '@/declarations/unban/copy'
import { UNBAN_STATUS_REGISTRY } from '@/declarations/unban/registries'
import { UNBAN_SCREEN_COPY } from '@/declarations/unban/screen'
import { MEMBER_FILE } from '@/declarations/ui/blocks'
import { DATE_COPY } from '@/declarations/ui/dates'
import { UNBAN_DESK_STYLES } from '@/declarations/ui/variants'
import type { ButtonVariant } from '@/declarations/ui/variants'
import type { FieldOption } from '@/types/forms'
import { UnbanStatuses } from '@/utils/constants/unban'
import { formatDay, formatDayTime } from '@/utils/format/time/dates'

export interface RequestDetailProps {
  id: string
  creators: FieldOption[]
}

// Decisions that ask for a word first, and the action each one runs
const DRAWER_ACTIONS: Record<DecisionKind, UnbanActionName> = {
  accept: UnbanActions.Accept,
  refuse: UnbanActions.Refuse,
  reopen: UnbanActions.Reopen,
}

interface ActionButton {
  action: UnbanActionName
  label: string
  variant: ButtonVariant
  kind?: DecisionKind
}

// Actions that close the file, shown at its foot
const DECISIONS: UnbanActionName[] = [UnbanActions.Accept, UnbanActions.Refuse]

// Buttons in display order
const BUTTONS: ActionButton[] = [
  {
    action: UnbanActions.Accept,
    label: UNBAN_COPY.acceptAction,
    variant: 'success',
    kind: 'accept',
  },
  {
    action: UnbanActions.Refuse,
    label: UNBAN_COPY.refuseAction,
    variant: 'danger',
    kind: 'refuse',
  },
  {
    action: UnbanActions.Reopen,
    label: UNBAN_COPY.reopenAction,
    variant: 'secondary',
    kind: 'reopen',
  },
]

/**
 * File of one request: who, what they wrote, what the team did
 * @param {RequestDetailProps} props - Request and perimeter
 * @return {JSX.Element | null}
 */

export const RequestDetail = ({ id, creators }: RequestDetailProps) => {
  const file = useUnbanRequest(id)
  const [drawer, setDrawer] = useState<DecisionKind | null>(null)
  const { detail } = file
  useBreadcrumbLabel(ROUTES.unbanRequest(id), detail?.reference)

  if (!detail) return null

  const status = UNBAN_STATUS_REGISTRY.get(detail.status)
  const creator = creators.find((option) => option.value === detail.youtuberId)
  // The server only lists what it would accept
  const allowed = new Set<UnbanActionName>(detail.actions)

  const run = ({ action, kind }: ActionButton) => {
    if (kind) {
      file.clearIssues()
      setDrawer(kind)
    } else {
      void file.act(action)
    }
  }

  const decisionButtons = BUTTONS.filter(
    ({ action }) => allowed.has(action) && DECISIONS.includes(action)
  )

  const entries: DetailEntry[] = [
    {
      label: UNBAN_SCREEN_COPY.status,
      value: <Status label={status.label} tone={status.accent} icon={status.icon} />,
    },
    {
      label: UNBAN_SCREEN_COPY.creator,
      value: <CreatorLabel name={detail.youtuberName} image={creator?.image} />,
    },
    { label: UNBAN_SCREEN_COPY.file, value: detail.reference },
    { label: UNBAN_SCREEN_COPY.submitted, value: formatDayTime(detail.submittedAt) },
    ...(detail.decidedAt
      ? [
          { label: UNBAN_SCREEN_COPY.decided, value: formatDay(detail.decidedAt) },
          { label: UNBAN_SCREEN_COPY.decidedBy, value: detail.decidedBy?.name },
        ]
      : []),
    ...(detail.reviewNote
      ? [{ label: UNBAN_SCREEN_COPY.teamAnswer, value: detail.reviewNote, wide: true }]
      : []),
  ]

  const railEntries: DetailEntry[] = entries.filter(({ wide }) => !wide)
  const teamAnswer = detail.reviewNote

  const lifted = detail.status === UnbanStatuses.Accepted && (
    <div className={UNBAN_DESK_STYLES.lift}>
      {detail.discordLiftedAt ? (
        <Status
          label={UNBAN_SCREEN_COPY.liftedOn.replace('{date}', formatDay(detail.discordLiftedAt))}
          tone="success"
          icon="success"
        />
      ) : (
        <>
          <Status label={UNBAN_COPY.toLiftOnDiscord} tone="warning" icon="pending" />
          {allowed.has(UnbanActions.Lift) && (
            <Button isLoading={file.isSaving} onClick={() => void file.act(UnbanActions.Lift)}>
              {UNBAN_SCREEN_COPY.liftMark}
            </Button>
          )}
        </>
      )}
    </div>
  )

  const fileTab = () => (
    <>
      {teamAnswer && (
        <Section title={UNBAN_SCREEN_COPY.teamAnswer} raised>
          <p className={UNBAN_DESK_STYLES.note}>{teamAnswer}</p>
        </Section>
      )}
      <Section title={UNBAN_SCREEN_COPY.answers} raised>
        <UnbanAnswers answers={detail.answers} />
      </Section>
      <UnbanVotes
        votes={detail.votes}
        isSaving={file.isSaving}
        onVote={(choice) => void file.vote(choice)}
      />
    </>
  )

  const commentsTab = () => (
    <WorkComments
      kind="unban"
      id={id}
      label={UNBAN_SCREEN_COPY.notes}
      isCompact
      empty={{
        title: UNBAN_SCREEN_COPY.commentsEmpty,
        action: UNBAN_SCREEN_COPY.commentsFirst,
      }}
    />
  )

  const historyTab = () => (
    <Section title={UNBAN_SCREEN_COPY.history} raised>
      <ActivityTimeline entries={file.history} />
    </Section>
  )

  return (
    <div className={MEMBER_FILE.layout}>
      <CandidateBack label={UNBAN_SCREEN_COPY.back} href={ROUTES.unban} />
      <div className={MEMBER_FILE.railStack}>
        <aside className={MEMBER_FILE.rail}>
          <div className={MEMBER_FILE.head}>
            <Avatar
              name={detail.discordName}
              src={detail.discordAvatar}
              size="lg"
              className="md:h-24 md:w-24 md:text-2xl"
            />
            <h2 className={MEMBER_FILE.name}>{detail.discordName}</h2>
            <p className={UNBAN_DESK_STYLES.reference}>{detail.discordId}</p>
          </div>
          <div className={MEMBER_FILE.body}>
            <dl className={MEMBER_FILE.railList}>
              {railEntries.map((entry) => (
                <div key={entry.label} className={MEMBER_FILE.railItem}>
                  <dt className={MEMBER_FILE.groupTitle}>{entry.label}</dt>
                  <dd className={entry.value ? MEMBER_FILE.factValue : MEMBER_FILE.factEmpty}>
                    {entry.value ?? DATE_COPY.none}
                  </dd>
                </div>
              ))}
            </dl>
            {lifted}
            <div className={UNBAN_DESK_STYLES.actions}>
              {BUTTONS.filter(
                ({ action }) => allowed.has(action) && !DECISIONS.includes(action)
              ).map((button) => (
                <Button
                  key={button.action}
                  variant={button.variant}
                  isLoading={file.isSaving}
                  onClick={() => run(button)}
                >
                  {button.label}
                </Button>
              ))}
            </div>
          </div>
        </aside>
        {decisionButtons.length > 0 && (
          <div className={UNBAN_DESK_STYLES.decisions}>
            {decisionButtons.map((button) => (
              <Button
                key={button.action}
                variant={button.variant}
                className="w-full"
                isLoading={file.isSaving}
                onClick={() => run(button)}
              >
                {button.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className={MEMBER_FILE.main}>
        {file.conflict && (
          <div className={UNBAN_DESK_STYLES.banner} role="status">
            <span>{`${file.conflict} ${UNBAN_SCREEN_COPY.conflictReload}`}</span>
            <Button onClick={file.dismissConflict}>{UNBAN_SCREEN_COPY.conflictClose}</Button>
          </div>
        )}

        <FileTabs
          label={UNBAN_SCREEN_COPY.paneTabs}
          tabs={[
            { value: 'file', label: UNBAN_SCREEN_COPY.fileTab, icon: 'sheet', render: fileTab },
            {
              value: 'comments',
              label: UNBAN_SCREEN_COPY.commentsTab,
              icon: 'note',
              render: commentsTab,
            },
            {
              value: 'history',
              label: UNBAN_SCREEN_COPY.history,
              icon: 'history',
              render: historyTab,
            },
          ]}
        />
      </div>

      <DecisionDrawer
        kind={drawer}
        isSaving={file.isSaving}
        issues={file.issues}
        onSubmit={async (values) => {
          if (!drawer) return false
          const done = await file.act(DRAWER_ACTIONS[drawer], values)
          if (done) setDrawer(null)

          return done
        }}
        onClose={() => setDrawer(null)}
      />
    </div>
  )
}
