import { createRegistry } from '@/core/lib/registry'
import { RecruitmentOwners, RecruitmentStatuses } from '@/utils/constants/recruitment'
import type { RecruitmentOwnerName, RecruitmentStatusName } from '@/utils/constants/recruitment'

/**
 * Labelled option carrying a colour token
 * @typedef {Object} RecruitmentOption
 * @property {string} label - Display label
 * @property {string} accent - Colour token
 */

interface RecruitmentOption {
  label: string
  accent: string
}

const STATUS_MAP: Record<RecruitmentStatusName, RecruitmentOption> = {
  [RecruitmentStatuses.Draft]: { label: 'Préparée', accent: 'neutral' },
  [RecruitmentStatuses.Announced]: { label: 'Annoncée', accent: 'warning' },
  [RecruitmentStatuses.Interviews]: { label: 'Entretiens', accent: 'success' },
  [RecruitmentStatuses.Closed]: { label: 'Clôturée', accent: 'info' },
  [RecruitmentStatuses.Archived]: { label: 'Archivée', accent: 'neutral' },
}

export const RECRUITMENT_STATUS_REGISTRY = createRegistry(STATUS_MAP)

const OWNER_MAP: Record<RecruitmentOwnerName, RecruitmentOption> = {
  [RecruitmentOwners.Responsable]: { label: 'Responsable', accent: 'warning' },
  [RecruitmentOwners.Recruteurs]: { label: 'Recruteurs', accent: 'brand' },
  [RecruitmentOwners.Both]: { label: 'Responsable + Recruteurs', accent: 'info' },
}

export const RECRUITMENT_OWNER_REGISTRY = createRegistry(OWNER_MAP)
