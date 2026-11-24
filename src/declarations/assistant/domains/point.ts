import { defineDomain } from '@/declarations/assistant/domains/types'
import { ROUTES } from '@/declarations/navigation'

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
  },
})
