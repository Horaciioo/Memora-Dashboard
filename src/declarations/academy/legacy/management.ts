import type { Course } from '@/declarations/academy/curriculum/types'

/**
 * Common Legacy module about managing volunteers, from motivation to feedback
 * @type {Course}
 */

export const LEGACY_MANAGEMENT: Course = {
  key: 'legacy-management',
  name: 'Manager des bénévoles',
  summary:
    'Motiver, donner du feedback et poser un cadre sans jamais oublier que ton équipe est là par envie.',
  track: 'legacy',
  surface: 'general',
  functions: [],
  minutes: 45,
  chapters: [
    {
      key: 'motivation',
      title: 'Ce qui fait rester un bénévole',
      blocks: [
        {
          kind: 'text',
          key: 'motivation-text',
          body: 'Un bénévole ne reçoit ni salaire ni menace de licenciement : il **reste parce qu’il en a envie**. Ton rôle de Responsable n’est pas de le pousser, mais de créer les conditions pour que l’envie dure.\n\nTrois besoins reviennent partout en psychologie de la motivation : l’**autonomie** (choisir comment), la **compétence** (progresser, se sentir utile) et l’**appartenance** (faire partie d’un groupe). Quand un des trois manque, la motivation s’éteint.',
        },
        {
          kind: 'sort',
          key: 'motivation-sort',
          title: 'Quel besoin nourris-tu ?',
          prompt: 'Range chaque geste selon le besoin qu’il alimente en priorité.',
          buckets: [
            { key: 'autonomy', label: 'Autonomie' },
            { key: 'competence', label: 'Compétence' },
            { key: 'belonging', label: 'Appartenance' },
          ],
          items: [
            {
              key: 'slots',
              label: 'Laisser chacun choisir ses créneaux de permanence',
              bucket: 'autonomy',
            },
            {
              key: 'idea',
              label: 'Laisser un modérateur proposer une amélioration du panel',
              bucket: 'autonomy',
            },
            {
              key: 'training',
              label: 'Proposer une formation plus avancée à qui progresse',
              bucket: 'competence',
            },
            {
              key: 'feedback',
              label: 'Souligner une progression précise dans un bilan',
              bucket: 'competence',
            },
            {
              key: 'vocal',
              label: 'Organiser un vocal d’équipe sans ordre du jour',
              bucket: 'belonging',
            },
            {
              key: 'welcome',
              label: 'Accueillir un nouveau par son prénom devant l’équipe',
              bucket: 'belonging',
            },
          ],
          explanation:
            'Choisir (autonomie), progresser (compétence), faire partie du groupe (appartenance). Un bon Responsable regarde lequel des trois manque à chacun.',
        },
        {
          kind: 'quiz',
          key: 'motivation-quiz',
          title: 'Deux situations',
          questions: [
            {
              key: 'q1',
              prompt:
                'Un modérateur très fiable commence à venir moins souvent, sans reproche de personne. Que fais-tu en premier ?',
              choices: [
                {
                  key: 'a',
                  label: 'Je lui demande comment il va et ce qui a changé pour lui',
                  correct: true,
                },
                { key: 'b', label: 'Je lui rappelle qu’il s’est engagé', correct: false },
                { key: 'c', label: 'Je le retire du planning pour le sanctionner', correct: false },
              ],
              explanation:
                'Un retrait a presque toujours une cause : fatigue, ennui, manque de reconnaissance. On écoute avant de rappeler un engagement, sinon on accélère le départ.',
            },
            {
              key: 'q2',
              prompt: 'Qu’est-ce qui décourage le plus un bénévole compétent ?',
              choices: [
                { key: 'a', label: 'Des consignes floues et changeantes', correct: true },
                { key: 'b', label: 'Un bilan honnête, même critique', correct: false },
                { key: 'c', label: 'Un cadre clair et stable', correct: false },
              ],
              explanation:
                'Un cadre clair rassure. Ce qui use, c’est de ne jamais savoir ce qu’on attend de soi.',
            },
          ],
        },
      ],
    },
    {
      key: 'feedback',
      title: 'Donner un feedback qui aide',
      blocks: [
        {
          kind: 'steps',
          key: 'feedback-steps',
          title: 'Situation, comportement, impact',
          steps: [
            {
              title: 'La situation',
              body: 'Quand et où : « Hier soir, pendant le live de 21 h ».',
            },
            {
              title: 'Le comportement',
              body: 'Ce que tu as **observé**, sans interpréter : « Tu as laissé passer trois spams sans réagir ».',
            },
            {
              title: 'L’impact',
              body: 'Ce que ça a produit : « Le chat s’est rempli et le streamer a dû s’arrêter. Comment l’as-tu vécu ? »',
            },
          ],
        },
        {
          kind: 'order',
          key: 'feedback-order',
          title: 'Construire le message',
          prompt: 'Remets les parties d’un feedback dans l’ordre.',
          items: [
            { key: 'context', label: 'Poser le moment précis' },
            { key: 'fact', label: 'Décrire ce qui a été observé' },
            { key: 'impact', label: 'Dire l’effet produit' },
            { key: 'question', label: 'Demander son point de vue' },
          ],
          explanation:
            'On part du fait, jamais du jugement, puis on ouvre la parole : un feedback est un dialogue.',
        },
        {
          kind: 'sort',
          key: 'feedback-sort',
          title: 'Fait ou interprétation ?',
          prompt: 'Sépare ce qui se constate de ce qui se suppose.',
          buckets: [
            { key: 'fact', label: 'Un fait' },
            { key: 'opinion', label: 'Une interprétation' },
          ],
          items: [
            {
              key: 'late',
              label: 'Tu es arrivé 20 minutes après le début du live',
              bucket: 'fact',
            },
            { key: 'spam', label: 'Trois spams sont restés dans le chat', bucket: 'fact' },
            { key: 'lazy', label: 'Tu ne t’investis plus', bucket: 'opinion' },
            { key: 'care', label: 'Tu t’en fiches', bucket: 'opinion' },
          ],
          explanation:
            'Un fait se vérifie, une interprétation se discute. Elle braque la personne avant même que tu aies fini ta phrase.',
        },
        {
          kind: 'case',
          key: 'feedback-case',
          title: 'Le retard répété',
          context:
            'Nolan, modérateur depuis un an, est arrivé en retard à ses trois dernières permanences. Il reste efficace une fois présent, et l’équipe l’apprécie.',
          questions: [
            {
              type: 'choice',
              key: 'c1',
              prompt: 'Quelle ouverture choisis-tu ?',
              choices: [
                {
                  key: 'a',
                  label:
                    '« Ces trois dernières permanences, tu es arrivé après le début. Comment ça se passe pour toi en ce moment ? »',
                  correct: true,
                },
                {
                  key: 'b',
                  label: '« Tu n’es plus fiable, il faut que ça change. »',
                  correct: false,
                },
                { key: 'c', label: '« Encore en retard, comme d’habitude. »', correct: false },
              ],
              explanation:
                'La bonne ouverture pose des faits et une question ouverte. Les deux autres jugent la personne.',
            },
            {
              type: 'open',
              key: 'c2',
              prompt: 'Rédige ton feedback complet, en quatre phrases au plus.',
              expert:
                'Nolan, ces trois dernières permanences, tu es arrivé une vingtaine de minutes après le début. Le chat est resté sans modérateur un moment, et Malo a dû gérer seul. Une fois là, ton travail est excellent et l’équipe y tient. Comment ça se passe pour toi en ce moment, et qu’est-ce qui t’aiderait à tenir ce créneau ?',
            },
          ],
        },
      ],
    },
    {
      key: 'cadre',
      title: 'Poser un cadre et une autorité',
      blocks: [
        {
          kind: 'text',
          key: 'cadre-text',
          body: 'L’autorité d’un Responsable ne vient pas de son titre mais de sa **cohérence**. Une équipe suit quelqu’un qui dit ce qu’il fait, fait ce qu’il dit et traite chacun de la même façon.\n\nUn cadre solide tient en trois choses : des **attentes claires**, des **limites constantes** et des **explications** plutôt que des ordres.',
        },
        {
          kind: 'callout',
          key: 'cadre-rule',
          tone: 'rule',
          title: 'Ferme sur le cadre, souple sur la personne',
          body: 'Tu peux refuser un comportement et rester bienveillant envers celui qui l’a eu. Les deux ne s’opposent pas.',
        },
        {
          kind: 'simulation',
          key: 'cadre-sim',
          title: 'Un modérateur conteste ta décision',
          surface: 'discord',
          context:
            'Tu viens de demander à Léa de revoir un timeout jugé trop lourd. Elle te répond en public dans le salon de l’équipe.',
          steps: [
            {
              key: 's1',
              lines: [
                {
                  author: 'Léa',
                  text: 'franchement je trouve ça injuste, j’ai suivi le panel à la lettre',
                  role: 'moderator',
                },
                {
                  author: 'Malo',
                  text: 'c’est vrai que le panel est clair là-dessus',
                  role: 'moderator',
                },
              ],
              prompt: 'Quelle est ta première réponse ?',
              options: [
                {
                  key: 'listen',
                  label:
                    'Je reconnais qu’elle a suivi le panel, je propose d’en discuter en privé et je vérifie ma lecture',
                  correct: true,
                  feedback:
                    'Exact : tu écoutes, tu ne tranches pas devant tout le monde et tu acceptes de te tromper.',
                },
                {
                  key: 'impose',
                  label: '« C’est moi qui décide, on n’en parle plus. »',
                  correct: false,
                  feedback:
                    'Imposer avec ton titre coûte en confiance. Si tu as tort, tu perds davantage qu’en le reconnaissant.',
                },
                {
                  key: 'give-in',
                  label: '« D’accord, garde ta version, oublie ma demande. »',
                  correct: false,
                  feedback:
                    'Céder sans avoir vérifié montre que le cadre dépend de la pression, pas des règles.',
                },
              ],
            },
            {
              key: 's2',
              lines: [{ author: 'Léa', text: 'ok on en parle en privé, merci', role: 'moderator' }],
              prompt: 'En privé, tu constates que Léa avait raison. Que fais-tu ?',
              options: [
                {
                  key: 'admit',
                  label: 'Je le reconnais simplement et je corrige ma consigne devant l’équipe',
                  correct: true,
                  feedback:
                    'Exact : admettre une erreur renforce l’autorité, elle devient crédible.',
                },
                {
                  key: 'hide',
                  label: 'Je change la consigne sans rien dire',
                  correct: false,
                  feedback:
                    'L’équipe voit la contradiction sans comprendre pourquoi. Elle perd ses repères.',
                },
                {
                  key: 'defend',
                  label: 'Je maintiens ma position pour ne pas perdre la face',
                  correct: false,
                  feedback:
                    'Défendre une erreur pour l’image est le chemin le plus sûr pour perdre le respect.',
                },
              ],
            },
          ],
        },
        {
          kind: 'quiz',
          key: 'cadre-quiz',
          title: 'Autorité et cohérence',
          questions: [
            {
              key: 'q1',
              prompt: 'Qu’est-ce qui rend un Responsable crédible ?',
              choices: [
                {
                  key: 'a',
                  label: 'Sa cohérence entre ce qu’il dit et ce qu’il fait',
                  correct: true,
                },
                { key: 'b', label: 'Son ancienneté dans l’équipe', correct: false },
                { key: 'c', label: 'Sa capacité à ne jamais se tromper', correct: false },
              ],
              explanation:
                'La crédibilité se gagne dans la durée, par la cohérence et l’honnêteté, pas par l’infaillibilité.',
            },
          ],
        },
      ],
    },
  ],
}
