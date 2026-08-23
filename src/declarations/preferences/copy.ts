/**
 * Copy of the personal settings page
 * @type {Record<string, string>}
 */

export const PREFERENCES_COPY = {
  title: 'Paramètres',
  lead: 'Tes informations, ton affichage et tes connexions.',
  tabInformation: 'Informations',
  tabDisplay: 'Préférences',
  tabSecurity: 'Sécurité',
  informationTitle: 'Mes informations',
  informationLead: 'Ce que tu peux corriger toi-même.',
  fileTitle: 'Ma fiche',
  fileLead: 'Ces champs sont tenus par les responsables.',
  academyPeriod: 'Période Academy',
  displayTitle: 'Affichage',
  displayLead: 'Ce que tu changes ici ne concerne que toi.',
  storageNotice: 'Ces réglages sont retenus par ton navigateur, pas par ton compte.',
  signInTitle: 'Connexion',
  signInLead: 'Memora te reconnaît à ton identifiant Discord, il n’y a pas de mot de passe.',
  sessionsTitle: 'Appareils connectés',
  sessionsLead: 'Ferme les sessions que tu ne reconnais pas.',
  currentSession: 'Cet appareil',
  unknownDevice: 'Appareil inconnu',
  openedAt: 'Ouverte le',
  expiresAt: 'Expire le',
  closeOthers: 'Fermer les autres sessions',
  onlySession: 'C’est ta seule session ouverte.',
  leaveTitle: 'Quitter',
  leaveLead: 'Tu devras retaper ton identifiant Discord pour revenir.',
} as const

/**
 * Labels of the fields a member owns on their own file
 * @type {Record<string, string>}
 */

export const PROFILE_FIELD_COPY = {
  email: 'Mail',
  phone: 'Téléphone',
  birthday: 'Date de naissance',
  timezone: 'Fuseau horaire',
  languages: 'Langues',
  avatarUrl: 'Photo de profil',
  celebrateBirthday: 'Fêter mon anniversaire dans l’équipe',
} as const
