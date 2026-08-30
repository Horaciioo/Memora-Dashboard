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

// Declared from least to most mature, then the two lifecycle markers
const MATURITY_MAP = {
  dev: {
    label: 'En dev',
    summary: 'En cours de création, pas encore utilisable ou incomplète.',
    tone: 'neutral',
  },
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
    tone: 'info',
  },
  new: {
    label: 'New',
    summary: 'Récemment ajoutée ou publiée.',
    tone: 'success',
  },
  deprecated: {
    label: 'Déprécié',
    summary:
      'Toujours disponible, mais vouée à être supprimée ou remplacée dans une future version.',
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
