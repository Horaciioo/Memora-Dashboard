'use client'

import { useCourseContext } from '@/composites/academy/course/CourseContextProvider'
import { COURSE_COPY } from '@/declarations/academy/copy'
import type { IconName } from '@/declarations/ui/icons'
import { isIconName } from '@/declarations/ui/icons'

/**
 * Name and glyph the app gives each Livecon level
 * @return {(level: number) => { name: string, icon: IconName }} - Look of a level
 */

export const useLevelLook = () => {
  const { livecon } = useCourseContext()

  return (level: number): { name: string; icon: IconName } => {
    const entry = livecon.find((candidate) => candidate.level === level)

    return {
      name: entry?.name ?? COURSE_COPY.liveconLevel(level),
      icon: entry?.icon && isIconName(entry.icon) ? entry.icon : 'livecon',
    }
  }
}
