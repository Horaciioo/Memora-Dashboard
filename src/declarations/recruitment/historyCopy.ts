import { RETENTION_POLICIES, inDays } from '@/declarations/system/security/privacy'

/**
 * Copy of the history and the blacklist
 * @type {Record<string, string | ((value: string) => string)>}
 */

export const HISTORY_COPY = {
  tabSessions: 'Sessions',
  tabHistory: 'Historique',
  tabsLabel: 'Recrutement',
  search: 'Chercher un identifiant ou un nom',
  bannedOnly: 'Blacklistés seulement',
  emptyTitle: 'Aucun candidat',
  emptyDescription:
    'Les candidats de toutes les sessions apparaissent ici, retrouvés par leur identifiant Discord.',
  allIdentities: 'Tous',
  openFile: 'Ouvrir la fiche',
  noOutcome: 'Sans statut',
  noRecruiter: 'Sans recruteur',
  more: 'Voir la suite',
  retention: `Les candidatures refusées sont effacées après ${inDays(RETENTION_POLICIES.rejectedCandidates)}.`,
  banned: 'Blacklisté',
  bannedOn: (session: string) => `Blacklisté sur la session : ${session}`,
  ban: 'Blacklister cet identifiant',
  banTitle: 'Blacklister',
  banNote:
    'Cet identifiant ne pourra plus être ajouté à une nouvelle session. Ses candidatures en cours restent.',
  reason: 'Motif',
  reasonInfo: 'Facultatif, visible des Responsables seulement.',
  submitBan: 'Blacklister',
  unban: 'Lever la blacklist',
  unbanTitle: 'Lever la blacklist',
  unbanDescription: 'Cet identifiant pourra de nouveau être ajouté à une session.',
  refused: (session: string) => `Cet identifiant a été blacklisté sur la session : ${session}`,
  refusedAnywhere: 'Cet identifiant a été blacklisté.',
  logBanned: (name: string) => `${name} blacklisté`,
  logUnbanned: (name: string) => `${name} sorti de la blacklist`,
  bannedDone: 'Identifiant blacklisté',
  unbannedDone: 'Blacklist levée',
} as const
