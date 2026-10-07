import { createRegistry } from '@/core/lib/registry'
import type { Tone } from '@/declarations/ui/theme'

/**
 * How far along a feature is in its lifecycle
 * @typedef {Object} MaturityOption
 * @property {string} label - Tag text
 * @property {string} summary - One-line definition
 * @property {Tone} tone - Tag colour
 */

interface MaturityOption {
  label: string
  summary: string
  tone: Tone
}

// Declared from least to most mature
const MATURITY_MAP = {
  alpha: {
    label: 'Alpha',
    summary:
      'Première version fonctionnelle pour les tests internes, avec des bugs et des changements importants attendus.',
    tone: 'warning',
  },
  beta: {
    label: 'Bêta',
    summary:
      'Presque finalisée, ouverte aux utilisateurs pour recueillir des retours et corriger les derniers problèmes.',
    tone: 'success',
  },
  new: {
    label: 'New',
    summary: 'Ce qui est nouveau, et fonctionnel.',
    tone: 'caution',
  },
  deprecated: {
    label: 'Deprecated',
    summary: 'Ce visuel, ou ce système là va bientôt disparaître tel qu’il est présenté.',
    tone: 'danger',
  },
} satisfies Record<string, MaturityOption>

export const MATURITY_REGISTRY = createRegistry<keyof typeof MATURITY_MAP, MaturityOption>(
  MATURITY_MAP
)

/**
 * Feature maturity key
 * @type {keyof typeof MATURITY_MAP}
 */

export type MaturityName = keyof typeof MATURITY_MAP
