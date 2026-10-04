'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/elements/actions/Button'
import { AvatarStack } from '@/components/elements/display/Avatar'
import { Badge } from '@/components/elements/display/Badge'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { FormDrawer } from '@/components/structures/FormDrawer'
import { LiveRosterBoard } from '@/composites/lives/LiveRosterBoard'
import { useLives } from '@/core/hooks/data/useLives'
import { LIVE_REPORT_COPY } from '@/declarations/lives/moderation'
import { LIVE_COPY, LIVE_ROSTER_COPY } from '@/declarations/lives/copy'
import { LIVE_COORDINATOR, LIVE_PLATFORM_REGISTRY } from '@/declarations/lives/registries'
import { ROUTES } from '@/declarations/navigation'
import { ICONS } from '@/declarations/ui/icons'
import { FORM_SUBJECTS } from '@/declarations/ui/subjects'
import { BUTTON_STYLES, LIVE_BOARD } from '@/declarations/ui/variants'
import type { FieldDefinition } from '@/types/forms'
import type { LiveView } from '@/types/lives'
import { LivePlatforms, LiveStatuses } from '@/utils/constants/lives'
import type { LiveStatusName } from '@/utils/constants/lives'
import { Permissions } from '@/utils/constants/permissions'
import { cn } from '@/utils/classnames'
import { formatDayTime } from '@/utils/format/dates'

export interface LivesBoardProps {
  initialLives: LiveView[]
  fields: FieldDefinition[]
  canAnnounce: boolean
  viewerId: string
}

/**
 * Open lives, each on its strip
 * @param {LiveView[]} initialLives - Lives resolved server-side
 * @param {FieldDefinition[]} fields - Announce form declarations
 * @param {boolean} canAnnounce - Viewer may announce
 * @param {string} viewerId - Signed-in member
 * @return {JSX.Element}
 */

export const LivesBoard = ({ initialLives, fields, canAnnounce, viewerId }: LivesBoardProps) => {
  const { lives, isSaving, issues, clearIssues, announce, move } = useLives(initialLives)
  const [isAnnouncing, setAnnouncing] = useState(false)

  const openAnnounce = () => {
    clearIssues()
    setAnnouncing(true)
  }

  return (
    <div className={LIVE_BOARD.wrapper}>
      {lives.length === 0 ? (
        <EmptyState
          figure="livecon"
          title={LIVE_COPY.emptyTitle}
          description={LIVE_COPY.emptyDescription}
          action={
            canAnnounce ? (
              <Button variant="primary" onClick={openAnnounce}>
                {LIVE_COPY.announce}
              </Button>
            ) : (
              <Badge label={LIVE_COPY.emptyTitle} tone="neutral" />
            )
          }
        />
      ) : (
        <>
          {canAnnounce && (
            <div className={LIVE_BOARD.toolbar}>
              <Button variant="primary" onClick={openAnnounce}>
                {LIVE_COPY.announce}
              </Button>
            </div>
          )}
          <ul className={LIVE_BOARD.list}>
            {lives.map((live) => (
              <li key={live.id}>
                <LiveStrip
                  live={live}
                  canMove={
                    live.permissions.includes(Permissions.LiveAnnounce) ||
                    live.coordinator?.id === viewerId
                  }
                  isSaving={isSaving}
                  onMove={(status) => move(live.id, status)}
                />
              </li>
            ))}
          </ul>
        </>
      )}

      <FormDrawer
        subject={FORM_SUBJECTS.live}
        open={isAnnouncing}
        title={LIVE_COPY.announceTitle}
        description={LIVE_COPY.announceLead}
        fields={fields}
        issues={issues}
        isSaving={isSaving}
        submitVerb={LIVE_COPY.announceVerb}
        onSubmit={async (values) => {
          const saved = await announce(values)
          if (saved) setAnnouncing(false)

          return saved
        }}
        onClose={() => setAnnouncing(false)}
      />
    </div>
  )
}

interface LiveStripProps {
  live: LiveView
  canMove: boolean
  isSaving: boolean
  onMove: (status: LiveStatusName) => Promise<boolean>
}

/**
 * One live, its facts and its moves
 * @param {LiveView} live - Live
 * @param {boolean} canMove - Viewer may start, end or cancel it
 * @param {boolean} isSaving - Mutation in flight
 * @param {(status: LiveStatusName) => Promise<boolean>} onMove - Status change
 * @return {JSX.Element}
 */

