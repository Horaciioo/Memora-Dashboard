import type { JuniorSkillView } from '@/types/academy'

/**
 * Competencies of one category
 * @typedef {Object} SkillGroup
 */

export interface SkillGroup {
  id: string
  name: string
  accent: string | null
  items: JuniorSkillView[]
}

/**
 * Gather competencies under their category, in the order met
 * @param {JuniorSkillView[]} skills - Competency grades
 * @return {SkillGroup[]} - One group per category
 */

export const groupSkills = (skills: JuniorSkillView[]): SkillGroup[] => {
  const groups = new Map<string, SkillGroup>()

  for (const skill of skills) {
    const group = groups.get(skill.categoryId) ?? {
      id: skill.categoryId,
      name: skill.categoryName,
      accent: skill.categoryAccent,
      items: [],
    }
    group.items.push(skill)
    groups.set(skill.categoryId, group)
  }

  return [...groups.values()]
}
