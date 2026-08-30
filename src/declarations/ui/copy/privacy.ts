/**
 * Privacy notice copy
 * @type {Record<string, string>}
 */

export const PRIVACY_COPY = {
  title: 'Tes données',
  subtitle: 'Ce que Memora enregistre, pourquoi, et pendant combien de temps.',
  controllerTitle: 'Qui est responsable',
  processingTitle: 'Ce qui est traité',
  rightsTitle: 'Tes droits',
  rightsLead:
    'Tu peux à tout moment demander l’accès à tes données, leur correction, leur effacement, ou t’opposer à un traitement.',
  ownershipTitle: 'Tes informations privées t’appartiennent',
  ownershipLead:
    'Ton adresse e-mail, ton téléphone, ta date de naissance et tes réseaux sont des informations que tu as choisi de communiquer. Tu peux les supprimer toi-même, quand tu veux, depuis tes paramètres, sans avoir à te justifier et sans que personne ait à valider.',
  ageTitle: 'Âge minimum',
  ageLead:
    'Memora ne recrute pas en dessous de {minimum} ans. Au-dessus de {threshold} ans, chacun consent pour soi : aucun accord parental n’est requis, et aucune donnée de mineur de moins de {threshold} ans n’est collectée.',
  publicTitle: 'Ce qui reste attaché à ton travail',
  publicLead:
    'Ton identifiant Discord, ton pseudo et ton portrait sont conservés : ils sont déjà publics sur Discord, et ce sont eux qui rendent l’historique d’équipe lisible. Les notes de suivi écrites pendant ton parcours restent également — ce ne sont pas des jugements, mais des repères d’accompagnement.',
  exportTitle: 'Récupérer mes données',
  exportLead: 'Depuis tes paramètres, tu télécharges l’intégralité de ton dossier en un fichier.',
  columnPurpose: 'Finalité',
  columnCategories: 'Données',
  columnBasis: 'Base légale',
  columnRetention: 'Conservation',
  backToSignIn: 'Retour à la connexion',
} as const

/**
 * History consent copy, shown wherever the agreement is asked for
 * @type {Record<string, string>}
 */

export const CONSENT_COPY = {
  title: 'Avant de continuer',
  lead: 'Une dernière chose, et elle compte.',
  accept: 'J’ai compris et j’accepte',
  pending: 'Enregistrement…',
  refuse: 'Je refuse et je me déconnecte',
  required: 'Coche la case pour continuer.',
} as const
