import { defineDomain } from '@/declarations/assistant/domains/types'

/**
 * Pages
 * @type {DomainDef}
 */

export const NAVIGATION_DOMAIN = defineDomain({
  label: 'Pages',
  summary: 'Je t’emmène sur n’importe quelle page que tu peux ouvrir.',
  intents: {
    navigate: {
      label: 'Ouvrir une page',
      kind: 'navigate',
      needs: 'noun',
      examples: ['Ouvre le calendrier', 'Va sur les formations'],
    },
  },
})
