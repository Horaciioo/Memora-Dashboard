import type { QuestionDefinition } from '@/declarations/recruitment/questionnaire/types'
import { RecruitmentPlatforms } from '@/utils/constants/recruitment'

// Pause hint shared by the sensitive questions
const SENSITIVE_HINT =
  'Sujet sensible : il n’est jamais obligé de répondre et peut passer à autre chose à tout moment.'

/**
 * Questions about the candidate and social networks
 * @type {readonly QuestionDefinition[]}
 */

export const SOCIAL_QUESTIONS: readonly QuestionDefinition[] = [
  {
    key: 'socials.habits',
    part: 'discovery',
    section: 'socials',
    kind: 'open',
    recommended: true,
    minutes: 3,
    prompt: 'Consultes-tu régulièrement les réseaux sociaux ?',
    say: 'Étant donné que tu candidates à un poste de modérateur, il me semble pertinent de discuter de ta relation aux réseaux sociaux…',
    hint: 'Même s’il manque d’expérience, vérifie sa culture et approfondis selon ses réponses.',
    branches: [
      {
        when: 'Si oui',
        asks: [
          'Comment as-tu découvert les réseaux sociaux et leurs créateurs de contenu ?',
          'Quel type de contenu consommes-tu (divertissement, information, jeux vidéo, débats) ?',
          'Y passes-tu beaucoup de temps au quotidien ?',
        ],
      },
      {
        when: 'Si non',
        asks: [
          'Qu’est-ce qui te freine (manque d’intérêt, fatigue, méfiance) ?',
          'Qu’est-ce qui t’amène à postuler pour un projet où les réseaux sociaux occupent une place centrale ?',
          'Serais-tu prêt(e) à y consacrer davantage de temps dans le cadre de ton rôle de modérateur ?',
        ],
      },
    ],
  },
  {
    key: 'socials.creators',
    part: 'discovery',
    section: 'socials',
    kind: 'open',
    minutes: 3,
    prompt: 'Tu suis des YouTubeurs, des streamers, des TikTokeurs ?',
    hint: 'S’il en suit, creuse. Sinon, passe à autre chose.',
    digs: [
      'Qui ça ? Pour quelle raison ?',
      'Quel type d’abonné es-tu : viewer silencieux ou actif ? Tu commentes, tu likes ?',
      'Quelle est la régularité de ta consommation ?',
    ],
  },
  {
    key: 'socials.experience',
    part: 'discovery',
    section: 'socials',
    kind: 'open',
    minutes: 3,
    prompt: 'Quels aspects positifs ou négatifs as-tu rencontrés sur les réseaux sociaux ?',
    digs: [
      'Des rencontres ? Des évènements marquants ?',
      'Une évolution personnelle, ou au contraire un frein ?',
      'Une prise de confiance, ou une perte ?',
      'Des disputes ?',
    ],
  },
  {
    key: 'socials.harassment',
    part: 'discovery',
    section: 'socials',
    kind: 'open',
    minutes: 4,
    prompt:
      'Sur les réseaux sociaux, on voit parfois des situations de cyberharcèlement, à l’égard des créateurs comme des utilisateurs. Est-ce un phénomène que tu as déjà observé, même de loin ?',
    hint: `${SENSITIVE_HINT} À poser seulement s’il n’a pas abordé le sujet de lui-même.`,
    say: 'Je vais te poser une question un peu plus personnelle. Tu n’es absolument pas obligé(e) d’y répondre et tu peux me dire à tout moment si tu préfères qu’on passe à autre chose.',
    branches: [
      {
        when: 'Il n’a pas évoqué d’expérience personnelle',
        asks: [
          'As-tu déjà été victime de harcèlement, ou concerné(e) de manière directe ou indirecte par ce type de situation ?',
        ],
      },
      {
        when: 'Il souhaite en parler',
        say: 'Merci pour ton honnêteté, et navré(e) de l’apprendre. Je me permets de te rappeler que tout ce qui est dit durant cet entretien reste confidentiel. Si ta candidature est retenue, notre accompagnement sera adapté à ton profil pour te soutenir au mieux dans tes missions de modération.',
        asks: [
          'Comment as-tu vécu cette situation ? Où en es-tu aujourd’hui ?',
          'As-tu été accompagné(e), par des proches ou des professionnels ? Et aujourd’hui ?',
          'Avec du recul, quel regard portes-tu sur cette expérience ?',
          'As-tu le sentiment d’en être entièrement rétabli(e) ?',
        ],
      },
      {
        when: 'Il ne souhaite pas en parler',
        say: 'Je comprends tout à fait, merci pour ton honnêteté. Dans tous les cas, si ta candidature est retenue, notre accompagnement sera adapté à ton profil.',
        asks: [],
      },
    ],
  },
  {
    key: 'socials.content',
    part: 'discovery',
    section: 'socials',
    kind: 'open',
    minutes: 5,
    prompt: 'Possèdes-tu des réseaux sociaux publics ou privés ? Publies-tu du contenu ?',
    hint: 'S’il publie en public, prépare un autre support pour aller voir ses réseaux. Le partage d’écran est interdit.',
    branches: [
      {
        when: 'Il publie du contenu public',
        asks: [
          'Si tu devais décrire ton contenu en quelques mots, comment le présenterais-tu ?',
          'Pour quelles raisons as-tu choisi de publier ? Qu’est-ce qui t’a donné envie de te lancer ?',
          'Tes publications ont-elles répondu à ces motivations ?',
          'Quel est ton réseau de prédilection pour créer ? (Demande subtilement son identifiant.)',
        ],
      },
      {
        when: 'Il ne poste rien ou son contenu est privé',
        asks: [
          'Pourquoi ne publies-tu pas de contenu public (confidentialité, manque d’intérêt, manque de temps) ?',
          'Qu’est-ce qui t’amène, malgré cela, à postuler dans un projet où la présence sur les réseaux est importante ?',
          'Si tu devais publier, ce serait quoi (vlog, tutoriel, danse, info, gaming) ?',
          'Ton usage discret ne pourrait-il pas te faire sentir en décalage avec des modérateurs très investis dans la création de contenu ?',
        ],
      },
    ],
  },
  {
    key: 'socials.contentReview',
    part: 'discovery',
    section: 'socials',
    kind: 'open',
    when: 'Le candidat publie du contenu public',
    minutes: 5,
    prompt:
      'Je vais jeter un œil à tes contenus publics. Avant que je regarde, souhaites-tu préciser ou ajouter quelque chose ?',
    say: 'Très bien, alors regardons !',
    hint: 'Repère factuel : sors du cadre si c’est pertinent. Le but est de connaître ses motivations de création et de repérer un éventuel but implicite.',
    digs: [
      'Pourquoi fais-tu du gaming, des podcasts, de la republication de contenu ?',
      'Y a-t-il un message, une ambiance ou des valeurs que tu cherches à transmettre ?',
      'As-tu une inspiration particulière pour réaliser tes vidéos ?',
    ],
    branches: [
      {
        when: 'Il y a un rapprochement avec {creator}',
        asks: [
          'Exemple : il danse, et {creator} aussi. « Ça tombe bien, tu as la même passion. {creator} a-t-il été une de tes sources d’inspiration ? »',
        ],
      },
      {
        when: 'Il n’y a pas de rapprochement',
        asks: [
          'Ne penses-tu pas que des centres d’intérêt différents de ceux de {creator} pourraient te faire sentir en décalage avec les autres modérateurs ?',
        ],
      },
    ],
  },
]

