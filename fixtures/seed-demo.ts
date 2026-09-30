import { prisma } from './lib/client.ts'
import { teardown } from './teardown.ts'
import { seedReference } from './steps/reference.ts'
import { seedPeople } from './steps/people.ts'
import { seedWork } from './steps/work.ts'
import { seedAbsences, seedCalendar, seedLivecon } from './steps/life.ts'
import { seedPipeline } from './steps/pipeline.ts'
import { seedJournal } from './steps/journal.ts'

/**
 * Replace the fixture dataset with a fresh one, six months of history up to today
 * @return {Promise<void>} - Seeded
 */

const main = async (): Promise<void> => {
  const removed = await teardown()
  console.log(`Anciennes données factices supprimées : ${removed} lignes.`)

  const reference = await seedReference()
  const cast = await seedPeople(reference)
  const work = await seedWork(reference, cast)
  const absences = await seedAbsences(cast)
  const livecon = await seedLivecon(reference, cast)
  const rollCalls = await seedCalendar(reference, cast, work)
  const pipeline = await seedPipeline(reference, cast)
  const journal = await seedJournal(cast)

  console.table({
    Créateurs: reference.creators.length,
    Responsables: cast.responsables.length,
    Modérateurs: cast.moderators.length,
    Équipes: cast.teams.length,
    Projets: work.projects.length,
    Tâches: work.tasks.length,
    Réunions: work.meetings.length,
    Absences: absences.length,
    'Changements de Livecon': livecon.length,
    'Appels de présence': rollCalls.length,
    Juniors: pipeline.juniorIds.length,
    Candidats: pipeline.candidateCount,
    'Lignes de journal': journal.logs,
    Notifications: journal.notifications,
  })
}

main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
