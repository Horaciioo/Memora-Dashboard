import { createRegistry } from '@/core/lib/registry'
import type { IconName } from '@/declarations/ui/icons'

/**
 * Sealed value keys
 * @type {Record<string, string>}
 */

export const SensitiveFields = {
  Email: 'email',
  Phone: 'phone',
  Medical: 'medical',
  Illness: 'illness',
  Private: 'private',
} as const

/**
 * Sensitive value key
 * @type {(typeof SensitiveFields)[keyof typeof SensitiveFields]}
 */

export type SensitiveFieldName = (typeof SensitiveFields)[keyof typeof SensitiveFields]

/**
 * Sensitive value metadata
 * @typedef {Object} SensitiveFieldOption
 * @property {string} label - Display name
 * @property {IconName} icon - Icon key
 */

interface SensitiveFieldOption {
  label: string
  icon: IconName
}

const SENSITIVE_FIELD_MAP: Record<SensitiveFieldName, SensitiveFieldOption> = {
  [SensitiveFields.Email]: { label: 'Adresse mail', icon: 'mail' },
  [SensitiveFields.Phone]: { label: 'Numéro de téléphone', icon: 'phone' },
  [SensitiveFields.Medical]: { label: 'Contraintes pathologiques', icon: 'shield' },
  [SensitiveFields.Illness]: { label: 'Maladies', icon: 'shield' },
  [SensitiveFields.Private]: { label: 'Contraintes privées', icon: 'shield' },
}

export const SENSITIVE_FIELD_REGISTRY = createRegistry(SENSITIVE_FIELD_MAP)

/**
 * Check a sealed field
 * @param {string} name - Field name
 * @return {boolean} - Field is sealed
 */

export const isSensitiveField = (name: string): name is SensitiveFieldName =>
  SENSITIVE_FIELD_REGISTRY.has(name)
