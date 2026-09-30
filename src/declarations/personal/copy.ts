/**
 * Copy of the personal surfaces
 * @type {Record<string, string>}
 */

export const PERSONAL_COPY = {
  title: 'Accueil',
  greeting: 'Salut {name}',
  lead: 'Ton espace personnel : tes tâches, tes réunions et tes absences au même endroit.',
  attendanceTitle: 'Appels de présence',
  attendanceLead: 'Les évènements à venir où ta présence est demandée.',
  attendanceEmpty: 'Aucun appel de présence en attente.',
  attendanceOpen: 'Répondre sur le calendrier',
  birthdaysTitle: 'Anniversaires',
  birthdaysEmpty: 'Aucun anniversaire dans les semaines à venir.',
  birthdayToday: 'Aujourd’hui',
  meetingsTitle: 'Tes réunions',
  meetingsEmpty: 'Aucune réunion ne t’attend pour le moment.',
} as const

/**
 * Copy of the home task list
 * @type {Record<string, string>}
 */

export const PERSONAL_TASK_COPY = {
  title: 'À faire',
  empty: 'Rien ne t’attend, tout est à jour.',
  assignTrainer: 'Attribuer un Formateur',
  assignTrainerDescription:
    'Ce junior a confirmé sa fiche. Choisis le Formateur qui le suivra pendant toute sa PIM.',
  launchPim: 'Lancer la PIM',
  launchPimDescription:
    'Chaque junior confirmé a son Formateur. Passe la session En cours : la timeline de chacun démarre aujourd’hui.',
  trainingContext: 'Formation indispensable',
  open: 'Ouvrir',
  go: 'Y aller, avec le guide',
  goPlain: 'Y aller',
  guideTitle: 'Marche à suivre',
  what: 'Ce qui doit se passer',
  where: 'Où agir',
  due: 'Prévue le',
} as const
