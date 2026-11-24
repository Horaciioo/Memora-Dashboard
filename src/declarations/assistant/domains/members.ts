import { defineDomain } from '@/declarations/assistant/domains/types'
import { ROUTES } from '@/declarations/navigation'

/**
 * Members
 * @type {DomainDef}
 */

export const MEMBERS = defineDomain({
  label: 'Modérateurs',
  summary: 'Je retrouve la fiche d’un modérateur.',
  intents: {
    findMember: {
      label: 'Trouver un modérateur',
      kind: 'read',
      verbs: ['qui'],
      nouns: ['modo', 'modos', 'moderateur', 'moderateurs', 'moderatrice'],
      weakNouns: ['fiche', 'profil', 'membre', 'membres'],
      needs: 'either',
      pages: [ROUTES.members],
      examples: ['Fiche de Procy', 'Qui est Procy'],
    },
  },
})
