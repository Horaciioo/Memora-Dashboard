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
  tabPlay: 'Memora Play',
  informationTitle: 'Mes informations',
  informationLead: 'Ce que tu peux corriger toi-même.',
  fileTitle: 'Mon profil',
  fileLead: 'Ta photo, et les champs tenus par les responsables.',
  academyDispositif: 'Dispositif Academy',
  discordHandle: 'Discord',
  displayTitle: 'Affichage',
  themeTitle: 'Thème',
  textSizeTitle: 'Taille du texte',
  textSizeSample: 'Aa',
  colorVisionTitle: 'Vision des couleurs',
  colorVisionLead:
    'Choisis le mode qui te convient : les couleurs d’état, les fonds et le cadre de Memora se redessinent pour rester distincts.',
  guidesSection: 'Guides',
  colorVisionModes: 'Mode',
  colorVisionNote: 'Chaque aperçu montre le fond du cadre et les couleurs d’état de son mode.',
  displayLead: 'Ce que tu changes ici ne concerne que toi.',
  storageNotice:
    'Ces réglages sont liés à ton compte : tu les retrouves sur n’importe quel navigateur.',
  signInTitle: 'Connexion',
  sessionsTitle: 'Appareils connectés',
  sessionsLead: 'Ferme les sessions que tu ne reconnais pas.',
  currentSession: 'Cet appareil',
  unknownDevice: 'Appareil inconnu',
  lastUsedAt: 'Vue le',
  closeOthers: 'Fermer les autres sessions',
  mobileDevice: 'Mobile',
  desktopDevice: 'Ordinateur',
  onlySession: 'C’est ta seule session ouverte.',
  dataTitle: 'Mes données',
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
  guidesTitle: 'Explications des pages',
  guidesLead:
    'Une petite bulle t’explique chaque page la première fois que tu l’ouvres, puis elle disparaît.',
  guidesHint:
    'Tu les as fermées trop vite ? Réaffiche-les : elles reviendront à ta prochaine visite de chaque page.',
  guidesAction: 'Réafficher les explications',
} as const

/**
 * Labels of the fields a member owns on their own file
 * @type {Record<string, string>}
 */

export const PROFILE_FIELD_COPY = {
  displayName: 'Pseudo',
  birthday: 'Date de naissance',
  timezone: 'Fuseau horaire',
  languages: 'Langues',
  celebrateBirthday: 'Fêter mon anniversaire dans l’équipe',
} as const
