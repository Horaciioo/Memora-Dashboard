import {
  ACTIONS_SCENE,
  AUTOMOD_SCENE,
  CHAT_SCENE,
  COMMUNITY_SCENE,
  MODES_SCENE,
  OPTIONS_SCENE,
  TITLE_SCENE,
  TOUR_SCENE,
  WAVE_DRAMA_SCENE,
  WAVE_INSIST_SCENE,
  WAVE_START_SCENE,
} from '@/declarations/academy/curriculum/scenes/twitchScenes'
import type { Course } from '@/declarations/academy/curriculum/types'

/**
 * Twitch moderation basics
 * @type {Course}
 */

export const TWITCH_FUNDAMENTALS: Course = {
  key: 'twitch-fondamentaux',
  name: 'Les fondamentaux de la Mod. Twitch',
  summary:
    'Nos méthodologies d’application, notre politique de Modération et les bases de la Vue Modérateur.',
  track: 'indispensable',
  surface: 'twitch',
  functions: ['Lives'],
  minutes: 35,
  intro: {
    objective:
      'À l’issue de celle-ci, tu comprendras nos méthodologies d’application, notre politique de Modération ainsi que les bases de la Vue Modérateur.',
    outline:
      'Chaque chapitre contient des exercices, des cas d’étude par simulation, ou bien d’autres pratiques visant à concrétiser la théorie.\n\nLes chapitres sont courts. La formation a été écrite de sorte à ce que tu n’aies pas des pavés à lire.',
    caseStudy: {
      title: 'Le harcèlement de groupe envers le Streamer',
      body: 'Pour ta formation, nous allons nous baser sur un cas d’étude assez précis : **Le harcèlement de groupe envers le Streamer**.',
    },
    feedback:
      'À la fin de ta formation, tu seras invité(e) à nous dire si cette formation t’a été utile ou non et si tu le souhaites : y laisser un commentaire constructif. Seuls les développeurs et les responsables verront ceci.',
    start: 'On commence ?',
  },
  chapters: [
    {
      key: 'vue-moderateur',
      title: 'La Vue Modérateur',
      blocks: [
        {
          kind: 'text',
          key: 'vue-accueil',
          body: 'Bienvenue sur ce chapitre 1 !\n\nTu verras, la Vue Modérateur peut faire peur, elle a beaucoup de boutons, beaucoup d’options, mais t’inquiète : nous allons tout te décortiquer minutieusement pour que tu puisses mieux comprendre.',
        },
        {
          kind: 'callout',
          key: 'vue-junior',
          tone: 'rule',
          title: 'À savoir',
          body: 'En tant que Junior, tu n’auras pas l’autorisation dès le début d’en manipuler un certain nombre, pour assurer la qualité et t’aider graduellement.',
        },
        {
          kind: 'tour',
          key: 'vue-visite',
          intro:
            'Clique sur une fenêtre en particulier pour connaître son action, ou clique sur le bouton pour démarrer le mode Auto.',
          scene: TOUR_SCENE,
          stops: [
            {
              target: 'chat',
              label: 'Chat',
              body: 'Le Chat, c’est littéralement là où tout se passe.',
            },
            {
              target: 'community',
              label: 'Communauté',
              body: 'C’est par cette fenêtre que tu peux voir tes collègues, la liste des Membres ou des VIPs.',
            },
            {
              target: 'broadcaster',
              label: 'Diffuseur',
              body: 'Le créateur qui diffuse le live.',
            },
            {
              target: 'moderators',
              label: 'Modérateur',
              body: 'Tes collègues présents ce soir, et les bots qui modèrent avec vous.',
            },
            {
              target: 'vips',
              label: 'VIP',
              body: 'Les membres que le créateur met en avant.',
            },
            {
              target: 'title',
              label: 'Titre de la page',
              body: 'Le titre du Live, ses tags de référencement et sa catégorie.',
            },
            {
              target: 'automod',
              label: 'File d’attente de l’AutoMod',
              body: 'Les mots interdits retenus par nos outils Auto-Mods et Nightbot, enveloppés en rouge.',
            },
            {
              target: 'modActions',
              label: 'Actions de modérateur',
              body: 'L’action de chacun de tes collègues, des Responsables, de l’équipe du créateur ou du créateur lui-même.',
            },
            {
              target: 'modes',
              label: 'Mode',
              body: 'La liste déroulante qui change la manière dont nous modérons.',
            },
            {
              target: 'chatOptions',
              label: 'Les 3 petits points',
              body: 'La manière dont tu souhaites faire afficher pas mal d’informations.',
            },
          ],
        },
        {
          kind: 'focus',
          key: 'vue-decortiquer',
          prompt:
            'Maintenant que tu as pu voir un visuel de ton futur outil, si on décortiquait ce qui t’intéresse ?\n\nParmi les options ci-dessous, choisis celle qui t’intéresse et tu pourras en apprendre davantage, avec des cas d’étude qui lui sont propres.',
          items: [
            {
              key: 'chat',
              label: 'Chat',
              windows: ['chat'],
              scene: CHAT_SCENE,
              points: [
                'Le Chat, c’est littéralement là où tout se passe. Les Streamers interagissent majoritairement par ce biais.',
                'C’est également par-là que tu vas pouvoir effectuer des actions de Modération, que nous aborderons plus en profondeur dans le Chapitre 2 et le Chapitre 3.',
                'Cela te permet également d’interagir avec la communauté, ou de participer au live à ta convenance (indépendamment du Livecon en vigueur).',
              ],
            },
            {
              key: 'communaute',
              label: 'Communauté',
              windows: ['community'],
              scene: COMMUNITY_SCENE,
              points: [
                'C’est par cette fenêtre que tu peux voir tes collègues, la liste des Membres ou des VIPs, c’est plus informationnel qu’autre chose.',
              ],
            },
            {
              key: 'titre',
              label: 'Titre de la Page',
              windows: ['stream'],
              spotlight: 'title',
              scene: TITLE_SCENE,
              points: [
                'Le titre du Live est toujours annoncé ici, avec ses tags de référencement ainsi que sa catégorie de live à gauche.',
              ],
            },
            {
              key: 'automod',
              label: 'File d’Attente de l’Auto-Mod',
              windows: ['automod', 'chat'],
              scene: AUTOMOD_SCENE,
              points: [
                'Cette fenêtre contextuelle est exclusive à nos outils Auto-Mods et Nightbot. C’est par ce biais-là que tu verras tous les mots interdits enveloppés en rouge.',
                'Tu as également la possibilité de les voir directement sur le Chat, cependant je ne te conseille pas de les modérer directement là-bas : le flux de Messages amène souvent à des clics malencontreux.',
                'Tu as la possibilité de filtrer, à ta convenance, le type de contenu que tu souhaites, selon la situation.',
              ],
            },
            {
              key: 'actions',
              label: 'Action de Modération',
              windows: ['modActions'],
              scene: ACTIONS_SCENE,
              points: [
                'Cette fenêtre informative te permet de voir l’action de chacun de tes collègues, des Responsables, de l’équipe du créateur ou du créateur lui-même.',
                'Ceci constitue ce qu’on appelle une « Log » d’activité, ce qui est très utile quand vous êtes à plusieurs à avoir détecté une infraction à modérer : tu peux alors voir si l’action a été réalisée ou non.',
                'Parmi les actions tu peux y avoir pas mal de choses telles que : les Messages supprimés, l’Ajout ou la Suppression de Nouveaux Termes Bloqués (Auto-mod), les Actions d’infractions (ban, déban, timeout…), les demandes d’annulation de bannissement (seul Jérémy peut les traiter), ainsi qu’un tas d’autres.',
                '**Attention** : nous prônons le parcours et les efforts individuels, ceci ne doit pas être une compétition, ni un motif de dénonciation. Si tu estimes qu’un Modérateur, ou un Junior abuse de ses droits : réfère-t’en uniquement à ton Formateur. Ne fais pas « Justice » toi-même.',
              ],
            },
            {
              key: 'mode',
              label: 'Mode',
              windows: ['chat'],
              spotlight: 'modes',
              scene: MODES_SCENE,
              points: [
                'C’est par cette liste déroulante que nous pouvons influer sur la manière dont nous modérons.',
                '**Mode bouclier** : cette option n’est activable que par Jérémy.',
                '**Chat réservé aux abonnés** : cette option n’est activable que par Jérémy.',
                '**Chat en émoticônes uniquement** : cette option est valable par demande, par initiative de Jérémy, ou sous son ordre, auquel cas les Responsables, ou le Coordinateur doivent y opérer rapidement.',
                '**Réservé aux Followers** : cette option n’est manipulable que par Jérémy.',
                '**Mode lent** : cette option n’est manipulable que par Jérémy, les Responsables, ou le Coordinateur de Live selon l’affluence, la difficulté de Modération ou la demande dudit créateur.',
                '**Termes bloqués** : tous les termes que l’auto-mod retient, et qu’il n’est pas possible d’écrire. Le Coordinateur peut décider d’en ajouter, d’en supprimer, ou d’en modifier.',
                '**Termes autorisés** : des termes normalement bloqués, qui sont temporairement autorisés pour la communauté. Cela s’y prête souvent selon le sujet ou le débat.',
              ],
            },
            {
              key: 'options',
              label: 'Les 3 petits points',
              windows: ['chat'],
              spotlight: 'chatOptions',
              scene: OPTIONS_SCENE,
              points: [
                'C’est la manière dont tu souhaites faire afficher pas mal d’informations.',
                'Par défaut, nous te conseillons de tous les afficher.',
              ],
            },
          ],
        },
        {
          kind: 'scene',
          key: 'vue-cas-vague',
          title: 'Cas d’étude : la vague commence',
          context:
            'Ce soir, un groupe de comptes s’en prend à Lumi. Regarde la Vue Modérateur pendant que la vague démarre, puis réponds aux questions.',
          scene: WAVE_START_SCENE,
          questions: [
            {
              key: 'retenu',
              prompt: 'Un message insultant n’est jamais arrivé dans le chat. Où l’as-tu vu ?',
              choices: [
                { key: 'automod', label: 'Dans la File d’attente de l’AutoMod', correct: true },
                { key: 'communaute', label: 'Dans la fenêtre Communauté', correct: false },
                { key: 'titre', label: 'Sous le titre du live', correct: false },
              ],
              explanation:
                'Les mots interdits sont retenus et enveloppés en rouge dans la File d’attente de l’AutoMod.',
            },
            {
              key: 'deja',
              prompt:
                'Tu repères le message « Lumi t’es une arnaque ». Comment sais-tu qu’un collègue l’a déjà traité ?',
              choices: [
                { key: 'actions', label: 'Je regarde les Actions de modérateur', correct: true },
                { key: 'chat', label: 'Je le demande dans le chat', correct: false },
                { key: 'rien', label: 'Je le supprime à nouveau, au cas où', correct: false },
              ],
              explanation:
                'Les Actions de modérateur sont le log d’activité de l’équipe : tu y vois si l’action a été réalisée.',
            },
            {
              key: 'collegues',
              prompt: 'Tu veux savoir quels collègues sont présents ce soir. Où regardes-tu ?',
              choices: [
                { key: 'communaute', label: 'Dans la fenêtre Communauté', correct: true },
                { key: 'automod', label: 'Dans la File d’attente de l’AutoMod', correct: false },
              ],
              explanation: 'La fenêtre Communauté montre tes collègues, les Membres et les VIPs.',
            },
          ],
        },
      ],
    },
    {
      key: 'politique',
      title: 'Notre politique de modération',
      blocks: [
        {
          kind: 'text',
          key: 'politique-intro',
          body: 'Nos Modérateurs doivent être humains, de « bons amis qui savent poser des limites ». Toutes nos interactions reposent sur la confiance et le respect envers autrui.\n\nNous tutoyons, agissons avec une certaine légèreté, et pouvons accorder une chance, si l’infraction n’est pas trop grave.',
        },
        {
          kind: 'text',
          key: 'politique-pourquoi',
          body: '### Pourquoi ?\n\nPour deux raisons :\n\n- **La stratégie éducative** : un comportement plus enclin, plus compréhensif réduit nettement les actions récidivistes.\n- **La protection du Modérateur** : un bon comportement réduit drastiquement les chances de créer des ennuis. Un Modérateur compréhensif, qui n’applique pas un froid littéral aura davantage de chances de se faire écouter plutôt qu’un Modérateur qui agit par professionnalisme idéal.\n\nC’est par cette méthodologie-là que nous avons réussi à concevoir une atmosphère et une réputation solide et mettre en confiance les personnes venues se détendre sur nos lives.',
        },
        {
          kind: 'text',
          key: 'politique-sevir',
          body: '### Dans quels cas sévir ?\n\nLa sévérité intervient selon plusieurs critères :\n\n- La gravité de la situation,\n- Le passif dudit concerné,\n- Le sujet ou les demandes actuelles.\n\nLa plupart du temps, c’est assez instinctif : lorsqu’on tente la voie de la pédagogie, s’ensuit automatiquement une sévérité qui augmente.\n\nDans des cas où ça part vraiment à vau-l’eau, le Coordinateur du Live peut avoir reçu l’ordre de ses Responsables de durcir automatiquement toute action.\n\nDe temps en temps, agir fermement peut être la solution pour éviter que ça empire. Il faut simplement éviter que ce genre de stratégies soient trop fréquentes.\n\nCréer une bonne mesure de gravité permet également à la communauté de connaître les limites et ainsi s’auto-réguler.',
        },
        {
          kind: 'text',
          key: 'politique-protection',
          body: '### Ta protection avant tout\n\nSelon la situation, Jérémy, ou un Responsable peut apparaître et prendre le lead sur la situation. Pas contre toi, simplement que si une situation est considérée à risque pour un modérateur, ou doit être immédiatement changée : l’Administration en porte la responsabilité et s’en porte garante, pour éviter que les Modérateurs prennent cette charge mentale.',
        },
        {
          kind: 'text',
          key: 'politique-hierarchie',
          body: '### Hiérarchie décisionnelle\n\nDans la majorité des Lives, un Coordinateur est désigné pour faire la passation sur la Coordination, la transmission d’informations, ou bien sur les décisions mineures.\n\nCependant, un live comporte des imprévus. L’échelle d’autorité s’applique donc du plus bas, au plus haut :',
        },
        {
          kind: 'hierarchy',
          key: 'politique-echelle',
          rungs: [
            { source: 'admins', label: 'Administration', tone: 'danger' },
            { source: 'responsables', label: 'Responsables YouTube et Twitch', tone: 'caution' },
            { source: 'coordinator', label: 'Coordinateur de Live', tone: 'success' },
          ],
        },
        {
          kind: 'text',
          key: 'politique-regles',
          body: '**Lorsqu’un Coordinateur de Lives donne une consigne** : celle-ci est considérée comme **continuellement** applicable tant qu’il ne l’a pas modifiée explicitement.\n\n**Lorsqu’un Responsable apparaît** : il peut décider sans préavis de prendre le lead, ainsi Coordinateurs, Référents et Modérateurs se réfèrent à ses demandes et ses consignes. Le Coordinateur les fera alors appliquer continuellement.\n\n**Lorsque Jérémy apparaît** : l’équipe entière s’en réfère en priorité à ses demandes. Jérémy ne donne pas de consignes contraires au responsable, il peut les faire évoluer, cependant si un Responsable donne une consigne de modération : celle-ci a forcément été communiquée à Jérémy en amont. Ses apparitions sont surtout dues à des demandes sur le coup, le Coordinateur est le principal interlocuteur dans ces cas-là.',
        },
        {
          kind: 'scene',
          key: 'politique-cas-vague',
          title: 'Cas d’étude : la vague insiste',
          context:
            'La vague revient. Le Coordinateur donne une consigne, puis un Responsable arrive. Regarde la scène, puis réponds.',
          scene: WAVE_INSIST_SCENE,
          questions: [
            {
              key: 'consigne',
              prompt:
                'Vingt minutes plus tard, le Coordinateur n’a rien dit de plus. Sa consigne s’applique-t-elle encore ?',
              choices: [
                {
                  key: 'oui',
                  label: 'Oui, tant qu’il ne l’a pas modifiée explicitement',
                  correct: true,
                },
                {
                  key: 'non',
                  label: 'Non, une consigne ne dure que quelques minutes',
                  correct: false,
                },
              ],
              explanation:
                'Une consigne du Coordinateur est continuellement applicable tant qu’il ne l’a pas modifiée.',
            },
            {
              key: 'lead',
              prompt: 'Le Responsable prend le lead. À qui te réfères-tu désormais ?',
              choices: [
                {
                  key: 'responsable',
                  label: 'Au Responsable, le Coordinateur fait appliquer ses consignes',
                  correct: true,
                },
                { key: 'coordinateur', label: 'Toujours au Coordinateur seul', correct: false },
                { key: 'moi', label: 'À mon propre jugement', correct: false },
              ],
              explanation:
                'Quand un Responsable prend le lead, Coordinateurs, Référents et Modérateurs se réfèrent à ses demandes.',
            },
            {
              key: 'pourquoi',
              prompt: 'Pourquoi l’Administration peut-elle reprendre la main sur une situation ?',
              choices: [
                {
                  key: 'protection',
                  label: 'Pour porter la responsabilité et t’éviter cette charge mentale',
                  correct: true,
                },
                { key: 'sanction', label: 'Parce que le modérateur a mal agi', correct: false },
              ],
              explanation:
                'Ce n’est pas contre toi : l’Administration se porte garante d’une situation à risque.',
            },
          ],
        },
      ],
    },
    {
      key: 'application',
      title: 'Notre méthode d’application',
      blocks: [
        {
          kind: 'text',
          key: 'application-intro',
          body: 'Ce chapitre va essentiellement porter sur la manière dont nous appliquons les sanctions, dans quelles mesures, et nos référentiels.',
        },
        {
          kind: 'text',
          key: 'application-livecon',
          body: '### Le Livecon\n\nC’est un dispositif dont tu entendras bien souvent parler.\n\nLe **livecon** est une variante de niveau d’alerte. Plus le niveau d’alerte est bas, plus la situation est tendue et requiert une vigilance accrue.\n\nChaque niveau d’alerte dispose de ses propres règles et consignes. Il est donc impératif de les respecter coûte que coûte. Dans le cas de questions, dirige-toi vers ton formateur, ou vers tes responsables.\n\nÀ mesure que les états se dégradent, les mesures de modération et de communication s’intensifient :',
        },
        {
          kind: 'livecon',
          key: 'application-niveaux',
          stops: [
            { level: 3, text: 'Aucun problème, le créateur se porte bien.' },
            {
              level: 2,
              text: 'Un début de dramas, de forcing ou de pressing sur le créateur.',
              notes: [
                'La modération doit avoir une vigilance accrue et faire en sorte que le créateur puisse passer un bon moment, sans qu’il soit perturbé.',
              ],
            },
            {
              level: 1,
              text: 'Dramas totaux.',
              notes: [
                'La Modération n’a plus l’autorisation de parler publiquement, pour sa sécurité et pour faciliter la communication autour du créateur. Seul Jérémy doit pouvoir intervenir.',
                'Dans le cas d’un Livecon 1 : Jérémy est appelé sur la totalité des lives.',
              ],
            },
          ],
        },
        {
          kind: 'text',
          key: 'application-intervenir',
          body: '### Comment intervenir dans ces cas-là ?\n\nTu as pu le voir sur le visuel, le Livecon influe immédiatement sur le panel de sanctions.\n\nDe ton côté, tu n’as strictement rien à faire : tu dois simplement suivre ce que t’indique le panel de sanctions en tant que Junior.',
        },
        {
          kind: 'text',
          key: 'application-panel',
          body: '### Le panel de Sanctions\n\nLe panel de Sanctions est établi selon des critères précis, mais ne dispose pas d’une vérité absolue. Les plus expérimentés ne s’en serviront pas par réflexe : à mesure que tu effectueras des lives, des actes de modération, tu sauras comment réagir et tu te construiras ta propre réflexion.\n\nNos modérateurs ne sont pas conditionnés à suivre tout un cheminement. Il s’agit d’une suite logique proposée et fortement recommandée. Suivre cette logique permet de s’aligner automatiquement sur notre politique de modération et ainsi être à l’aise dans énormément de situations rencontrées.',
        },
        {
          kind: 'scene',
          key: 'application-cas-vague',
          title: 'Cas d’étude : la vague devient un drama',
          context:
            'La vague déborde sur les réseaux, le Livecon descend. Regarde la scène jusqu’au bout, puis réponds.',
          scene: WAVE_DRAMA_SCENE,
          questions: [
            {
              key: 'parler',
              prompt: 'Le Livecon passe à 1. Peux-tu encore écrire publiquement dans le chat ?',
              choices: [
                { key: 'non', label: 'Non, seul Jérémy intervient publiquement', correct: true },
                { key: 'oui', label: 'Oui, pour rassurer la communauté', correct: false },
              ],
              explanation:
                'En Livecon 1, la Modération ne parle plus publiquement, pour sa sécurité et pour faciliter la communication autour du créateur.',
            },
            {
              key: 'appel',
              prompt: 'Qui est appelé sur la totalité des lives en Livecon 1 ?',
              choices: [
                { key: 'jeremy', label: 'Jérémy', correct: true },
                { key: 'coordinateur', label: 'Le Coordinateur de chaque live', correct: false },
              ],
              explanation:
                'Dans le cas d’un Livecon 1, Jérémy est appelé sur la totalité des lives.',
            },
            {
              key: 'panel',
              prompt: 'En tant que Junior, comment choisis-tu la sanction à appliquer ?',
              choices: [
                {
                  key: 'panel',
                  label: 'Je suis ce qu’indique le panel de sanctions',
                  correct: true,
                },
                { key: 'instinct', label: 'Je choisis à l’instinct', correct: false },
                { key: 'max', label: 'Je bannis directement, c’est un drama', correct: false },
              ],
              explanation:
                'Le Livecon met le panel à jour : en Junior, tu suis simplement ce qu’il indique.',
            },
          ],
        },
      ],
    },
  ],
}