/**
 * Questions about the creator and opportunism
 * @type {readonly QuestionDefinition[]}
 */

export const CREATOR_QUESTIONS: readonly QuestionDefinition[] = [
  {
    key: 'creator.follow',
    part: 'discovery',
    section: 'creator',
    kind: 'open',
    mandatory: true,
    minutes: 4,
    prompt: 'Suis-tu {creator} ?',
    hint: 'Identifie la motivation profonde (évolution professionnelle, fan, simple curiosité). Distingue la motivation implicite de la volonté réelle de s’engager.',
    branches: [
      {
        when: 'Si oui',
        asks: [
          'Quels contenus préfères-tu sur ses réseaux ?',
          'As-tu un concept ou une vidéo préféré(e) ?',
          'Laisses-tu des commentaires sur ses publications ou ses lives ? Lui envoies-tu des messages ? Likes-tu ses contenus ?',
          'Que penses-tu de la communauté de {creator} ?',
          'Test d’honnêteté : « Nous avons accès à ses réseaux et avons vu que tu lui as déjà envoyé un message. Peux-tu nous en dire plus ? » À poser seulement si tu l’as vérifié.',
        ],
      },
      {
        when: 'Si non',
        asks: [
          'Alors pourquoi avoir postulé pour {creator} ?',
          'Pourquoi ne consommes-tu pas ses contenus ?',
          'N’as-tu pas peur que sa personnalité et sa communauté ne te correspondent pas ?',
          'Quelle serait ta réaction si ces craintes devenaient réelles ?',
        ],
      },
    ],
  },
  {
    key: 'opportunism.team',
    part: 'discovery',
    section: 'opportunism',
    kind: 'open',
    mandatory: true,
    minutes: 3,
    prompt: 'Connais-tu des membres de l’équipe de {creator} ?',
    hint: 'Sous-partie la plus importante : teste sa solidité et repère si la démarche est opportuniste ou réellement bienveillante.',
    branches: [
      {
        when: 'Si oui',
        asks: [
          'T’es-tu renseigné(e) sur eux ?',
          'Les suis-tu sur les réseaux sociaux ? Pourquoi ?',
        ],
      },
      {
        when: 'Si non',
        asks: [
          'Tu as donc postulé sans prendre connaissance des éléments principaux concernant {creator} et ses équipes ?',
        ],
      },
    ],
  },
  {
    key: 'opportunism.reaction',
    part: 'discovery',
    section: 'opportunism',
    kind: 'open',
    mandatory: true,
    minutes: 2,
    prompt: 'Si {creator} écrit dans {modChat}, quelle serait ta réaction ?',
    hint: 'Attarde-toi : c’est ici que l’opportunisme se voit.',
  },
]

