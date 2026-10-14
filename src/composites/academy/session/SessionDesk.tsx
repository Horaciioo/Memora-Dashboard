'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { ScrollCard } from '@/components/structures/ScrollCard'
import { useSessionState } from '@/composites/academy/session/SessionFileContext'
import { decisionQueue, reviewQueue } from '@/core/lib/academy/queues'
import { PARKOUR_COPY } from '@/declarations/academy/parkour'
import { PARKOUR_PHASES } from '@/declarations/academy/parkour'
import { SESSION_DESK } from '@/declarations/ui/variants'
import type { JuniorView } from '@/types/academy'

interface DeskCardProps {
  title: string
  empty: string
  action: string
  count: (total: number) => string
  juniors: JuniorView[]
  onStart: () => void
}

/**
 * One box of work waiting for the viewer, started in one click
 * @param {DeskCardProps} props - What waits and how to start it
 * @return {JSX.Element}
 */

const DeskCard = ({ title, empty, action, count, juniors, onStart }: DeskCardProps) => (
  <ScrollCard title={title}>
    {juniors.length === 0 ? (
      <p className={SESSION_DESK.empty}>{empty}</p>
    ) : (
      <>
        <span className={SESSION_DESK.count}>{count(juniors.length)}</span>
        <ul className={SESSION_DESK.list}>
          {juniors.map((junior) => (
            <li key={junior.id} className={SESSION_DESK.item}>
              <Avatar name={junior.displayName} src={junior.avatarUrl} size="xs" />
              <span className={SESSION_DESK.body}>
                <span className={SESSION_DESK.name}>{junior.displayName}</span>
                <span className={SESSION_DESK.phase}>{PARKOUR_PHASES[junior.phase].label}</span>
              </span>
            </li>
          ))}
        </ul>
        <Button variant="primary" icon="forward" className={SESSION_DESK.start} onClick={onStart}>
          {action}
        </Button>
      </>
    )}
  </ScrollCard>
)

/**
 * Check-ins a trainer owes and decisions a responsable owes, beside the information box
 * @return {JSX.Element | null}
 */

export const SessionDesk = () => {
  const { session, can, setFlow } = useSessionState()
  const reviews = can.writeReviews ? reviewQueue(session.juniors, can.viewerId) : null
  const decisions = can.validateReviews ? decisionQueue(session.juniors) : null

  if (!reviews && !decisions) return null

  return (
    <>
      {reviews && (
        <DeskCard
          title={PARKOUR_COPY.reviewsDeskTitle}
          empty={PARKOUR_COPY.reviewsDeskEmpty}
          action={PARKOUR_COPY.doReviews}
          count={PARKOUR_COPY.reviewsPending}
          juniors={reviews}
          onStart={() => setFlow('reviews')}
        />
      )}
      {decisions && (
        <DeskCard
          title={PARKOUR_COPY.decisionsDeskTitle}
          empty={PARKOUR_COPY.decisionsDeskEmpty}
          action={PARKOUR_COPY.doDecisions}
          count={PARKOUR_COPY.decisionsPending}
          juniors={decisions}
          onStart={() => setFlow('decisions')}
        />
      )}
    </>
  )
}
