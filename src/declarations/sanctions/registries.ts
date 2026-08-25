import { createRegistry } from '@/core/lib/registry'
import { SanctionKinds } from '@/utils/constants/moderation'
import type { SanctionKindName } from '@/utils/constants/moderation'

/**
 * Sanction nature metadata
 * @typedef {Object} SanctionKindOption
 * @property {string} label - Display name
 * @property {string} accent - Token driving the badge colour
 */

interface SanctionKindOption {
  label: string
  accent: string
}

const SANCTION_KIND_MAP: Record<SanctionKindName, SanctionKindOption> = {
  [SanctionKinds.Delete]: { label: 'Suppression', accent: 'success' },
  [SanctionKinds.Warn]: { label: 'Avertissement', accent: 'success' },
  [SanctionKinds.Timeout]: { label: 'Timeout', accent: 'caution' },
  [SanctionKinds.Ban]: { label: 'Bannissement', accent: 'danger' },
}

export const SANCTION_KIND_REGISTRY = createRegistry(SANCTION_KIND_MAP)
