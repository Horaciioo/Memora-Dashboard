import 'server-only'

import { prisma } from '@/core/lib/db'
import { notFound } from '@/core/lib/errors'

// A creator owns a lot of rows, the transaction gets time
const ERASE_TIMEOUT_MS = 120_000

/**
 * Rows a creator's erasure took away
 * @typedef {Object} ErasureReport
 * @property {number} lives - Lives of the creator
 * @property {number} events - Calendar events of the creator
 * @property {number} teams - Teams of the creator
 * @property {number} projects - Projects only this creator had
 * @property {number} tasks - Tasks only this creator had
 * @property {number} meetings - Meetings only this creator had
 */

export interface ErasureReport {
  lives: number
  events: number
  teams: number
  projects: number
  tasks: number
  meetings: number
}

/**
 * Erase a creator and everything that belongs to them, nothing that belongs to another creator:
 * the rows that point at the creator alone go, the ones shared with another creator stay and only
 * lose their link to this one, members are never touched
 * @param {string} id - Creator
 * @return {Promise<ErasureReport>} - What went
 */

export const eraseYoutuber = async (id: string): Promise<ErasureReport> => {
  const youtuber = await prisma.youtuber.findUnique({ where: { id }, select: { id: true } })
  if (!youtuber) throw notFound()

  // Shared with another creator: kept
  const onlyThis = { youtubers: { some: { id }, every: { id } } }

  return prisma.$transaction(
    async (tx) => {
      const lives = await tx.live.count({ where: { youtuberId: id } })
      const meetings = await tx.meeting.deleteMany({ where: onlyThis })
      const tasks = await tx.task.deleteMany({ where: onlyThis })
      const projects = await tx.project.deleteMany({ where: onlyThis })

      // Rows that only point softly at the creator would stay orphaned
      const events = await tx.calendarEvent.deleteMany({ where: { youtuberId: id } })
      const teams = await tx.team.deleteMany({ where: { youtuberId: id } })
      await tx.discordIdentifier.deleteMany({ where: { youtuberId: id } })
      await tx.integrationInvite.deleteMany({ where: { youtuberId: id } })

      // The rest follows by cascade: lives, panels, comments, channels, rights, recruitment
      await tx.youtuber.delete({ where: { id } })

      return {
        lives,
        events: events.count,
        teams: teams.count,
        projects: projects.count,
        tasks: tasks.count,
        meetings: meetings.count,
      }
    },
    { timeout: ERASE_TIMEOUT_MS }
  )
}
