import { defineDomain } from '@/declarations/assistant/domains/types'
import { ROUTES } from '@/declarations/navigation'
import { Permissions } from '@/utils/constants/permissions'

// Words naming a live
const LIVE_NOUNS = ['live', 'lives', 'stream', 'streams', 'direct'] as const

/**
 * Lives
 * @type {DomainDef}
 */

export const LIVES = defineDomain({
  label: 'Lives',
  summary: 'J’ouvre un live ou son bilan.',
  intents: {
    liveReport: {
      label: 'Voir le bilan d’un live',
      kind: 'read',
      nouns: ['bilan', 'bilans', 'rapport', 'recap'],
      companions: LIVE_NOUNS,
      needs: 'noun',
      permission: Permissions.LiveRead,
      pages: [ROUTES.lives],
      examples: ['Bilan du dernier live', 'Rapport du live en cours'],
    },
    openLive: {
      label: 'Ouvrir un live',
      kind: 'read',
      nouns: LIVE_NOUNS,
      needs: 'noun',
      permission: Permissions.LiveRead,
      pages: [ROUTES.lives],
      examples: ['Ouvre le live en cours', 'Le dernier stream'],
    },
  },
})
