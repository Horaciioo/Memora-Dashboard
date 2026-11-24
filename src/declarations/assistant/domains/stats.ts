import { defineDomain } from '@/declarations/assistant/domains/types'

/**
 * Figures
 * @type {DomainDef}
 */

export const STATS = defineDomain({
  label: 'Chiffres',
  summary:
    'Je te donne tes chiffres : lives modérés, heures de modération, tâches ouvertes ou en retard.',
  intents: {
    stats: {
      label: 'Connaître un chiffre',
      kind: 'read',
      phrases: [
        'combien de',
        'combien d',
        'mes stats',
        'mes statistiques',
        'mes chiffres',
        'mes heures',
      ],
      nouns: ['statistiques', 'stats', 'chiffres'],
      needs: 'either',
      boost: 30,
      examples: [
        'Combien de lives j’ai modérés ce mois',
        'Mes heures de modération la semaine dernière',
      ],
    },
  },
})
