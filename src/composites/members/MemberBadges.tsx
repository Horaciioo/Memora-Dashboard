import { Badge } from '@/components/elements/display/Badge'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { toTone } from '@/declarations/ui/theme'
import { MEMBER_COPY } from '@/declarations/members/copy'
import type { MemberDivision, MemberSummary } from '@/types/members'

export interface DivisionBadgeProps {
  division: MemberDivision | null
}

/**
 * Division of a member, its visual when one is declared, its chevrons otherwise
 * @param {MemberDivision | null} division - Division to show
 * @return {JSX.Element}
 */

export const DivisionBadge = ({ division }: DivisionBadgeProps) => {
  if (!division) {
    return <Badge label={MEMBER_COPY.noDivision} tone="neutral" />
  }

  return (
    <span
      title={division.label}
      className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-brand-soft)] text-[var(--color-brand-600)]"
    >
      {division.imagePath ? (
        // The path is declared in the configuration, so it skips the optimiser
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={division.imagePath}
          alt={division.label}
          width={18}
          height={18}
          className="h-[18px] w-[18px] rounded-full"
        />
      ) : (
        <span className="text-xs font-bold" aria-hidden="true">
          {division.glyph}
        </span>
      )}
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

export const RoleBadge = ({ member }: RoleBadgeProps) => {
  const role = ROLE_REGISTRY.get(member.role)

  return (
    <Badge
      label={role.label}
      tone={toTone(role.accent, 'neutral')}
      icon={member.isRoot ? 'shield' : undefined}
    />
  )
}
