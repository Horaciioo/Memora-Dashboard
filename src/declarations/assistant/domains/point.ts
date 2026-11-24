import { defineDomain } from '@/declarations/assistant/domains/types'
import { ROUTES } from '@/declarations/navigation'
import { Permissions } from '@/utils/constants/permissions'

// A specific window outranks the plain point
const WINDOW_BOOST = 20

/**
 * Points on the day and the week
 * @type {DomainDef}
 */

export const POINT = defineDomain({
  label: 'Point',
  summary:
    'Je te fais le point de ta journée ou de ta semaine : ce qui t’attend, le calendrier, les absents.',
  intents: {
    dayPoint: {
      label: 'Faire le point du jour',
      kind: 'say',
      phrases: [
        'point du jour',
        'mon point',
        'le point',
        'fais le point',
        'faire le point',
        'ma journee',
        'programme du jour',
      ],
      needs: 'noun',
      pages: [ROUTES.home],
      examples: ['Fais-moi mon point du jour', 'Ma journée'],
    },
    weekPoint: {
      label: 'Faire le point de la semaine',
      kind: 'say',
      phrases: ['point de la semaine', 'point semaine', 'ma semaine', 'programme de la semaine'],
      needs: 'noun',
      boost: WINDOW_BOOST,
      pages: [ROUTES.home],
      examples: ['Mon point de la semaine', 'Ma semaine'],
    },
    myTodo: {
      label: 'Voir ce qui t’attend',
      kind: 'say',
      phrases: ['j ai a faire', 'a faire', 'ma liste', 'mes taches en attente'],
      needs: 'noun',
      boost: WINDOW_BOOST,
      pages: [ROUTES.home],
      examples: ['Qu’est-ce que j’ai à faire', 'Ma liste'],
    },
    myLate: {
      label: 'Voir ce qui est en retard',
      kind: 'say',
      phrases: ['en retard', 'mes retards'],
      needs: 'noun',
      boost: WINDOW_BOOST,
      examples: ['Je suis en retard sur quoi', 'Mes retards'],
    },
    nextPlans: {
      label: 'Voir le prochain évènement',
      kind: 'say',
      phrases: [
        'prochain evenement',
        'prochains evenements',
        'prochaine reunion',
        'mon prochain live',
      ],
      needs: 'noun',
      boost: WINDOW_BOOST,
      examples: ['Mon prochain évènement', 'Mes prochains évènements'],
    },
    whoAway: {
      label: 'Voir qui est absent',
      kind: 'say',
      phrases: ['qui est absent', 'qui est en absence', 'qui est absente', 'qui manque'],
      needs: 'noun',
      boost: WINDOW_BOOST * 2,
      permission: Permissions.AbsenceRead,
      examples: ['Qui est absent aujourd’hui', 'Qui manque'],
    },
    nextBirthdays: {
      label: 'Voir les prochains anniversaires',
      kind: 'say',
      phrases: ['prochains anniversaires', 'prochain anniversaire', 'les anniversaires'],
      needs: 'noun',
      boost: WINDOW_BOOST,
      examples: ['Les prochains anniversaires', 'Les anniversaires du mois'],
    },
  },
})
