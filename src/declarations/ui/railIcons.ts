import { ICONS, type IconName, type LucideIcon } from '@/declarations/ui/icons'

/**
 * Plain stand-ins for the drawn glyphs, rail and consoles
 * @type {Partial<Record<IconName, LucideIcon>>}
 */

export const RAIL_ICONS: Partial<Record<IconName, LucideIcon>> = {
  flame: ICONS.playFlame,
  liveDot: ICONS.stream,
  liveconCrisis: ICONS.sanctionsPanel,
  discord: ICONS.discordLogo,
  system: ICONS.storage,
  youtuberNone: ICONS.youtuberOff,
  youtuber: ICONS.youtubeLogo,
  livecon: ICONS.gauge,
  employee: ICONS.briefcasePlain,
}

/**
 * Icon of a key on the rail, never a drawn glyph
 * @param {IconName} name - Icon key
 * @return {LucideIcon}
 */

export const railIcon = (name: IconName): LucideIcon => RAIL_ICONS[name] ?? ICONS[name]
