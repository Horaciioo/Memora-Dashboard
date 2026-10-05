import type { Course } from '@/declarations/academy/curriculum/types'

/**
 * Legacy module of the Discord trade
 * @type {Course}
 */

export const LEGACY_DISCORD: Course = {
  key: 'legacy-discord',
  name: 'Responsable Discord',
  summary:
    'Superviser la modération du serveur avec Marsha : historique, corrections et préparation aux crises.',
  track: 'legacy',
  surface: 'discord',
  functions: ['Discord'],
  minutes: 35,
  chapters: [
    {
      key: 'superviser',
      title: 'Superviser avec Marsha',
      blocks: [
        {
          kind: 'text',
          key: 'superviser-text',
          body: 'Un Responsable Discord ne modère pas plus que les autres : il **regarde le tableau d’ensemble**. Il repère qui est très actif, qui ne l’est plus, et si l’équipe applique les paliers de la même façon.',
        },
        {
          kind: 'command',
          key: 'superviser-stats',
          title: 'Voir l’activité de l’équipe',
          prompt:
            'Affiche les statistiques de modération du serveur, sans viser un modérateur en particulier.',
          accepted: ['/mod-statistics'],
          hint: 'Une commande avec une barre oblique, sans argument.',
          explanation:
            '`/mod-statistics` : le nombre d’infractions par type, les modérateurs les plus actifs et les tendances.',
        },
        {
          kind: 'command',
          key: 'superviser-auto',
          title: 'Comprendre une sanction automatique',
          prompt: 'Affiche ce que l’auto-modération a fait sur `@Pseudo`.',
          accepted: ['!auto-moderation @Pseudo'],
          hint: 'Le nom complet de la commande, puis le membre.',
          explanation:
            '`!auto-moderation @Pseudo` : utile pour comprendre pourquoi un membre a déjà été averti ou rendu muet sans intervention humaine.',
        },
        {
          kind: 'quiz',
          key: 'superviser-quiz',
          title: 'Corriger sans casser',
          questions: [
            {
              key: 'q1',
              prompt:
                'Un modérateur a posé une sanction trop lourde. Que fais-tu de l’infraction ?',
              choices: [
                {
                  key: 'a',
                  label:
                    'J’ouvre son détail avec /infractions get et je corrige la raison ou la durée',
                  correct: true,
                },
                { key: 'b', label: 'Je la supprime pour qu’elle ne se voie plus', correct: false },
                { key: 'c', label: 'Je laisse faire, puis je préviens le membre', correct: false },
              ],
              explanation:
                'La correction est tracée avec son auteur et sa date. La suppression est irréversible : elle se réserve aux erreurs de membre ou aux appels acceptés.',
            },
            {
              key: 'q2',
              prompt: 'Que fais-tu quand deux modérateurs appliquent différemment le même palier ?',
              choices: [
                {
                  key: 'a',
                  label: 'Je les réunis pour fixer la lecture du panel et je le note',
                  correct: true,
                },
                {
                  key: 'b',
                  label: 'Je donne raison à celui qui a le plus d’ancienneté',
                  correct: false,
                },
                { key: 'c', label: 'Je laisse chacun faire à sa manière', correct: false },
              ],
              explanation:
                'Une règle appliquée de deux façons n’est plus une règle. On clarifie ensemble puis on documente.',
            },
          ],
        },
      ],
    },
    {
      key: 'crise',
      title: 'Préparer les crises',
      blocks: [
        {
          kind: 'order',
          key: 'crise-order',
          title: 'La séquence d’un raid',
          prompt: 'Remets dans l’ordre les décisions que tu fais prendre à ton équipe.',
          items: [
            { key: 'mode', label: 'Activer le mode anti-raid prévu' },
            { key: 'proof', label: 'Garder la preuve des messages' },
            { key: 'ban', label: 'Bannir les comptes du raid' },
            { key: 'clean', label: 'Nettoyer le serveur' },
            { key: 'disable', label: 'Désactiver le mode anti-raid' },
          ],
          explanation:
            'On arrête l’arrivée, on garde la preuve, on bannit, on nettoie, puis on rouvre.',
        },
        {
          kind: 'case',
          key: 'crise-case',
          title: 'Un plan pour la nuit',
          context:
            'Un évènement du créateur attire beaucoup de monde ce soir, et vous n’êtes que deux modérateurs de permanence. Vous avez déjà subi un raid le mois dernier.',
          questions: [
            {
              type: 'choice',
              key: 'c1',
              prompt: 'Que prépares-tu avant le début ?',
              choices: [
                {
                  key: 'a',
                  label: 'Les modes anti-raid réglés et un référent clairement désigné',
                  correct: true,
                },
                { key: 'b', label: 'Rien, on verra si un problème arrive', correct: false },
                { key: 'c', label: 'Un long message aux membres sur les règles', correct: false },
              ],
              explanation:
                'En crise, on n’a pas le temps de régler un mode ni de chercher qui décide. Tout se prépare avant.',
            },
            {
              type: 'open',
              key: 'c2',
              prompt:
                'Écris le message de consigne que tu envoies aux deux modérateurs de permanence.',
              expert:
                'Ce soir, Malo est référent : c’est lui qui active le mode anti-raid si plus de 30 comptes arrivent en une minute. Léa gère les sanctions courantes. On se parle dans le salon de l’équipe à chaque décision, et on archive avant de nettoyer. En cas de doute, vous m’appelez, quelle que soit l’heure.',
            },
          ],
        },
      ],
    },
  ],
}

