import { PrismaPg } from '@prisma/adapter-pg'
import { MemberRole, MemberStatus, PrismaClient, RecruitmentOwner } from '@prisma/client'

import {
  FIXED_DIVISIONS,
  FIXED_FUNCTIONS,
  FIXED_LIVECON_LEVELS,
  FIXED_PRIORITIES,
  FIXED_RECRUITMENT_OUTCOMES,
  FIXED_RECRUITMENT_STEPS,
} from '../src/declarations/reference/fixed.ts'

// Gap between two recruitment steps
const POSITION_STEP = 1000

// Prisma 7 no longer loads .env on its own
try {
  process.loadEnvFile()
} catch {
  // No .env file, variables come from the environment
}

const discordId = process.env.ADMIN_DISCORD_ID?.trim() ?? ''
const displayName = process.env.ADMIN_DISPLAY_NAME?.trim() ?? ''

const MISSING_IDENTIFIER = 'ADMIN_DISCORD_ID is required to seed the root account'
const MISSING_NAME = 'ADMIN_DISPLAY_NAME is required to seed the root account'

/**
 * Write the collections fixed in code, never deleting a row
 * @param {PrismaClient} prisma - Database client
 * @return {Promise<void>} - Synced
 */

const syncFixedReferences = async (prisma: PrismaClient): Promise<void> => {
  // Divisions, keyed on name
  for (const division of FIXED_DIVISIONS) {
    await prisma.division.upsert({
      where: { name: division.name },
      update: {
        rank: division.rank,
        summary: division.summary,
        leadAssignable: division.leadAssignable,
        imagePath: division.imagePath,
      },
      create: division,
    })
  }

  // Functions, keyed on name
  for (const jobFunction of FIXED_FUNCTIONS) {
    const { name, ...rest } = jobFunction

    await prisma.jobFunction.upsert({
      where: { name },
      update: { ...rest, archived: false },
      create: jobFunction,
    })
  }

  // Priorities, keyed on name
  for (const priority of FIXED_PRIORITIES) {
    await prisma.priority.upsert({
      where: { name: priority.name },
      update: { weight: priority.weight, accent: priority.accent },
      create: { name: priority.name, weight: priority.weight, accent: priority.accent },
    })
  }

  // Livecon, keyed on level
  for (const level of FIXED_LIVECON_LEVELS) {
    await prisma.liveconLevel.upsert({
      where: { level: level.level },
      update: {
        name: level.name,
        icon: level.icon,
        summary: level.summary,
        guidelines: level.guidelines,
        accent: level.accent,
      },
      create: level,
    })
  }

  // Outcomes, keyed on name
  for (const [index, outcome] of FIXED_RECRUITMENT_OUTCOMES.entries()) {
    await prisma.recruitmentOutcome.upsert({
      where: { name: outcome.name },
      update: { ...outcome, position: index, archived: false },
      create: { ...outcome, position: index },
    })
  }

  // Global trame, keyed on title
  for (const [index, step] of FIXED_RECRUITMENT_STEPS.entries()) {
    const data = {
      ...step,
      owner: RecruitmentOwner[step.owner],
      position: (index + 1) * POSITION_STEP,
    }
    const known = await prisma.recruitmentStepTemplate.findFirst({
      where: { title: step.title, youtuberId: null, functionId: null },
    })

    if (known) await prisma.recruitmentStepTemplate.update({ where: { id: known.id }, data })
    else await prisma.recruitmentStepTemplate.create({ data })
  }
}

/**
 * Write the root administrator and the collections fixed in code
 * @return {Promise<void>} - Seeded
 */

const seed = async (): Promise<void> => {
  if (discordId.length === 0) throw new Error(MISSING_IDENTIFIER)
  if (displayName.length === 0) throw new Error(MISSING_NAME)

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  // The name is refreshed on every seed, the identifier stays the key
  await prisma.account.upsert({
    where: { discordId },
    update: {
      displayName,
      role: MemberRole.ADMIN,
      status: MemberStatus.ACTIVE,
      leftAt: null,
    },
    create: {
      discordId,
      displayName,
      role: MemberRole.ADMIN,
      status: MemberStatus.ACTIVE,
    },
  })

  await syncFixedReferences(prisma)

  await prisma.$disconnect()
}

void seed()
