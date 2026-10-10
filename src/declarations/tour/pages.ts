import { GUIDE_BEACONS } from '@/declarations/academy/guides'
import { ROUTES } from '@/declarations/navigation'
import { TOUR_BEACONS } from '@/declarations/tour/beacons'
import { NAV_COPY } from '@/declarations/ui/copy/navigation'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * Something a page plays by itself while a step is on, in place of its usual content
 * @typedef {'absence'} TourScene
 */

export type TourScene = 'absence'

/**
 * One lit part of a page and its words
 * @typedef {Object} TourStep
 * @property {string} beacon - Part lit
 * @property {string} title - Part name
 * @property {string} body - What it does
 * @property {PermissionName} [permission] - Needed to be told about it
 * @property {PermissionName} [without] - Whoever holds it is not told about it
 * @property {TourScene} [scene] - What the page plays while the step is on
 */

export interface TourStep {
  beacon: string
  title: string
  body: string
  permission?: PermissionName
  without?: PermissionName
  scene?: TourScene
}

/**
 * Page the first visit walks through
 * @typedef {Object} TourPage
 * @property {string} route - Page address
 * @property {string} [label] - Name when the rail does not carry it
 * @property {string[]} [functions] - Functions the page is for, any of them opens it
 * @property {TourStep[]} steps - Parts lit one by one
 */

export interface TourPage {
  route: string
  label?: string
  functions?: string[]
  steps: TourStep[]
}

/**
 * Pages in the order the first visit unlocks them
 * @type {TourPage[]}
 */

