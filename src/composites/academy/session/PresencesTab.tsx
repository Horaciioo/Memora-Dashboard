'use client'

import { Avatar } from '@/components/elements/display/Avatar'
import { EmptyState } from '@/components/elements/feedback/EmptyState'
import { Section } from '@/components/structures/page/Section'
import { useSessionState } from '@/composites/academy/session/SessionFileContext'
import { ACADEMY_COPY } from '@/declarations/academy/copy'
import { PRESENCE_OUTCOME_REGISTRY } from '@/declarations/academy/registries'
import { ACCOMPANIED_LIVES, LIST_STYLES } from '@/declarations/ui/variants'
import { PresenceOutcomes } from '@/utils/constants/workflow'

/**
 * What each junior answered on the lives of their period
 * @return {JSX.Element}
 */

export const PresencesTab = () => {
  const { session, presences, openJunior } = useSessionState()
  const rows = session.juniors.flatMap((junior) => {
    const tally = presences.find((entry) => entry.juniorId === junior.id)

    return tally ? [{ junior, tally }] : []
  })

  return (
    <Section description={ACADEMY_COPY.presencesSessionLead} bare>
      {rows.length === 0 ? (
        <EmptyState
          figure="academy"
          title={ACADEMY_COPY.livesEmpty}
          description={ACADEMY_COPY.presencesSessionLead}
        />
      ) : (
        <ul className={LIST_STYLES.stack}>
          {rows.map(({ junior, tally }) => (
            <li key={junior.id}>
              <button
                type="button"
                className={`${LIST_STYLES.item} w-full text-left`}
                onClick={() => openJunior(junior)}
              >
                <Avatar name={junior.displayName} src={junior.avatarUrl} size="sm" />
                <span className={ACCOMPANIED_LIVES.body}>
                  <span className={ACCOMPANIED_LIVES.creator}>{junior.displayName}</span>
                </span>
                {(
                  [
                    [PresenceOutcomes.Present, tally.present],
                    [PresenceOutcomes.Absent, tally.absent],
                    [PresenceOutcomes.Excused, tally.excused],
                    [PresenceOutcomes.Silent, tally.silent],
                  ] as const
                ).map(([status, total]) => (
                  <span key={status} className={ACCOMPANIED_LIVES.date}>
                    {total} {PRESENCE_OUTCOME_REGISTRY.get(status).label.toLowerCase()}
                  </span>
                ))}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
