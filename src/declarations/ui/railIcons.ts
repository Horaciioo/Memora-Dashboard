import type { ComponentType } from 'react'
import type { GlyphProps } from '@/components/elements/display/Glyphs'
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
  RailRefreshGlyph,
  RailSettingsGlyph,
  RailSystemGlyph,
  RailSheetGlyph,
  RailClockGlyph,
  RailSparkGlyph,
  RailBirthdayGlyph,
} from '@/components/elements/display/RailGlyphs'
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
  refresh: RailRefreshGlyph,
  system: RailSystemGlyph,
  sheet: RailSheetGlyph,
  clock: RailClockGlyph,
  spark: RailSparkGlyph,
  birthday: RailBirthdayGlyph,
}

/**
 * Glyph of an icon key on the rail, the full-colour one when no line glyph exists
 * @param {IconName} name - Icon key
 * @return {ComponentType<GlyphProps>}
 */

export const railIcon = (name: IconName): ComponentType<GlyphProps> =>
  RAIL_ICONS[name] ?? ICONS[name]
