'use client'

import { useRouter } from 'next/navigation'

import { Avatar } from '@/components/elements/display/Avatar'
import { MEMBER_COPY } from '@/declarations/members/copy'
import { ROUTES } from '@/declarations/navigation'
import { CREATOR_GROUP } from '@/declarations/ui/blocks'
import { LIST_STYLES } from '@/declarations/ui/variants'
import type { AcceptedCandidate } from '@/types/members'
import { cn } from '@/utils/classnames'

export interface AcceptedCandidatesProps {
  candidates: AcceptedCandidate[]
}

/**
 * Accepted candidates under the moderators
 * @param {AcceptedCandidatesProps} props - Candidates of one creator
 * @return {JSX.Element | null}
 */

export const AcceptedCandidates = ({ candidates }: AcceptedCandidatesProps) => {
  const router = useRouter()

  if (candidates.length === 0) return null

  return (
    <div className={CREATOR_GROUP.section}>
      <h3 className={CREATOR_GROUP.sectionHeading}>{MEMBER_COPY.acceptedCandidates}</h3>
      <div className={LIST_STYLES.grid}>
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            role="button"
            tabIndex={0}
            onClick={() => router.push(ROUTES.candidate(candidate.sessionId, candidate.id))}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                router.push(ROUTES.candidate(candidate.sessionId, candidate.id))
              }
            }}
            className={cn(
              LIST_STYLES.card,
              LIST_STYLES.cardClickable,
              'flex-row items-center gap-3 px-4 py-3'
            )}
          >
            <Avatar name={candidate.name} src={candidate.avatarUrl} size="sm" />
            <span className="min-w-0 flex-1 truncate font-medium">{candidate.name}</span>
            <span className="text-sm text-[var(--color-ink-subtle)]">{candidate.functionName}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
