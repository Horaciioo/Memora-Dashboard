import { WRITTEN_CONTEXTS } from '@/declarations/recruitment/questionnaire/contexts'
import type {
  QuestionBranch,
  QuestionDefinition,
} from '@/declarations/recruitment/questionnaire/types'

// Reminder shared by every exercise
const REBOUND_HINT = 'Rebondis au moins une fois sur sa réponse.'

// Contexts numbered across both levels
const WRITTEN_BRANCHES: QuestionBranch[] = [
  { when: 'Difficulté modérée', level: 'moderate' },
  { when: 'Difficulté complexe', level: 'complex' },
].map(({ when, level }) => ({
  key: level,
  when,
  asks: WRITTEN_CONTEXTS.map((context, index) => ({ context, number: index + 1 }))
    .filter(({ context }) => context.level === level)
    .map(({ context, number }) => ({
      key: context.key,
      text: `Contexte ${number} : ${context.brief}`,
    })),
}))

/**
 * Practical exercises of the interview
 * @type {readonly QuestionDefinition[]}
 */

export const SITUATION_QUESTIONS: readonly QuestionDefinition[] = [
  {
    key: 'exercise.sixty',
    part: 'situation',
    section: 'exercise',
    kind: 'exercise',
    exercise: 'sixty',
    recommended: true,
    minutes: 5,
    prompt: '⚡ Les 60 secondes',
    hint: `Voir s’il garde son sang-froid, répond vite sans trop réfléchir et réagit dans les moments cruciaux. ${REBOUND_HINT}`,
    say: 'Je vais [te|vous] soumettre à un exercice de rapidité et de réflexion immédiate. Chaque question devra être répondue en 5 à 10 secondes. Si [ta|votre] réponse dépasse le délai, je m’autorise à [te|vous] couper la parole et à passer à la suivante. [Ne réfléchis pas trop loin, dis ce qui te passe|Ne réfléchissez pas trop loin, dites ce qui vous passe] par la tête : ce qui compte, c’est la rapidité et la cohérence.',
    steps: [
      {
        prompt: 'Comment [réagis-tu|réagissez-vous] si {member} spamme et floode des emojis ?',
        pause: '5 s',
      },
      {
        prompt: 'Si un autre modérateur sanctionne {member} pour rien, que [fais-tu|faites-vous] ?',
        pause: '5 s',
      },
      {
        prompt: 'Si {member} insulte {creator} dans {chat}, que [fais-tu|faites-vous] ?',
        pause: '5 s',
      },
      {
        prompt:
          '{member} joue avec les limites sans jamais les dépasser. Quel est [ton|votre] plan d’action ?',
        pause: '5 s',
      },
      {
        prompt:
          'Un utilisateur évoque son âge et dit être « underage » {voice}. Que [fais-tu|faites-vous] ?',
        pause: '5 s',
      },
      {
        prompt:
          'Un groupe arrive avec des photos de profil identiques et des pseudos similaires. Que [fais-tu|faites-vous] ?',
        pause: '5 s',
      },
      {
        prompt:
          'Un raid de 400 personnes arrive {inSpace}, [tu es|vous êtes] seul(e) à modérer. Comment [procèdes-tu|procédez-vous] ?',
        pause: '5 s',
      },
      {
        prompt:
          'Un utilisateur menace de faire du doxxing contre {member}. Comment [réagis-tu|réagissez-vous] ?',
        pause: '10 s',
      },
    ],
    digs: [
      {
        key: 'selonPourquoi',
        text: 'Selon [toi|vous], pourquoi je [te|vous] soumets cet exercice ?',
      },
      { key: 'confiantReponses', text: '[Tu es|Vous êtes] confiant(e) de [tes|vos] réponses ?' },
      {
        key: 'vieChoses',
        text: 'Dans la vie, [tu fais|vous faites] les choses par rapidité ou [tu réfléchis|vous réfléchissez] bien avant d’agir ?',
      },
    ],
  },
  {
    key: 'exercise.written',
    part: 'situation',
    section: 'exercise',
    kind: 'exercise',
    exercise: 'written',
    recommended: true,
    minutes: 6,
    prompt: '✏️ Les contextes écrits',
    hint: 'Deux réponses écrites. Il partage son écran : vérifie qu’il n’utilise ni correcteur ni aide extérieure. Laisse-lui 2 minutes, puis demande les textes finaux en message privé.',
    say: 'Passons à un exercice écrit. Je [te|vous] demande un partage d’écran, [tu as|vous avez] 15 secondes. [Tu devras|Vous devrez] choisir un contexte modéré et un contexte complexe. Je [t’énonce|vous énonce] les titres, on commence par les modérés.',
    branches: WRITTEN_BRANCHES,
  },
  {
    key: 'exercise.mediation',
    part: 'situation',
    section: 'exercise',
    kind: 'exercise',
    exercise: 'cases',
    minutes: 7,
    prompt: '⚖️ Le cas de médiation',
    hint: `Équité, écoute, jugement dans un conflit : prend-il le temps de comprendre les deux versions, pose-t-il les bonnes questions, cherche-t-il à résoudre plutôt qu’à sanctionner aveuglément ? ${REBOUND_HINT}`,
    say: 'Je vais [te|vous] présenter un conflit entre deux membres, avec la version de chacun. J’aimerais que [tu m’expliques|vous m’expliquiez] comment [tu gérerais|vous géreriez] cette situation.',
    scenario: `**Version d’Alex :** « Jordan n’arrête pas de me suivre partout. À chaque fois que je parle, il me coupe la parole ou se moque de ce que je dis. Hier il a même imité ma voix devant tout le monde pour me ridiculiser. Ça fait des semaines que ça dure et personne ne fait rien. J’ai fini par lui dire de me lâcher, et là il a pété un câble en disant que je suis parano. »

**Version de Jordan :** « Alex exagère complètement. On se croise parce qu’on a les mêmes centres d’intérêt, c’est normal. Je ne me moque pas de lui, on fait juste des blagues entre nous. Hier je plaisantais gentiment et lui s’est énervé direct, agressif, devant tout le monde. C’est lui qui m’a insulté en premier, moi j’ai juste répondu. Il est hyper susceptible et maintenant il veut me faire bannir. »`,
    steps: [
      {
        prompt:
          'Comment [vas-tu mener ton|allez-vous mener votre] enquête pour comprendre ce qui s’est réellement passé ?',
        pause: '20 à 30 s',
      },
      {
        prompt: 'Quelles questions précises [poserais-tu|poseriez-vous] à Alex et à Jordan ?',
        pause: '20 à 30 s',
      },
      {
        prompt:
          'Comment [déterminerais-tu|détermineriez-vous] qui a raison, ou s’il y a une part de responsabilité de chaque côté ?',
        pause: '20 à 30 s',
      },
      {
        prompt:
          'Quelle serait [ta|votre] décision finale, et comment [l’expliquerais-tu|l’expliqueriez-vous] aux deux ?',
        pause: '30 à 40 s',
      },
    ],
    digs: [
      {
        key: 'apresDecision',
        text: 'Que [ferais-tu|feriez-vous] si, après [ta|votre] décision, l’un des deux [t’accuse|vous accuse] de favoritisme ?',
      },
      {
        key: 'toujoursPossible',
        text: 'Est-il toujours possible de trouver « le coupable » dans un conflit ?',
      },
      {
        key: 'gereraisCela',
        text: 'Comment [gérerais-tu|géreriez-vous] le fait que cela s’est passé devant d’autres membres, qui ont peut-être leur propre version ?',
      },
    ],
  },
  {
    key: 'exercise.logs',
    part: 'situation',
    section: 'exercise',
    kind: 'exercise',
    exercise: 'cases',
    minutes: 8,
    prompt: '📊 L’analyse de logs',
    hint: `Recul, lecture du contexte humain derrière les messages : voit-il au-delà des infractions, repère-t-il les émotions et les dynamiques de groupe, est-il nuancé ? ${REBOUND_HINT}`,
    say: 'Je vais [te|vous] partager l’historique d’une situation. [Prends|Prenez] le temps de le lire, [tu as|vous avez] environ une minute.',
    scenario: `Historique de {chat}, le 18 décembre 2025, de 21h30 à 22h00.

\`\`\`
[21:32] MaxGaming: Les gens qui jouent à Fortnite en 2024 sont vraiment des gamins attardés lol
[21:33] LunaSkye: Excuse-moi ?? J'y joue et je suis pas attardée merci
[21:33] MaxGaming: Calme toi c'est une blague mdrr
[21:34] LunaSkye: C'est pas drôle comme blague, trouve mieux
[21:35] TheoVibe: @LunaSkye il a raison pourtant, ce jeu c'est pour les 12 ans
[21:35] MaxGaming: Merci Theo au moins quelqu'un qui comprend
[21:36] LunaSkye: Vous êtes sérieux là ? Vous vous croyez supérieurs parce que vous jouez à quoi ? LoL ?
[21:37] TheoVibe: Ouais et alors, au moins c'est un vrai jeu compétitif
[21:37] LunaSkye: N'importe quoi vous êtes juste toxiques
[21:38] MaxGaming: Toxique ? On dit juste la vérité ma pauvre
[21:39] SarahLePoint: Hey les gars vous pouvez arrêter ? Laissez les gens jouer à ce qu'ils veulent
[21:40] TheoVibe: Toi on t'a rien demandé Sarah, mêle toi de tes affaires
[21:40] MaxGaming: +1
[21:41] LunaSkye: Merci Sarah, au moins y'a des gens normaux ici
[21:42] TheoVibe: Ouais bien sûr les filles se défendent entre elles comme d'hab
[21:43] SarahLePoint: Sérieux ? T'es en train de dire quoi là ?
[21:44] LunaSkye: Non mais laisse tomber Sarah, ils sont juste pathétiques
[21:45] MaxGaming: Pathétique ? Venant de toi c'est drôle
[21:46] TheoVibe: Bon on arrête de feed les rageux et on retourne jouer ?
[21:46] MaxGaming: Go
[21:47] LunaSkye: J'en ai marre de ce serveur, c'est toujours pareil
[21:48] SarahLePoint: Luna attends, signale les à la modération
\`\`\``,
    steps: [
      {
        prompt:
          'Que s’est-il passé dans cette conversation selon [toi|vous] ? [Analyse|Analysez] la situation.',
        pause: '30 à 40 s',
      },
      {
        prompt: '[Identifie|Identifiez] les comportements problématiques. Qui a fait quoi ?',
        pause: '30 à 40 s',
      },
      {
        prompt:
          'Des éléments du contexte ou des émotions peuvent-ils expliquer certaines réactions ?',
        pause: '20 à 30 s',
      },
      {
        prompt:
          'Comment [aurais-tu|auriez-vous] géré cette situation en temps réel ? Et maintenant que c’est terminé ?',
        pause: '40 à 50 s',
      },
      {
        prompt: 'Quelles sanctions [appliquerais-tu|appliqueriez-vous], s’il y en a, et à qui ?',
        pause: '30 à 40 s',
      },
    ],
    digs: [
      {
        key: 'lunaskyePart',
        text: 'LunaSkye a-t-elle une part de responsabilité dans l’escalade ?',
      },
      {
        key: 'gereraisSarahlepoint',
        text: 'Comment [gérerais-tu|géreriez-vous] le fait que SarahLePoint, qui a voulu aider, s’est aussi fait attaquer ?',
      },
      {
        key: 'maxgamingTheovibe',
        text: 'Si MaxGaming et TheoVibe disent « on plaisantait », cela change-t-il [ta|votre] décision ?',
      },
    ],
  },
  {
    key: 'exercise.priority',
    part: 'situation',
    section: 'exercise',
    kind: 'exercise',
    exercise: 'cases',
    minutes: 6,
    prompt: '🎯 Le test de priorisation',
    hint: `Bon sens et maturité face à des situations simultanées : notion d’urgence, gravité, cohérence de ses choix sous pression. ${REBOUND_HINT}`,
    say: '[Tu es|Vous êtes] de modération et plusieurs situations se déclenchent en même temps. [Tu es|Vous êtes] seul(e) disponible. Je [t’en|vous en] présente cinq : [classe-les|classez-les] de la plus urgente à la moins urgente, puis [explique-moi|expliquez-moi] pourquoi. [Tu as|Vous avez] une minute de réflexion. L’IA est interdite : au moindre doute, l’exercice pourrait ne pas être compté.',
    scenario: `**Situation A :** {member} poste un lien suspect {inChat} qui pourrait être un virus. Plusieurs personnes ont déjà cliqué dessus.

**Situation B :** Deux personnes se disputent {voice}. Ça s’envenime avec des insultes légères mais reste gérable pour l’instant.

**Situation C :** Un nouveau envoie 15 messages d’affilée pour poser des questions. Ce n’est pas vraiment du spam, mais c’est envahissant.

**Situation D :** [Tu reçois|Vous recevez] un message privé d’{member} qui vient de voir des messages à caractère sexuel impliquant potentiellement un mineur. Il n’a pas de capture d’écran, mais dit que c’est sérieux.

**Situation E :** {member} spamme des emojis {inChat} depuis 2 minutes, une trentaine de messages.`,
    steps: [
      {
        prompt:
          '[Donne-moi ton|Donnez-moi votre] ordre de priorité, de 1 (plus urgent) à 5 (moins urgent).',
        pause: '20 à 30 s',
      },
      {
        prompt: 'Pourquoi avoir classé la situation la plus urgente en premier ?',
        pause: '20 à 30 s',
      },
      { prompt: 'Pourquoi avoir classé la moins urgente en dernier ?', pause: '20 à 30 s' },
      {
        prompt:
          'Comment [gérerais-tu|géreriez-vous] concrètement les 3 plus urgentes, dans quel ordre et avec quelles actions ?',
        pause: '40 à 60 s',
      },
    ],
    digs: [
      {
        key: 'autreModerateur',
        text: 'Si un autre modérateur arrive, vers quelle situation le [dirigerais-tu|dirigeriez-vous] en priorité ?',
      },
      {
        key: 'pendantPriorite',
        text: 'Que [ferais-tu|feriez-vous] si, pendant la priorité 1, la priorité 3 s’aggravait soudainement ?',
      },
      {
        key: 'bonneReponse',
        text: 'Y a-t-il une « bonne » réponse absolue, ou plusieurs réponses défendables ?',
      },
    ],
  },
  {
    key: 'exercise.dilemma',
    part: 'situation',
    section: 'exercise',
    kind: 'exercise',
    exercise: 'cases',
    minutes: 6,
    prompt: '⚖️ Le dilemme imparfait',
    hint: `Révèle ses valeurs : comment il tranche sans solution parfaite, s’il assume, quelles valeurs il privilégie au compromis. ${REBOUND_HINT}`,
    say: 'Je vais [te|vous] placer dans une situation inconfortable : quelle que soit [ta|votre] décision, il y aura des conséquences négatives. Ce qui m’intéresse, c’est [ton|votre] raisonnement et les valeurs que [tu privilégies|vous privilégiez]. Je [te|vous] propose d’en débattre.',
    scenario: `[Tu modères|Vous modérez] {space} depuis quelques mois. **Tom** en fait partie depuis plus de 2 ans, il est apprécié, aide les nouveaux, organise des évènements : un pilier de la communauté.

Mais depuis quelques semaines, il a des comportements limites : des blagues qui frôlent le harcèlement, des remarques déplacées cachées derrière « l’humour », des excuses suivies de récidive. Plusieurs personnes [t’ont|vous ont] signalé en privé qu’elles ne se sentent plus à l’aise. [Tu en as|Vous en avez] parlé avec lui, il a dit qu’il ferait attention. Hier, il a recommencé avec un nouveau, qui a failli partir.

L’équipe est divisée : certains veulent un bannissement définitif (il a eu plusieurs chances), d’autres un simple timeout (il fait beaucoup pour la communauté). C’est à [toi|vous] de trancher.

**S’il est banni :** ses amis proches risquent de partir avec lui, environ 15 à 20 personnes actives. La communauté en souffrira.

**S’il n’est pas banni, ou seulement un timeout :** ceux qui se sont plaints penseront que [tu le protèges|vous le protégez] parce qu’il est populaire. Certains perdront confiance et partiront aussi. Le message serait que les règles ne s’appliquent pas à tout le monde.`,
    steps: [
      {
        prompt:
          'Premier débat, la sanction : bannissement définitif, timeout ou autre chose ? Pourquoi, et qu’est-ce qui est le plus important ici ?',
        pause: '2 min maximum',
      },
      {
        prompt:
          'Second débat : quelles sont les conséquences négatives de [ta|votre] décision ? [Tu l’assumerais|Vous l’assumeriez] publiquement, [tu les gères|vous les gérez] comment ? Plutôt sécuriser [ta|votre] crédibilité ou la sacrifier ?',
        pause: '2 min maximum',
      },
      {
        prompt:
          'Troisième débat : si [tes|vos] collègues ne sont pas d’accord, comment [réagis-tu|réagissez-vous] ? [Tu fais|Vous faites] confiance à [ton|votre] jugement, ou [tu te remets|vous vous remettez] en question ?',
      },
    ],
    digs: [
      {
        key: 'populariteAnciennete',
        text: 'La popularité ou l’ancienneté d’un membre devrait-elle influencer les sanctions ?',
      },
      {
        key: 'situationsFaut',
        text: 'Y a-t-il des situations où il faut accepter de perdre des membres pour maintenir ses principes ?',
      },
      {
        key: 'tomEtait',
        text: 'Si Tom était un membre lambda sans amis, [aurais-tu|auriez-vous] pris la même décision ?',
      },
    ],
  },
]
