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
  fileTitle: 'Mon profil',
  fileLead: 'Ta photo, et les champs tenus par les responsables.',
  academyDispositif: 'Dispositif Academy',
  displayTitle: 'Affichage',
  displayLead: 'Ce que tu changes ici ne concerne que toi.',
  storageNotice: 'Ces réglages sont retenus par ton navigateur, pas par ton compte.',
  signInTitle: 'Connexion',
  signInLead: 'Memora te reconnaît à ton identifiant Discord, il n’y a pas de mot de passe.',
  sessionsTitle: 'Appareils connectés',
  sessionsLead: 'Ferme les sessions que tu ne reconnais pas.',
  currentSession: 'Cet appareil',
  unknownDevice: 'Appareil inconnu',
  lastUsedAt: 'Vue le',
  closeOthers: 'Fermer les autres sessions',
  onlySession: 'C’est ta seule session ouverte.',
  privacyTitle: 'Mes informations privées',
  privacyLead:
    'Ton adresse e-mail, ton téléphone, ta date de naissance et tes réseaux t’appartiennent. Tu peux les effacer quand tu veux, sans te justifier.',
  eraseDetails: 'Effacer mes informations privées',
  erasePending: 'Effacement…',
  eraseConfirmTitle: 'Effacer tes informations privées ?',
  eraseConfirmDescription:
    'Ton adresse e-mail, ton téléphone, ta date de naissance et tes réseaux sont supprimés. Ton pseudo, ton portrait et ton historique ne bougent pas.',
  eraseDone: 'Informations privées effacées',
  detailsErased: 'Effacement des informations privées',
  exportTitle: 'Récupérer mes données',
  exportLead: 'Télécharge l’intégralité de ton dossier, dans un fichier lisible.',
  exportAction: 'Télécharger mes données',
  exportPending: 'Préparation…',
  exportFileName: 'memora-mes-donnees.json',
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
