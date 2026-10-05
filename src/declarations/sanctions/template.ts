import type { SanctionGravityName, SanctionPanelName } from '@/utils/constants/moderation'

/**
 * One step of a ladder
 * @typedef {Object} SanctionRungSeed
 * @property {string} condition - When it applies
 * @property {string[]} measures - Measure names
 */

export interface SanctionRungSeed {
  condition: string
  measures: string[]
}

/**
 * How one offence is handled inside one livecon level
 * @typedef {Object} SanctionLevelSeed
 * @property {SanctionGravityName} gravity - Weight of the offence at this level
 * @property {SanctionRungSeed[]} ladder - Steps
 */

export interface SanctionLevelSeed {
  gravity: SanctionGravityName
  ladder: SanctionRungSeed[]
}

/**
 * One offence of a reference panel. {creator} and {CREATOR} name the creator it is cloned for
 * @typedef {Object} SanctionOffenseSeed
 * @property {string} name - Display name
 * @property {string} summary - What the offence covers
 * @property {string[]} examples - Messages to moderate
 * @property {string[]} tolerated - Close messages left alone
 * @property {string | null} warningExample - Reason a moderator can paste
 * @property {Record<number, SanctionLevelSeed>} levels - Handling per livecon level
 */

export interface SanctionOffenseSeed {
  name: string
  summary: string
  examples: string[]
  tolerated: string[]
  warningExample: string | null
  levels: Record<number, SanctionLevelSeed>
}

/**
 * Reference Twitch panel
 * @type {readonly SanctionOffenseSeed[]}
 */

