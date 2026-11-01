import type { IconName } from '@/declarations/ui/icons'

/**
 * Tabs of the settings page
 * @typedef {Object} SettingsTab
 * @property {string} label - Name in the strip
 * @property {IconName} icon - Glyph in the strip
 */

interface SettingsTab {
  label: string
  icon: IconName
}

/**
 * Tabs of the settings page
 * @type {Record<string, SettingsTab>}
 */

export const SETTINGS_TABS = {
  information: {
    label: 'Profil',
    icon: 'me',
  },
  appearance: {
    label: 'Apparence',
    icon: 'spark',
  },
  preferences: {
    label: 'Préférences',
    icon: 'settingsLine',
  },
  notifications: {
    label: 'Notifications',
    icon: 'bell',
  },
  connections: {
    label: 'Comptes',
    icon: 'link',
  },
  security: {
    label: 'Sécurité',
    icon: 'shield',
  },
  privacy: {
    label: 'Confidentialité',
    icon: 'lock',
  },
} as const satisfies Record<string, SettingsTab>

export type SettingsTabName = keyof typeof SETTINGS_TABS

/**
 * Sections of the profile form, by field name
 * @type {{ title: string, lead: string, fields: string[] }[]}
 */

export const PROFILE_SECTIONS = [
  {
    title: 'Identité',
    lead: 'Le nom que l’équipe lit et les langues que tu parles.',
    fields: ['displayName', 'languages'],
  },
  {
    title: 'Dates et fuseau',
    lead: 'Pour caler tes horaires et fêter ton anniversaire.',
    fields: ['birthday', 'timezone', 'celebrateBirthday'],
  },
] as const

/**
 * Copy of the groups inside the tabs
 * @type {Record<string, string>}
 */

export const SETTINGS_GROUP_COPY = {
  theme: 'Thème',
  themeLead: 'Clair, sombre, ou celui de ton appareil.',
  frame: 'Cadre et cartes',
  frameLead: 'Le fond de l’application et la matière de ses cartes.',
  shape: 'Formes',
  shapeLead: 'La rondeur de tout ce qui se touche et se lit.',
  vision: 'Vision des couleurs',
  reading: 'Lecture',
  readingLead: 'Taille, espacement et liens des textes.',
  accessibility: 'Accessibilité',
  accessibilityLead: 'Moins de mouvement, un repère plus net au clavier.',
  device: 'Sur cet appareil',
  deviceLead: 'Installation et barre du bas sur mobile.',
  help: 'Aide',
  reset: 'Remettre les réglages d’origine',
  resetDone: 'Réglages remis à zéro',
  browserNotice:
    'Ces réglages restent dans ce navigateur. Le thème, la taille du texte et la vision des couleurs te suivent partout.',
  sealedTitle: 'Informations protégées',
  sealedLead: 'Débloque-les pour les lire.',
  save: 'Enregistrer mon profil',
  sample: 'Aperçu',
} as const

/**
 * Copy of the security tab
 * @type {Record<string, string>}
 */

export const SECURITY_COPY = {
  scoreTitle: 'Niveau de protection',
  scoreLead: 'Quatre points qui disent si ton compte est bien gardé.',
  scoreOf: 'sur',
  discordTitle: 'Connexion par Discord',
  discordOk: 'Pas de mot de passe à voler : Discord garde ta connexion.',
  sessionsTitle: 'Une seule session ouverte',
  sessionsOk: 'Tu es connecté sur cet appareil seulement.',
  sessionsWarn: 'Plusieurs sessions sont ouvertes : vérifie-les plus bas.',
  accountsTitle: 'Comptes de plateforme à jour',
  accountsOk: 'Tes comptes reliés répondent.',
  accountsWarn: 'Un compte relié ne répond plus : relie-le de nouveau.',
  accountsNone: 'Aucun compte relié pour l’instant.',
  sealTitle: 'Informations sensibles masquées',
  sealOk: 'Tes coordonnées restent verrouillées tant que tu ne les ouvres pas.',
  sealWarn: 'Tes coordonnées sont déverrouillées en ce moment.',
  identityTitle: 'Identité de connexion',
  sessionsSectionTitle: 'Appareils connectés',
  sessionsSectionLead: 'Ferme les sessions que tu ne reconnais pas.',
  thisDevice: 'Cet appareil',
  unknownDevice: 'Appareil inconnu',
  lastUsed: 'Vue',
  closeOne: 'Fermer',
  closeOthers: 'Fermer toutes les autres',
  closedOne: 'Session fermée',
  closedOthers: 'Autres sessions fermées',
  onlySession: 'C’est ta seule session ouverte.',
  tipsTitle: 'Bons réflexes',
  tips: [
    'Ferme ta session sur un ordinateur partagé.',
    'Ne donne jamais ton lien de connexion Discord à quelqu’un.',
    'Relie de nouveau une plateforme dès qu’elle ne répond plus.',
  ],
} as const

/**
 * Copy of the privacy tab
 * @type {Record<string, string>}
 */

export const PRIVACY_COPY = {
  exportTitle: 'Récupérer mes données',
  exportLead: 'Un fichier lisible avec tout ce que Memora garde sur toi.',
  keepTitle: 'Ce que Memora garde',
  keeps: [
    'Ton pseudo, ton portrait et ton historique dans l’équipe.',
    'Tes coordonnées, uniquement si tu les as données.',
    'Les actions que tu fais dans Memora, pour le suivi de l’équipe.',
  ],
  eraseTitle: 'Effacer mes informations privées',
  eraseLead: 'Adresse e-mail, téléphone, date de naissance et réseaux, retirés en un geste.',
} as const
