import type { InstallRoute } from '@/types/pwa'

/**
 * Copy of the installed application
 * @type {Record<string, string>}
 */

export const INSTALL_COPY = {
  name: 'Memora',
  shortName: 'Memora',
  // Dev build, told apart in the dock
  devName: 'Memora - Dev',
  title: 'Application',
  lead: 'Ouvre Memora comme une application : plein écran, icône sur ton écran d’accueil et notifications sur ton téléphone.',
  action: 'Installer Memora',
  installed: 'Memora est installée sur cet appareil.',
  iosSteps: 'Dans Safari, touche Partager puis « Sur l’écran d’accueil ».',
  iosOtherBrowser: 'Sur iPhone et iPad, Memora s’installe depuis Safari.',
  manual:
    'Ton navigateur ne propose pas l’installation ici. Cherche « Installer l’application » ou « Ajouter à l’écran d’accueil » dans son menu.',
  hintTitle: 'Memora sur ton écran d’accueil',
  hintLead: 'Installe Memora pour l’ouvrir en un geste et recevoir tes notifications.',
  hintLater: 'Plus tard',
  hintNever: 'Ne plus proposer',
} as const

/**
 * What each install route tells the member
 * @type {Record<Exclude<InstallRoute, null>, string>}
 */

export const INSTALL_ROUTE_COPY: Record<Exclude<InstallRoute, null>, string> = {
  installed: INSTALL_COPY.installed,
  prompt: INSTALL_COPY.lead,
  apple: INSTALL_COPY.iosSteps,
  appleOther: INSTALL_COPY.iosOtherBrowser,
  manual: INSTALL_COPY.manual,
}

/**
 * Copy of updates and lost connection
 * @type {Record<string, string>}
 */

export const LIFECYCLE_COPY = {
  updateWord: 'Hop !',
  updateTitle: 'Memora a une nouvelle version',
  updateLead: 'Recharge pour en profiter.',
  updateAction: 'Recharger',
  offlineBanner: 'Tu es hors ligne. Ce que tu modifies ne partira qu’au retour de la connexion.',
  offlineTitle: 'Hors ligne',
  offlineLead:
    'Memora a besoin d’Internet pour afficher cette page. Elle revient dès que la connexion revient.',
  offlineRetry: 'Réessayer',
} as const

/**
 * Copy of the push settings
 * @type {Record<string, string>}
 */

export const PUSH_COPY = {
  tab: 'Notifications',
  deviceTitle: 'Sur cet appareil',
  inviteTitle: 'Memora débarque en App',
  enabledTitle: 'Tu es branché',
  deviceLead:
    'Reçois désormais tes notifications directement sur ton téléphone, ou sur ton ordinateur, même quand Memora est fermée.',
  enable: 'Activer sur cet appareil',
  disable: 'Couper sur cet appareil',
  enabled: 'Activées sur cet appareil.',
  pending: 'Un instant…',
  denied:
    'Tu as bloqué les notifications de Memora. Débloque-les dans les réglages du navigateur, puis reviens ici.',
  unsupported: 'Ce navigateur ne reçoit pas de notifications.',
  iosNeedsInstall:
    'Sur iPhone et iPad, installe d’abord Memora sur ton écran d’accueil, puis ouvre-la depuis son icône.',
  notConfigured: 'Les notifications sur appareil ne sont pas encore branchées sur ce serveur.',
  enabledToast: 'Notifications activées',
  disabledToast: 'Notifications coupées sur cet appareil',
  categoriesTitle: 'Ce que tu reçois',
  categoriesLead: 'Une famille coupée reste visible dans la cloche de Memora.',
  devicesTitle: 'Appareils abonnés',
  devicesLead: 'Une déconnexion retire l’appareil tout seul.',
  thisDevice: 'Cet appareil',
  removeDevice: 'Retirer cet appareil',
  noDevice: 'Aucun appareil abonné.',
  subscribedOn: 'Abonné le',
  lastSentOn: 'Dernier envoi le',
  testAction: 'M’envoyer un essai',
  testSent: 'Essai envoyé',
} as const

/**
 * Copy of the phone dock
 * @type {Record<string, string>}
 */

export const DOCK_COPY = {
  label: 'Navigation principale',
  title: 'Barre du bas',
  lead: 'Sur téléphone, l’Accueil reste au centre et le Menu à droite. Choisis les pages des autres cases.',
  slot: 'Case {position}',
  preview: 'Aperçu de la barre du bas sur un iPhone',
  menu: 'Menu',
  reset: 'Revenir aux pages proposées',
  saved: 'Barre du bas enregistrée',
} as const

/**
 * Copy of the push screen of the system section
 * @type {Record<string, string>}
 */

export const PUSH_CONSOLE_COPY = {
  title: 'Push',
  lead: 'Chaque notification telle qu’elle arrive sur un téléphone, et le journal des envois.',
  catalogueTitle: 'Catalogue',
  catalogueLead: 'Envoie-toi une notification pour la voir sur ton appareil.',
  sendToMe: 'M’envoyer celle-ci',
  sent: 'Envoyée sur tes appareils',
  noDevice: 'Active d’abord les notifications sur un de tes appareils, dans tes paramètres.',
  sampleSubject: 'Exemple',
  category: 'Famille',
  opens: 'Ouvre',
  journalTitle: 'Journal des envois',
  journalLead: 'Chaque notification remise, ou non, à Apple, Google, Microsoft ou Mozilla.',
  journalEmptyTitle: 'Aucun envoi',
  journalEmptyLead: 'Les notifications parties sur un appareil apparaîtront ici.',
  columnDate: 'Date',
  columnMember: 'Membre',
  columnNotification: 'Notification',
  columnDevice: 'Appareil',
  columnResult: 'Résultat',
  test: 'Essai',
  loadMore: 'Voir les plus anciens',
} as const
