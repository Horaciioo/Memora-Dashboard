/**
 * Ways Memora tells a point of the day or the week, drawn so it never repeats itself
 * @type {Record<string, readonly string[]>}
 */

export const AGENDA_VARIANTS = {
  openDay: [
    'J’ai {count} choses pour toi aujourd’hui.',
    'Aujourd’hui, {count} sujets t’attendent.',
    'Voilà ta journée : {count} choses à voir.',
  ],
  openDayOne: ['J’ai une chose pour toi aujourd’hui.', 'Une seule chose t’attend aujourd’hui.'],
  openWeek: [
    'J’ai {count} choses pour ta semaine.',
    'Cette semaine, {count} sujets t’attendent.',
    'Voilà ta semaine : {count} choses à voir.',
  ],
  openWeekOne: ['Une seule chose t’attend cette semaine.', 'J’ai une chose pour ta semaine.'],
  taskLate: [
    '« {title} » est en retard, c’était prévu {day}.',
    '« {title} » aurait dû être faite {day}.',
  ],
  taskToday: ['« {title} » est à faire aujourd’hui.', 'Aujourd’hui, il y a « {title} ».'],
  taskDue: ['« {title} » est à faire {day}.', 'Pour {day}, tu as « {title} ».'],
  taskOpen: ['« {title} » attend ta réponse.', 'Il y a « {title} » à traiter.'],
  taskMore: [
    'Et {count} autres t’attendent sur ton accueil.',
    'Je t’en laisse {count} autres sur ton accueil.',
  ],
  plan: ['{when}, « {title} ».', 'Il y a « {title} » {when}.'],
  planMore: ['Et {count} autres au calendrier.', 'Le calendrier en compte {count} autres.'],
  awayOne: ['{names} est en absence.', '{names} est absent en ce moment.'],
  awayMany: ['{names} sont en absence.', '{names} sont absents en ce moment.'],
  birthday: [
    'C’est l’anniversaire de {names} {when}.',
    'Pense à l’anniversaire de {names} {when}.',
  ],
  end: ['C’est tout pour aujourd’hui.', 'Voilà pour ta journée.'],
  endWeek: ['C’est tout pour cette semaine.', 'Voilà pour ta semaine.'],
  calmDay: ['Rien de pressé aujourd’hui, ta journée est calme.', 'Rien ne t’attend aujourd’hui.'],
  calmWeek: ['Rien de pressé cette semaine, elle est calme.', 'Rien ne t’attend cette semaine.'],
} as const

/**
 * Fixed words of a point
 * @type {Record<string, string>}
 */

export const AGENDA_COPY = {
  today: 'aujourd’hui',
  nameJoin: ' et ',
  nameSeparator: ', ',
  openCalendar: 'Ouvre le calendrier',
  openTasks: 'Ouvre mes tâches',
  weekAsk: 'Fais-moi mon point de la semaine',
  dayAsk: 'Fais-moi mon point du jour',
} as const
