import 'server-only'

import { prisma } from '@/core/lib/db'
import {
  LIBRARY_DISPOSITIFS,
  LIBRARY_EVENT_TEMPLATES,
  LIBRARY_NETWORKS,
  LIBRARY_PIM_STEPS,
  LIBRARY_SKILL_CATEGORIES,
  LIBRARY_STATES,
} from '@/declarations/reference/library'

// Collections written once per server process
let synced: Promise<void> | null = null

/**
 * Resolve a name to its row identifier
 * @param {Map<string, string>} ids - Identifiers by name
 * @param {string | null} name - Name to resolve
 * @return {string | null} - Row identifier
 */

const idOf = (ids: Map<string, string>, name: string | null): string | null =>
  name === null ? null : (ids.get(name) ?? null)

/**
 * Write the collections fixed in code onto their rows
 * @return {Promise<void>} - Written
 */

const writeLibrary = async (): Promise<void> => {
  const [functions, dispositifRows] = await Promise.all([
    prisma.jobFunction.findMany({ select: { id: true, name: true } }),
    Promise.all(
      LIBRARY_DISPOSITIFS.map((entry, position) => {
        const data = { summary: entry.summary, accent: entry.accent, position }

        return prisma.dispositif.upsert({
          where: { name: entry.name },
          update: data,
          create: { name: entry.name, ...data },
        })
      })
    ),
  ])

  const functionIds = new Map(functions.map((row) => [row.name, row.id]))
  const dispositifIds = new Map(dispositifRows.map((row) => [row.name, row.id]))

  // Statuses
  const positions = new Map<string, number>()

  for (const entry of LIBRARY_STATES) {
    const position = positions.get(entry.scope) ?? 0
    positions.set(entry.scope, position + 1)

    const data = {
      accent: entry.accent,
      phase: entry.phase,
      isDefault: entry.isDefault,
      position,
    }

    await prisma.workflowState.upsert({
      where: { scope_name: { scope: entry.scope, name: entry.name } },
      update: data,
      create: { scope: entry.scope, name: entry.name, ...data },
    })
  }

  // Social networks
  for (const [position, entry] of LIBRARY_NETWORKS.entries()) {
    const data = {
      urlPrefix: entry.urlPrefix,
      accent: entry.accent,
      required: entry.required,
      position,
    }

    await prisma.socialNetwork.upsert({
      where: { name: entry.name },
      update: data,
      create: { name: entry.name, ...data },
    })
  }

  // Calendar templates
  for (const [position, entry] of LIBRARY_EVENT_TEMPLATES.entries()) {
    const data = {
      kind: entry.kind,
      summary: entry.summary,
      body: entry.summary,
      accent: entry.accent,
      visibility: entry.visibility,
      defaultMinutes: entry.defaultMinutes,
      allDay: entry.allDay,
      position,
    }

    await prisma.eventTemplate.upsert({
      where: { name: entry.name },
      update: data,
      create: { name: entry.name, ...data },
    })
  }

  // Skill families then their skills
  for (const [categoryPosition, category] of LIBRARY_SKILL_CATEGORIES.entries()) {
    const row = await prisma.skillCategory.upsert({
      where: { name: category.name },
      update: { accent: category.accent, position: categoryPosition },
      create: { name: category.name, accent: category.accent, position: categoryPosition },
    })

    for (const [position, skill] of category.skills.entries()) {
      const key = {
        name: skill.name,
        functionId: idOf(functionIds, skill.function),
        dispositifId: idOf(dispositifIds, skill.dispositif),
      }
      const existing = await prisma.skill.findFirst({ where: key, select: { id: true } })

      if (existing) {
        await prisma.skill.update({
          where: { id: existing.id },
          data: { categoryId: row.id, position, description: skill.description },
        })
      } else {
        await prisma.skill.create({
          data: { ...key, categoryId: row.id, position, description: skill.description },
        })
      }
    }
  }

  // PIM timeline
  for (const [position, step] of LIBRARY_PIM_STEPS.entries()) {
    const key = {
      title: step.title,
      functionId: idOf(functionIds, step.function),
      dispositifId: idOf(dispositifIds, step.dispositif),
    }
    const data = {
      stage: step.stage,
      anchor: step.anchor,
      offset: step.offset,
      owner: step.owner,
      required: step.required,
      icon: step.icon,
      guide: step.guide,
      destination: step.destination,
      position,
    }
    const existing = await prisma.pimStepTemplate.findFirst({ where: key, select: { id: true } })

    if (existing) {
      await prisma.pimStepTemplate.update({ where: { id: existing.id }, data })
    } else {
      await prisma.pimStepTemplate.create({ data: { ...key, ...data } })
    }
  }
}

/**
 * Make sure the collections declared in code sit in the database
 * @return {Promise<void>} - Synced
 */

export const syncReferenceLibrary = (): Promise<void> => {
  synced ??= writeLibrary().catch((error: unknown) => {
    synced = null
    throw error
  })

  return synced
}
