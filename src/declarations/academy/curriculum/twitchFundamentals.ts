import { VOICE_CHANNELS } from '@/declarations/academy/curriculum/scenes/voiceScenes'
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
  WAVE_INSIST_REACTION,
  WAVE_INSIST_SCENE,
  WAVE_START_SCENE,
} from '@/declarations/academy/curriculum/scenes/twitchScenes'
import { INSULT_LEVELS } from '@/declarations/academy/curriculum/scenes/liveconLadders'
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
  maturity: 'new',
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
      key: 'introduction',
      title: 'Introduction',
      blocks: [
        {
          kind: 'text',
          key: 'vue-accueil',
          title: 'Bienvenue',
          body: 'Bienvenue à toi dans ce premier chapitre !\n\nTu verras, la Vue Modérateur peut faire peur, elle a beaucoup de boutons, beaucoup d’options, mais t’inquiète : nous allons tout te décortiquer minutieusement pour que tu puisses mieux comprendre.',
        },
        {
          kind: 'ask',
          key: 'vue-pret',
          prompt: 'Tu es prêt(e) à démarrer ?',
          yes: 'Oui !',
          no: 'Retour à l’Accueil',
          note: 'Si au cours de la Formation, des questions te viennent à l’esprit, note-les pour les poser à ton Référent ou à ton Formateur.',
        },
        {
          kind: 'text',
          key: 'vue-objectif',
          title: 'Objectif de la formation',
          body: 'Modérer un live Twitch peut faire un peu peur au départ, et c’est totalement normal : tu es garant de l’ambiance du chat et de la sécurité de la communauté, mais t’inquiète, tu vas vite prendre tes marques !',
        },
        { kind: 'outline', key: 'vue-plan' },
        {
          kind: 'text',
          key: 'vue-debut',
          title: 'Ton outil de modération',
          body: 'Bien, commençons par le commencement !\n\nTout d’abord, regardons ensemble ce qui constituera ton outil de modération pour les temps à venir. Plus tard, nous pourrons décortiquer chacun de ces éléments.',
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
          title: 'On décortique ?',
          prompt:
            'Maintenant que tu as pu voir un visuel de ton futur outil, si on décortiquait ce qui t’intéresse ?\n\nParmi les options ci-dessous, choisis celle qui t’intéresse et tu pourras en apprendre davantage, avec des cas d’étude qui lui sont propres.',
          items: [
            {
              key: 'chat',
              label: 'Chat',
              windows: ['chat'],
              scene: CHAT_SCENE,
              points: [
                'Le Chat, c’est là que tout se passe : c’est par lui que les Streamers échangent avec leur communauté.',
                'C’est aussi là que tu appliques tes actions de modération. Nous les verrons en détail plus loin dans la formation.',
                'Tu peux également y échanger avec la communauté, dans le respect des consignes du Livecon en vigueur.',
              ],
            },
            {
              key: 'communaute',
              label: 'Communauté',
              windows: ['community'],
              scene: COMMUNITY_SCENE,
              points: [
                'Tu y retrouves tes collègues présents, ainsi que la liste des Membres et des VIPs. Cette fenêtre est avant tout informative.',
              ],
            },
            {
              key: 'titre',
              label: 'Titre de la Page',
              windows: ['stream'],
              spotlight: 'title',
              scene: TITLE_SCENE,
              points: [
                'Le titre du live est toujours annoncé ici. Tu y retrouves aussi ses tags de référencement et, sur la gauche, sa catégorie.',
              ],
            },
            {
              key: 'automod',
              label: 'File d’Attente de l’Auto-Mod',
              windows: ['automod', 'chat'],
              scene: AUTOMOD_SCENE,
              points: [
                'Cette file est propre à nos outils AutoMod et Nightbot : les messages contenant un mot interdit y sont retenus, enveloppés en rouge.',
                'Tu peux aussi les repérer directement dans le Chat, mais nous te déconseillons de les modérer depuis là : le flux va vite et les clics malencontreux sont fréquents.',
                'Selon la situation, tu peux filtrer le type de contenu affiché.',
              ],
            },
            {
              key: 'actions',
              label: 'Action de Modération',
              windows: ['modActions'],
              scene: ACTIONS_SCENE,
              points: [
                'Cette fenêtre est le journal d’activité du live : tu y vois l’action de chacun, de tes collègues aux Responsables, jusqu’à l’équipe du créateur ou le créateur lui-même.',
                'C’est très utile quand plusieurs personnes repèrent la même infraction : tu vérifies tout de suite si l’action a déjà été réalisée.',
                'Tu y trouves notamment les messages supprimés, l’ajout ou le retrait de termes bloqués, les sanctions (ban, déban, timeout…) et les demandes d’annulation de bannissement, que seul Jérémy peut traiter.',
                '**Attention** : ici, chacun progresse à son rythme. Ce n’est ni une compétition, ni un outil de dénonciation. Si tu penses qu’un Modérateur ou un Junior abuse de ses droits, parles-en uniquement à ton Formateur : ne fais pas justice toi-même.',
              ],
            },
            {
              key: 'mode',
              label: 'Mode',
              windows: ['chat'],
              spotlight: 'modes',
              scene: MODES_SCENE,
              points: [
                'Cette liste déroulante change la façon dont nous modérons. Chaque mode a ses propres règles d’activation :\n\n- **Mode bouclier**, **Chat réservé aux abonnés** et **Réservé aux Followers** : uniquement par Jérémy.\n- **Chat en émoticônes uniquement** : sur demande ou à l’initiative de Jérémy, ou sous son ordre. Les Responsables ou le Coordinateur doivent alors l’activer rapidement.\n- **Mode lent** : par Jérémy, les Responsables ou le Coordinateur, selon l’affluence, la difficulté de modération ou la demande du créateur.',
                'Deux listes complètent ces modes :\n\n- **Termes bloqués** : les termes que l’AutoMod retient et qu’il est impossible d’écrire. Le Coordinateur peut en ajouter, en retirer ou les modifier.\n- **Termes autorisés** : des termes normalement bloqués, temporairement autorisés pour la communauté, souvent selon le sujet ou le débat en cours.',
              ],
            },
            {
              key: 'options',
              label: 'Les 3 petits points',
              windows: ['chat'],
              spotlight: 'chatOptions',
              scene: OPTIONS_SCENE,
              points: [
                'Les trois petits points règlent l’affichage de nombreuses informations dans le Chat.',
                'Par défaut, nous te conseillons de tout afficher.',
              ],
            },
          ],
        },
        {
          kind: 'scene',
          key: 'vue-cas-vague',
          title: 'Cas d’étude : la vague commence',
          context:
            'Ce soir, un groupe de comptes s’en prend à {creator}. Regarde la Vue Modérateur pendant que la vague démarre, puis réponds aux questions.',
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
                'Tu repères le message « {creator} t’es une arnaque ». Comment sais-tu qu’un collègue l’a déjà traité ?',
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
      key: 'livecon',
      title: 'Livecon',
      blocks: [
        { kind: 'step', key: 'livecon-fonctionnement', title: 'Son fonctionnement' },
        {
          kind: 'text',
          key: 'livecon-explications',
          title: 'Les explications',
          body: 'Le Livecon est le fil directeur de la stratégie de Modération. C’est ce dispositif qui dicte comment la modération se comporte publiquement et quelle sanction elle privilégie.',
        },
        {
          kind: 'text',
          key: 'livecon-pourquoi',
          title: 'Pourquoi ce dispositif ?',
          body: 'Il permet de s’adapter efficacement aux besoins du moment du Streamer : s’il est sujet à des dramas ou à des tendances qui l’importunent, le Livecon peut être ajusté pour s’aligner sur la façon dont il souhaite que le sujet soit traité.',
        },
        {
          kind: 'sanctionBox',
          key: 'livecon-boite',
          offense: 'Insulte grave → {creator}',
          example: '{creator} j’te b*, sale fils de ****',
          levels: INSULT_LEVELS,
        },
        {
          kind: 'text',
          key: 'livecon-qui',
          title: 'Qui juge son niveau ?',
          body: 'Le niveau ne se décide jamais depuis le chat : la décision descend la chaîne. Elle part de Jérémy, passe par l’Administration, puis par le Coordinateur de live, et arrive jusqu’à la Modération. L’équipe du créateur, elle, passe toujours par Jérémy.',
        },
        {
          kind: 'orgChart',
          key: 'livecon-organigramme',
          nodes: [
            { key: 'jeremy', label: 'Jérémy', x: 80, y: 9, role: 'owner' },
            { key: 'team', label: 'Équipe de {creator}', x: 128, y: 31, role: 'outside' },
            { key: 'administration', label: 'Administration', x: 80, y: 53, role: 'admin' },
            { key: 'coordinator', label: 'Coordinateur de live', x: 80, y: 75, role: 'lead' },
            { key: 'moderation', label: 'Modération', x: 80, y: 94, role: 'moderation' },
          ],
          links: [
            { from: 'team', to: 'jeremy', turns: true },
            { from: 'jeremy', to: 'administration' },
            { from: 'administration', to: 'coordinator' },
            { from: 'coordinator', to: 'moderation' },
          ],
          bubbles: [
            { node: 'jeremy', text: 'Le drama X est incontrôlable, on descend en Livecon.' },
            {
              node: 'administration',
              text: 'Durcissement des sanctions pour le drama X, tentons de l’étouffer au plus vite.',
            },
            {
              node: 'coordinator',
              text: 'Les gars, l’administration veut que le drama X soit traité avec fermeté : on applique.',
            },
          ],
        },
        { kind: 'step', key: 'livecon-communication', title: 'L’impact sur la communication' },
        {
          kind: 'text',
          key: 'livecon-implique',
          title: 'Ce qu’un niveau implique',
          strongTone: 'danger',
          body: 'Il ne modifie pas seulement la stratégie et la méthode d’application des sanctions : il intervient aussi dans la communication.\n\nSi le Livecon tombe à **1**, la modération n’a plus l’autorisation de parler librement dans le chat. C’est à la fois pour sa sécurité, et pour laisser à Jérémy et à l’équipe du Streamer mieux maîtriser le sujet préoccupant, sans à-coup.',
        },
        {
          kind: 'rules',
          key: 'livecon-consignes',
          title: 'Les consignes associées',
          rows: [
            {
              level: 3,
              text: 'Aucun problème remonté : la Modération peut parler librement, sans trop de risques.',
            },
            {
              level: 2,
              text: 'Début de vigilance : la Modération contrôle ses propos, évite le dialogue direct et fait attention à ne pas alimenter le sujet préoccupant naissant.',
            },
            {
              level: 1,
              text: 'La Modération ne parle plus, même pour répondre à des questions. Elle doit être un fantôme pur et dur.',
            },
          ],
        },
        { kind: 'step', key: 'livecon-archetypes', title: 'Les 3 archétypes de vigilance' },
        {
          kind: 'text',
          key: 'livecon-niveaux',
          title: 'Explication des niveaux',
          body: 'Chaque niveau correspond à un état d’esprit précis :\n\n- **Livecon 3, période normale** : tout est normal, la gestion du live suit son cours habituel.\n- **Livecon 2, vigilance renforcée** : période instable, drama à petite échelle, l’équipe est sur ses gardes.\n- **Livecon 1, période critique** : harcèlement, drama à grande échelle portant atteinte à la bienséance du chat.\n\nRegarde comment une même infraction, une insulte grave envers {creator}, voit sa sanction se durcir à mesure que le Livecon baisse :',
        },
        {
          kind: 'sanctionCompare',
          key: 'livecon-sanctions',
          offense: 'Insulte grave → {creator}',
          levels: INSULT_LEVELS,
        },
        {
          kind: 'text',
          key: 'livecon-jugement',
          title: 'Le jugement humain',
          body: 'À force d’affronter des situations comme celles-ci, ton jugement humain saura réagir rapidement. Tant que tu restes aligné avec les consignes, tu peux tout à fait adapter ta réaction selon ton propre jugement.\n\n**Attention** cependant : lorsqu’une consigne précise est donnée, par exemple « Réaliser un TO de 5 h à ceux qui disent X mots », tu dois la respecter, voire durcir selon la situation. Jamais de minimisation.',
        },
        {
          kind: 'callout',
          key: 'livecon-pourquoi-note',
          tone: 'rule',
          title: 'Pourquoi ?',
          body: 'La Modération et la crédibilité du YouTubeur sont étroitement liées. Les actions des deux parties doivent rester cohérentes, et parfois la dureté ou l’ignorance est la meilleure stratégie pour stopper le sujet le plus vite possible.',
        },
        { kind: 'step', key: 'livecon-cas', title: 'Cas d’étude' },
        {
          kind: 'text',
          key: 'application-intervenir',
          title: 'Comment intervenir dans ces cas-là ?',
          body: 'Tu as pu le voir sur le visuel, le Livecon influe immédiatement sur le panel de sanctions.\n\nDe ton côté, tu n’as strictement rien à faire : tu dois simplement suivre ce que t’indique le panel de sanctions en tant que Junior.',
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
                { key: 'non', label: 'Non, l’équipe n’apparaît plus du tout', correct: true },
                { key: 'oui', label: 'Oui, pour rassurer la communauté', correct: false },
              ],
              explanation:
                'En Livecon 1, l’apparition de l’équipe est totalement interdite, pour sa sécurité et pour faciliter la communication autour du créateur.',
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
    {
      key: 'vocaux',
      title: 'Vocaux de Modération',
      blocks: [
        {
          kind: 'text',
          key: 'vocaux-must',
          title: 'Les vocaux, un Must',
          body: 'Lorsqu’un live débute, les Modérateurs sont habitués à lancer un vocal sur le serveur communautaire de Miguel ! Pendant toute ta période d’intégration, tu as l’obligation d’être en vocal. Pas besoin de parler, tu peux rester à l’écrit, mais tu dois être en mesure d’entendre le coordinateur, ton Référent et les Tuteurs à tout moment s’ils s’adressent à toi.\n\nSi tu arrives avant que le live n’ait commencé, tu peux créer le vocal toi-même, sinon tu rejoins celui déjà ouvert par les autres modérateurs.\n\nDes directives spécifiques sont transmises régulièrement, pense à bien les prendre en compte et à adapter ta modération en conséquence.\n\nLes vocaux permettent :\n\n- La passation bien plus facile d’informations,\n- D’être plus efficace, à plusieurs,\n- De passer un meilleur moment.',
        },
        {
          kind: 'voices',
          key: 'vocaux-animation',
          channels: VOICE_CHANNELS,
        },
        {
          kind: 'text',
          key: 'politique-hierarchie',
          title: 'Hiérarchie décisionnelle',
          body: 'Dans la majorité des Lives, un Coordinateur est désigné pour faire la passation sur la Coordination, la transmission d’informations, ou bien sur les décisions mineures.\n\nCependant, un live comporte des imprévus. L’échelle d’autorité s’applique donc du plus bas, au plus haut :',
        },
        {
          kind: 'hierarchy',
          key: 'politique-echelle',
          rungs: [
            { source: 'admins', label: 'Administration', tone: 'danger' },
            { source: 'responsables', label: 'Responsables YouTube et Twitch', tone: 'caution' },
            { source: 'coordinator', label: 'Coordinateur de Live', tone: 'info' },
          ],
        },
        {
          kind: 'roles',
          key: 'politique-regles',
          title: 'Consignes et apparitions',
          rows: [
            {
              label: 'Le Coordinateur de Live',
              tone: 'info',
              side: 'left',
              text: 'Dans la majorité des cas, il constitue le premier interlocuteur dans la chaîne de passation de consignes. Sa mission première consiste à s’assurer que les directives soient **continuellement** respectées.',
            },
            {
              label: 'Un Responsable apparaît',
              tone: 'caution',
              side: 'right',
              text: 'Lorsqu’un Responsable apparaît, il prend ainsi le **lead** de la situation et constitue donc une priorité à prendre en compte, tant pour le Coordinateur que pour les Modérateurs. Les Responsables agissent dans des cas qui nécessitent une action de Modération immédiate.',
            },
            {
              label: 'Jérémy apparaît',
              tone: 'danger',
              side: 'center',
              text: 'Lorsque Jérémy apparaît, l’équipe entière s’en réfère en priorité à ses demandes. Cependant, il ne donne pas de consignes de Modération contraires à celles des Responsables. Ses apparitions sont surtout dues à des demandes spécifiques pour le bien du Live.',
            },
          ],
        },
        {
          kind: 'scene',
          key: 'politique-cas-vague',
          title: 'Cas d’étude : la vague insiste',
          context:
            'La vague revient. Lis la passation de consignes, puis regarde ce qu’elle change dans le chat et dans le fil d’Attente de l’auto-mod.',
          conversation: [
            {
              from: 'coordinator',
              to: 'moderator',
              text: 'Yo la team, la vague est de retour. On supprime tous leurs messages et on ne répond à personne en public, ok ?',
            },
            { from: 'moderator', to: 'coordinator', text: 'Ok, on s’en occupe 👍' },
            {
              from: 'responsable',
              to: 'coordinator',
              text: 'Salut ! Je viens de voir passer ça. Ils écrivent tous le même mot, « arnaque ». Tu peux le mettre en badword s’il te plaît ?',
            },
            {
              from: 'coordinator',
              to: 'moderator',
              text: 'Nouvelle consigne les gars : on passe le mot « arnaque » et ses dérivés en badword !',
            },
            {
              from: 'moderator',
              to: 'coordinator',
              text: 'C’est fait ! Il ressort bien en rouge dans le chat.',
            },
            {
              from: 'responsable',
              to: 'coordinator',
              text: 'Parfait, merci. Et pour ceux qui l’écrivent, pas de timeout : bannissement direct.',
            },
            {
              from: 'coordinator',
              to: 'moderator',
              text: 'Nickel. Bannissement direct pour ceux qui écrivent ce mot, et je garde un œil sur l’Attente de l’auto-mod.',
            },
          ],
          scene: WAVE_INSIST_SCENE,
          reaction: WAVE_INSIST_REACTION,
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
              key: 'badword',
              prompt:
                'Le Responsable demande de bloquer « arnaque ». Où retrouves-tu ce mot ensuite ?',
              choices: [
                {
                  key: 'rouge',
                  label: 'En rouge dans le chat et dans le fil d’Attente de l’auto-mod',
                  correct: true,
                },
                { key: 'cache', label: 'Nulle part, le mot disparaît simplement', correct: false },
              ],
              explanation:
                'Un mot bloqué est surligné en rouge dans le chat, et les messages qui le contiennent attendent ta décision dans le fil d’Attente.',
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
      key: 'panel-sanctions',
      title: 'Le Panel de Sanctions',
      blocks: [
        {
          kind: 'panelStack',
          key: 'panel-outil',
          title: 'Le Panel de Sanctions',
          where: 'Le panel de sanctions se trouve dans la page',
          page: { icon: 'liveconCrisis', label: 'Panel de sanctions' },
          intro:
            'C’est l’outil qui te permet de savoir comment réagir selon le type de message dans le chat. Tes actions dépendent de plusieurs facteurs :',
          panel: {
            level: 3,
            levelAccent: 'success',
            groups: [
              {
                gravity: 'HIGH',
                offenses: ['Insulte envers le créateur', 'Menace → viewer', 'Doxxing'],
              },
              { gravity: 'LOW', offenses: ['Spam', 'Majuscule', 'Publicité'] },
            ],
            offense: 'Insulte envers le créateur',
            tiers: INSULT_LEVELS[0]!.tiers,
          },
          factors: [
            {
              icon: 'livecon',
              label: 'Le Livecon du moment',
              text: 'Plus il est bas, plus tout se durcit.',
            },
            {
              icon: 'warning',
              label: 'La gravité du message',
              text: 'Une pique n’est pas une menace.',
            },
            {
              icon: 'history',
              label: 'Les récidives',
              text: 'L’historique du viewer pèse sur ta décision.',
            },
            {
              icon: 'lead',
              label: 'Les directives des responsables',
              text: 'Elles passent avant le reste.',
            },
            {
              icon: 'chat',
              label: 'La dynamique du chat',
              text: 'Un chat qui s’emballe change la donne.',
            },
            {
              icon: 'clock',
              label: 'Le temps à disposition',
              text: 'Chat très actif, peu de mods, etc.',
            },
          ],
          outro:
            'Prends le temps de consulter le panel avant d’appliquer une sanction. Si t’as besoin de vérifier quelque chose, tu peux mettre un TO de 5 minutes pour te permettre de regarder l’historique du viewer et le panel de sanctions. Pense juste à prévenir tes collègues que ce timeout est temporaire.',
        },
        {
          kind: 'text',
          key: 'application-panel',
          title: 'Une suite logique recommandée',
          body: 'Le panel de Sanctions est établi selon des critères précis, mais ne dispose pas d’une vérité absolue. Les plus expérimentés ne s’en serviront pas par réflexe : à mesure que tu effectueras des lives, des actes de modération, tu sauras comment réagir et tu te construiras ta propre réflexion.\n\nNos modérateurs ne sont pas conditionnés à suivre tout un cheminement. Il s’agit d’une suite logique proposée et fortement recommandée. Suivre cette logique permet de s’aligner automatiquement sur notre politique de modération et ainsi être à l’aise dans énormément de situations rencontrées.',
        },
        {
          kind: 'judgement',
          key: 'jugement-tango',
          title: "Cas d'étude : Tango s’emporte",
          context:
            'Nous allons nous concentrer sur **Tango** : un viewer de longue date, toujours très gentil. Ce soir, il en a marre qu’un autre viewer parle « trop parfaitement » à son goût, et il s’emporte un peu. Regarde la scène, ouvre sa fiche et le panel du Livecon en cours, puis décide.',
          chat: [
            { author: 'Alpha', text: 'Salut tout le monde, belle soirée !' },
            {
              author: 'Victor',
              text: 'Bonsoir à tous. Je tenais à souligner la qualité remarquable de cette discussion.',
            },
            { author: 'Tango', text: 'haha Victor, tu parles comme un livre' },
            {
              author: 'Victor',
              text: 'Je m’efforce simplement de m’exprimer correctement, Tango, c’est une question de rigueur.',
            },
            { author: 'Tango', text: 'ouais bon, on t’a pas demandé un discours' },
            {
              author: 'Victor',
              text: 'Il me semble pourtant que la grammaire est un plaisir partagé.',
            },
            {
              author: 'Tango',
              text: 'ta grammaire c’est qu’une m*.#rde, arrête de nous saouler',
              flagged: true,
            },
            { author: 'Alpha', text: 'oula, ça chauffe ce soir' },
          ],
          viewer: 'Tango',
          facts: [
            {
              key: 'created',
              icon: 'history',
              label: 'Compte créé',
              value: 'Mars 2021, il y a 5 ans',
              blink: true,
            },
            {
              key: 'messages',
              icon: 'chat',
              label: 'Messages',
              value: '12 480',
              blink: true,
            },
            { key: 'sub', icon: 'star', label: 'Abonné depuis', value: '3 ans' },
            { key: 'follow', icon: 'viewer', label: 'Présent sur', value: '214 lives' },
          ],
          panel: {
            level: 3,
            levelAccent: 'success',
            offense: 'Insulte grave → viewer',
            tiers: [
              { condition: 'Dès constaté', measures: ['Suppression', 'Avertissement'] },
              { condition: '1re récidive', measures: ['TO : 1 heure'] },
              { condition: '2e récidive', measures: ['TO : 5 heures'] },
            ],
          },
          question:
            'Tango semble s’être levé du mauvais pied aujourd’hui. Selon toi, il mérite tout de même une sanction ?',
          answers: { yes: 'Oui, le panel est clair', no: 'Non, pas cette fois' },
          doubt: {
            title: 'T’es sûr ?',
            text: 'Regarde à nouveau les différents visuels : certaines informations clignotent. **La date du compte**, **l’historique** de modération, **le nombre de messages**… Qu’est-ce qu’elles te disent de Tango ?',
          },
          reveal: {
            title: 'L’erreur est humaine',
            text: 'Malheureusement, ça arrive à tout le monde de se lever du mauvais pied. Et c’est tout l’intérêt de notre modération : Tango a toujours été respectueux, très fidèle, très gentil.\n\nAlors même si le panel de sanctions préconise une sanction, **ton jugement humain, lui, va être plus conciliant**. À la limite, pose-lui un petit avertissement avec le `/warn`.',
            action: 'Poser un avertissement',
          },
          warn: {
            command:
              '/warn Tango Mon gars, s’il te plaît, aujourd’hui t’as l’air à cran, calme-toi, on n’aimerait pas avoir à te sanctionner... On s’occupe de lui, t’en fais pas pour ça !',
            message:
              'Mon gars, s’il te plaît, aujourd’hui t’as l’air à cran, calme-toi, on n’aimerait pas avoir à te sanctionner... On s’occupe de lui, t’en fais pas pour ça !',
            reply: { author: 'Tango', text: 'Désolé les modérateurs, merci' },
          },
        },
        {
          kind: 'text',
          key: 'politique-intro',
          title: 'Notre politique de modération',
          body: 'Nos Modérateurs doivent être humains, de « bons amis qui savent poser des limites ». Toutes nos interactions reposent sur la confiance et le respect envers autrui.\n\nNous tutoyons, agissons avec une certaine légèreté, et pouvons accorder une chance, si l’infraction n’est pas trop grave.',
        },
        {
          kind: 'pillars',
          key: 'politique-pourquoi',
          title: 'Pourquoi ?',
          intro: 'Pour deux raisons :',
          items: [
            {
              icon: 'academy',
              tone: 'info',
              label: 'La stratégie éducative',
              text: 'Un comportement plus enclin, plus compréhensif réduit nettement les actions récidivistes.',
            },
            {
              icon: 'shield',
              tone: 'success',
              label: 'La protection du Modérateur',
              text: 'Un bon comportement réduit drastiquement les chances de créer des ennuis. Un Modérateur compréhensif, qui n’applique pas un froid littéral, aura davantage de chances de se faire écouter.',
            },
          ],
          outro:
            'C’est par cette méthodologie-là que nous avons réussi à concevoir une atmosphère et une réputation solide, et à mettre en confiance les personnes venues se détendre sur nos lives.',
        },
        {
          kind: 'severity',
          key: 'politique-sevir',
          title: 'Dans quels cas sévir ?',
          intro:
            'La sévérité intervient selon plusieurs critères. Chacun fait avancer l’aiguille :',
          ends: { calm: 'Pédagogie', firm: 'Fermeté' },
          criteria: [
            { icon: 'warning', label: 'La gravité', text: 'De la situation.' },
            { icon: 'history', label: 'Le passif', text: 'Dudit concerné.' },
            { icon: 'chat', label: 'Le sujet', text: 'Ou les demandes actuelles.' },
          ],
          outro:
            'La plupart du temps, c’est assez instinctif : lorsqu’on tente la voie de la pédagogie, s’ensuit automatiquement une sévérité qui augmente.\n\nDans des cas où ça part vraiment à vau-l’eau, le Coordinateur du Live peut avoir reçu l’ordre de ses Responsables de durcir automatiquement toute action.\n\nDe temps en temps, agir fermement peut être la solution pour éviter que ça empire. Il faut simplement éviter que ce genre de stratégies soient trop fréquentes.\n\nCréer une bonne mesure de gravité permet également à la communauté de connaître les limites et ainsi s’auto-réguler.',
        },
        {
          kind: 'text',
          key: 'politique-protection',
          title: 'Ta protection avant tout',
          body: 'Selon la situation, Jérémy, ou un Responsable peut apparaître et prendre le lead sur la situation. Pas contre toi, simplement que si une situation est considérée à risque pour un modérateur, ou doit être immédiatement changée : l’Administration en porte la responsabilité et s’en porte garante, pour éviter que les Modérateurs prennent cette charge mentale.',
        },
      ],
    },
    {
      key: 'conclusion',
      title: 'Pour conclure',
      blocks: [
        {
          kind: 'text',
          key: 'fin-retenir',
          title: 'Pour conclure',
          body: 'C’est good, t’es au bout de cette formation !\n\nTu as maintenant les fondamentaux pour savoir quoi modérer et quand ! Voici quelques derniers trucs à retenir pour la suite :\n\n- Si ce n’est pas déjà fait, va lire et découvrir le panel de sanctions pour être prêt pour le prochain live\n- Reste attentif au Livecon et adapte ta modération en fonction\n- Utilise les outils à ta disposition (AutoMod, modes de chat…)\n- Communique avec ton équipe',
        },
        {
          kind: 'text',
          key: 'fin-referent',
          title: 'Préviens ton référent',
          body: 'Indique à ton Référent que tu as terminé cette formation. Garde tes notes bien au chaud pour la Revue des Formations.\n\nSi t’as des questions, n’hésite pas à le contacter. Bonne suite !',
        },
      ],
    },
  ],
}
