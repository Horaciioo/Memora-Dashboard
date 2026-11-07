import { keepsAnswer } from '@/core/lib/play/baccalaureat/scoring'

/**
 * Answer with the voters who judged it
 * @typedef {Object} VotedAnswer
 * @property {string} accountId - Author
 * @property {{ voterId: string }[]} votes - Votes cast
 */

export interface VotedAnswer {
  accountId: string
  votes: { voterId: string }[]
}

/**
 * Players who judged every word but their own
 * @param {VotedAnswer[]} answers - Round answers
 * @param {string[]} players - Seated players
 * @return {string[]} - Finished voters
 */

export const finishedVoters = (answers: VotedAnswer[], players: string[]): string[] =>
  players.filter((player) =>
    answers
      .filter((answer) => answer.accountId !== player)
      .every((answer) => answer.votes.some((vote) => vote.voterId === player))
  )

/**
 * Verdict of an answer while votes come in
 * @param {Object} input - Tally
 * @param {boolean} input.fits - Opens on the letter
 * @param {number} input.accepts - Votes for
 * @param {number} input.rejects - Votes against
 * @return {'yes' | 'no' | 'none'} - Check, cross or undecided
 */

export const liveVerdict = (input: {
  fits: boolean
  accepts: number
  rejects: number
}): 'yes' | 'no' | 'none' => {
  if (!input.fits) return 'no'
  if (input.accepts + input.rejects === 0) return 'none'

  return keepsAnswer(input) ? 'yes' : 'no'
}
