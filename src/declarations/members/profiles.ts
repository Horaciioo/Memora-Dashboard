import type { ComponentType } from 'react'
import {
  AdminGlyph,
  JuniorGlyph,
  ModeratorGlyph,
  ResponsableGlyph,
  type FrameTone,
} from '@/components/elements/display/BrandGlyphs'
import { FIXED_DIVISIONS } from '@/declarations/reference/fixed'
import { ICONS, isIconName } from '@/declarations/ui/icons'
import type { LucideIcon } from '@/declarations/ui/icons'
import type { MemberFunction, MemberSummary } from '@/types/members'
import { MemberRoles } from '@/utils/constants/hierarchy'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import { FunctionKinds } from '@/utils/constants/workflow'

// Role glyph, tinted by the function it carries
type RoleGlyphComponent = ComponentType<{ className?: string; tone?: FrameTone }>

/**
 * Glyph and own tint of each role, the top of the hierarchy
 * @type {Record<MemberRoleName, { glyph: RoleGlyphComponent, tone: FrameTone, tinted: boolean }>}
 */

export const ROLE_EMBLEMS: Record<
  MemberRoleName,
  { glyph: RoleGlyphComponent; tone: FrameTone; tinted: boolean }
> = {
  // Holds no function, always its own red
  [MemberRoles.Admin]: { glyph: AdminGlyph, tone: 'ADMIN', tinted: false },
  [MemberRoles.Responsable]: { glyph: ResponsableGlyph, tone: 'RESPONSABLE', tinted: true },
  [MemberRoles.Moderateur]: { glyph: ModeratorGlyph, tone: 'brand', tinted: true },
  [MemberRoles.Junior]: { glyph: JuniorGlyph, tone: 'brand', tinted: true },
}

/**
 * Short mark of each division, drawn in the corner of the portrait
 * @type {Record<string, string>}
 */

export const DIVISION_MARKS: Record<string, string> = {
  Junior: 'J',
  'Squad I': 'I',
  'Squad II': 'II',
  'Squad III': 'III',
}

/**
 * Official logo of a division, the stored path first then the one declared in code
 * @param {string} label - Division name
 * @param {string | null} [stored] - Path kept in the database
 * @return {string | null} - Public path, none for a division without logo
 */

export const divisionLogo = (label: string, stored?: string | null): string | null =>
  stored ?? FIXED_DIVISIONS.find((division) => division.name === label)?.imagePath ?? null

/**
 * Mark of one division, its first letter when none is declared
 * @param {string} label - Division name
 * @return {string} - Short mark
 */

export const divisionMark = (label: string): string =>
  DIVISION_MARKS[label] ?? label.charAt(0).toUpperCase()

/**
 * Tint a principal function lends to the role glyph, keyed by its glyph key
 * @type {Partial<Record<string, FrameTone>>}
 */

export const FUNCTION_TINTS: Partial<Record<string, FrameTone>> = {
  functionDiscord: 'DISCORD',
  functionLive: 'LIVE',
  functionAnimator: 'ANIMATOR',
}

/**
 * Tint of a member's role glyph, from the highest principal function lending one
 * @param {MemberSummary} member - Member to describe
 * @return {FrameTone} - Tint to paint
 */

export const roleTone = (member: MemberSummary): FrameTone => {
  const emblem = ROLE_EMBLEMS[member.role]
  if (!emblem.tinted) return emblem.tone

  const lending = member.functions.find(
    (entry) => entry.kind === FunctionKinds.Primary && entry.icon && FUNCTION_TINTS[entry.icon]
  )

  return (lending?.icon && FUNCTION_TINTS[lending.icon]) || emblem.tone
}

/**
 * Glyph of one function, nothing when its key is unknown
 * @param {MemberFunction} entry - Held function
 * @return {LucideIcon | null} - Glyph component
 */

export const functionGlyph = (entry: MemberFunction): LucideIcon | null =>
  entry.icon && isIconName(entry.icon) ? ICONS[entry.icon] : null
