import 'server-only'

import { prisma } from '@/core/lib/db'
import type { TrainingFeedbackSummary } from '@/types/academy'

/**
 * Reviews of one training
 * @param {string} trainingId - Training identifier
 * @return {Promise<TrainingFeedbackSummary>} - Averages and comments
 */

export const readFeedbackSummary = async (
  trainingId: string
): Promise<TrainingFeedbackSummary> => {
  const [averages, comments] = await Promise.all([
    prisma.trainingFeedback.aggregate({
      where: { trainingId },
      _avg: { content: true, fluency: true },
      _count: { _all: true },
    }),
    prisma.trainingFeedback.findMany({
      where: { trainingId, comment: { not: null } },
      select: {
        id: true,
        content: true,
        fluency: true,
        comment: true,
        createdAt: true,
        account: { select: { displayName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
  ])

  return {
    reviews: averages._count._all,
    content: averages._avg.content,
    fluency: averages._avg.fluency,
    comments: comments.map((row) => ({
      id: row.id,
      memberName: row.account.displayName,
      avatarUrl: row.account.avatarUrl,
      content: row.content,
      fluency: row.fluency,
      comment: row.comment ?? '',
      createdAt: row.createdAt.toISOString(),
    })),
  }
}
