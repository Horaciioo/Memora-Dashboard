import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { ROLE_EMBLEMS, functionGlyph, roleTone } from '@/declarations/members/profiles'
import { ICONS } from '@/declarations/ui/icons'
import { MEMBER_BLOCK } from '@/declarations/ui/blocks'
import { TONES, toTone } from '@/declarations/ui/theme'
import type { MemberDivision, MemberSummary } from '@/types/members'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import { cn } from '@/utils/classnames'

// Drawn pixels of the crest, matching the large portrait it faces
const CREST_SIZE = 64

export interface DivisionCrestProps {
  division: MemberDivision | null
}

/**
 * Visual of a division, standing opposite the portrait, absent until one is declared
 * @param {MemberDivision | null} division - Division to show
 * @return {JSX.Element | null}
 */

export const DivisionCrest = ({ division }: DivisionCrestProps) => {
  // A division without a visual draws nothing, the row simply closes up
  if (!division?.imagePath) return null

  return (
    // The path is declared in the configuration, so it skips the optimiser
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={division.imagePath}
      alt={division.label}
      title={division.label}
      width={CREST_SIZE}
      height={CREST_SIZE}
      className={MEMBER_BLOCK.crest}
    />
  )
}

export interface RoleGlyphProps {
  role: MemberRoleName
  // Root administrator, marked apart from the ordinary role glyph
  isRoot?: boolean
  className?: string
}

/**
 * Hierarchy level, a glyph replacing the role's name everywhere it would otherwise read as text
 * @param {MemberRoleName} role - Role to describe
 * @param {boolean} [isRoot] - Root administrator, marked apart
 * @param {string} [className] - Extra classes merged onto the glyph
 * @return {JSX.Element}
 */

export const RoleGlyph = ({ role: roleName, isRoot, className }: RoleGlyphProps) => {
  const role = ROLE_REGISTRY.get(roleName)
  const tone = TONES[toTone(role.accent, 'neutral')]
  const Icon = ICONS[role.icon]
  const RootIcon = ICONS.shield

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)} title={role.label}>
      <Icon className={cn('h-4 w-4 shrink-0', tone.text)} aria-hidden="true" />
      <span className="sr-only">{role.label}</span>
      {isRoot && <RootIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
    </span>
  )
}

export interface RoleBadgeProps {
  member: MemberSummary
}

/**
 * Hierarchy level of a member, the root administrator marked apart
 * @param {MemberSummary} member - Member to describe
 * @return {JSX.Element}
 */

export const RoleBadge = ({ member }: RoleBadgeProps) => (
  <RoleGlyph role={member.role} isRoot={member.isRoot} />
)

export interface RoleEmblemProps {
  member: MemberSummary
  className?: string
}

/**
 * Large glyph of a member's role, tinted by their highest principal function
 * @param {MemberSummary} member - Member to describe
 * @param {string} [className] - Sizing classes
 * @return {JSX.Element}
 */

export const RoleEmblem = ({ member, className }: RoleEmblemProps) => {
  const Glyph = ROLE_EMBLEMS[member.role].glyph
  const label = ROLE_REGISTRY.label(member.role)

  return (
    <span className={cn('shrink-0', className)} title={label}>
      <Glyph className="h-full w-full" tone={roleTone(member)} />
      <span className="sr-only">{label}</span>
    </span>
  )
}

export interface FunctionEmblemsProps {
  member: MemberSummary
  className?: string
  glyphClassName?: string
}

/**
 * Glyphs of every function a member holds, side by side down the hierarchy
 * @param {MemberSummary} member - Member to describe
 * @param {string} [className] - Row classes
 * @param {string} [glyphClassName] - Sizing classes of each glyph
 * @return {JSX.Element | null}
 */

export const FunctionEmblems = ({ member, className, glyphClassName }: FunctionEmblemsProps) => {
  if (member.functions.length === 0) return null

  return (
    <span className={cn('flex shrink-0 items-center', className)}>
      {member.functions.map((entry) => {
        const Glyph = functionGlyph(entry)

        return (
          <span key={entry.id} title={entry.label} className={cn('shrink-0', glyphClassName)}>
            {Glyph && <Glyph className="h-full w-full" aria-hidden="true" />}
            <span className="sr-only">{entry.label}</span>
          </span>
        )
      })}
    </span>
  )
}