const TWITCH_PANEL: readonly SanctionOffenseSeed[] = [
  {
    name: 'Autre langue',
    summary:
      'Certaines personnes parlent dans une autre langue dans le chat mais malheureusement nous n’**acceptons que le français**.\n\nPense à vérifier si la phrase dite n’est pas propice à une insulte, ou un propos dénigrant. Si cela est le cas, utilise la sanction « Dès constaté • Si insulte » ci-dessous.',
    examples: ['Hello how are you today {creator}'],
    tolerated: [],
    warningExample:
      "Hello, écrire dans une autre langue que le français et/ou avec des caractères non latins n'est pas permis sur le chat de {creator}. Merci pour ta compréhension, bon live à toi !",
    levels: {
      3: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression', 'Avertissement'] },
          { condition: 'Dès constaté • Si insulte', measures: ['Suppression', 'TO : 10 minutes'] },
          { condition: 'Si récidive', measures: ['TO : 1 heure'] },
          { condition: 'Ne fait que ça', measures: ['TO : 5 heures'] },
        ],
      },
      2: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression'] },
          { condition: '1re récidive', measures: ['Avertissement'] },
          { condition: '2e récidive', measures: ['TO : 10 minutes'] },
          { condition: '3e récidive', measures: ['TO : 1 heure'] },
        ],
      },
      1: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression'] },
          { condition: '1re récidive', measures: ['TO : 10 minutes'] },
          { condition: '2e récidive', measures: ['TO : 1 heure'] },
          { condition: '3e récidive', measures: ['TO : 5 heures'] },
        ],
      },
    },
  },
  {
    name: 'Contournement de sanctions',
    summary:
      "Lorsqu’un message apparaît en rouge comme « potentiel contournement de sanction », nous n’intervenons pas forcément, cela dépendra de la situation et concertation auprès de l'équipe..",
    examples: [],
    tolerated: [],
    warningExample: null,
    levels: {
      3: {
        gravity: 'LOW',
        ladder: [],
      },
      2: {
        gravity: 'LOW',
        ladder: [{ condition: 'Dès constaté', measures: ['Bannissement définitif'] }],
      },
      1: {
        gravity: 'LOW',
        ladder: [{ condition: 'Dès constaté', measures: ['Bannissement définitif'] }],
      },
    },
  },
  {
    name: 'Demande de dédicace',
    summary:
      'Certaines personnes profitent du live pour demander des dédicaces, ce qui peut nuire à l’ambiance du chat et gêner le bon déroulement du live.\n\nLe mot « Dédicace » et ses variantes sont **supprimés automatiquement** par NightBot. Pense à vérifier qu’aucun mot ne passe.',
    examples: ['{creator} dédicace moi stp !!!'],
    tolerated: [],
    warningExample:
      'Hello, {creator} ne peut malheureusement pas répondre aux demandes de dédicaces pendant ses lives. Merci pour ta compréhension, bon live à toi !',
    levels: {
      3: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression'] },
          { condition: 'Si spam', measures: ['Suppression', 'Avertissement'] },
          { condition: 'Récidive après averto', measures: ['TO : 30 minutes'] },
          { condition: 'Ne fait plus que ça', measures: ['TO : 1 heure'] },
        ],
      },
      2: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression'] },
          { condition: '1re récidive', measures: ['Avertissement'] },
          { condition: '2e récidive', measures: ['TO : 10 minutes'] },
          { condition: '3e récidive', measures: ['TO : 1 heure'] },
        ],
      },
      1: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression'] },
          { condition: '1re récidive', measures: ['TO : 10 minutes'] },
          { condition: '2e récidive', measures: ['TO : 1 heure'] },
          { condition: '3e récidive', measures: ['TO : 5 heures'] },
        ],
      },
    },
  },
  {
    name: 'Flood excessif',
    summary:
      'Lorsqu’une personne perturbe le chat en envoyant ostensiblement de l’excessivité dans ses messages.\n\n**Il faut savoir faire la différence entre l’euphorie et la démesure avant d’agir.** Par exemple, si {creator} le demande ou si la situation s’y prête dans ce cas là, c’est acceptable.',
    examples: [
      '{creator}uuuuuuu, ❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️ (sur plusieurs lignes)',
    ],
    tolerated: ['{CREATOR}UUUUUUUUU, ❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️'],
    warningExample:
      'Hello, le flood excessif gêne la lecture du chat. En cas de récidive, ça peut entraîner une sanction. Merci pour ta compréhension et bon live !',
    levels: {
      3: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression', 'Avertissement'] },
          { condition: '1re récidive', measures: ['TO : 5 minutes'] },
          { condition: '2e récidive', measures: ['TO : 30 minutes'] },
          { condition: '3e récidive', measures: ['TO : 5 heures'] },
        ],
      },
      2: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression'] },
          { condition: '1re récidive', measures: ['TO : 10 minutes'] },
          { condition: '2e récidive', measures: ['TO : 1 heure'] },
          { condition: '3e récidive', measures: ['TO : 5 heures'] },
        ],
      },
      1: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['TO : 10 minutes'] },
          { condition: '1re récidive', measures: ['TO : 1 heure'] },
          { condition: '2e récidive', measures: ['TO : 5 heures'] },
          { condition: '3e récidive', measures: ['TO : 1 jour'] },
        ],
      },
    },
  },
  {
    name: 'Grossièreté',
    summary:
      "Certains viewers sont grossiers en disant des petites insultes **sans grande gravité**. Attention cependant, cela peut être bon enfant. Il faut savoir le dissocier selon la situation et l'ambiance du live.",
    examples: ['T’es con {creator} !', 'Les modos vous êtes des méchants'],
    tolerated: [],
    warningExample:
      'Il est important de rester respectueux dans tes messages, ceci est sujet à une sanction. Merci pour ta compréhension et bon live !',
    levels: {
      3: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['Aucune action'] },
          { condition: '1re récidive', measures: ['Avertissement'] },
          { condition: '2e récidive', measures: ['Suppression'] },
          { condition: '3e récidive', measures: ['TO : 10 minutes'] },
        ],
      },
      2: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression'] },
          { condition: '1re récidive', measures: ['Avertissement'] },
          { condition: '2e récidive', measures: ['TO : 10 minutes'] },
          { condition: '3e récidive', measures: ['TO : 1 heure'] },
        ],
      },
      1: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression'] },
          { condition: '1re récidive', measures: ['TO : 10 minutes'] },
          { condition: '2e récidive', measures: ['TO : 1 heure'] },
          { condition: '3e récidive', measures: ['TO : 5 heures'] },
        ],
      },
    },
  },
  {
    name: 'Insulte grave → viewer',
    summary:
      'Certains membres du chat profitent de l’enchaînement de plusieurs messages dans le chat pour **insulter d’autres membres**.',
    examples: ['Lucas espèce de sale fils de p%@*'],
    tolerated: [],
    warningExample: 'Merci de cesser immédiatement les insultes sous peine de sanction.',
    levels: {
      3: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression', 'Avertissement'] },
          { condition: '1re récidive', measures: ['TO : 1 heure'] },
          { condition: '2e récidive', measures: ['TO : 5 heures'] },
        ],
      },
      2: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['TO : 1 heure'] },
          { condition: '1re récidive', measures: ['TO : 5 heures'] },
          { condition: '2e récidive', measures: ['TO : 1 jour'] },
          { condition: '3e récidive', measures: ['TO : 7 jours'] },
        ],
      },
      1: {
        gravity: 'MEDIUM',
        ladder: [
          { condition: 'Dès constaté', measures: ['TO : 5 heures'] },
          { condition: '1re récidive', measures: ['TO : 1 jour'] },
          { condition: '2e récidive', measures: ['TO : 7 jours'] },
          { condition: '3e récidive', measures: ['Bannissement définitif'] },
        ],
      },
    },
  },
  {
    name: 'Majuscule',
    summary:
      'Les majuscules, c’est assez controversé : soit c’est inutile, soit c’est pénible pour l’utilisateur. Les majuscules sont aussi un moyen de capter l’attention, ce sont alors deux choses différentes.\n\nOn ne modère les majuscules que si c’est **à outrance**, quand ça empiète sur le confort visuel de la communauté ou des modérateurs.\n\n> Ce n’est pas parce qu’il y a des majuscules que c’est obligatoirement à modérer. Tout dépend du contenu et de la longueur du message.',
    examples: [
      '{CREATOR} AUJOURD’HUI J’AI ENTERRE MON POISSON ROUGE, IL ETAIT VIEUX IL AVAIT 3 JOURS, JE LE VOYAIS PLUS BOUGER APRES LUI AVOIR DONNE MON REDBULL : DONNE DES AIIIIIIILESSSSSSSSSSSSSSSSSSSSSS',
    ],
    tolerated: ['{CREATOR} CA VA, MOI CA VA BIEN ?'],
    warningExample:
      'Salut chef, attention à ne pas trop écrire en majuscule, ça peut vite être gênant pour les autres viewers. Merci pour ta compréhension et bon live !',
    levels: {
      3: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['Aucune action'] },
          { condition: '1re récidive', measures: ['Suppression', 'Avertissement'] },
          { condition: '2e récidive', measures: ['TO : 5 minutes'] },
          { condition: '3e récidive', measures: ['TO : 30 minutes'] },
        ],
      },
      2: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression'] },
          { condition: '1re récidive', measures: ['Avertissement'] },
          { condition: '2e récidive', measures: ['TO : 10 minutes'] },
          { condition: '3e récidive', measures: ['TO : 1 heure'] },
        ],
      },
      1: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression'] },
          { condition: '1re récidive', measures: ['TO : 10 minutes'] },
          { condition: '2e récidive', measures: ['TO : 1 heure'] },
          { condition: '3e récidive', measures: ['TO : 5 heures'] },
        ],
      },
    },
  },
  {
    name: 'Message inapproprié',
    summary:
      'Un message est défini comme inapproprié lorsqu’il n’est **pas directement offensant** envers une personne mais qu’il perturbe le chat. Il peut être défini comme un **message puéril**.\n\n> Ce n’est pas parce qu’un message est inapproprié qu’il est forcément à modérer. Tout dépend du contenu et de la longueur du message.',
    examples: ["Caca (j'ai pas eu d'autres idées jugez pas)"],
    tolerated: [],
    warningExample:
      'Merci de ne pas poster ce genre de messages à outrance, ça peut gêner la lecture du chat. Merci pour ta compréhension et bon live !',
    levels: {
      3: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression'] },
          { condition: '1re récidive', measures: ['Suppression', 'Avertissement'] },
          { condition: '2e récidive', measures: ['TO : 5 minutes'] },
          { condition: '3e récidive', measures: ['TO : 30 minutes'] },
        ],
      },
      2: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression'] },
          { condition: '1re récidive', measures: ['TO : 10 minutes'] },
          { condition: '2e récidive', measures: ['TO : 1 heure'] },
          { condition: '3e récidive', measures: ['TO : 5 heures'] },
        ],
      },
      1: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['TO : 10 minutes'] },
          { condition: '1re récidive', measures: ['TO : 1 heure'] },
          { condition: '2e récidive', measures: ['TO : 5 heures'] },
          { condition: '3e récidive', measures: ['TO : 1 jour'] },
        ],
      },
    },
  },
  {
    name: 'Numéro de téléphone dans le pseudo',
    summary:
      'Un pseudo peut contenir des informations sensibles, notamment un numéro de téléphone. C’est assez commun mais doit être pris en compte **uniquement si la personne est active** dans le chat.',
    examples: ['0607080910 : Coucou le chat !!'],
    tolerated: [],
    warningExample:
      "Ton pseudo n'est pas conforme, tu es banni le temps que tu ne le changes pas. Lorsque ce sera fait, tu pourras effectuer une demande de débannissement qui sera acceptée si celle-ci est constructive.",
    levels: {
      3: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['Avertissement', 'TO : 1 heure'] },
          { condition: '1re récidive', measures: ['TO : 1 jour'] },
          { condition: '2e récidive', measures: ['TO : 7 jours'] },
        ],
      },
      2: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['TO : 1 heure'] },
          { condition: '1re récidive', measures: ['TO : 5 heures'] },
          { condition: '2e récidive', measures: ['TO : 1 jour'] },
          { condition: '3e récidive', measures: ['TO : 7 jours'] },
        ],
      },
      1: {
        gravity: 'MEDIUM',
        ladder: [
          { condition: 'Dès constaté', measures: ['TO : 5 heures'] },
          { condition: '1re récidive', measures: ['TO : 1 jour'] },
          { condition: '2e récidive', measures: ['TO : 7 jours'] },
          { condition: '3e récidive', measures: ['Bannissement définitif'] },
        ],
      },
    },
  },
  {
    name: 'Participation volontaire à un harcèlement',
    summary:
      'Cette section regroupe les cas où un viewer prend part activement à une situation de harcèlement visant un autre viewer, un membre de l’équipe ou même le créateur.',
    examples: [
      'T’es vraiment trop c*n Mathis, tu sais pas écrire t’es un golm**!! (suivi d’autres membres)',
    ],
    tolerated: [],
    warningExample: null,
    levels: {
      3: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['TO : 5 heures'] },
          { condition: '1re récidive', measures: ['TO : 1 jour'] },
          { condition: '2e récidive', measures: ['TO : 7 jours'] },
        ],
      },
      2: {
        gravity: 'HIGH',
        ladder: [{ condition: 'Dès constaté', measures: ['Bannissement définitif'] }],
      },
      1: {
        gravity: 'HIGH',
        ladder: [{ condition: 'Dès constaté', measures: ['Bannissement définitif'] }],
      },
    },
  },
  {
    name: 'Plainte envers la modération',
    summary:
      'Certains membres réfutent les actions des modérateurs dans différents buts, et cela peut nuire au bon déroulement du chat par une plainte excessive et traînante dans la durée.',
    examples: ['Les modos ils suppriment pour rien !!', 'Bavure des modos, honte à eux !!'],
    tolerated: [],
    warningExample:
      "Merci de rester respectueux ! Si tu as une plainte, je te conseille dez te diriger sur Discord et d'en référer à mes responsables.",
    levels: {
      3: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression', 'Avertissement'] },
          { condition: 'Si spam', measures: ['TO : 5 heures'] },
          { condition: 'Si cale une insulte', measures: ['TO : 7 jours'] },
        ],
      },
      2: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression'] },
          { condition: '1re récidive', measures: ['TO : 10 minutes'] },
          { condition: '2e récidive', measures: ['TO : 1 heure'] },
          { condition: '3e récidive', measures: ['TO : 5 heures'] },
        ],
      },
      1: {
        gravity: 'HIGH',
        ladder: [
          { condition: 'Dès constaté', measures: ['TO : 10 minutes'] },
          { condition: '1re récidive', measures: ['TO : 1 heure'] },
          { condition: '2e récidive', measures: ['TO : 5 heures'] },
          { condition: '3e récidive', measures: ['TO : 1 jour'] },
        ],
      },
    },
  },
  {
    name: 'Publicité',
    summary:
      "Lorsqu'un viewer fait la promotion d’un produit, d’un service ou d’une chaîne Twitch/YouTube, cela est considéré comme de la publicité et est **interdit sur le chat** (Sur Twitch tout court).\n\n> Il est important de noter que la publicité peut être faite de manière subtile, par exemple en mentionnant un lien ou en parlant d’un produit sans le nommer directement. Dans ces cas-là, il est recommandé de supprimer le message et d’avertir le viewer.",
    examples: [
      'J’ai sorti une vidéo youtube sur mon poisson rouge qui a bu du Redbull, venaiit vous abonnés à moi',
    ],
    tolerated: [],
    warningExample:
      'La publicité est interdite sur le chat, ceci est sujet à une sanction. Merci pour ta compréhension et bon live !',
    levels: {
      3: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression', 'Avertissement'] },
          { condition: '1re récidive', measures: ['TO : 30 minutes'] },
          { condition: '2e récidive', measures: ['TO : 5 heures'] },
          { condition: '3e récidive', measures: ['TO : 1 jour'] },
        ],
      },
      2: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression'] },
          { condition: '1re récidive', measures: ['TO : 10 minutes'] },
          { condition: '2e récidive', measures: ['TO : 1 heure'] },
          { condition: '3e récidive', measures: ['TO : 5 heures'] },
        ],
      },
      1: {
        gravity: 'MEDIUM',
        ladder: [
          { condition: 'Dès constaté', measures: ['TO : 10 minutes'] },
          { condition: '1re récidive', measures: ['TO : 1 heure'] },
          { condition: '2e récidive', measures: ['TO : 5 heures'] },
          { condition: '3e récidive', measures: ['TO : 1 jour'] },
        ],
      },
    },
  },
  {
    name: 'Spam',
    summary:
      '**Le spam est sujet à une refonte complète côté Modération.**\n\nUn spam est un amas de messages qui se suivent très **rapidement**. Un viewer qui écrit le même message 5 fois entre 22h00 et 22h01, c’est perturbant : c’est du spam. S’il l’écrit 5 fois entre 22h et 22h15, c’est suffisamment espacé : ce n’est pas du spam.\n\n> Concrètement, base-toi sur le **visuel** du chat et le confort des viewers.',
    examples: ['22h01 : {creator} répond moi stpppp !! (×5 dans la même minute)'],
    tolerated: [
      '22h01, 22h05, 22h12, 22h28, 22h46 : {creator} répond moi stpppp !! (même message, espacé : on ne supprime même pas)',
    ],
    warningExample:
      'Envoyer le même message aussi rapidement est très dérangeant pour les autres viewers. Ceci est sujet à une sanction. Merci pour ta compréhension et bon live !',
    levels: {
      3: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['Aucune action'] },
          { condition: '1re récidive', measures: ['Suppression', 'Avertissement'] },
          { condition: '2e récidive', measures: ['TO : 5 minutes'] },
          { condition: '3e récidive', measures: ['TO : 30 minutes'] },
        ],
      },
      2: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression'] },
          { condition: '1re récidive', measures: ['TO : 10 minutes'] },
          { condition: '2e récidive', measures: ['TO : 1 heure'] },
          { condition: '3e récidive', measures: ['TO : 5 heures'] },
        ],
      },
      1: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['TO : 10 minutes'] },
          { condition: '1re récidive', measures: ['TO : 1 heure'] },
          { condition: '2e récidive', measures: ['TO : 5 heures'] },
          { condition: '3e récidive', measures: ['TO : 1 jour'] },
        ],
      },
    },
  },
  {
    name: 'Propos sexuels',
    summary:
      'Certains membres peuvent tenir des propos à connotation sexuelle explicite, y compris les **insinuations sexuelles** ou toute forme de message à **connotation sexuelle**.',
    examples: ['{creator} s*ce moi'],
    tolerated: [],
    warningExample: null,
    levels: {
      3: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['TO : 1 heure'] },
          { condition: '1re récidive', measures: ['TO : 7 jours'] },
          { condition: '2e récidive', measures: ['TO : 14 jours'] },
        ],
      },
      2: {
        gravity: 'MEDIUM',
        ladder: [
          { condition: 'Dès constaté', measures: ['TO : 1 heure'] },
          { condition: '1re récidive', measures: ['TO : 5 heures'] },
          { condition: '2e récidive', measures: ['TO : 1 jour'] },
          { condition: '3e récidive', measures: ['TO : 7 jours'] },
        ],
      },
      1: {
        gravity: 'HIGH',
        ladder: [
          { condition: 'Dès constaté', measures: ['TO : 5 heures'] },
          { condition: '1re récidive', measures: ['TO : 1 jour'] },
          { condition: '2e récidive', measures: ['TO : 7 jours'] },
          { condition: '3e récidive', measures: ['Bannissement définitif'] },
        ],
      },
    },
  },
  {
    name: 'Spoil & backseat',
    summary:
      'Le spoil, c’est révéler des éléments clés d’un jeu (événements à venir, solutions, fin de l’histoire) alors qu’ils n’ont pas encore été découverts. Selon le contexte et le type de jeu, seuls les spoils révélant des informations majeures ou déterminantes sont sanctionnés.\n\n> Si {creator} demande de l’aide, les réponses ne sont pas du spoil : adapte-toi à sa demande et ne sanctionne pas.',
    examples: [
      '{creator}!! L’imposteur c’est Flamby!',
      '{creator}!! Tu vas voir dans la prochaine scène y’aura un mort',
    ],
    tolerated: [],
    warningExample: null,
    levels: {
      3: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['TO : 30 minutes'] },
          { condition: '1re récidive', measures: ['TO : 5 heures'] },
          { condition: '2e récidive', measures: ['TO : 1 jour'] },
        ],
      },
      2: {
        gravity: 'LOW',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression'] },
          { condition: '1re récidive', measures: ['Avertissement'] },
          { condition: '2e récidive', measures: ['TO : 10 minutes'] },
          { condition: '3e récidive', measures: ['TO : 1 heure'] },
        ],
      },
      1: {
        gravity: 'MEDIUM',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression'] },
          { condition: '1re récidive', measures: ['TO : 10 minutes'] },
          { condition: '2e récidive', measures: ['TO : 1 heure'] },
          { condition: '3e récidive', measures: ['TO : 5 heures'] },
        ],
      },
    },
  },
  {
    name: 'Insulte grave → l’équipe',
    summary:
      'Un viewer peut devenir insultant envers l’équipe dans le chat ou dans les chuchotements, soit parce qu’une action à son égard ne lui a pas plu, soit par pure envie d’insulter. Dans les deux cas, tu n’as pas à subir cela.\n\n> La sévérité de la sanction est **proportionnelle à la gravité de l’insulte**. Une insulte grave peut entraîner un **TO : 1 jour** sans passer par les autres sanctions d’abord.\n\n**En cas de bannissement définitif**, ajoute un commentaire indiquant la raison du bannissement et le contexte si nécessaire.',
    examples: ['Le modo qui m’a sanctionné t’es qu’un fideup, va te chercher un emploi !!'],
    tolerated: [],
    warningExample: null,
    levels: {
      3: {
        gravity: 'MEDIUM',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression', 'TO : 5 heures'] },
          { condition: '1re récidive', measures: ['TO : 1 jour'] },
          { condition: '2e récidive', measures: ['TO : 14 jours'] },
          { condition: '3e récidive', measures: ['Bannissement définitif', 'Commentaire'] },
        ],
      },
      2: {
        gravity: 'MEDIUM',
        ladder: [
          { condition: 'Dès constaté', measures: ['TO : 5 heures'] },
          { condition: '1re récidive', measures: ['TO : 1 jour'] },
          { condition: '2e récidive', measures: ['TO : 7 jours'] },
          { condition: '3e récidive', measures: ['TO : 14 jours'] },
        ],
      },
      1: {
        gravity: 'HIGH',
        ladder: [
          { condition: 'Dès constaté', measures: ['TO : 1 jour'] },
          { condition: '1re récidive', measures: ['TO : 7 jours'] },
          { condition: '2e récidive', measures: ['TO : 14 jours'] },
          { condition: '3e récidive', measures: ['Bannissement définitif'] },
        ],
      },
    },
  },
  {
    name: 'Insulte grave → {creator}',
    summary:
      'Certains membres profitent des dramas ou d’une situation pour attaquer directement {creator}. Si un membre arrive sur le live en disant juste « fdp », l’insulte est considérée envers {creator}.\n\n> La sévérité de la sanction est **proportionnelle à la gravité de l’insulte**. Une insulte grave peut entraîner un **TO : 1 jour** sans passer par les autres sanctions d’abord.\n\n**En cas de bannissement définitif**, ajoute un commentaire indiquant la raison du bannissement et le contexte si nécessaire.',
    examples: ['{creator} j’te b*, sale fils de ****'],
    tolerated: [],
    warningExample: null,
    levels: {
      3: {
        gravity: 'MEDIUM',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression', 'TO : 5 heures'] },
          { condition: '1re récidive', measures: ['TO : 1 jour'] },
          { condition: '2e récidive', measures: ['TO : 14 jours'] },
          { condition: '3e récidive', measures: ['Bannissement définitif', 'Commentaire'] },
        ],
      },
      2: {
        gravity: 'HIGH',
        ladder: [
          { condition: 'Dès constaté', measures: ['TO : 5 heures'] },
          { condition: '1re récidive', measures: ['TO : 1 jour'] },
          { condition: '2e récidive', measures: ['TO : 7 jours'] },
          { condition: '3e récidive', measures: ['TO : 14 jours'] },
        ],
      },
      1: {
        gravity: 'HIGH',
        ladder: [
          { condition: 'Dès constaté', measures: ['TO : 1 jour'] },
          { condition: '1re récidive', measures: ['TO : 7 jours'] },
          { condition: '2e récidive', measures: ['TO : 14 jours'] },
          { condition: '3e récidive', measures: ['Bannissement définitif'] },
        ],
      },
    },
  },
  {
    name: 'Insulte grave → personnalité',
    summary:
      'Toute insulte ou attaque envers une personnalité. Si un membre arrive sur le live en disant juste « fdp », l’insulte est considérée envers {creator}.\n\n> La sévérité de la sanction est **proportionnelle à la gravité de l’insulte**. Une insulte grave peut entraîner un **TO : 1 jour** sans passer par les autres sanctions d’abord.\n\n**En cas de bannissement définitif**, ajoute un commentaire indiquant la raison du bannissement et le contexte si nécessaire.',
    examples: ['Squeezie est vraiment FD* de merde'],
    tolerated: [],
    warningExample: null,
    levels: {
      3: {
        gravity: 'MEDIUM',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression', 'TO : 1 heure'] },
          { condition: '1re récidive', measures: ['TO : 5 heures'] },
          { condition: '2e récidive', measures: ['TO : 7 jours'] },
          { condition: '3e récidive', measures: ['Bannissement définitif', 'Commentaire'] },
        ],
      },
      2: {
        gravity: 'MEDIUM',
        ladder: [
          { condition: 'Dès constaté', measures: ['TO : 5 heures'] },
          { condition: '1re récidive', measures: ['TO : 1 jour'] },
          { condition: '2e récidive', measures: ['TO : 7 jours'] },
          { condition: '3e récidive', measures: ['TO : 14 jours'] },
        ],
      },
      1: {
        gravity: 'HIGH',
        ladder: [
          { condition: 'Dès constaté', measures: ['TO : 1 jour'] },
          { condition: '1re récidive', measures: ['TO : 7 jours'] },
          { condition: '2e récidive', measures: ['TO : 14 jours'] },
          { condition: '3e récidive', measures: ['Bannissement définitif'] },
        ],
      },
    },
  },
  {
    name: 'Sexisme & machisme',
    summary:
      'Un membre peut tenir des propos dévalorisants fondés sur des stéréotypes de genre ou une hypersexualisation. Le machisme vient nourrir ce genre de propos.\n\n**En cas de bannissement définitif**, ajoute un commentaire indiquant la raison du bannissement et le contexte si nécessaire.',
    examples: [
      '(doux) Les meufs à la cuisine',
      '(doux) Elle fée le ménage',
      '(grave) Elle est habillée comme une p*te',
      '(grave) Un homme comme toi devrait se comporter comme un vrai mâle, pas comme une tapette',
    ],
    tolerated: [],
    warningExample: null,
    levels: {
      3: {
        gravity: 'HIGH',
        ladder: [
          { condition: 'Si doux', measures: ['TO : 7 jours'] },
          { condition: 'Si doux • Récidive', measures: ['Bannissement définitif', 'Commentaire'] },
          { condition: 'Si insulte grave', measures: ['Bannissement définitif', 'Commentaire'] },
        ],
      },
      2: {
        gravity: 'HIGH',
        ladder: [
          { condition: 'Dès constaté', measures: ['TO : 1 heure'] },
          { condition: '1re récidive', measures: ['TO : 5 heures'] },
          { condition: '2e récidive', measures: ['TO : 1 jour'] },
          { condition: '3e récidive', measures: ['TO : 7 jours'] },
        ],
      },
      1: {
        gravity: 'HIGH',
        ladder: [
          { condition: 'Dès constaté', measures: ['TO : 5 heures'] },
          { condition: '1re récidive', measures: ['TO : 1 jour'] },
          { condition: '2e récidive', measures: ['TO : 7 jours'] },
          { condition: '3e récidive', measures: ['Bannissement définitif'] },
        ],
      },
    },
  },
  {
    name: 'Doxxing',
    summary:
      'La divulgation d’informations personnelles, dite « doxxing », consiste à dévoiler des informations sensibles : carte bancaire, adresse, orientation sexuelle…\n\n> On ne dissocie pas l’appartenance. Tout doxxing est jugé à la même hauteur, que ce soient les informations de la personne elle-même ou celles d’un autre. On n’aura jamais la certitude de la véracité, alors on part du principe que ça appartient à quelqu’un d’autre.\n\n**En cas de bannissement définitif**, ajoute un commentaire indiquant la raison du bannissement et le contexte si nécessaire.',
    examples: ['Numéro : 07 68 68 62 38', 'Adresse : 18 rue du papillon, Lyon'],
    tolerated: [],
    warningExample:
      'Envoyer des informations personnelles dans le chat n’est pas permis, ceci est sujet à une sanction. Merci pour ta compréhension et bon live !',
    levels: {
      3: {
        gravity: 'HIGH',
        ladder: [
          { condition: 'Numéro de téléphone', measures: ['Bannissement définitif', 'Commentaire'] },
          { condition: 'Carte bancaire', measures: ['Bannissement définitif', 'Commentaire'] },
          { condition: 'Adresse postale', measures: ['Bannissement définitif', 'Commentaire'] },
          { condition: 'Orientation sexuelle', measures: ['Suppression', 'TO : 1 jour'] },
          { condition: 'Prénom / Nom', measures: ['Suppression', 'Avertissement'] },
          { condition: 'Prénom / Nom • Récidive', measures: ['Suppression', 'TO : 5 heures'] },
        ],
      },
      2: {
        gravity: 'HIGH',
        ladder: [{ condition: 'Dès constaté', measures: ['Bannissement définitif'] }],
      },
      1: {
        gravity: 'HIGH',
        ladder: [{ condition: 'Dès constaté', measures: ['Bannissement définitif'] }],
      },
    },
  },
  {
    name: 'En dessous de l’âge légal requis',
    summary:
      'En France, l’âge légal requis est de 15 ans, en Belgique 13 ans. Par souci d’égalité, on intervient uniquement lorsque l’âge dévoilé est en dessous de 13 ans, sauf si la personne écrit explicitement être française.\n\n**Il est interdit de demander l’âge de la personne.** Elle doit l’avoir dit de son plein gré, sans qu’on l’y pousse.\n\nAjoute un commentaire indiquant la raison du bannissement et le contexte si nécessaire.\n\n**Signalement à Twitch** : Signalement → Utilisateur (avatar, points de chaîne, panneaux, tags, etc.) → Rechercher → Utilisateur qui n’a pas l’âge requis. [Conditions d’utilisation de Twitch](https://legal.twitch.com/en/legal/terms-of-service/)',
    examples: [],
    tolerated: [],
    warningExample: null,
    levels: {
      3: {
        gravity: 'HIGH',
        ladder: [
          {
            condition: 'Dès constaté',
            measures: ['Bannissement définitif', 'Commentaire', 'Signalement'],
          },
        ],
      },
      2: {
        gravity: 'HIGH',
        ladder: [
          {
            condition: 'Dès constaté',
            measures: ['Bannissement définitif', 'Commentaire', 'Signalement'],
          },
        ],
      },
      1: {
        gravity: 'HIGH',
        ladder: [
          {
            condition: 'Dès constaté',
            measures: ['Bannissement définitif', 'Commentaire', 'Signalement'],
          },
        ],
      },
    },
  },
  {
    name: 'Menace → l’équipe',
    summary:
      'On parle de **menace envers l’équipe** lorsqu’elle vise la structure du créateur, la Marsha Squad ou nos partenaires.\n\n**En cas de bannissement définitif**, ajoute un commentaire indiquant la raison du bannissement et le contexte si nécessaire.',
    examples: ['Les modos je vais vous retrouver et vous déf*****, vous allez voir!'],
    tolerated: [],
    warningExample: null,
    levels: {
      3: {
        gravity: 'HIGH',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression', 'TO : 7 jours'] },
          { condition: 'Si récidive', measures: ['Bannissement définitif', 'Commentaire'] },
        ],
      },
      2: {
        gravity: 'HIGH',
        ladder: [{ condition: 'Dès constaté', measures: ['Bannissement définitif'] }],
      },
      1: {
        gravity: 'HIGH',
        ladder: [{ condition: 'Dès constaté', measures: ['Bannissement définitif'] }],
      },
    },
  },
  {
    name: 'Menace → {creator}',
    summary:
      'Une **menace envers {creator}** est souvent explicite, liée aux dramas du moment. Même si ce n’est pas le sujet du live, on ne laisse passer aucun drama, donc aucune menace.\n\n**En cas de bannissement définitif**, ajoute un commentaire indiquant la raison du bannissement et le contexte si nécessaire.',
    examples: ['{creator} si je te vois je te corrige.'],
    tolerated: [],
    warningExample: null,
    levels: {
      3: {
        gravity: 'HIGH',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression', 'TO : 7 jours'] },
          { condition: 'Si récidive', measures: ['Bannissement définitif', 'Commentaire'] },
        ],
      },
      2: {
        gravity: 'HIGH',
        ladder: [{ condition: 'Dès constaté', measures: ['Bannissement définitif'] }],
      },
      1: {
        gravity: 'HIGH',
        ladder: [{ condition: 'Dès constaté', measures: ['Bannissement définitif'] }],
      },
    },
  },
  {
    name: 'Menace → viewer',
    summary:
      'Un viewer peut tenir des **propos menaçants ou intimidants envers un autre membre du chat**. C’est d’une gravité sans précédent, avec des répercussions possibles. Il est impératif de réagir rapidement.\n\n**En cas de bannissement définitif**, ajoute un commentaire indiquant la raison du bannissement et le contexte si nécessaire.',
    examples: ['Je vais te retrouver et te foutre en s*ng @viewer'],
    tolerated: [],
    warningExample: null,
    levels: {
      3: {
        gravity: 'MEDIUM',
        ladder: [
          { condition: 'Dès constaté', measures: ['TO : 7 jours'] },
          { condition: '1re récidive', measures: ['TO : 14 jours'] },
          { condition: '2e récidive', measures: ['Bannissement définitif', 'Commentaire'] },
        ],
      },
      2: {
        gravity: 'HIGH',
        ladder: [
          { condition: 'Dès constaté', measures: ['TO : 5 heures'] },
          { condition: '1re récidive', measures: ['TO : 1 jour'] },
          { condition: '2e récidive', measures: ['TO : 7 jours'] },
          { condition: '3e récidive', measures: ['TO : 14 jours'] },
        ],
      },
      1: {
        gravity: 'HIGH',
        ladder: [
          { condition: 'Dès constaté', measures: ['TO : 1 jour'] },
          { condition: '1re récidive', measures: ['TO : 7 jours'] },
          { condition: '2e récidive', measures: ['TO : 14 jours'] },
          { condition: '3e récidive', measures: ['Bannissement définitif'] },
        ],
      },
    },
  },
  {
    name: 'Démarchage et publicité illégaux',
    summary:
      '**Démarchage illégal** : tout contact dans le chat ou en chuchotements visant à **vendre un service illégal** ou à **rediriger vers un autre projet** sans consentement explicite relève du démarchage abusif.\n\n**Publicité illégale** : toute promotion sans accord peut enfreindre la loi si elle est **trompeuse ou mensongère** (article L121-1 du Code de la consommation) ou concerne des **produits interdits** (drogues, contrefaçons…).\n\n**En cas de bannissement définitif**, ajoute un commentaire indiquant la raison du bannissement et le contexte si nécessaire.',
    examples: [
      'Je vends des nitros moins chers pour éviter qu’on vous arnaque, venez',
      'Un lien vers un site de paris, sans avertissement légal',
    ],
    tolerated: [],
    warningExample: null,
    levels: {
      3: {
        gravity: 'MEDIUM',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression', 'TO : 5 heures'] },
          { condition: '1re récidive', measures: ['TO : 14 jours'] },
          { condition: '2e récidive', measures: ['Bannissement définitif', 'Commentaire'] },
        ],
      },
      2: {
        gravity: 'MEDIUM',
        ladder: [{ condition: 'Dès constaté', measures: ['Bannissement définitif'] }],
      },
      1: {
        gravity: 'HIGH',
        ladder: [{ condition: 'Dès constaté', measures: ['Bannissement définitif'] }],
      },
    },
  },
  {
    name: 'Menace → personnalité',
    summary:
      'Une **menace envers une personnalité** est souvent explicite, liée aux dramas du moment. Même si ce n’est pas le sujet du live, on ne laisse passer aucun drama, donc aucune menace.\n\n**En cas de bannissement définitif**, ajoute un commentaire indiquant la raison du bannissement et le contexte si nécessaire.',
    examples: ['LeBouseuh fait trop le fou, j’le vois dans la vraie vie j’le corrige.'],
    tolerated: [],
    warningExample: null,
    levels: {
      3: {
        gravity: 'HIGH',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression', 'TO : 7 jours'] },
          { condition: 'Si récidive', measures: ['Bannissement définitif', 'Commentaire'] },
        ],
      },
      2: {
        gravity: 'MEDIUM',
        ladder: [{ condition: 'Dès constaté', measures: ['Bannissement définitif'] }],
      },
      1: {
        gravity: 'HIGH',
        ladder: [{ condition: 'Dès constaté', measures: ['Bannissement définitif'] }],
      },
    },
  },
  {
    name: 'Propos extrêmes',
    summary:
      'On qualifie de propos extrêmes tout ce qui fait référence à **l’homophobie, le nazisme, le racisme, l’antisémitisme, etc.** Ces propos sont supprimés en priorité et entraînent dans tous les cas un bannissement définitif sans sommation.\n\n**Ajoute un commentaire indiquant la raison du bannissement et le contexte si nécessaire.**',
    examples: [],
    tolerated: [],
    warningExample: null,
    levels: {
      3: {
        gravity: 'HIGH',
        ladder: [
          { condition: 'Dès constaté', measures: ['Bannissement définitif', 'Commentaire'] },
        ],
      },
      2: {
        gravity: 'HIGH',
        ladder: [
          { condition: 'Dès constaté', measures: ['Bannissement définitif', 'Commentaire'] },
        ],
      },
      1: {
        gravity: 'HIGH',
        ladder: [
          { condition: 'Dès constaté', measures: ['Bannissement définitif', 'Commentaire'] },
        ],
      },
    },
  },
  {
    name: 'Propos suicidaires',
    summary:
      'Un membre de la communauté peut évoquer le fait de mettre fin à sa vie ou de se faire du mal. Envoie-lui le message ci-dessous, en avertissement ou en réponse à un chuchotement. **Le responsable live doit être prévenu immédiatement.**',
    examples: ['J’ai envie de me suicider, ça me tend je suis à deux doigts de passer à l’acte.'],
    tolerated: [],
    warningExample:
      "Nous sommes désolés mais les propos évoqués ne peuvent être tenus dans un chat Twitch, pour ta sécurité mais aussi pour la convivialité. Si tu as besoin d'aide, nous t’invitons fortement à contacter ce numéro : 09 72 39 40 50. Il est gratuit.",
    levels: {
      3: {
        gravity: 'MEDIUM',
        ladder: [
          { condition: 'Dès constaté', measures: ['Suppression', 'Avertissement'] },
          { condition: '1re récidive', measures: ['TO : 5 heures', 'Avertissement'] },
          { condition: '2e récidive', measures: ['TO : 14 jours'] },
        ],
      },
      2: {
        gravity: 'MEDIUM',
        ladder: [{ condition: 'Dès constaté', measures: ['Bannissement définitif'] }],
      },
      1: {
        gravity: 'MEDIUM',
        ladder: [{ condition: 'Dès constaté', measures: ['Bannissement définitif'] }],
      },
    },
  },
]

/**
 * Reference panel of each surface
 * @type {Record<SanctionPanelName, readonly SanctionOffenseSeed[]>}
 */

export const SANCTION_TEMPLATES: Record<SanctionPanelName, readonly SanctionOffenseSeed[]> = {
  TWITCH: TWITCH_PANEL,
  YOUTUBE: [],
  DISCORD: [],
}

/**
 * Fill the creator placeholders of a reference text
 * @param {string} text - Reference text
 * @param {string} creator - Creator name
 * @return {string} - Text for this creator
 */

export const forCreator = (text: string, creator: string): string =>
  text.replaceAll('{creator}', creator).replaceAll('{CREATOR}', creator.toUpperCase())
