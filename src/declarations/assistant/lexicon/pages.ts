import { ROUTES } from '@/declarations/navigation'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'

/**
 * Page reachable by name
 * @typedef {Object} AssistantPage
 * @property {string} href - Destination
 * @property {string} label - Display name
 * @property {string[]} phrases - Folded names
 * @property {PermissionName} [permission] - Gate off the rail
 */

export interface AssistantPage {
  href: string
  label: string
  phrases: readonly string[]
  permission?: PermissionName
}

/**
 * Pages by name
 * @type {AssistantPage[]}
 */

export const ASSISTANT_PAGES: readonly AssistantPage[] = [
  {
    href: ROUTES.dashboard,
    label: 'Accueil',
    phrases: ['accueil', 'tableau de bord', 'dashboard', 'home'],
  },
  { href: ROUTES.absences, label: 'Absences', phrases: ['absences', 'absence', 'conges'] },
  {
    href: ROUTES.changelog,
    label: 'Nouveautés',
    phrases: ['nouveautes', 'patchnote', 'patchnotes', 'changelog', 'mises a jour'],
  },
  { href: ROUTES.play, label: 'Play', phrases: ['play', 'jeux', 'arcade'] },
  { href: ROUTES.calendar, label: 'Calendrier', phrases: ['calendrier', 'agenda', 'planning'] },
  { href: ROUTES.trainings, label: 'Formations', phrases: ['formations', 'formation', 'cours'] },
  { href: ROUTES.members, label: 'Modérateurs', phrases: ['moderateurs', 'modos', 'membres'] },
  { href: ROUTES.projects, label: 'Projets', phrases: ['projets', 'projet'] },
  { href: ROUTES.tasks, label: 'Tâches', phrases: ['taches', 'tache', 'todo'] },
  { href: ROUTES.meetings, label: 'Réunions', phrases: ['reunions', 'reunion', 'meetings'] },
  {
    href: ROUTES.announcements,
    label: 'Communications',
    phrases: ['communications', 'annonces', 'annonce'],
  },
  {
    href: ROUTES.recruitments,
    label: 'Recrutements',
    phrases: ['recrutements', 'recrutement', 'candidats'],
  },
  { href: ROUTES.academy, label: 'Academy', phrases: ['academy', 'academie'] },
  { href: ROUTES.legacy, label: 'Legacy', phrases: ['legacy'] },
  { href: ROUTES.lives, label: 'Lives', phrases: ['lives', 'live', 'streams'] },
  {
    href: ROUTES.sanctions,
    label: 'Panel Twitch',
    phrases: ['panel twitch', 'sanctions', 'twitch'],
  },
  {
    href: ROUTES.discordSanctions,
    label: 'Panel Discord',
    phrases: ['panel discord', 'discord'],
  },
  { href: ROUTES.marsha, label: 'Marsha Bots', phrases: ['marsha', 'bots', 'commandes'] },
  { href: ROUTES.settings, label: 'Configuration', phrases: ['configuration', 'config'] },
  { href: ROUTES.system, label: 'Système', phrases: ['systeme'] },
  {
    href: ROUTES.journal,
    label: 'Logs',
    phrases: ['logs', 'journal'],
    permission: Permissions.AccessManage,
  },
  { href: ROUTES.notifications, label: 'Notifications', phrases: ['notifications', 'notifs'] },
  {
    href: ROUTES.preferences,
    label: 'Paramètres',
    phrases: ['parametres', 'preferences', 'reglages'],
  },
  { href: ROUTES.pages, label: 'Pages privées', phrases: ['pages', 'notes'] },
]