/**
 * Questions about moderation itself
 * @type {readonly QuestionDefinition[]}
 */

export const MODERATION_QUESTIONS: readonly QuestionDefinition[] = [
  {
    key: 'moderation.roles',
    part: 'discovery',
    section: 'moderation',
    kind: 'open',
    minutes: 2,
    platforms: [RecruitmentPlatforms.Discord],
    prompt: 'Que penses-tu des rôles de couleur sur Discord ?',
    digs: [
      'Qu’est-ce que cela représente pour toi ?',
      'Qu’apporte de plus un rôle de couleur en haut de la liste ?',
    ],
  },
  {
    key: 'moderation.badge',
    part: 'discovery',
    section: 'moderation',
    kind: 'open',
    minutes: 2,
    platforms: [RecruitmentPlatforms.Twitch],
    prompt: 'Que penses-tu du badge de modérateur sur Twitch ?',
    digs: [
      'Qu’est-ce que cela représente pour toi ?',
      'Qu’apporte de plus un badge visible à côté de ton pseudo dans le chat ?',
    ],
  },
  {
    key: 'moderation.experience',
    part: 'discovery',
    section: 'moderation',
    kind: 'open',
    mandatory: true,
    minutes: 3,
    prompt: 'As-tu déjà postulé pour être modérateur pour un autre créateur de contenu ?',
    hint: 'Comprends comment il compte exploiter son expérience passée et ce qu’il en retire vraiment. S’il a déjà modéré sans le préciser dans sa candidature, demande où et pique sur les clichés qui entourent l’endroit.',
    digs: ['Sur quel(s) espace(s) as-tu déjà modéré ?'],
  },
  {
    key: 'moderation.police',
    part: 'discovery',
    section: 'moderation',
    kind: 'open',
    minutes: 2,
    prompt: 'Pour toi, la modération est-elle une forme de police d’internet ? Pourquoi ?',
  },
  {
    key: 'moderation.insulted',
    part: 'discovery',
    section: 'moderation',
    kind: 'open',
    minutes: 2,
    recommended: true,
    prompt:
      'Si tu venais à te faire insulter en tant que modérateur, quel serait ton premier réflexe ?',
  },
  {
    key: 'moderation.word',
    part: 'discovery',
    section: 'moderation',
    kind: 'open',
    minutes: 2,
    prompt:
      'Quel est le premier mot qui te vient en tête quand tu penses à la modération ? Pourquoi ?',
    hint: 'La meilleure réponse est « impartialité ». Creuse et pique légèrement sa réflexion.',
  },
  {
    key: 'moderation.spam',
    part: 'discovery',
    section: 'moderation',
    kind: 'open',
    minutes: 2,
    recommended: true,
    prompt: '{creator} écrit {inChat} et spamme un lien. Que fais-tu ?',
    hint: 'S’il répond « rien », relance : « Mais s’il s’est fait pirater, tu prends le risque de laisser {members} cliquer sur un lien frauduleux ? »',
  },
  {
    key: 'moderation.distress',
    part: 'discovery',
    section: 'moderation',
    kind: 'open',
    mandatory: true,
    minutes: 3,
    prompt:
      'Un viewer écrit dans {chat} qu’il se suicidera si {creator} ne lui répond pas. Comment agis-tu ?',
    hint: 'Observe son calme, son empathie et les relais qu’il connaît avant son premier mot.',
  },
  {
    key: 'moderation.device',
    part: 'discovery',
    section: 'moderation',
    kind: 'open',
    minutes: 1,
    prompt: 'Sur quel appareil penses-tu pouvoir modérer (ordinateur, téléphone, tablette) ?',
    hint: 'Assure-toi qu’il a bien un ordinateur personnel.',
  },
  {
    key: 'moderation.toolsDiscord',
    part: 'discovery',
    section: 'moderation',
    kind: 'open',
    minutes: 3,
    platforms: [RecruitmentPlatforms.Discord],
    prompt:
      'Quels outils de Discord utilises-tu pour modérer (rôles, permissions, fils, journaux, bots) ?',
    hint: 'Vérifie sa familiarité réelle, pas seulement le vocabulaire : demande un exemple concret.',
  },
  {
    key: 'moderation.toolsTwitch',
    part: 'discovery',
    section: 'moderation',
    kind: 'open',
    minutes: 3,
    platforms: [RecruitmentPlatforms.Twitch],
    prompt:
      'Quels outils de modération de Twitch connais-tu (mode lent, followers-only, AutoMod, timeout, ban) ?',
    hint: 'Vérifie sa familiarité réelle, pas seulement le vocabulaire : demande dans quel cas il utilise chacun.',
  },
  {
    key: 'theory.document',
    part: 'discovery',
    section: 'theory',
    kind: 'exercise',
    minutes: 15,
    prompt: 'Lui passer un document de théorie, 5 à 10 minutes de lecture',
    say: 'Directement dans ton fil privé : je vais te passer un document, bien évidemment confidentiel, que tu devras analyser en mute casque pendant 5 à 10 minutes. Après cela, je te démuterai et te poserai des questions. Tu es prêt(e) ?',
    hint: 'Facultatif. Choisis la difficulté selon son profil : vitre brisée pour un profil peu convaincant, Maslach pour un profil anxieux, ethnotypes et sociotypes pour un profil potentiellement problématique humainement, cheval de Troie pour un profil problématique.',
    documents: [
      { label: 'Hypothèse de la vitre brisée', url: 'https://media.mtdwn.com/ul8le38.pdf' },
      { label: 'Échelle de mesure de Maslach', url: 'https://media.mtdwn.com/3refyco.pdf' },
      { label: 'Ethnotypes et sociotypes', url: 'https://media.mtdwn.com/mkm05qs.pdf' },
      { label: 'Cheval de Troie', url: 'https://media.mtdwn.com/1fp34ku.pdf' },
      { label: 'Les réponses', url: 'https://media.mtdwn.com/u96bgec.pdf' },
    ],
    steps: [
      { prompt: 'Tu en as pensé quoi de ce document ?' },
      {
        prompt: 'En toute honnêteté, t’es-tu aidé(e) d’une IA pour l’analyser ?',
        pause: 'Pas dramatique, il doit simplement expliquer comment il a procédé',
      },
      { prompt: 'T’évoque-t-il une situation que tu avais déjà connue ?' },
      { prompt: 'L’associes-tu à ta manière de modérer ?' },
      { prompt: 'Associes-tu ce document à une sanction ?' },
    ],
  },
]
