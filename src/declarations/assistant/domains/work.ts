import { defineDomain } from '@/declarations/assistant/domains/types'
import { ROUTES } from '@/declarations/navigation'
import { Permissions } from '@/utils/constants/permissions'

// A question outranks the plain nouns it quotes
const QUESTION_BOOST = 30

// A precise list outranks the personal one it contains
const LIST_BOOST = 60

/**
 * Projects, meetings, announcements and requests waiting
 * @type {DomainDef}
 */

export const WORK = defineDomain({
  label: 'Suivi',
  summary:
    'Je te dis où en est un projet, lesquels sont en retard, ta prochaine réunion, les annonces de la semaine, les absences et les demandes de déban qui attendent.',
  intents: {
    projectPoint: {
      label: 'Savoir où en est un projet',
      kind: 'say',
      phrases: [
        'ou en est le projet',
        'ou en est mon projet',
        'point sur le projet',
        'avancement du projet',
      ],
      needs: 'noun',
      boost: QUESTION_BOOST,
      permission: Permissions.ProjectRead,
      pages: [ROUTES.projects],
      examples: ['Où en est le projet du tournoi', 'Point sur le projet recrutement'],
    },
    lateProjects: {
      label: 'Voir les projets en retard',
      kind: 'say',
      phrases: ['projets en retard', 'projet en retard', 'projets sont en retard'],
      needs: 'noun',
      boost: LIST_BOOST,
      permission: Permissions.ProjectRead,
      pages: [ROUTES.projects],
      examples: ['Les projets en retard', 'Quels projets sont en retard'],
    },
    nextMeeting: {
      label: 'Voir ta prochaine réunion',
      kind: 'say',
      phrases: ['prochaine reunion', 'ma prochaine reunion', 'mes prochaines reunions'],
      needs: 'noun',
      boost: LIST_BOOST,
      permission: Permissions.MeetingRead,
      pages: [ROUTES.meetings],
      examples: ['Ma prochaine réunion', 'C’est quand ma prochaine réunion'],
    },
    weekAnnouncements: {
      label: 'Voir les annonces de la semaine',
      kind: 'say',
      phrases: ['annonces de la semaine', 'les annonces', 'annonces recentes'],
      needs: 'noun',
      boost: QUESTION_BOOST,
      permission: Permissions.CommunicationRead,
      examples: ['Les annonces de la semaine', 'Annonces récentes'],
    },
    pendingAbsences: {
      label: 'Voir les absences en attente',
      kind: 'say',
      phrases: ['absences en attente', 'absences a valider', 'conges en attente'],
      needs: 'noun',
      boost: LIST_BOOST,
      permission: Permissions.AbsenceReview,
      pages: [ROUTES.absences],
      examples: ['Les absences en attente', 'Mes absences en attente'],
    },
    pendingUnban: {
      label: 'Voir les demandes de déban en attente',
      kind: 'say',
      phrases: [
        'demandes de deban en attente',
        'demandes de deban',
        'deban en attente',
        'demandes en attente',
      ],
      needs: 'noun',
      boost: QUESTION_BOOST,
      permission: Permissions.UnbanRead,
      pages: [ROUTES.unban],
      examples: ['Les demandes de déban en attente', 'Quelles demandes de déban attendent'],
    },
  },
})
