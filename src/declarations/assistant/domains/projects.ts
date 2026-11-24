import { defineDomain } from '@/declarations/assistant/domains/types'
import { ROUTES } from '@/declarations/navigation'

/**
 * Projects
 * @type {DomainDef}
 */

export const PROJECTS = defineDomain({
  label: 'Projets',
  summary: 'J’ouvre un projet, une réunion ou une de tes notes.',
  intents: {
    openProject: {
      label: 'Ouvrir un projet',
      kind: 'read',
      nouns: ['projet', 'projets'],
      needs: 'noun',
      pages: [ROUTES.projects],
      examples: ['Ouvre le projet du tournoi', 'Montre le projet recrutement'],
    },
    openMeeting: {
      label: 'Ouvrir une réunion',
      kind: 'read',
      nouns: ['reunion', 'reunions', 'meeting'],
      needs: 'noun',
      pages: [ROUTES.meetings],
      examples: ['Ouvre la réunion de jeudi', 'Montre la réunion du recrutement'],
    },
    openPage: {
      label: 'Ouvrir une note',
      kind: 'read',
      nouns: ['note', 'notes'],
      needs: 'noun',
      pages: [ROUTES.pages],
      examples: ['Ouvre ma note sur le tournoi', 'Montre la note du planning'],
    },
  },
})
