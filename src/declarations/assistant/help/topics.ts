import { ROUTES } from '@/declarations/navigation'

/**
 * What Memora knows about one page
 * @typedef {Object} HelpTopic
 * @property {string} href - Page described, it names the topic and gates the link
 * @property {string[]} [extra] - Folded words that also name it
 * @property {string[]} lines - What she says, {page} is the name of the page
 * @property {string} [offer] - Sentence that makes her do it for the member
 */

export interface HelpTopic {
  href: string
  extra?: readonly string[]
  lines: readonly string[]
  offer?: string
}

/**
 * Help sheets, one per page
 * @type {HelpTopic[]}
 */

export const HELP_TOPICS: readonly HelpTopic[] = [
  {
    href: ROUTES.absences,
    lines: [
      'Tu les poses depuis la page « {page} ».',
      'Dis-moi simplement les dates : je les pose, les décale ou les supprime pour toi.',
    ],
    offer: 'Je pars en vacances du 3 au 14 décembre',
  },
  {
    href: ROUTES.tasks,
    lines: [
      'Tes tâches sont dans la page « {page} », chacune rattachée à un projet.',
      'Clique sur un champ pour le modifier sur place, clic droit pour les autres options.',
      'Je peux aussi t’en créer une : dis-moi pour qui et pour quand.',
    ],
    offer: 'Crée une tâche pour Procy : préparer le planning vendredi',
  },
  {
    href: ROUTES.projects,
    lines: [
      'Les projets sont dans la page « {page} ».',
      'Un projet réunit les tâches qui le font avancer.',
    ],
    offer: 'Ouvre le projet du tournoi',
  },
  {
    href: ROUTES.meetings,
    lines: [
      'Les réunions sont dans la page « {page} ».',
      'Clique sur un champ pour le modifier sur place.',
    ],
  },
  {
    href: ROUTES.announcements,
    lines: ['La page « {page} » sert aux annonces adressées à l’équipe.'],
  },
  {
    href: ROUTES.calendar,
    lines: [
      'Le « {page} » montre les lives et les rendez-vous à venir.',
      'Tu peux le lire par jour ou par semaine.',
    ],
  },
  {
    href: ROUTES.lives,
    lines: [
      'La page « {page} » liste les lives, en cours et passés.',
      'Chaque live passé a son bilan.',
      'Demande-moi celui du dernier et je l’ouvre.',
    ],
    offer: 'Bilan du dernier live',
  },
  {
    href: ROUTES.sanctions,
    extra: ['barème', 'bareme'],
    lines: [
      'Le « {page} » sert à appliquer le barème de sanctions pendant un live.',
      'La sévérité dépend du Livecon en vigueur.',
    ],
  },
  {
    href: ROUTES.unban,
    extra: ['deban', 'debannissement'],
    lines: ['La page « {page} » reçoit les demandes de viewers qui veulent être débannis.'],
  },
  {
    href: ROUTES.members,
    extra: ['equipe'],
    lines: ['La page « {page} » liste l’équipe, chaque modérateur a sa fiche.'],
    offer: 'Fiche de Procy',
  },
  {
    href: ROUTES.recruitments,
    lines: [
      'Les recrutements sont dans la page « {page} ».',
      'Chaque recrutement a ses candidats, et chaque candidat sa fiche.',
    ],
  },
  {
    href: ROUTES.academy,
    extra: ['junior', 'juniors'],
    lines: ['« {page} » réunit les cours de l’équipe, les Juniors et leurs sessions.'],
  },
  {
    href: ROUTES.legacy,
    lines: ['« {page} » liste les paliers à franchir, parcours après parcours.'],
  },
  {
    href: ROUTES.trainings,
    extra: ['cours'],
    lines: ['« {page} » rassemble tes cours et ta progression.'],
  },
  {
    href: ROUTES.pages,
    extra: ['notes', 'page privee', 'pages privees'],
    lines: [
      'Tes pages privées sont des pages de notes à toi, que tu peux partager.',
      'Tape « / » dans une page pour ajouter un bloc.',
    ],
  },
  {
    href: ROUTES.notifications,
    lines: ['La page « {page} » regroupe ce qui t’est adressé.'],
  },
  {
    href: ROUTES.preferences,
    extra: ['compte', 'profil'],
    lines: ['La page « {page} » règle ton compte et tes préférences.'],
  },
  {
    href: ROUTES.play,
    extra: ['jouer'],
    lines: ['« {page} » est la salle de jeux de l’équipe.'],
  },
  {
    href: ROUTES.changelog,
    extra: ['quoi de neuf'],
    lines: ['La page « {page} » liste ce qui a changé dans Memora, version après version.'],
  },
  {
    href: ROUTES.intelligence,
    extra: ['intelligence', 'memora'],
    lines: [
      'C’est ici que tu me parles : « {page} ».',
      'Écris ce que tu veux faire ou savoir, je réponds par une discussion.',
    ],
    offer: 'Qu’est-ce que tu sais faire',
  },
]
