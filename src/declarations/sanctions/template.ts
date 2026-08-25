/**
 * One offence of the panel model, with the ladder it runs per livecon level
 * @typedef {Object} SanctionOffenseSeed
 * @property {string} name - Display name
 * @property {string} summary - What the offence covers
 * @property {string} example - Concrete case
 * @property {string} warningExample - Reason a moderator can paste
 * @property {Record<number, string[]>} ladder - Measure names per livecon level
 */

export interface SanctionOffenseSeed {
  name: string
  summary: string
  example: string
  warningExample: string
  ladder: Record<number, string[]>
}

/**
 * The panel every creator starts from, cloned on creation and editable afterwards
 * @type {readonly SanctionOffenseSeed[]}
 */

export const SANCTION_TEMPLATE: readonly SanctionOffenseSeed[] = [
  {
    name: 'Autre langue',
    summary:
      'Le chat se tient en français. Une autre langue coupe la communauté et empêche la modération de lire.',
    example: 'Un viewer enchaîne plusieurs messages en anglais malgré un rappel.',
    warningExample: "Merci d'écrire en français sur ce chat.",
    ladder: {
      1: ['Suppression', 'TO : 10 minutes', 'TO : 1 heure', 'TO : 5 heures'],
      2: ['Suppression', 'Avertissement', 'TO : 10 minutes', 'TO : 1 heure'],
      3: ['Suppression', 'Avertissement', 'Avertissement', 'TO : 10 minutes'],
    },
  },
  {
    name: 'Contournement de sanctions',
    summary: 'Revenir sur un autre compte pour échapper à une sanction en cours.',
    example: 'Un compte banni réapparaît sous un pseudo proche cinq minutes plus tard.',
    warningExample: "Contournement d'une sanction en cours.",
    ladder: {
      1: ['Bannissement définitif'],
      2: ['Bannissement définitif'],
      3: ['TO : 14 jours', 'Bannissement définitif'],
    },
  },
  {
    name: 'Demande de dédicace',
    summary: 'Réclamer un salut, un shout-out ou une mention au créateur, de façon répétée.',
    example: "« coucou dis mon pseudo stp » posté six fois d'affilée.",
    warningExample: 'Les demandes de dédicace ne sont pas acceptées sur ce chat.',
    ladder: {
      1: ['Suppression', 'TO : 10 minutes', 'TO : 1 heure', 'TO : 5 heures'],
      2: ['Suppression', 'Avertissement', 'TO : 10 minutes', 'TO : 1 heure'],
      3: ['Suppression', 'Avertissement', 'Avertissement', 'TO : 10 minutes'],
    },
  },
  {
    name: 'Flood excessif',
    summary: 'Répéter un message ou saturer le chat au point de le rendre illisible.',
    example: 'Le même emote envoyé vingt fois en dix secondes.',
    warningExample: 'Flood excessif du chat.',
    ladder: {
      1: ['TO : 10 minutes', 'TO : 1 heure', 'TO : 5 heures', 'TO : 1 jour'],
      2: ['Suppression', 'TO : 10 minutes', 'TO : 1 heure', 'TO : 5 heures'],
      3: ['Suppression', 'Avertissement', 'TO : 10 minutes', 'TO : 1 heure'],
    },
  },
  {
    name: 'Grossièreté',
    summary: 'Vulgarité gratuite, sans cible, qui abaisse le ton général du chat.',
    example: 'Une insulte lâchée dans le vide à chaque action du créateur.',
    warningExample: 'Merci de surveiller ton langage.',
    ladder: {
      1: ['Suppression', 'TO : 10 minutes', 'TO : 1 heure', 'TO : 5 heures'],
      2: ['Suppression', 'Avertissement', 'TO : 10 minutes', 'TO : 1 heure'],
      3: ['Suppression', 'Avertissement', 'Avertissement', 'TO : 10 minutes'],
    },
  },
  {
    name: 'Insulte grave à viewer',
    summary: 'Attaquer nommément un autre spectateur.',
    example: "« t'es qu'un déchet » adressé à un pseudo précis.",
    warningExample: 'Insulte grave envers un autre viewer.',
    ladder: {
      1: ['TO : 5 heures', 'TO : 1 jour', 'TO : 7 jours', 'Bannissement définitif'],
      2: ['TO : 1 heure', 'TO : 5 heures', 'TO : 1 jour', 'TO : 7 jours'],
      3: ['TO : 10 minutes', 'TO : 1 heure', 'TO : 5 heures', 'TO : 1 jour'],
    },
  },
  {
    name: 'Insulte grave à modo',
    summary: "Attaquer un membre de la modération dans l'exercice de son rôle.",
    example: "Une bordée d'insultes après un timeout.",
    warningExample: 'Insulte grave envers un membre de la modération.',
    ladder: {
      1: ['TO : 1 jour', 'TO : 7 jours', 'TO : 14 jours', 'Bannissement définitif'],
      2: ['TO : 5 heures', 'TO : 1 jour', 'TO : 7 jours', 'TO : 14 jours'],
      3: ['TO : 1 heure', 'TO : 5 heures', 'TO : 1 jour', 'TO : 7 jours'],
    },
  },
  {
    name: 'Insulte grave à YouTubeur',
    summary: 'Attaquer le créateur ou un de ses invités.',
    example: 'Des insultes répétées visant le créateur pendant son live.',
    warningExample: 'Insulte grave envers le créateur.',
    ladder: {
      1: ['TO : 1 jour', 'TO : 7 jours', 'TO : 14 jours', 'Bannissement définitif'],
      2: ['TO : 5 heures', 'TO : 1 jour', 'TO : 7 jours', 'TO : 14 jours'],
      3: ['TO : 1 heure', 'TO : 5 heures', 'TO : 1 jour', 'TO : 7 jours'],
    },
  },
  {
    name: 'Insulte grave à la Corp',
    summary: 'Attaquer la structure, ses équipes ou ses partenaires.',
    example: "Des propos insultants visant l'organisation dans son ensemble.",
    warningExample: 'Insulte grave envers la structure.',
    ladder: {
      1: ['TO : 1 jour', 'TO : 7 jours', 'TO : 14 jours', 'Bannissement définitif'],
      2: ['TO : 5 heures', 'TO : 1 jour', 'TO : 7 jours', 'TO : 14 jours'],
      3: ['TO : 1 heure', 'TO : 5 heures', 'TO : 1 jour', 'TO : 7 jours'],
    },
  },
  {
    name: 'Spam de majuscules',
    summary: "Écrire en capitales pour attirer l'attention.",
    example: '« REGARDEZ MOI JE SUIS LA » en boucle.',
    warningExample: "Merci d'éviter les majuscules.",
    ladder: {
      1: ['Suppression', 'TO : 10 minutes', 'TO : 1 heure', 'TO : 5 heures'],
      2: ['Suppression', 'Avertissement', 'TO : 10 minutes', 'TO : 1 heure'],
      3: ['Suppression', 'Avertissement', 'Avertissement', 'TO : 10 minutes'],
    },
  },
  {
    name: 'Message inapproprié',
    summary: "Contenu déplacé qui n'entre dans aucune autre catégorie mais n'a pas sa place ici.",
    example: "Une blague sur un drame d'actualité pendant le live.",
    warningExample: 'Message inapproprié sur ce chat.',
    ladder: {
      1: ['TO : 10 minutes', 'TO : 1 heure', 'TO : 5 heures', 'TO : 1 jour'],
      2: ['Suppression', 'TO : 10 minutes', 'TO : 1 heure', 'TO : 5 heures'],
      3: ['Suppression', 'Avertissement', 'TO : 10 minutes', 'TO : 1 heure'],
    },
  },
  {
    name: 'Num. de tél. dans un pseudo',
    summary: 'Un numéro de téléphone affiché dans le pseudo, exposant une personne.',
    example: 'Un pseudo composé de dix chiffres présentés comme un numéro.',
    warningExample: 'Numéro de téléphone affiché dans le pseudo.',
    ladder: {
      1: ['TO : 5 heures', 'TO : 1 jour', 'TO : 7 jours', 'Bannissement définitif'],
      2: ['TO : 1 heure', 'TO : 5 heures', 'TO : 1 jour', 'TO : 7 jours'],
      3: ['TO : 10 minutes', 'TO : 1 heure', 'TO : 5 heures', 'TO : 1 jour'],
    },
  },
  {
    name: 'Participation volontaire à un cyberharcèlement',
    summary: 'Se joindre à une campagne visant une personne.',
    example: 'Un viewer relaie un raid contre un autre spectateur.',
    warningExample: 'Participation à un cyberharcèlement.',
    ladder: {
      1: ['Bannissement définitif'],
      2: ['Bannissement définitif'],
      3: ['TO : 14 jours', 'Bannissement définitif'],
    },
  },
  {
    name: 'Plainte envers un Modérateur',
    summary: "Contester publiquement une décision de modération au lieu d'en parler en privé.",
    example: '« ce modo abuse » répété pendant plusieurs minutes.',
    warningExample: 'Les décisions de modération se discutent en privé.',
    ladder: {
      1: ['TO : 10 minutes', 'TO : 1 heure', 'TO : 5 heures', 'TO : 1 jour'],
      2: ['Suppression', 'TO : 10 minutes', 'TO : 1 heure', 'TO : 5 heures'],
      3: ['Suppression', 'Avertissement', 'TO : 10 minutes', 'TO : 1 heure'],
    },
  },
  {
    name: 'Propos sexuels',
    summary: 'Contenu à caractère sexuel, explicite ou suggestif.',
    example: 'Une description sexuelle non sollicitée adressée au chat.',
    warningExample: 'Propos à caractère sexuel.',
    ladder: {
      1: ['TO : 5 heures', 'TO : 1 jour', 'TO : 7 jours', 'Bannissement définitif'],
      2: ['TO : 1 heure', 'TO : 5 heures', 'TO : 1 jour', 'TO : 7 jours'],
      3: ['TO : 10 minutes', 'TO : 1 heure', 'TO : 5 heures', 'TO : 1 jour'],
    },
  },
  {
    name: 'Propos suicidaires',
    summary:
      "Incitation au suicide ou banalisation de celui-ci. Un appel à l'aide se traite à part, avec les ressources adaptées.",
    example: 'Un message poussant explicitement un autre viewer à se faire du mal.',
    warningExample: 'Propos suicidaires ou incitation au suicide.',
    ladder: {
      1: ['Bannissement définitif'],
      2: ['Bannissement définitif'],
      3: ['TO : 14 jours', 'Bannissement définitif'],
    },
  },
  {
    name: 'Publicité',
    summary: 'Promouvoir une chaîne, un serveur ou un produit sans autorisation.',
    example: 'Un lien vers une autre chaîne collé dans le chat.',
    warningExample: "La publicité n'est pas autorisée sur ce chat.",
    ladder: {
      1: ['TO : 10 minutes', 'TO : 1 heure', 'TO : 5 heures', 'TO : 1 jour'],
      2: ['Suppression', 'TO : 10 minutes', 'TO : 1 heure', 'TO : 5 heures'],
      3: ['Suppression', 'Avertissement', 'TO : 10 minutes', 'TO : 1 heure'],
    },
  },
  {
    name: 'Spam en tout genre',
    summary: 'Message répétitif ou automatisé sans rapport avec le direct.',
    example: 'Un bot qui recolle le même texte toutes les trente secondes.',
    warningExample: 'Spam du chat.',
    ladder: {
      1: ['TO : 10 minutes', 'TO : 1 heure', 'TO : 5 heures', 'TO : 1 jour'],
      2: ['Suppression', 'TO : 10 minutes', 'TO : 1 heure', 'TO : 5 heures'],
      3: ['Suppression', 'Avertissement', 'TO : 10 minutes', 'TO : 1 heure'],
    },
  },
  {
    name: 'Démarchage et publicité illégale',
    summary: "Proposer un service frauduleux, un jeu d'argent ou un produit interdit.",
    example: 'Une offre de gains rapides avec un lien de parrainage.',
    warningExample: 'Démarchage ou publicité illégale.',
    ladder: {
      1: ['Bannissement définitif'],
      2: ['Bannissement définitif'],
      3: ['TO : 14 jours', 'Bannissement définitif'],
    },
  },
  {
    name: 'Spoil & Backseat',
    summary: "Dévoiler la suite ou souffler au créateur ce qu'il doit faire.",
    example: '« va à droite, le boss est là » pendant une découverte.',
    warningExample: "Merci d'éviter les spoils et le backseat.",
    ladder: {
      1: ['Suppression', 'TO : 10 minutes', 'TO : 1 heure', 'TO : 5 heures'],
      2: ['Suppression', 'Avertissement', 'TO : 10 minutes', 'TO : 1 heure'],
      3: ['Suppression', 'Avertissement', 'Avertissement', 'TO : 10 minutes'],
    },
  },
  {
    name: 'Doxxing',
    summary: 'Publier des informations privées sur une personne sans son accord.',
    example: 'Une adresse ou un nom réel posté dans le chat.',
    warningExample: "Publication d'informations privées.",
    ladder: {
      1: ['Bannissement définitif'],
      2: ['Bannissement définitif'],
      3: ['TO : 14 jours', 'Bannissement définitif'],
    },
  },
  {
    name: 'Underaged',
    summary: "Le spectateur est manifestement sous l'âge minimum de la plateforme.",
    example: 'Un viewer déclare avoir onze ans dans le chat.',
    warningExample: 'Âge inférieur au minimum requis par la plateforme.',
    ladder: {
      1: ['Bannissement définitif'],
      2: ['Bannissement définitif'],
      3: ['TO : 14 jours', 'Bannissement définitif'],
    },
  },
  {
    name: 'Menace grave à viewer',
    summary: 'Menacer physiquement ou moralement un autre spectateur.',
    example: '« je sais où tu habites » adressé à un pseudo.',
    warningExample: 'Menace grave envers un autre viewer.',
    ladder: {
      1: ['TO : 1 jour', 'TO : 7 jours', 'TO : 14 jours', 'Bannissement définitif'],
      2: ['TO : 5 heures', 'TO : 1 jour', 'TO : 7 jours', 'TO : 14 jours'],
      3: ['TO : 1 heure', 'TO : 5 heures', 'TO : 1 jour', 'TO : 7 jours'],
    },
  },
  {
    name: 'Menace grave à modo',
    summary: 'Menacer un membre de la modération.',
    example: 'Des menaces adressées à un modérateur après une sanction.',
    warningExample: 'Menace grave envers un membre de la modération.',
    ladder: {
      1: ['Bannissement définitif'],
      2: ['Bannissement définitif'],
      3: ['TO : 14 jours', 'Bannissement définitif'],
    },
  },
  {
    name: 'Menace grave à YouTubeur',
    summary: 'Menacer le créateur ou ses proches.',
    example: 'Une menace explicite visant le créateur.',
    warningExample: 'Menace grave envers le créateur.',
    ladder: {
      1: ['Bannissement définitif'],
      2: ['Bannissement définitif'],
      3: ['TO : 14 jours', 'Bannissement définitif'],
    },
  },
  {
    name: 'Menace grave à la Corp',
    summary: 'Menacer la structure, ses locaux ou ses équipes.',
    example: "Une menace visant les bureaux de l'organisation.",
    warningExample: 'Menace grave envers la structure.',
    ladder: {
      1: ['Bannissement définitif'],
      2: ['Bannissement définitif'],
      3: ['TO : 14 jours', 'Bannissement définitif'],
    },
  },
  {
    name: 'Sexisme & Machisme',
    summary: 'Propos rabaissant une personne pour son genre.',
    example: "Un message affirmant qu'une catégorie de personnes n'a pas sa place ici.",
    warningExample: 'Propos sexistes.',
    ladder: {
      1: ['TO : 5 heures', 'TO : 1 jour', 'TO : 7 jours', 'Bannissement définitif'],
      2: ['TO : 1 heure', 'TO : 5 heures', 'TO : 1 jour', 'TO : 7 jours'],
      3: ['TO : 10 minutes', 'TO : 1 heure', 'TO : 5 heures', 'TO : 1 jour'],
    },
  },
]