export const TOUR_PAGES: TourPage[] = [
  {
    route: ROUTES.dashboard,
    steps: [
      {
        beacon: TOUR_BEACONS.rail,
        title: 'Le menu',
        body: 'Chaque page de Memora s’ouvre depuis ce menu. Il n’en montre qu’une pour l’instant : les autres apparaissent au fil de la visite.',
      },
      {
        beacon: TOUR_BEACONS.homeHeader,
        title: 'Ton accueil',
        body: 'Ton prénom et la date du jour, puis tout ce qui te concerne en dessous.',
      },
      {
        beacon: TOUR_BEACONS.homeNews,
        title: 'La dernière note de mise à jour',
        body: 'Elle apparaît quand Memora change. Clique dessus pour lire ce qui est nouveau.',
      },
      {
        beacon: TOUR_BEACONS.homeQueue,
        title: 'Tes tâches',
        body: 'Ce qui attend une action de ta part : une tâche, un appel de présence. Quand tout est fait, c’est écrit.',
      },
      {
        beacon: TOUR_BEACONS.homePlanned,
        title: 'Ton planning',
        body: 'Tes prochains évènements du calendrier. « Voir la suite dans le calendrier » ouvre le reste.',
      },
      {
        beacon: TOUR_BEACONS.homeBirthdays,
        title: 'Anniversaires à venir',
        body: 'Les anniversaires des semaines qui arrivent dans ton équipe.',
      },
      {
        beacon: TOUR_BEACONS.homeShortcuts,
        title: 'Raccourcis',
        body: 'De grandes cartes qui ouvrent les espaces auxquels tu as accès, en un clic.',
      },
    ],
  },
  {
    route: ROUTES.absences,
    steps: [
      {
        beacon: TOUR_BEACONS.absencesDeclare,
        title: 'Déclarer une absence',
        body: '« Déclarer une absence » ouvre la déclaration. Une absence posée apparaît ensuite dans ta liste avec son état : envoyée, prise en compte, refusée ou annulée.',
        permission: Permissions.AbsenceCreate,
      },
      {
        beacon: TOUR_BEACONS.absencesWizard,
        title: 'Comment on la pose',
        body: 'Regarde, Memora le fait à ta place : elle choisit le premier et le dernier jour, écrit un motif (facultatif, tu n’as pas à te justifier), puis envoie. Cet exemple n’est pas enregistré.',
        permission: Permissions.AbsenceCreate,
        scene: 'absence',
      },
    ],
  },
  {
    route: ROUTES.calendar,
    steps: [
      {
        beacon: TOUR_BEACONS.page,
        title: 'Le calendrier',
        body: 'Lives, réunions, absences, anniversaires : tout ce que tu as le droit de voir, par mois, par semaine ou en planning. Le menu de gauche laisse choisir quels calendriers afficher.',
      },
      {
        beacon: TOUR_BEACONS.calendarRequest,
        title: 'Demander un rendez-vous',
        body: 'Pour voir un de tes responsables, choisis un sujet et un jour : ils reçoivent ta demande et te répondent. Le calendrier, lui, se lit seulement.',
        without: Permissions.CalendarManage,
      },
      {
        beacon: GUIDE_BEACONS.calendarAdd,
        title: 'Poser un évènement',
        body: 'Ce bouton pose un évènement dans le calendrier. Tu peux aussi tirer sur une colonne de la grille pour en créer un.',
        permission: Permissions.CalendarManage,
      },
    ],
  },
  {
    route: ROUTES.trainings,
    steps: [
      {
        beacon: TOUR_BEACONS.coursesStage,
        title: 'La suite logique',
        body: 'La formation à suivre en priorité. « Commencer » ou « Reprendre » l’ouvre là où tu t’étais arrêté(e).',
      },
      {
        beacon: TOUR_BEACONS.coursesList,
        title: 'Toutes tes formations',
        body: 'Les indispensables d’abord, à terminer pendant la période de découverte. Les suivantes restent verrouillées (« ? ? ? ») jusqu’à la période de pratique.',
      },
    ],
  },
  {
    route: ROUTES.myLegacy,
    steps: [
      {
        beacon: TOUR_BEACONS.page,
        title: 'Mon Legacy',
        body: 'Tes modules, ta progression et ton verdict. Ton parcours apparaît ici quand l’Administration l’ouvre pour toi.',
      },
    ],
  },
  {
    route: ROUTES.sanctions,
    steps: [
      {
        beacon: TOUR_BEACONS.sanctionsLivecon,
        title: 'Le livecon en vigueur',
        body: 'Le niveau de livecon du créateur change les sanctions affichées. Le panel n’est qu’une référence, il ne remplace pas ton jugement. La recherche retrouve une infraction.',
      },
      {
        beacon: TOUR_BEACONS.sanctionsOffenses,
        title: 'Les infractions',
        body: 'Classées de la plus grave à la moins grave. Clique sur l’une d’elles : description, ce qu’il faut modérer ou laisser passer, barème au livecon en cours et raison de sanction suggérée.',
      },
    ],
  },
  {
    route: ROUTES.marsha,
    functions: ['Discord'],
    steps: [
      {
        beacon: TOUR_BEACONS.marshaFamilies,
        title: 'Les familles de commandes',
        body: 'Marsha Bot est notre bot de modération Discord. Choisis une famille, ou cherche une commande. « Bien démarrer » explique comment lui parler sans erreur.',
      },
      {
        beacon: TOUR_BEACONS.marshaList,
        title: 'Les commandes',
        body: 'Clique sur une commande pour voir sa syntaxe, ses arguments et des exemples, puis copie-la.',
      },
    ],
  },
  {
    route: ROUTES.changelog,
    steps: [
      {
        beacon: TOUR_BEACONS.page,
        title: 'Les nouveautés',
        body: 'Chaque version de Memora a sa note : ce qui a été ajouté, amélioré ou corrigé. Les notes précédentes sont rangées par mois.',
      },
    ],
  },
  {
    route: ROUTES.preferences,
    label: NAV_COPY.preferences,
    steps: [
      {
        beacon: TOUR_BEACONS.page,
        title: 'Tes paramètres',
        body: 'Trois onglets. Informations : ce que tu corriges toi-même (e-mail, téléphone, date de naissance, langues). Préférences : thème, taille du texte, vision des couleurs. Sécurité : tes appareils connectés et la double authentification.',
      },
    ],
  },
]

/**
 * Routes the first visit covers
 * @type {Set<string>}
 */

export const TOUR_ROUTES: ReadonlySet<string> = new Set(TOUR_PAGES.map((page) => page.route))
