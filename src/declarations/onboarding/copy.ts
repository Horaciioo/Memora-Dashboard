/**
 * Copy of the public integration form
 * @type {Record<string, string>}
 */

export const ONBOARDING_COPY = {
  title: 'Formulaire d’intégration',
  subtitle: 'Quelques minutes pour ouvrir ton accès, et c’est parti.',
  invalidTitle: 'Lien invalide',
  invalidDescription:
    'Ce lien n’existe plus, a expiré ou a atteint son nombre d’utilisations. Rapproche-toi de ton Responsable.',
  progressLabel: 'Progression du formulaire',
  next: 'Continuer',
  previous: 'Revenir',
  submit: 'Valider mon intégration',
  pending: 'Envoi…',
  successTitle: 'C’est enregistré',
  successDescription: 'Ton compte est ouvert, tu peux te connecter au dashboard avec Discord.',
  successPendingDescription:
    'Ton dossier part à ton Responsable, il ouvre ton accès dès qu’il l’a validé.',
  successProfileDescription: 'Tes informations sont transmises, merci d’avoir pris le temps.',
} as const

/**
 * Captions of the wizard steps
 * @type {Record<string, string>}
 */

export const ONBOARDING_STEP_COPY = {
  identity: 'Discord',
  identityHint: 'On vérifie que le compte est bien le tien',
  informations: 'Informations',
  informationsHint: 'Qui tu es, comment te joindre',
  socials: 'Réseaux',
  socialsHint: 'Là où on peut te suivre',
  constraints: 'Contraintes',
  constraintsHint: 'Ce qu’on doit savoir pour t’organiser',
  preferences: 'Préférences',
  preferencesHint: 'L’allure du dashboard',
  confirmation: 'Confirmation',
  confirmationHint: 'Un dernier coup d’œil',
} as const

/**
 * Copy of the Discord identity step
 * @type {Record<string, string>}
 */

export const ONBOARDING_DISCORD_COPY = {
  lead: 'On récupère seulement ton pseudo et ton avatar, rien d’autre.',
  connect: 'Connecter mon compte Discord',
  retry: 'Réessayer',
  confirm: 'Oui, c’est bien moi',
  reject: 'Ce n’est pas moi',
  warningTitle: 'Ton compte, et uniquement le tien',
  warningBody:
    'Seul le compte Discord appartenant directement à toi est autorisé. Utiliser celui d’un proche, d’un ami ou d’un membre de ta famille entraîne la révocation immédiate de tes accès.',
  failureTitle: 'La connexion n’a pas abouti',
  failureBody:
    'Contacte ton Responsable pour qu’il vérifie ton lien, puis relance la connexion Discord.',
  takenTitle: 'Ce compte a déjà une fiche',
  takenBody:
    'Un accès existe déjà pour ce compte Discord. Rapproche-toi de ton Responsable plutôt que de recommencer.',
} as const

/**
 * Labels of the integration form fields
 * @type {Record<string, string>}
 */

export const ONBOARDING_FIELD_COPY = {
  displayName: 'Pseudonyme',
  displayNameHint: 'Celui sous lequel l’équipe te connaîtra.',
  email: 'Adresse e-mail',
  phone: 'Numéro de téléphone',
  birthday: 'Date de naissance',
  languages: 'Langues maîtrisées',
  discord: 'Compte Discord',
  medical: 'Contraintes pathologiques',
  medicalHint: 'Ce qui doit être pris en compte dans ton organisation.',
  illness: 'Maladies',
  private: 'Contraintes privées',
  privateHint: 'Horaires, études, travail, tout ce qui limite tes disponibilités.',
  theme: 'Thème du dashboard',
  hasColorVision: 'J’ai une vision des couleurs particulière',
  colorVision: 'Type de daltonisme',
  fontScale: 'Taille du texte',
  dispositif: 'Dispositif souhaité',
  consent: 'J’accepte la conservation de mes données',
} as const

/**
 * Notices the form owes the person, each shown on the step it applies to
 * @type {Record<string, string>}
 */

export const ONBOARDING_NOTICE_COPY = {
  optionalTitle: 'Rien ici n’est verrouillé',
  constraints:
    'La totalité de ces informations sensibles peut être modifiée ou supprimée par toi-même, à tout moment, depuis tes paramètres. Elles t’appartiennent entièrement.',
  preferences:
    'Chacune de ces préférences se change quand tu veux depuis les paramètres du dashboard.',
  retention:
    'Seules deux informations publiques sont conservées durablement : ton avatar Discord et ton identifiant Discord. Tout le reste est effaçable par toi.',
} as const

/**
 * Copy of the integration link, handed out from the campaign timeline
 * @type {Record<string, string>}
 */

export const INTEGRATION_LINK_COPY = {
  emit: 'Envoyer le formulaire',
  emitTitle: 'Envoyer le formulaire d’intégration',
  emitDescription:
    'Le YouTubeur, la fonction et la promotion sont ceux de ce recrutement. Il ne reste qu’à choisir ce que le formulaire ouvre.',
  emitted: 'Formulaire d’intégration envoyé',
  reissue: 'Réémettre',
  copy: 'Copier le lien',
  copied: 'Lien copié',
  revoke: 'Révoquer',
  revokeTitle: 'Révoquer ce lien ?',
  revokeDescription:
    'Le formulaire devient inaccessible. Les comptes déjà ouverts par ce lien restent en place.',
  usesLabel: 'utilisations',
  unlimited: '∞',
  expiredBadge: 'Expiré',
  exhaustedBadge: 'Complet',
  pendingHint: 'Le lien part une fois la réunion d’information terminée.',
} as const

/**
 * Labels of the link creation form
 * @type {Record<string, string>}
 */

export const INTEGRATION_LINK_FIELD_COPY = {
  kind: 'Type de lien',
  expiresAt: 'Expire le',
  expiresAtHint: 'Laissée vide, la fenêtre déclarée s’applique.',
  maxUses: 'Nombre d’utilisations',
  maxUsesHint: 'Laissé vide, le lien est sans limite.',
} as const

/**
 * Copy of the screen a pending account lands on
 * @type {Record<string, string>}
 */

export const PENDING_ACCOUNT_COPY = {
  title: 'Compte en attente de validation',
  lead: 'Ton formulaire est bien arrivé. Un Responsable ouvre ton accès très vite.',
  body: 'Tu recevras un message sur Discord dès que c’est fait, rien de plus à faire de ton côté.',
} as const
