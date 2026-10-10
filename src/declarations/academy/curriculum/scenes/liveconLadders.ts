import type { SanctionBoxLevel } from '@/declarations/academy/curriculum/types'

/**
 * An insult against the creator at each Livecon level
 * @type {SanctionBoxLevel[]}
 */

export const INSULT_LEVELS: SanctionBoxLevel[] = [
  {
    level: 3,
    tiers: [
      { condition: 'Dès constaté', measures: ['Suppression', 'TO : 5 heures'] },
      { condition: '1re récidive', measures: ['TO : 1 jour'] },
      { condition: '2e récidive', measures: ['TO : 14 jours'] },
      { condition: '3e récidive', measures: ['Bannissement définitif', 'Commentaire'] },
    ],
  },
  {
    level: 2,
    tiers: [
      { condition: 'Dès constaté', measures: ['Suppression', 'TO : 1 jour'] },
      { condition: '1re récidive', measures: ['TO : 7 jours'] },
      { condition: '2e récidive', measures: ['Bannissement définitif', 'Commentaire'] },
    ],
  },
  {
    level: 1,
    tiers: [
      { condition: 'Dès constaté', measures: ['Suppression', 'TO : 7 jours'] },
      { condition: '1re récidive', measures: ['Bannissement définitif', 'Commentaire'] },
    ],
  },
]
