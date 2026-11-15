'use client'

import type { ReactNode } from 'react'

import { Section } from '@/components/structures/page/Section'
import { Button } from '@/components/elements/actions/Button'
import { UNBAN_DESK_STYLES } from '@/declarations/ui/variants'
import { UNBAN_COPY } from '@/declarations/unban/copy'
import type { UnbanVoteSummary } from '@/types/unban'

export interface UnbanVotesProps {
  votes: UnbanVoteSummary
  isSaving: boolean
  onVote: (choice: 'FOR' | 'AGAINST') => void
  // Decision buttons of the lead, under the opinions
  footer?: ReactNode
}

/**
 * Pour / Contre of the moderators, the one who decides only sees how many voted
 * @param {UnbanVotesProps} props - Votes and the vote writer
 * @return {JSX.Element | null}
 */

export const UnbanVotes = ({ votes, isSaving, onVote, footer }: UnbanVotesProps) => {
  const total = votes.voters
  const summary =
    total === 0
      ? UNBAN_COPY.voteNone
      : total === 1
        ? UNBAN_COPY.voteVoterOne
        : UNBAN_COPY.voteVoters.replace('{n}', String(total))

  if (!votes.canVote && !footer && total === 0 && votes.forCount === null) return null

  return (
    <Section title={UNBAN_COPY.voteTitle} raised>
      <p className={UNBAN_DESK_STYLES.barNote}>{summary}</p>

      {votes.canVote && (
        <>
          <div className={UNBAN_DESK_STYLES.actions}>
            <Button
              variant={votes.mine === 'FOR' ? 'success' : 'secondary'}
              isLoading={isSaving}
              aria-pressed={votes.mine === 'FOR'}
              onClick={() => onVote('FOR')}
            >
              {UNBAN_COPY.voteFor}
              {votes.forCount !== null && ` (${votes.forCount})`}
            </Button>
            <Button
              variant={votes.mine === 'AGAINST' ? 'danger' : 'secondary'}
              isLoading={isSaving}
              aria-pressed={votes.mine === 'AGAINST'}
              onClick={() => onVote('AGAINST')}
            >
              {UNBAN_COPY.voteAgainst}
              {votes.againstCount !== null && ` (${votes.againstCount})`}
            </Button>
          </div>
          <p className={UNBAN_DESK_STYLES.barNote}>{UNBAN_COPY.voteHint}</p>
        </>
      )}
      {footer}
    </Section>
  )
}
