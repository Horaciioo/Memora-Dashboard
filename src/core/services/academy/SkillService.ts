import 'server-only'

import { prisma } from '@/core/lib/db'
import type { AcademyScope } from '@/core/services/academy/AcademyScope'
import { ACADEMY_SETTINGS } from '@/declarations/configurations/settings'
import { LIBRARY_SKILL_NAMES } from '@/declarations/reference/library'
import type { JuniorSkillView } from '@/types/academy'
import { juniorInScope } from '@/core/services/academy/lookups'

/**
 * Shape one competency grade
 * @param {object} skill - Skill row with its category
 * @param {object} [grade] - Existing grade
 * @return {JuniorSkillView} - Skill view
 */

const toJuniorSkill = (
  skill: {
    id: string
    name: string
    description: string | null
    categoryId: string
    category: { name: string; accent: string | null }
  },
  grade?: { percent: number; updatedAt: Date; validator: { displayName: string } | null }
): JuniorSkillView => ({
  skillId: skill.id,
  name: skill.name,
  description: skill.description,
  categoryId: skill.categoryId,
  categoryName: skill.category.name,
  categoryAccent: skill.category.accent,
  percent: grade?.percent ?? 0,
  validatorName: grade?.validator?.displayName ?? null,
  updatedAt: grade?.updatedAt.toISOString() ?? null,
})

/**
 * Read the competencies open to a junior's function and dispositif
 * @param {string} juniorId - Junior identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @return {Promise<JuniorSkillView[]>} - Skills grouped by category order
 */

export const listJuniorSkills = async (
  juniorId: string,
  scope: AcademyScope
): Promise<JuniorSkillView[]> => {
  const junior = await juniorInScope(juniorId, scope)

  const [skills, grades] = await Promise.all([
    prisma.skill.findMany({
      where: {
        // Only the skills declared in code
        name: { in: [...LIBRARY_SKILL_NAMES] },
        OR: [{ functionId: null }, { functionId: junior.session.functionId }],
        AND: [{ OR: [{ dispositifId: null }, { dispositifId: junior.dispositifId }] }],
      },
      include: { category: true },
      orderBy: [{ category: { position: 'asc' } }, { position: 'asc' }],
    }),
    prisma.juniorSkill.findMany({ where: { juniorId }, include: { validator: true } }),
  ])

  const gradeBySkill = new Map(grades.map((grade) => [grade.skillId, grade]))

  return skills.map((skill) => toJuniorSkill(skill, gradeBySkill.get(skill.id)))
}

/**
 * Move the mastery of one competency
 * @param {string} juniorId - Junior identifier
 * @param {AcademyScope} scope - Visibility fragment
 * @param {string} skillId - Skill identifier
 * @param {number} percent - Wanted mastery
 * @param {string} validatorId - Who moved it
 * @return {Promise<JuniorSkillView[]>} - Skills
 */

export const setJuniorSkill = async (
  juniorId: string,
  scope: AcademyScope,
  skillId: string,
  percent: number,
  validatorId: string
): Promise<JuniorSkillView[]> => {
  await juniorInScope(juniorId, scope)

  const bounded = Math.min(Math.max(percent, 0), ACADEMY_SETTINGS.skillMaxPercent)

  await prisma.juniorSkill.upsert({
    where: { juniorId_skillId: { juniorId, skillId } },
    update: { percent: bounded, validatorId },
    create: { juniorId, skillId, percent: bounded, validatorId },
  })

  return listJuniorSkills(juniorId, scope)
}
