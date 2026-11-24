import { defineDomain } from '@/declarations/assistant/domains/types'
import { ROUTES } from '@/declarations/navigation'

/**
 * Projects
 * @type {DomainDef}
 */

export const PROJECTS = defineDomain({
  label: 'Projets',
  summary: 'J’ouvre un projet.',
  intents: {
    openProject: {
      label: 'Ouvrir un projet',
      kind: 'read',
      nouns: ['projet', 'projets'],
      needs: 'noun',
      pages: [ROUTES.projects],
      examples: ['Ouvre le projet du tournoi', 'Montre le projet recrutement'],
    },
  },
})
