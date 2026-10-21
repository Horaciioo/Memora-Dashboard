import type { ComponentType } from 'react'
import type { GlyphProps } from '@/components/elements/display/glyphs/Glyphs'
import { FavoriteStar } from '@/components/elements/display/FavoriteStar'
import {
  RailLiveGlyph,
  RailHomeGlyph,
  RailAbsenceGlyph,
  RailNewsGlyph,
  RailCalendarGlyph,
  RailAcademyGlyph,
  RailCrownGlyph,
  RailMembersGlyph,
  RailProjectsGlyph,
  RailTasksGlyph,
  RailRecruitmentGlyph,
  RailCrisisGlyph,
  RailDiscordGlyph,
  RailSearchGlyph,
  RailSettingsGlyph,
  RailSystemGlyph,
  RailSheetGlyph,
  RailClockGlyph,
  RailSparkGlyph,
  RailBirthdayGlyph,
  RailCommunicationsGlyph,
  RailReviewGlyph,
} from '@/components/elements/display/glyphs/RailGlyphs'
import { ICONS, type IconName } from '@/declarations/ui/icons'

/**
 * Line glyphs of the rail, by icon key
 * @type {Partial<Record<IconName, ComponentType<GlyphProps>>>}
 */

export const RAIL_ICONS: Partial<Record<IconName, ComponentType<GlyphProps>>> = {
  liveDot: RailLiveGlyph,
  dashboard: RailHomeGlyph,
  absences: RailAbsenceGlyph,
  news: RailNewsGlyph,
  meetings: RailCalendarGlyph,
  academy: RailAcademyGlyph,
  crown: RailCrownGlyph,
  members: RailMembersGlyph,
  projects: RailProjectsGlyph,
  tasks: RailTasksGlyph,
  recruitment: RailRecruitmentGlyph,
  liveconCrisis: RailCrisisGlyph,
  discord: RailDiscordGlyph,
  settings: RailSettingsGlyph,
  search: RailSearchGlyph,
  system: RailSystemGlyph,
  sheet: RailSheetGlyph,
  clock: RailClockGlyph,
  spark: RailSparkGlyph,
  birthday: RailBirthdayGlyph,
  communications: RailCommunicationsGlyph,
  objective: RailReviewGlyph,
  star: FavoriteStar,
}

/**
 * Glyph of an icon key on the rail, the full-colour one when no line glyph exists
 * @param {IconName} name - Icon key
 * @return {ComponentType<GlyphProps>}
 */

export const railIcon = (name: IconName): ComponentType<GlyphProps> =>
  RAIL_ICONS[name] ?? ICONS[name]