/**
 * Legacy module of the Lives trade
 * @type {Course}
 */

export const LEGACY_LIVES: Course = {
  key: 'legacy-lives',
  name: 'Responsable Lives',
  summary:
    'Décider du livecon, briefer l’équipe avant un live et ajuster le panel à l’ambiance du chat.',
  track: 'legacy',
  surface: 'lives',
  functions: ['Lives'],
  minutes: 35,
  chapters: [
    {
      key: 'livecon',
      title: 'Piloter le livecon',
      blocks: [
        {
          kind: 'text',
          key: 'livecon-text',
          body: 'Le **livecon** est le niveau d’attention du chat : il décide du barème que ton équipe applique. Le **3** est le plus calme, le **2** demande de la vigilance, le **1** est une crise. C’est toi qui le changes, **selon les besoins**, et l’équipe s’aligne aussitôt.',
        },
        {
          kind: 'sort',
          key: 'livecon-sort',
          title: 'Faut-il monter le livecon ?',
          prompt: 'Classe ces situations.',
          buckets: [
            { key: 'raise', label: 'Je monte le livecon' },
            { key: 'keep', label: 'Je le garde' },
          ],
          items: [
            {
              key: 'raid',
              label: 'Une vague de comptes récents inonde le chat de liens',
              bucket: 'raise',
            },
            {
              key: 'hate',
              label: 'Un invité polémique déclenche des insultes en rafale',
              bucket: 'raise',
            },
            {
              key: 'harass',
              label: 'Des viewers coordonnés harcèlent un autre viewer',
              bucket: 'raise',
            },
            { key: 'hype', label: 'Le chat s’emballe de joie après une victoire', bucket: 'keep' },
            { key: 'long', label: 'Le chat est actif et bavard, sans problème', bucket: 'keep' },
          ],
          explanation:
            'On monte le livecon face à un **danger réel ou coordonné**. Une ambiance festive n’en est pas un : monter pour de l’euphorie rendrait l’équipe trop sévère.',
        },
        {
          kind: 'quiz',
          key: 'livecon-quiz',
          title: 'Décider vite et bien',
          questions: [
            {
              key: 'q1',
              prompt: 'Une fois le livecon changé, que dois-tu faire savoir à ton équipe ?',
              choices: [
                { key: 'a', label: 'Le nouveau niveau et pourquoi', correct: true },
                { key: 'b', label: 'Rien, elle verra le changement', correct: false },
                { key: 'c', label: 'Seulement le niveau, jamais la raison', correct: false },
              ],
              explanation:
                'Le motif aide l’équipe à ajuster son jugement. Un niveau sans explication se suit sans se comprendre.',
            },
            {
              key: 'q2',
              prompt: 'Quand redescends-tu le livecon ?',
              choices: [
                {
                  key: 'a',
                  label: 'Quand la situation est calmée depuis un moment',
                  correct: true,
                },
                { key: 'b', label: 'Dès la première minute de calme', correct: false },
                { key: 'c', label: 'Jamais avant la fin de la journée', correct: false },
              ],
              explanation:
                'Redescendre trop tôt fait repartir la crise, rester haut trop longtemps use l’équipe et le chat.',
            },
          ],
        },
      ],
    },
    {
      key: 'briefing',
      title: 'Briefer avant un live',
      blocks: [
        {
          kind: 'order',
          key: 'briefing-order',
          title: 'Le briefing',
          prompt: 'Remets dans l’ordre les points d’un briefing avant le live.',
          items: [
            { key: 'context', label: 'Le contexte du live : invité, sujet, moment sensible' },
            { key: 'level', label: 'Le livecon en vigueur et pourquoi' },
            { key: 'roles', label: 'Qui fait quoi pendant le live' },
            { key: 'signal', label: 'Comment se signaler un problème' },
          ],
          explanation:
            'Contexte, niveau, rôles, signal : l’équipe entre dans le live en sachant ce qui l’attend et qui décide.',
        },
        {
          kind: 'case',
          key: 'briefing-case',
          title: 'Un invité qui fait débat',
          context:
            'Ce soir, le créateur reçoit un invité connu pour attirer des critiques violentes. Trois modérateurs sont prévus, dont un débutant.',
          questions: [
            {
              type: 'choice',
              key: 'c1',
              prompt: 'Que fais-tu avant le live ?',
              choices: [
                {
                  key: 'a',
                  label:
                    'Je passe au livecon adapté, je place le débutant avec un binôme et je brief l’équipe',
                  correct: true,
                },
                {
                  key: 'b',
                  label: 'Je laisse le livecon habituel pour ne pas dramatiser',
                  correct: false,
                },
                { key: 'c', label: 'Je demande au débutant de ne pas intervenir', correct: false },
              ],
              explanation:
                'Anticiper coûte moins cher que réagir. Le binôme protège le débutant sans l’écarter.',
            },
            {
              type: 'open',
              key: 'c2',
              prompt: 'Écris le message de briefing que tu envoies à l’équipe.',
              expert:
                'Ce soir, invité polémique : je passe au livecon 2 dès le début du live, on redescendra si le chat reste calme. Malo et Léa gèrent le chat, Nolan est avec Léa pour apprendre. Au moindre débordement, signalez-le ici et j’ajuste. Pas d’hésitation à supprimer, on garde la même règle pour tous.',
            },
          ],
        },
      ],
    },
  ],
}

