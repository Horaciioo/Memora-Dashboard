import 'server-only'
import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'
import { scoreExercise } from '@/core/lib/curriculum/scoring'
import type { ExerciseAnswer, ExerciseResult } from '@/core/lib/curriculum/scoring'
import { recordEvent } from '@/core/services/system/ActivityService'
import { notify } from '@/core/services/system/NotificationService'
import { exercisesOf } from '@/declarations/academy/curriculum'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import type { SessionUser } from '@/types/auth'
import type { CourseProgress } from '@/types/academy'
import { AcademyJuniorStatuses, TrainingStatuses } from '@/utils/constants/hierarchy'
import type { Prisma } from '@prisma/client'
import { readCourse } from '@/core/services/academy/training/CurriculumService/catalog'

/**
 * Tell the referent of a junior that a course is done
 * @param {string} accountId - Junior account
 * @param {string} courseName - Course finished
 * @return {Promise<void>} - Notified
 */

const announceFinish = async (accountId: string, courseName: string): Promise<void> => {
  const junior = await prisma.academyJunior.findFirst({
    where: { accountId, status: AcademyJuniorStatuses.Active },
    select: { id: true, referentId: true },
    orderBy: { startedAt: 'desc' },
  })
  if (!junior) return

  // Responsables of the junior's creators hear of it too
  const creators = await prisma.account.findUnique({
    where: { id: accountId },
    select: { youtubers: { select: { id: true } } },
  })
  const leads = await prisma.youtuberLead.findMany({
    where: { youtuberId: { in: creators?.youtubers.map((creator) => creator.id) ?? [] } },
    select: { accountId: true },
  })
  const recipients = [junior.referentId, ...leads.map((lead) => lead.accountId)]

  if (recipients.some(Boolean)) {
    await notify({
      kind: 'TrainingFinished',
      recipients,
      actorId: accountId,
      target: 'member',
      targetId: accountId,
      subject: courseName,
    })
  }
}

/**
 * Score one exercise on the server
 * @param {string} trainingId - Training identifier
 * @param {SessionUser} viewer - Signed-in member
 * @param {string} blockKey - Exercise key
 * @param {ExerciseAnswer} answer - Learner answer
 * @return {Promise<{ result: ExerciseResult, progress: CourseProgress, finished: boolean }>} - Outcome
 */

export const submitExercise = async (
  trainingId: string,
  viewer: SessionUser,
  blockKey: string,
  answer: ExerciseAnswer
): Promise<{ result: ExerciseResult; progress: CourseProgress; finished: boolean }> => {
  const { course, progress } = await readCourse(trainingId, viewer)
  const exercises = exercisesOf(course)
  const block = exercises.find((entry) => entry.key === blockKey)
  if (!block) throw notFound()

  const result = scoreExercise(block, answer, ACADEMY_SETTINGS.exercisePassPercent)
  const next: CourseProgress = {
    blocks: {
      ...progress.blocks,
      // A cleared exercise stays cleared
      [blockKey]: {
        passed: result.passed || progress.blocks[blockKey]?.passed === true,
        score: result.score,
        max: result.max,
        answer,
      },
    },
  }

  const finished = exercises.every((entry) => next.blocks[entry.key]?.passed)
  const existing = await prisma.trainingRecord.findUnique({
    where: { trainingId_accountId: { trainingId, accountId: viewer.id } },
    select: { status: true },
  })
  const alreadyDone = existing?.status === TrainingStatuses.Done

  await prisma.trainingRecord.upsert({
    where: { trainingId_accountId: { trainingId, accountId: viewer.id } },
    update: {
      progress: next as unknown as Prisma.InputJsonValue,
      ...(finished && !alreadyDone
        ? { status: TrainingStatuses.Done, completedAt: new Date() }
        : alreadyDone
          ? {}
          : { status: TrainingStatuses.InProgress }),
    },
    create: {
      trainingId,
      accountId: viewer.id,
      startedAt: new Date(),
      progress: next as unknown as Prisma.InputJsonValue,
      status: finished ? TrainingStatuses.Done : TrainingStatuses.InProgress,
      completedAt: finished ? new Date() : null,
    },
  })

  if (finished && !alreadyDone) {
    await recordEvent({
      eventType: 'TrainingValidated',
      actorId: viewer.id,
      subjectId: viewer.id,
      targetType: 'training',
      targetId: trainingId,
      summary: course.name,
    })
    await announceFinish(viewer.id, course.name)
  }

  return { result, progress: next, finished }
}

/**
 * Keep what a learner thought of a course
 * @param {string} trainingId - Training identifier
 * @param {SessionUser} viewer - Signed-in member
 * @param {{ content: number, fluency: number, comment: string | null }} review - Marks out of 10
 * @return {Promise<void>} - Saved
 */

export const saveFeedback = async (
  trainingId: string,
  viewer: SessionUser,
  review: { content: number; fluency: number; comment: string | null }
): Promise<void> => {
  // Only a course the learner can open takes a review
  await readCourse(trainingId, viewer)

  await prisma.trainingFeedback.create({
    data: { trainingId, accountId: viewer.id, ...review },
  })
}
