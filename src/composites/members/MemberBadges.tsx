import Image from 'next/image'
import { Badge } from '@/components/elements/display/Badge'
import {
  ACADEMY_PERIOD_REGISTRY,
  MEMBER_STATUS_REGISTRY,
  ROLE_REGISTRY,
} from '@/declarations/access/roles'
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
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-soft)] py-0.5 pr-2.5 pl-1 text-xs font-medium text-[var(--color-brand-600)]">
      {division.imagePath ? (
        <Image
          src={division.imagePath}
          alt=""
          width={18}
          height={18}
          className="h-[18px] w-[18px] rounded-full"
        />
      ) : (
        <span className="px-1 font-bold" aria-hidden="true">
          {division.glyph}
        </span>
      )}
      {division.label}
    </span>
  )
}

export interface MemberStatusBadgeProps {
  member: MemberSummary
}

/**
 * Membership status, paired with the academy period while the member is still in training
 * @param {MemberSummary} member - Member to describe
 * @return {JSX.Element}
 */

export const MemberStatusBadge = ({ member }: MemberStatusBadgeProps) => {
  const status = MEMBER_STATUS_REGISTRY.get(member.status)
  const period = member.academyPeriod
    ? ACADEMY_PERIOD_REGISTRY.get(member.academyPeriod)
    : null

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <Badge label={status.label} tone={toTone(status.accent)} dot />
      {period && <Badge label={period.label} tone="info" />}
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