/**
 * Legacy module of the Animateurs trade
 * @type {Course}
 */

export const LEGACY_ANIMATORS: Course = {
  key: 'legacy-animateurs',
  name: 'Responsable Animateurs',
  summary:
    'Préparer, animer et clore un évènement en répartissant les rôles et en tirant les leçons.',
  track: 'legacy',
  surface: 'general',
  functions: ['Animateurs'],
  minutes: 35,
  chapters: [
    {
      key: 'preparer',
      title: 'Préparer un évènement',
      blocks: [
        {
          kind: 'text',
          key: 'preparer-text',
          body: 'Un bon évènement se gagne **avant** qu’il commence. Le Responsable Animateurs ne fait pas tout : il s’assure que **chaque rôle est tenu** et que **chacun sait quand intervenir**.',
        },
        {
          kind: 'order',
          key: 'preparer-order',
          title: 'La préparation',
          prompt: 'Remets les étapes de préparation dans l’ordre.',
          items: [
            { key: 'goal', label: 'Fixer l’objectif de l’évènement' },
            { key: 'format', label: 'Choisir le format et la durée' },
            { key: 'roles', label: 'Répartir les rôles' },
            { key: 'rehearse', label: 'Répéter les moments clés avec l’équipe' },
            { key: 'announce', label: 'Annoncer l’évènement' },
          ],
          explanation:
            'L’objectif décide du format, le format des rôles. On répète avant d’annoncer, pour ne rien promettre qu’on ne tienne pas.',
        },
        {
          kind: 'quiz',
          key: 'preparer-quiz',
          title: 'Les rôles',
          questions: [
            {
              key: 'q1',
              prompt: 'Pourquoi désigner un référent pendant l’évènement ?',
              choices: [
                {
                  key: 'a',
                  label: 'Pour que quelqu’un décide quand un imprévu arrive',
                  correct: true,
                },
                { key: 'b', label: 'Pour qu’un seul animateur parle', correct: false },
                { key: 'c', label: 'Pour éviter de briefer l’équipe', correct: false },
              ],
              explanation:
                'Sans référent, chacun hésite ou décide seul. Un imprévu demande une seule voix.',
            },
          ],
        },
      ],
    },
    {
      key: 'clore',
      title: 'Animer et clore',
      blocks: [
        {
          kind: 'case',
          key: 'clore-case',
          title: 'Un évènement qui déraille',
          context:
            'À mi-parcours d’un évènement communautaire, la moitié des participants décroche et deux animateurs se marchent sur les pieds.',
          questions: [
            {
              type: 'choice',
              key: 'c1',
              prompt: 'Que fais-tu ?',
              choices: [
                {
                  key: 'a',
                  label:
                    'Je clarifie discrètement les rôles et je relance avec un moment simple pour tous',
                  correct: true,
                },
                {
                  key: 'b',
                  label: 'Je reprends tout en main et je parle à la place des animateurs',
                  correct: false,
                },
                { key: 'c', label: 'J’arrête l’évènement immédiatement', correct: false },
              ],
              explanation:
                'On corrige sans humilier les animateurs et on redonne au groupe quelque chose de simple à faire ensemble.',
            },
            {
              type: 'open',
              key: 'c2',
              prompt: 'Quelles trois questions poses-tu à l’équipe pour le bilan ?',
              expert:
                'Ce qui a bien marché et pourquoi ? Ce qui a coincé, et à quel moment précis ? Qu’est-ce qu’on change la prochaine fois, et qui s’en occupe ?',
            },
          ],
        },
      ],
    },
  ],
}
