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
    prompt: '[Consultes-tu|Consultez-vous] régulièrement les réseaux sociaux ?',
    say: 'Étant donné que [tu candidates|vous candidatez] à un poste de modérateur, il me semble pertinent de discuter de [ta|votre] relation aux réseaux sociaux…',
    hint: 'Même s’il manque d’expérience, vérifie sa culture et approfondis selon ses réponses.',
    branches: [
      {
        key: 'oui',
        when: 'Si oui',
        asks: [
          {
            key: 'decouvertReseaux',
            text: 'Comment [as-tu|avez-vous] découvert le monde de l’influence ?',
          },
          { key: 'decouvertCreateur', text: 'Et celui de {creator} ?' },
          {
            key: 'typeContenu',
            text: 'Quel type de contenu [consommes-tu|consommez-vous] (divertissement, information, jeux vidéo, débats) ?',
          },
          {
            key: 'passesBeaucoup',
            text: '[Y passes-tu|Y passez-vous] beaucoup de temps au quotidien ?',
          },
        ],
      },
      {
        key: 'non',
        when: 'Si non',
        asks: [
          {
            key: 'freineManque',
            text: 'Qu’est-ce qui [te|vous] freine (manque d’intérêt, fatigue, méfiance) ?',
          },
          {
            key: 'amenePostuler',
            text: 'Qu’est-ce qui [t’amène|vous amène] à postuler pour un projet où les réseaux sociaux occupent une place centrale ?',
          },
          {
            key: 'pretConsacrer',
            text: '[Serais-tu|Seriez-vous] prêt(e) à y consacrer davantage de temps dans le cadre de [ton|votre] rôle de modérateur ?',
          },
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
    prompt: '[Tu suis|Vous suivez] des YouTubeurs, des streamers, des TikTokeurs ?',
    hint: 'S’il en suit, creuse. Sinon, passe à autre chose.',
    digs: [
      { key: 'raison', text: 'Qui ça ? Pour quelle raison ?' },
      {
        key: 'typeAbonne',
        text: 'Quel type d’abonné [es-tu|êtes-vous] : viewer silencieux ou actif ? [Tu commentes, tu likes|Vous commentez, vous likez] ?',
      },
      {
        key: 'regulariteConsommation',
        text: 'Quelle est la régularité de [ta|votre] consommation ?',
      },
    ],
  },
  {
    key: 'socials.experience',
    part: 'discovery',
    section: 'socials',
    kind: 'open',
    minutes: 3,
    prompt:
      'Quels aspects positifs ou négatifs [as-tu|avez-vous] rencontrés sur les réseaux sociaux ?',
    digs: [
      { key: 'rencontresEvenements', text: 'Des rencontres ? Des évènements marquants ?' },
      {
        key: 'evolutionPersonnelle',
        text: 'Une évolution personnelle, ou au contraire un frein ?',
      },
      { key: 'priseConfiance', text: 'Une prise de confiance, ou une perte ?' },
      { key: 'disputes', text: 'Des disputes ?' },
    ],
  },
  {
    key: 'socials.harassment',
    part: 'discovery',
    section: 'socials',
    kind: 'open',
    minutes: 4,
    prompt:
      'Sur les réseaux sociaux, on voit parfois des situations de cyberharcèlement, à l’égard des créateurs comme des utilisateurs. Est-ce un phénomène que [tu as|vous avez] déjà observé, même de loin ?',
    hint: `${SENSITIVE_HINT} À poser seulement s’il n’a pas abordé le sujet de lui-même.`,
    say: 'Je vais [te|vous] poser une question un peu plus personnelle. [Tu n’es|Vous n’êtes] absolument pas obligé(e) d’y répondre et [tu peux|vous pouvez] me dire à tout moment si [tu préfères|vous préférez] qu’on passe à autre chose.',
    branches: [
      {
        key: 'evoqueExperience',
        when: 'Il n’a pas évoqué d’expérience personnelle',
        asks: [
          {
            key: 'dejaEte',
            text: '[As-tu|Avez-vous] déjà été victime de harcèlement, ou concerné(e) de manière directe ou indirecte par ce type de situation ?',
          },
        ],
      },
      {
        key: 'souhaiteParler',
        when: 'Il souhaite en parler',
        say: 'Merci pour [ton|votre] honnêteté, et navré(e) de l’apprendre. Je me permets de [te|vous] rappeler que tout ce qui est dit durant cet entretien reste confidentiel. Si ta candidature est retenue, notre accompagnement sera adapté à [ton|votre] profil pour [te soutenir|vous soutenir] au mieux dans [tes|vos] missions de modération.',
        asks: [
          {
            key: 'vecuSituation',
            text: 'Comment [as-tu|avez-vous] vécu cette situation ? Où en [es-tu|êtes-vous] aujourd’hui ?',
          },
          {
            key: 'eteAccompagne',
            text: '[As-tu|Avez-vous] été accompagné(e), par des proches ou des professionnels ? Et aujourd’hui ?',
          },
          {
            key: 'reculRegard',
            text: 'Avec du recul, quel regard [portes-tu|portez-vous] sur cette expérience ?',
          },
          {
            key: 'sentimentEntierement',
            text: '[As-tu|Avez-vous] le sentiment d’en être entièrement rétabli(e) ?',
          },
        ],
      },
      {
        key: 'souhaiteParler2',
        when: 'Il ne souhaite pas en parler',
        say: 'Je comprends tout à fait, merci pour [ton|votre] honnêteté. Dans tous les cas, si [ta|votre] candidature est retenue, notre accompagnement sera adapté à [ton|votre] profil.',
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
    prompt:
      '[Possèdes-tu|Possédez-vous] des réseaux sociaux publics ou privés ? [Publies-tu|Publiez-vous] du contenu ?',
    hint: 'S’il publie en public, prépare un autre support pour aller voir ses réseaux. Le partage d’écran est interdit.',
    branches: [
      {
        key: 'publieContenu',
        when: 'Il publie du contenu public',
        asks: [
          {
            key: 'devaisDecrire',
            text: 'Si [tu devais|vous deviez] décrire [ton|votre] contenu en quelques mots, comment le [présenterais-tu|présenteriez-vous] ?',
          },
          {
            key: 'raisonsChoisi',
            text: 'Pour quelles raisons [as-tu|avez-vous] choisi de publier ? Qu’est-ce qui [t’a|vous a] donné envie de [te|vous] lancer ?',
          },
          {
            key: 'publicationsElles',
            text: '[Tes|Vos] publications ont-elles répondu à ces motivations ?',
          },
          {
            key: 'reseauPredilection',
            text: 'Quel est [ton|votre] réseau de prédilection pour créer ? (Demande subtilement son identifiant.)',
          },
        ],
      },
      {
        key: 'posteRien',
        when: 'Il ne poste rien ou son contenu est privé',
        asks: [
          {
            key: 'pourquoiPublies',
            text: 'Pourquoi ne [publies-tu|publiez-vous] pas de contenu public (confidentialité, manque d’intérêt, manque de temps) ?',
          },
          {
            key: 'ameneMalgre',
            text: 'Qu’est-ce qui [t’amène|vous amène], malgré cela, à postuler dans un projet où la présence sur les réseaux est importante ?',
          },
          {
            key: 'devaisPublier',
            text: 'Si [tu devais|vous deviez] publier, ce serait quoi (vlog, tutoriel, danse, info, gaming) ?',
          },
          {
            key: 'usageDiscret',
            text: '[Ton|Votre] usage discret ne pourrait-il pas [te|vous] faire sentir en décalage avec des modérateurs très investis dans la création de contenu ?',
          },
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
      'Je vais jeter un œil à [tes|vos] contenus publics. Avant que je regarde, [souhaites-tu|souhaitez-vous] préciser ou ajouter quelque chose ?',
    say: 'Très bien, alors regardons !',
    hint: 'Repère factuel : sors du cadre si c’est pertinent. Le but est de connaître ses motivations de création et de repérer un éventuel but implicite.',
    digs: [
      {
        key: 'pourquoiGaming',
        text: 'Pourquoi [fais-tu|faites-vous] du gaming, des podcasts, de la republication de contenu ?',
      },
      {
        key: 'messageAmbiance',
        text: 'Y a-t-il un message, une ambiance ou des valeurs que [tu cherches|vous cherchez] à transmettre ?',
      },
      {
        key: 'inspirationParticuliere',
        text: '[As-tu|Avez-vous] une inspiration particulière pour réaliser [tes|vos] vidéos ?',
      },
    ],
    branches: [
      {
        key: 'rapprochement',
        when: 'Il y a un rapprochement avec {creator}',
        asks: [
          {
            key: 'exempleDanse',
            text: 'Exemple : il danse, et {creator} aussi. « Ça tombe bien, [tu as|vous avez] la même passion. {creator} a-t-il été une de [tes|vos] sources d’inspiration ? »',
          },
        ],
      },
      {
        key: 'rapprochement2',
        when: 'Il n’y a pas de rapprochement',
        asks: [
          {
            key: 'centresInteret',
            text: 'Ne [penses-tu|pensez-vous] pas que des centres d’intérêt différents de ceux de {creator} pourraient [te|vous] faire sentir en décalage avec les autres modérateurs ?',
          },
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
    prompt: '[Suis-tu|Suivez-vous] {creator} ?',
    hint: 'Identifie la motivation profonde (évolution professionnelle, fan, simple curiosité). Distingue la motivation implicite de la volonté réelle de s’engager.',
    branches: [
      {
        key: 'oui',
        when: 'Si oui',
        asks: [
          {
            key: 'contenusPreferes',
            text: 'Quels contenus [préfères-tu|préférez-vous] sur ses réseaux ?',
          },
          { key: 'conceptVideo', text: '[As-tu|Avez-vous] un concept ou une vidéo préféré(e) ?' },
          {
            key: 'laissesCommentaires',
            text: '[Laisses-tu|Laissez-vous] des commentaires sur ses publications ou ses lives ? [Lui envoies-tu|Lui envoyez-vous] des messages ? [Likes-tu|Likez-vous] ses contenus ?',
          },
          {
            key: 'communaute',
            text: 'Que [penses-tu|pensez-vous] de la communauté de {creator} ?',
          },
          {
            key: 'testHonnetete',
            text: 'Test d’honnêteté : « Nous avons accès à ses réseaux et avons vu que [tu lui as|vous lui avez] déjà envoyé un message. [Peux-tu|Pouvez-vous] nous en dire plus ? » À poser seulement si tu l’as vérifié.',
          },
        ],
      },
      {
        key: 'non',
        when: 'Si non',
        asks: [
          { key: 'alorsPourquoi', text: 'Alors pourquoi avoir postulé pour {creator} ?' },
          {
            key: 'pourquoiConsommes',
            text: 'Pourquoi ne [consommes-tu|consommez-vous] pas ses contenus ?',
          },
          {
            key: 'peurPersonnalite',
            text: 'N’[as-tu|avez-vous] pas peur que sa personnalité et sa communauté ne [te|vous] correspondent pas ?',
          },
          {
            key: 'reactionCraintes',
            text: 'Quelle serait [ta|votre] réaction si ces craintes devenaient réelles ?',
          },
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
    prompt: '[Connais-tu|Connaissez-vous] des membres de l’équipe de {creator} ?',
    hint: 'Sous-partie la plus importante : teste sa solidité et repère si la démarche est opportuniste ou réellement bienveillante.',
    branches: [
      {
        key: 'oui',
        when: 'Si oui',
        asks: [
          { key: 'renseigneEux', text: '[T’es-tu|Vous êtes-vous] renseigné(e) sur eux ?' },
          {
            key: 'reseauxSociaux',
            text: 'Les [suis-tu|suivez-vous] sur les réseaux sociaux ? Pourquoi ?',
          },
        ],
      },
      {
        key: 'non',
        when: 'Si non',
        asks: [
          {
            key: 'doncPostule',
            text: '[Tu as|Vous avez] donc postulé sans prendre connaissance des éléments principaux concernant {creator} et ses équipes ?',
          },
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
    prompt: 'Si {creator} écrit dans {modChat}, quelle serait [ta|votre] réaction ?',
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
    prompt: 'Que [penses-tu|pensez-vous] des rôles de couleur sur Discord ?',
    digs: [
      { key: 'celaRepresente', text: 'Qu’est-ce que cela représente pour [toi|vous] ?' },
      { key: 'apportePlus', text: 'Qu’apporte de plus un rôle de couleur en haut de la liste ?' },
    ],
  },
  {
    key: 'moderation.badge',
    part: 'discovery',
    section: 'moderation',
    kind: 'open',
    minutes: 2,
    platforms: [RecruitmentPlatforms.Twitch],
    prompt: 'Que [penses-tu|pensez-vous] du badge de modérateur sur Twitch ?',
    digs: [
      { key: 'celaRepresente', text: 'Qu’est-ce que cela représente pour [toi|vous] ?' },
      {
        key: 'apportePlus',
        text: 'Qu’apporte de plus un badge visible à côté de [ton|votre] pseudo dans le chat ?',
      },
    ],
  },
  {
    key: 'moderation.experience',
    part: 'discovery',
    section: 'moderation',
    kind: 'open',
    mandatory: true,
    minutes: 3,
    prompt:
      '[As-tu|Avez-vous] déjà postulé pour être modérateur pour un autre créateur de contenu ?',
    hint: 'Comprends comment il compte exploiter son expérience passée et ce qu’il en retire vraiment. S’il a déjà modéré sans le préciser dans sa candidature, demande où et pique sur les clichés qui entourent l’endroit.',
    digs: [{ key: 'espaceDeja', text: 'Sur quel(s) espace(s) [as-tu|avez-vous] déjà modéré ?' }],
  },
  {
    key: 'moderation.police',
    part: 'discovery',
    section: 'moderation',
    kind: 'open',
    minutes: 2,
    prompt: 'Pour [toi|vous], la modération est-elle une forme de police d’internet ? Pourquoi ?',
  },
  {
    key: 'moderation.insulted',
    part: 'discovery',
    section: 'moderation',
    kind: 'open',
    minutes: 2,
    recommended: true,
    prompt:
      'Si [tu venais à te|vous veniez à vous] faire insulter en tant que modérateur, quel serait [ton|votre] premier réflexe ?',
  },
  {
    key: 'moderation.word',
    part: 'discovery',
    section: 'moderation',
    kind: 'open',
    minutes: 2,
    prompt:
      'Quel est le premier mot qui [te|vous] vient en tête quand [tu penses|vous pensez] à la modération ? Pourquoi ?',
    hint: 'La meilleure réponse est « impartialité ». Creuse et pique légèrement sa réflexion.',
  },
  {
    key: 'moderation.spam',
    part: 'discovery',
    section: 'moderation',
    kind: 'open',
    minutes: 2,
    recommended: true,
    prompt: '{creator} écrit {inChat} et spamme un lien. Que [fais-tu|faites-vous] ?',
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
      'Un viewer écrit dans {chat} qu’il se suicidera si {creator} ne lui répond pas. Comment [agis-tu|agissez-vous] ?',
    hint: 'Observe son calme, son empathie et les relais qu’il connaît avant son premier mot.',
  },
  {
    key: 'moderation.device',
    part: 'discovery',
    section: 'moderation',
    kind: 'open',
    minutes: 1,
    prompt:
      'Sur quel appareil [penses-tu|pensez-vous] pouvoir modérer (ordinateur, téléphone, tablette) ?',
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
      'Quels outils de Discord [utilises-tu|utilisez-vous] pour modérer (rôles, permissions, fils, journaux, bots) ?',
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
      'Quels outils de modération de Twitch [connais-tu|connaissez-vous] (mode lent, followers-only, AutoMod, timeout, ban) ?',
    hint: 'Vérifie sa familiarité réelle, pas seulement le vocabulaire : demande dans quel cas il utilise chacun.',
  },
  {
    key: 'theory.document',
    part: 'discovery',
    section: 'theory',
    kind: 'exercise',
    minutes: 15,
    prompt: 'Lui passer un document de théorie, 5 à 10 minutes de lecture',
    say: 'Directement dans [ton|votre] fil privé : je vais [te|vous] passer un document, bien évidemment confidentiel, que [tu devras|vous devrez] analyser en mute casque pendant 5 à 10 minutes. Après cela, je [te|vous] démuterai et [te|vous] poserai des questions. [Tu es|Vous êtes] prêt(e) ?',
    hint: 'Facultatif. Choisis la difficulté selon son profil : vitre brisée pour un profil peu convaincant, Maslach pour un profil anxieux, ethnotypes et sociotypes pour un profil potentiellement problématique humainement, cheval de Troie pour un profil problématique.',
    documents: [
      { label: 'Hypothèse de la vitre brisée', url: 'https://media.mtdwn.com/ul8le38.pdf' },
      { label: 'Échelle de mesure de Maslach', url: 'https://media.mtdwn.com/3refyco.pdf' },
      { label: 'Ethnotypes et sociotypes', url: 'https://media.mtdwn.com/mkm05qs.pdf' },
      { label: 'Cheval de Troie', url: 'https://media.mtdwn.com/1fp34ku.pdf' },
      { label: 'Les réponses', url: 'https://media.mtdwn.com/u96bgec.pdf' },
    ],
    steps: [
      { prompt: '[Tu en as|Vous en avez] pensé quoi de ce document ?' },
      {
        prompt: 'En toute honnêteté, [t’es-tu|vous êtes-vous] aidé(e) d’une IA pour l’analyser ?',
        pause: 'Pas dramatique, il doit simplement expliquer comment il a procédé',
      },
      {
        prompt:
          '[T’évoque-t-il|Vous évoque-t-il] une situation que [tu avais|vous aviez] déjà connue ?',
      },
      { prompt: '[L’associes-tu|L’associez-vous] à [ta|votre] manière de modérer ?' },
      { prompt: '[Associes-tu|Associez-vous] ce document à une sanction ?' },
    ],
  },
]
