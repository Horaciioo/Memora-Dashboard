import type { Course } from '@/declarations/academy/curriculum/types'

/**
 * Common Legacy module about conflicts inside a team and the emotional load of moderation
 * @type {Course}
 */

export const LEGACY_CONFLICTS: Course = {
  key: 'legacy-conflits',
  name: 'Conflits & charge émotionnelle',
  summary:
    'Apaiser un désaccord dans l’équipe, repérer l’usure et protéger ceux qui voient passer le pire.',
  track: 'legacy',
  surface: 'general',
  functions: [],
  minutes: 40,
  chapters: [
    {
      key: 'desaccord',
      title: 'Un désaccord dans l’équipe',
      blocks: [
        {
          kind: 'text',
          key: 'desaccord-text',
          body: 'Deux modérateurs qui s’opposent, ce n’est pas un échec : c’est le signe qu’ils tiennent à leur travail. Ce qui devient dangereux, c’est un désaccord qui **dure sans être dit**. Ton rôle est de le sortir du silence avant qu’il devienne une rancune.',
        },
        {
          kind: 'steps',
          key: 'desaccord-steps',
          title: 'Quatre gestes pour apaiser',
          steps: [
            {
              title: 'Écouter chacun séparément',
              body: 'Sans conclure. Chacun doit se sentir entendu avant de rencontrer l’autre.',
            },
            {
              title: 'Séparer faits et interprétations',
              body: '« Il m’a coupé la parole » est un fait. « Il me méprise » est une interprétation.',
            },
            {
              title: 'Reformuler',
              body: 'Redis ce que tu as compris : « Ce qui t’a blessé, c’est d’avoir été repris devant tout le monde. »',
            },
            {
              title: 'Chercher un accord concret',
              body: 'Un engagement précis et petit : « On se dit les désaccords en privé d’abord ».',
            },
          ],
        },
        {
          kind: 'order',
          key: 'desaccord-order',
          title: 'Dans quel ordre agir ?',
          prompt: 'Remets ces gestes dans l’ordre.',
          items: [
            { key: 'listen', label: 'Écouter chacun séparément' },
            { key: 'facts', label: 'Séparer les faits des interprétations' },
            { key: 'reformulate', label: 'Reformuler ce qui a été compris' },
            { key: 'agree', label: 'Se mettre d’accord sur un engagement précis' },
          ],
          explanation:
            'On ne cherche l’accord qu’après avoir écouté et reformulé : sinon il ne tient pas.',
        },
        {
          kind: 'simulation',
          key: 'desaccord-sim',
          title: 'Tension dans le salon des modos',
          surface: 'discord',
          context:
            'Deux modérateurs, Malo et Léa, s’envoient des piques dans le salon de l’équipe depuis deux jours.',
          steps: [
            {
              key: 's1',
              lines: [
                {
                  author: 'Malo',
                  text: 'certains devraient relire le panel avant de sanctionner',
                  role: 'moderator',
                },
                {
                  author: 'Léa',
                  text: 'et d’autres devraient arrêter de donner des leçons',
                  role: 'moderator',
                },
              ],
              prompt: 'Que fais-tu maintenant ?',
              options: [
                {
                  key: 'private',
                  label:
                    'Je propose un échange à chacun en privé, sans prendre parti dans le salon',
                  correct: true,
                  feedback: 'Exact : tu sors la tension de la scène publique et tu écoutes chacun.',
                },
                {
                  key: 'public',
                  label: 'Je tranche en public qui a raison',
                  correct: false,
                  feedback: 'Un verdict public humilie l’un des deux et enflamme l’autre.',
                },
                {
                  key: 'wait',
                  label: 'J’attends que ça passe',
                  correct: false,
                  feedback: 'Un désaccord qui dure sans être dit s’installe et finit en rancune.',
                },
              ],
            },
            {
              key: 's2',
              lines: [
                {
                  author: 'Léa',
                  text: 'ce qui m’a blessée c’est qu’il l’ait dit devant tout le monde',
                  role: 'moderator',
                },
              ],
              prompt: 'Léa te confie ce qui l’a blessée. Comment réagis-tu ?',
              options: [
                {
                  key: 'reformulate',
                  label:
                    '« Si je comprends bien, c’est la remarque publique qui t’a touchée, pas le fond. »',
                  correct: true,
                  feedback:
                    'Exact : la reformulation montre que tu as entendu et vérifie que tu as bien compris.',
                },
                {
                  key: 'minimise',
                  label: '« Ce n’est rien, il ne pensait pas à mal. »',
                  correct: false,
                  feedback: 'Minimiser invalide ce qu’elle ressent et ferme la conversation.',
                },
                {
                  key: 'advice',
                  label: '« Tu devrais moins te formaliser. »',
                  correct: false,
                  feedback: 'Un conseil non demandé ressemble à un reproche.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      key: 'usure',
      title: 'Repérer l’usure',
      blocks: [
        {
          kind: 'text',
          key: 'usure-text',
          body: 'Modérer, c’est lire chaque jour des insultes, des provocations et parfois pire. **L’usure s’installe doucement** : on ne la voit qu’en comparant avec avant. Ton rôle est de repérer les changements, pas de diagnostiquer.',
        },
        {
          kind: 'sort',
          key: 'usure-sort',
          title: 'Signal d’alerte ou variation normale ?',
          prompt: 'Classe ces observations sur un modérateur de ton équipe.',
          buckets: [
            { key: 'alert', label: 'À prendre au sérieux' },
            { key: 'normal', label: 'Variation normale' },
          ],
          items: [
            {
              key: 'cynic',
              label: 'Il devient cynique sur le chat alors qu’il était bienveillant',
              bucket: 'alert',
            },
            {
              key: 'withdraw',
              label: 'Il ne répond plus dans le salon de l’équipe depuis deux semaines',
              bucket: 'alert',
            },
            { key: 'irritable', label: 'Il s’énerve à chaque petite remarque', bucket: 'alert' },
            {
              key: 'exam',
              label: 'Il annonce une semaine moins disponible pour ses examens',
              bucket: 'normal',
            },
            { key: 'quiet', label: 'Il parle moins un soir de fatigue', bucket: 'normal' },
          ],
          explanation:
            'C’est le **changement durable** de comportement qui compte : cynisme, retrait, irritabilité. Une fatigue ponctuelle ou une indisponibilité annoncée sont normales.',
        },
        {
          kind: 'quiz',
          key: 'usure-quiz',
          title: 'Que faire ?',
          questions: [
            {
              key: 'q1',
              prompt:
                'Tu remarques des signes d’usure chez un modérateur. Quelle est la meilleure première étape ?',
              choices: [
                {
                  key: 'a',
                  label: 'Lui proposer une conversation calme et lui offrir une pause',
                  correct: true,
                },
                {
                  key: 'b',
                  label: 'Lui donner davantage de responsabilités pour le motiver',
                  correct: false,
                },
                { key: 'c', label: 'Attendre qu’il demande de l’aide', correct: false },
              ],
              explanation:
                'Une personne usée demande rarement de l’aide. Une conversation sans reproche et une pause valent mieux qu’une charge de plus.',
            },
            {
              key: 'q2',
              prompt: 'Parmi ces mesures, laquelle protège durablement une équipe ?',
              choices: [
                {
                  key: 'a',
                  label: 'Faire tourner les créneaux difficiles entre plusieurs personnes',
                  correct: true,
                },
                {
                  key: 'b',
                  label: 'Confier toujours les pires cas à la personne la plus solide',
                  correct: false,
                },
                { key: 'c', label: 'Ne jamais parler de ce qu’on lit', correct: false },
              ],
              explanation:
                'La rotation répartit la charge. La personne « solide » finit par s’user la première, et se taire aggrave l’isolement.',
            },
          ],
        },
      ],
    },
    {
      key: 'contenus',
      title: 'Les contenus difficiles',
      blocks: [
        {
          kind: 'callout',
          key: 'contenus-warning',
          tone: 'warning',
          title: 'On ne porte pas ça seul',
          body: 'Menaces, propos suicidaires, contenus choquants : personne ne doit gérer seul. Quand un membre de l’équipe est exposé, tu remontes, tu t’assures qu’il n’est pas seul et tu lui laisses le temps de souffler.',
        },
        {
          kind: 'case',
          key: 'contenus-case',
          title: 'Un soir difficile',
          context:
            'Après un live, Malo t’écrit en privé : un viewer a posté des propos très inquiétants dans le chat, il a géré la situation mais il se sent secoué et n’arrive pas à dormir.',
          questions: [
            {
              type: 'choice',
              key: 'c1',
              prompt: 'Quelle est ta priorité ?',
              choices: [
                {
                  key: 'a',
                  label: 'Le soutenir, l’écouter et lui laisser une pause si besoin',
                  correct: true,
                },
                { key: 'b', label: 'Lui rappeler que ça fait partie du travail', correct: false },
                {
                  key: 'c',
                  label: 'Lui demander un rapport écrit avant d’en parler',
                  correct: false,
                },
              ],
              explanation:
                'La personne d’abord, le rapport ensuite. Rappeler que « ça fait partie du travail » minimise ce qu’il vit.',
            },
            {
              type: 'open',
              key: 'c2',
              prompt: 'Écris le premier message que tu lui envoies.',
              expert:
                'Merci de m’avoir écrit, et bravo d’avoir tenu ce soir. Je suis là si tu veux en parler maintenant ou demain, quand tu veux. Tu n’as rien à prouver, on peut aussi te libérer de tes prochaines permanences si tu as besoin de souffler. Tu n’es pas seul là-dessus.',
            },
          ],
        },
      ],
    },
  ],
}