const LiveStrip = ({ live, canMove, isSaving, onMove }: LiveStripProps) => {
  // Status waiting on a second click
  const [confirming, setConfirming] = useState<LiveStatusName | null>(null)
  const [isRosterOpen, setRosterOpen] = useState(false)

  const platform = LIVE_PLATFORM_REGISTRY.get(live.platform)
  const PlatformIcon = ICONS[platform.icon]
  const DotIcon = ICONS.liveDot
  const CoordinatorIcon = ICONS[LIVE_COORDINATOR.icon]
  const isLive = live.status === LiveStatuses.Live

  // Ending or cancelling asks twice, starting does not
  const request = async (status: LiveStatusName) => {
    if (status !== LiveStatuses.Live && confirming !== status) {
      setConfirming(status)
      return
    }

    await onMove(status)
    setConfirming(null)
  }

  return (
    <article className={cn(LIVE_BOARD.strip, isLive && LIVE_BOARD.stripLive)}>
      <span
        aria-hidden="true"
        className={cn(
          LIVE_BOARD.rule,
          live.platform === LivePlatforms.Twitch ? LIVE_BOARD.ruleTwitch : LIVE_BOARD.ruleYoutube
        )}
      />

      <div className={LIVE_BOARD.head}>
        <PlatformIcon className={LIVE_BOARD.platform} aria-label={platform.label} />
        <div className={LIVE_BOARD.identity}>
          <span
            className={cn(
              LIVE_BOARD.status,
              isLive ? LIVE_BOARD.statusLive : LIVE_BOARD.statusAnnounced
            )}
          >
            <DotIcon className={isLive ? LIVE_BOARD.dotPulse : LIVE_BOARD.dot} />
            {isLive ? LIVE_COPY.liveBadge : LIVE_COPY.announcedBadge}
          </span>
          <h2 className={LIVE_BOARD.creator}>{live.youtuber.name}</h2>
          <p className={LIVE_BOARD.title}>{live.title}</p>
        </div>
      </div>

      <dl className={LIVE_BOARD.facts}>
        <div className={LIVE_BOARD.fact}>
          <dt className={LIVE_BOARD.factLabel}>
            {isLive ? LIVE_COPY.startedAt : LIVE_COPY.startsAt}
          </dt>
          <dd className={LIVE_BOARD.factValue}>
            {formatDayTime(isLive ? live.startedAt : live.plannedStartAt)}
          </dd>
        </div>
        <div className={LIVE_BOARD.fact}>
          <dt className={LIVE_BOARD.factLabel}>{LIVE_COPY.endsAt}</dt>
          <dd className={LIVE_BOARD.factValue}>{formatDayTime(live.plannedEndAt)}</dd>
        </div>
        <div className={LIVE_BOARD.fact}>
          <dt className={LIVE_BOARD.factLabel}>{LIVE_COPY.coordinator}</dt>
          {live.coordinator ? (
            <dd className={LIVE_BOARD.factValue}>
              <CoordinatorIcon className={LIVE_BOARD.factGlyph} />
              {live.coordinator.name}
            </dd>
          ) : (
            <dd className={LIVE_BOARD.factEmpty}>{LIVE_COPY.noCoordinator}</dd>
          )}
        </div>
        <div className={LIVE_BOARD.fact}>
          <dt className={LIVE_BOARD.factLabel}>{LIVE_COPY.convened}</dt>
          <dd className={LIVE_BOARD.factValue}>
            <AvatarStack
              people={live.members.map((member) => ({
                id: member.id,
                name: member.name,
                src: member.avatar,
              }))}
            />
          </dd>
        </div>
      </dl>

      <div className={LIVE_BOARD.actions}>
        {isLive ? (
          <Link
            href={ROUTES.live(live.id)}
            className={cn(BUTTON_STYLES.base, BUTTON_STYLES.primary)}
          >
            {LIVE_COPY.openModView}
          </Link>
        ) : (
          <Button variant="secondary" disabled title={LIVE_COPY.modViewLocked}>
            {LIVE_COPY.openModView}
          </Button>
        )}

        {isLive && live.permissions.includes(Permissions.LiveLogRead) && (
          <Link
            href={ROUTES.liveReport(live.id)}
            className={cn(BUTTON_STYLES.base, BUTTON_STYLES.ghost)}
          >
            {LIVE_REPORT_COPY.logTitle}
          </Link>
        )}

        {canMove && !isLive && (
          <Button variant="success" isLoading={isSaving} onClick={() => request(LiveStatuses.Live)}>
            {LIVE_COPY.start}
          </Button>
        )}

        {canMove && (
          <Button
            variant={confirming ? 'danger' : 'ghost'}
            isLoading={isSaving && confirming !== null}
            onClick={() => request(isLive ? LiveStatuses.Ended : LiveStatuses.Cancelled)}
          >
            {isLive ? LIVE_COPY.end : LIVE_COPY.cancel}
          </Button>
        )}

        <Button
          variant="ghost"
          aria-expanded={isRosterOpen}
          onClick={() => setRosterOpen((open) => !open)}
        >
          {isRosterOpen ? LIVE_ROSTER_COPY.close : LIVE_ROSTER_COPY.open}
        </Button>

        {confirming && (
          <p className={LIVE_BOARD.confirm}>
            {confirming === LiveStatuses.Ended ? LIVE_COPY.confirmEnd : LIVE_COPY.confirmCancel}
          </p>
        )}
      </div>

      {isRosterOpen && <LiveRosterBoard liveId={live.id} />}
    </article>
  )
}
