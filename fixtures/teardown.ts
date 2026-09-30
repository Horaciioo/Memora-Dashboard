import { pathToFileURL } from 'node:url'
import { prisma, FIXTURE_PREFIX } from './lib/client.ts'

// Only rows whose identifier carries the fixture prefix
const OWN = { id: { startsWith: FIXTURE_PREFIX } }

/**
 * Delete every fixture row, children first, never touching a row the app wrote
 * @return {Promise<number>} - Rows deleted
 */

export const teardown = async (): Promise<number> => {
  const steps = [
    () => prisma.notification.deleteMany({ where: OWN }),
    () => prisma.activityLog.deleteMany({ where: OWN }),
    () => prisma.eventAttendance.deleteMany({ where: OWN }),
    () => prisma.calendarEvent.deleteMany({ where: OWN }),
    () => prisma.juniorAnswer.deleteMany({ where: OWN }),
    () => prisma.trainingRecord.deleteMany({ where: OWN }),
    () => prisma.juniorObjective.deleteMany({ where: OWN }),
    () => prisma.juniorNote.deleteMany({ where: OWN }),
    () => prisma.juniorSkill.deleteMany({ where: OWN }),
    () => prisma.academyReview.deleteMany({ where: OWN }),
    () => prisma.academyStep.deleteMany({ where: OWN }),
    () => prisma.integrationClaim.deleteMany({ where: OWN }),
    () => prisma.integrationInvite.deleteMany({ where: OWN }),
    () => prisma.recruitmentComment.deleteMany({ where: OWN }),
    () =>
      prisma.recruitmentSpectator.deleteMany({
        where: { candidateId: { startsWith: FIXTURE_PREFIX } },
      }),
    () => prisma.recruitmentCandidate.deleteMany({ where: OWN }),
    () => prisma.recruitmentStep.deleteMany({ where: OWN }),
    () => prisma.recruitmentResponsable.deleteMany({ where: OWN }),
    () => prisma.recruitmentSession.deleteMany({ where: OWN }),
    () => prisma.academyJunior.deleteMany({ where: OWN }),
    () => prisma.academySessionTrainer.deleteMany({ where: OWN }),
    () => prisma.academySession.deleteMany({ where: OWN }),
    () => prisma.liveconEntry.deleteMany({ where: OWN }),
    () => prisma.absence.deleteMany({ where: OWN }),
    () => prisma.meetingTopic.deleteMany({ where: OWN }),
    () => prisma.meetingAttendee.deleteMany({ where: OWN }),
    () => prisma.meeting.deleteMany({ where: OWN }),
    () => prisma.communication.deleteMany({ where: OWN }),
    () => prisma.task.deleteMany({ where: OWN }),
    () => prisma.projectLead.deleteMany({ where: OWN }),
    () => prisma.projectAssistant.deleteMany({ where: OWN }),
    () => prisma.project.deleteMany({ where: OWN }),
    () => prisma.teamMember.deleteMany({ where: OWN }),
    () => prisma.youtuberLead.deleteMany({ where: OWN }),
    () => prisma.team.deleteMany({ where: OWN }),
    () => prisma.accountPermission.deleteMany({ where: OWN }),
    () => prisma.accountConstraint.deleteMany({ where: OWN }),
    () => prisma.accountNote.deleteMany({ where: OWN }),
    () => prisma.socialLink.deleteMany({ where: OWN }),
    () => prisma.accountFunction.deleteMany({ where: OWN }),
    () => prisma.account.deleteMany({ where: OWN }),
    () => prisma.sanctionTier.deleteMany({ where: OWN }),
    () => prisma.sanctionOffense.deleteMany({ where: OWN }),
    () => prisma.functionPermission.deleteMany({ where: OWN }),
    () => prisma.youtuberFunction.deleteMany({ where: OWN }),
    () => prisma.recruitmentQuestion.deleteMany({ where: OWN }),
    () => prisma.quizChoice.deleteMany({ where: OWN }),
    () => prisma.quizQuestion.deleteMany({ where: OWN }),
    () => prisma.trainingBlock.deleteMany({ where: OWN }),
    () => prisma.trainingChapter.deleteMany({ where: OWN }),
    () => prisma.training.deleteMany({ where: OWN }),
    () => prisma.pimStepTemplate.deleteMany({ where: OWN }),
    () => prisma.skill.deleteMany({ where: OWN }),
    () => prisma.skillCategory.deleteMany({ where: OWN }),
    () => prisma.dispositif.deleteMany({ where: OWN }),
    () => prisma.eventTemplate.deleteMany({ where: OWN }),
    () => prisma.socialNetwork.deleteMany({ where: OWN }),
    () => prisma.platform.deleteMany({ where: OWN }),
    () => prisma.youtuber.deleteMany({ where: OWN }),
    () => prisma.storageEntry.deleteMany({ where: OWN }),
  ]

  let total = 0
  for (const step of steps) total += (await step()).count

  return total
}

// Run on its own, the fixtures are simply removed
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  teardown()
    .then((count) => console.log(`Données factices supprimées : ${count} lignes.`))
    .catch((error: unknown) => {
      console.error(error)
      process.exitCode = 1
    })
    .finally(() => prisma.$disconnect())
}
