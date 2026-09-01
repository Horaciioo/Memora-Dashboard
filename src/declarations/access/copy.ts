/**
 * Copy of the access matrix
 * @type {Record<string, string>}
 */

export const ACCESS_COPY = {
  title: 'Accès',
  lead: 'Ce que chaque rôle et chaque fonction ouvrent. Le compte administrateur garde tout, quoi qu’il arrive.',
  tabRoles: 'Par rôle',
  tabFunctions: 'Par fonction',
  save: 'Enregistrer',
  preset: 'Remettre les permissions conseillées',
  presetTitle: 'Remettre les permissions conseillées ?',
  presetDescription: 'Les permissions de ce rôle sont remplacées par celles du modèle.',
  functionsEmptyTitle: 'Aucune fonction',
  functionsEmptyDescription:
    'Crée des fonctions dans la configuration pour leur donner des permissions.',
  configure: 'Ouvrir la configuration',
  granted: 'permissions',
  grantedOne: 'permission',
  rootNote: 'Le compte administrateur ignore cette matrice.',
  search: 'Chercher une permission',
  noMatch: 'Aucune permission ne correspond.',
  grantAll: 'Tout',
  grantNone: 'Rien',
  sensitive: 'Sensible',
  pending: 'modification',
  pendingMany: 'modifications',
  stateInherited: 'Hérité',
  stateAllowed: 'Autorisé',
  stateDenied: 'Refusé',
  inheritedYes: 'Hérité · autorisé',
  inheritedNo: 'Hérité · refusé',
  createdFunctions: 'Fonctions créées',
  encadrementLocked: 'Seul un administrateur modifie ce niveau.',
} as const

/**
 * Copy of the second factor
 * @type {Record<string, string>}
 */

export const TWO_FACTOR_COPY = {
  title: 'Authentification à deux facteurs',
  lead: 'Elle descelle les données sensibles : adresse mail et numéro de téléphone.',
  enrolled: 'A2F active',
  notEnrolled: 'A2F inactive',
  enrol: 'Activer l’A2F',
  enrolTitle: 'Activer l’authentification à deux facteurs',
  enrolLead:
    'Scanne ce code avec ton application d’authentification, puis recopie le code affiché.',
  manualTitle: 'Impossible de scanner ?',
  manualLead: 'Saisis cette clé à la main dans ton application.',
  copySecret: 'Copier la clé',
  secretCopied: 'Clé copiée.',
  recoveryTitle: 'Codes de secours',
  recoveryLead:
    'Garde-les hors du dashboard : chacun ouvre une fois, si ton application n’est plus là.',
  recoveryLeft: 'codes de secours restants',
  recoveryLeftOne: 'code de secours restant',
  copyRecovery: 'Copier les codes',
  recoveryCopied: 'Codes copiés.',
  codeLabel: 'Code à 6 chiffres',
  codePlaceholder: '000000',
  confirm: 'Confirmer',
  confirmed: 'A2F activée.',
  unlockTitle: 'Données scellées',
  unlockLead: 'Saisis ton code d’authentification pour ouvrir les données sensibles.',
  unlock: 'Desceller',
  unlocked: 'Données descellées.',
  unlockedUntil: 'Descellé jusqu’à',
  seal: 'Resceller',
  sealed: 'Données rescellées.',
  drop: 'Désactiver l’A2F',
  dropTitle: 'Désactiver l’A2F ?',
  dropLead: 'Les données sensibles redeviennent inaccessibles et les codes de secours sont perdus.',
  dropped: 'A2F désactivée.',
  missingTitle: 'Aucune A2F sur ce compte',
  missingLead: 'Active l’authentification à deux facteurs pour ouvrir cette donnée.',
  wrongCode: 'Ce code ne correspond pas.',
  enrolmentExpired: 'Cette activation a expiré, relance-la.',
  sealedHint: 'Scellé par l’A2F',
  reveal: 'Desceller cette donnée',
} as const

/**
 * Copy of the encadrement views
 * @type {Record<string, string>}
 */

export const VIEW_COPY = {
  noCreator: 'Aucun',
  activeCreator: 'YouTubeur en cours',
  adminTitle: 'Console admin',
  adminLead: 'L’état réel du back-end, des accès et des données de Memora.',
  adminRuntime: 'Infrastructure',
  adminRuntimeLead: 'Chaque sujet, son état d’activation et sa dernière sonde.',
  adminData: 'Données',
  adminDataLead: 'Ce que la base porte aujourd’hui.',
  adminAccess: 'Accès',
  adminAccessLead: 'Comptes, sessions ouvertes et second facteur.',
  subjectOn: 'Actif',
  subjectOff: 'Inactif',
  probeMissing: 'Aucune sonde',
  environment: 'Environnement',
  runtimeDown: 'Back-end à l’arrêt',
  runtimeDownLead: 'Aucun sujet n’est activé dans la configuration de cet environnement.',
  metricAccounts: 'Comptes',
  metricSessions: 'Sessions ouvertes',
  metricTwoFactor: 'Comptes avec A2F',
  metricCreators: 'YouTubeurs',
  metricTeams: 'Équipes',
  metricProjects: 'Projets',
  metricTasks: 'Tâches',
  metricFiles: 'Fichiers',
  metricLogs: 'Entrées de journal',
  metricNotifications: 'Notifications',
} as const
