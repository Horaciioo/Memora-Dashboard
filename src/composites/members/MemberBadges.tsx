import { Tip } from '@/components/elements/feedback/Tip'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { ROLE_EMBLEMS, functionGlyph, roleTone } from '@/declarations/members/profiles'
import { ICONS } from '@/declarations/ui/icons'
import type { MemberSummary } from '@/types/members'
import { MemberRoles } from '@/utils/constants/hierarchy'
import type { MemberRoleName } from '@/utils/constants/hierarchy'
import { cn } from '@/utils/classnames'

export interface RoleGlyphProps {
  role: MemberRoleName
  // Root administrator
  isRoot?: boolean
  className?: string
  glyphClassName?: string
}

/**
 * Hierarchy level
 * @param {MemberRoleName} role - Role to describe
 * @param {boolean} [isRoot] - Root administrator
 * @param {string} [className] - Extra classes merged onto the wrapper
 * @param {string} [glyphClassName] - Sizing classes of the glyph
 * @return {JSX.Element}
 */

export const RoleGlyph = ({
  role: roleName,
  isRoot,
  className,
  glyphClassName = 'h-6 w-6',
}: RoleGlyphProps) => {
  const role = ROLE_REGISTRY.get(roleName)
  const Glyph = ROLE_EMBLEMS[roleName].glyph
  const RootIcon = ICONS.shield

  return (
    <Tip label={role.label} className={cn('items-center gap-1.5', className)}>
      <Glyph
        className={cn(glyphClassName, 'shrink-0')}
        tone={roleName === MemberRoles.Junior ? 'brand_JUNIOR' : undefined}
      />
      <span className="sr-only">{role.label}</span>
      {isRoot && <RootIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
    </Tip>
  )
}

export interface RoleEmblemProps {
  member: MemberSummary
  className?: string
}

/**
 * Large glyph of a member's role
 * @param {MemberSummary} member - Member to describe
 * @param {string} [className] - Sizing classes
 * @return {JSX.Element}
 */

export const RoleEmblem = ({ member, className }: RoleEmblemProps) => {
  const Glyph = ROLE_EMBLEMS[member.role].glyph
  const label = ROLE_REGISTRY.label(member.role)

  return (
    <Tip label={label} className={className}>
      <Glyph className="h-full w-full" tone={roleTone(member)} />
      <span className="sr-only">{label}</span>
    </Tip>
  )
}

export interface FunctionEmblemsProps {
  member: MemberSummary
  className?: string
  glyphClassName?: string
}

/**
 * Glyphs of every function a member holds
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
          <Tip key={entry.id} label={entry.label} className={glyphClassName}>
            {Glyph && <Glyph className="h-full w-full" aria-hidden="true" />}
            <span className="sr-only">{entry.label}</span>
          </Tip>
        )
      })}
    </span>
  )
}
