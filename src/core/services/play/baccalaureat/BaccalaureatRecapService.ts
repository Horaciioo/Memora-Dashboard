import 'server-only'

import { prisma } from '@/core/lib/db'

/**
 * Highlights of a finished Baccalaureat
 * @param {string} sessionId - Game
 * @param {Map<string, string>} labels - Category labels
 * @return {Promise<object>} - Best word, most refused word, best category
 */

export const baccalaureatRecap = async (sessionId: string, labels: Map<string, string>) => {
  const answers = await prisma.baccalaureatAnswer.findMany({
    where: { round: { sessionId } },
    select: {
      accountId: true,
      category: true,
      word: true,
      points: true,
      _count: { select: { votes: { where: { accepted: false } } } },
    },
  })
  if (!answers.length) return null

  // Top word, longest on a tie
  const best = answers.toSorted(
    (left, right) => right.points - left.points || right.word.length - left.word.length
  )[0]
  const refused = answers.toSorted((left, right) => right._count.votes - left._count.votes)[0]

  // Category paying the most
  const byCategory = Map.groupBy(answers, (answer) => answer.category)
  const [category, total] = [...byCategory]
    .map(([key, entries]) => [key, entries.reduce((sum, entry) => sum + entry.points, 0)] as const)
    .toSorted((left, right) => right[1] - left[1])[0]

  return {
    bestWord: { accountId: best.accountId, word: best.word, points: best.points },
    mostRefused: refused._count.votes
      ? { accountId: refused.accountId, word: refused.word, refusals: refused._count.votes }
      : null,
    bestCategory: { label: labels.get(category) ?? category, points: total },
  }
}
