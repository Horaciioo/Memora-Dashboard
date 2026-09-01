import { Badge } from '@/components/elements/display/Badge'
import { ROLE_REGISTRY } from '@/declarations/access/roles'
import { MEMBER_BLOCK } from '@/declarations/ui/blocks'
import type { MemberDivision, MemberSummary } from '@/types/members'

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
      accent={role.accent}
      tone={'neutral'}
      icon={member.isRoot ? 'shield' : undefined}
    />
  )
}
