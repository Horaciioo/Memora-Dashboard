import type { Course } from '@/declarations/academy/curriculum/types'

/**
 * Marsha Bots course, built on the handbook rules and the prefix commands the team types
 * @type {Course}
 */

export const MARSHA_BOT: Course = {
  key: 'marsha-bot',
  name: 'Marsha Bot, l’outil de Modération',
  summary:
    'Lire, écrire et enchaîner les commandes de Marsha pour sanctionner vite, juste et avec preuve.',
  track: 'indispensable',
  surface: 'discord',
  functions: ['Discord'],
  minutes: 40,
  chapters: [
    {
      key: 'comprendre',
      title: 'Comprendre Marsha',
      blocks: [
        {
          kind: 'text',
          key: 'comprendre-text',
          body: 'Marsha est le bot avec lequel toute la modération Discord se fait. Chaque commande **crée une entrée dans l’historique** du membre : c’est cette mémoire commune qui te permet d’appliquer les paliers du panel sans deviner ce qui s’est passé avant toi.',
        },
        {
          kind: 'keypoints',
          key: 'comprendre-points',
          title: 'Ce qu’il faut savoir de Marsha',
          points: [
            {
              glyph: 'journal',
              title: 'Une mémoire commune',
              body: 'Chaque commande crée une entrée dans l’historique du membre.',
              tone: 'brand',
            },
            {
              glyph: 'note',
              title: 'Raison et preuve',
              body: 'Une raison lisible, et une capture dès que possible.',
              tone: 'info',
            },
            {
              glyph: 'members',
              title: 'Un membre, un identifiant',
              body: 'La mention, ou l’identifiant si la personne a quitté le serveur.',
              tone: 'success',
            },
          ],
        },
        {
          kind: 'discord',
          key: 'comprendre-discord',
          caption: 'Une commande telle qu’on la tape',
          author: 'Modérateur',
          message: '!warn 588054997481291816 League Of Legends',
        },
        {
          kind: 'steps',
          key: 'comprendre-steps',
          title: 'Lire une commande',
          steps: [
            {
              title: 'Le nom',
              body: '`!warn` : l’action. Elle commence par `!` pour la plupart, par `/` pour certaines.',
            },
            {
              title: 'Le membre',
              body: 'Une mention `@Pseudo`, ou l’**identifiant Discord**, la seule façon de viser quelqu’un qui a quitté le serveur.',
            },
            {
              title: 'La raison',
              body: 'Ici « League Of Legends ». Marsha accepte de s’en passer, **pas l’équipe** : écris toujours une raison lisible.',
            },
          ],
        },
        {
          kind: 'diagram',
          key: 'comprendre-diagram',
          title: 'Le trajet d’une commande',
          nodes: [
            { glyph: 'discord', label: 'Tu tapes', note: '!warn @Pseudo raison', tone: 'brand' },
            {
              glyph: 'flash',
              label: 'Marsha agit',
              note: 'Elle applique la sanction',
              tone: 'info',
            },
            {
              glyph: 'journal',
              label: 'L’historique',
              note: 'Une entrée est créée',
              tone: 'success',
            },
            {
              glyph: 'mail',
              label: 'Le membre',
              note: 'Il reçoit un message privé',
              tone: 'caution',
            },
          ],
        },
        {
          kind: 'callout',
          key: 'comprendre-rule',
          tone: 'rule',
          title: 'Raison et preuve, à chaque fois',
          body: 'Chaque action porte une raison lisible et, dès que possible, une capture ajoutée depuis le détail de l’infraction.',
        },
        {
          kind: 'quiz',
          key: 'comprendre-quiz',
          title: 'Lire sans se tromper',
          questions: [
            {
              key: 'q1',
              prompt: 'Dans la doc, `< >` autour d’un argument veut dire…',
              choices: [
                { key: 'a', label: 'Qu’il est requis', correct: true },
                { key: 'b', label: 'Qu’il est optionnel', correct: false },
                { key: 'c', label: 'Qu’il faut le taper avec ces symboles', correct: false },
              ],
              explanation: '`< >` : requis. `[ ]` : optionnel. Les symboles ne se tapent jamais.',
            },
            {
              key: 'q2',
              prompt: 'Comment viser un membre qui a quitté le serveur ?',
              choices: [
                { key: 'a', label: 'Avec son identifiant Discord', correct: true },
                { key: 'b', label: 'Avec sa mention', correct: false },
                { key: 'c', label: 'C’est impossible', correct: false },
              ],
              explanation:
                'Une mention ne fonctionne que pour quelqu’un présent. L’identifiant, copié avec le mode développeur, marche toujours.',
            },
          ],
        },
      ],
    },
    {
      key: 'quotidien',
      title: 'Les commandes du quotidien',
      blocks: [
        {
          kind: 'text',
          key: 'quotidien-text',
          body: 'Les sanctions vont **de la plus légère à la plus lourde**. Le panel te dit où t’arrêter, mais tu dois connaître toute l’échelle pour choisir la bonne commande.',
        },
        {
          kind: 'diagram',
          key: 'quotidien-diagram',
          title: 'L’échelle des sanctions, de la plus légère à la plus lourde',
          nodes: [
            { glyph: 'note', label: '!note', note: 'Interne, sans sanction', tone: 'neutral' },
            { glyph: 'warning', label: '!warn', note: 'Avertissement officiel', tone: 'info' },
            { glyph: 'clock', label: '!tempmute', note: 'Muet pour une durée', tone: 'caution' },
            { glyph: 'signOut', label: '!kick', note: 'Expulsé, il peut revenir', tone: 'caution' },
            { glyph: 'lock', label: '!tempban', note: 'Banni pour une durée', tone: 'danger' },
            { glyph: 'blocked', label: '!ban', note: 'Banni définitivement', tone: 'danger' },
          ],
        },
        {
          kind: 'order',
          key: 'quotidien-order',
          title: 'De la note au bannissement',
          prompt: 'Range ces commandes de la plus légère à la plus lourde.',
          items: [
            { key: 'note', label: '!note : une note interne, sans sanction' },
            { key: 'warn', label: '!warn : un avertissement officiel' },
            { key: 'tempmute', label: '!tempmute : muet pour une durée donnée' },
            { key: 'kick', label: '!kick : expulsé, il peut revenir' },
            { key: 'tempban', label: '!tempban : banni pour une durée' },
            { key: 'ban', label: '!ban : banni définitivement' },
          ],
          explanation:
            'Note, avertissement, mute temporaire, expulsion, ban temporaire, ban définitif. Dans le doute, une note d’abord : elle documente sans sanctionner.',
        },
        {
          kind: 'sort',
          key: 'quotidien-sort',
          title: 'Temporaire ou définitif ?',
          prompt: 'Classe chaque commande selon sa durée.',
          buckets: [
            { key: 'temp', label: 'Se lève toute seule' },
            { key: 'perm', label: 'Reste jusqu’à un geste de l’équipe' },
          ],
          items: [
            { key: 'tempmute', label: '!tempmute @Pseudo 30m', bucket: 'temp' },
            { key: 'tempban', label: '!tempban @Pseudo 7d', bucket: 'temp' },
            { key: 'mute', label: '!mute @Pseudo', bucket: 'perm' },
            { key: 'ban', label: '!ban @Pseudo', bucket: 'perm' },
          ],
          explanation:
            'Les commandes « temp » ont une durée et Marsha lève la sanction seule. `!mute` et `!ban` restent en place jusqu’à un `!unmute` ou un `!unban`.',
        },
        {
          kind: 'fill',
          key: 'quotidien-fill',
          title: 'Écrire une durée',
          text: 'Une durée s’écrit avec un nombre suivi d’une unité : [[s]] pour les secondes, [[m]] pour les minutes, [[h]] pour les heures, [[d]] pour les jours et [[w]] pour les semaines. Un mute temporaire ne dépasse pas [[28]] jours.',
          bank: ['s', 'm', 'h', 'd', 'w', '28', '30', '7'],
          explanation:
            'Exemples : `30s`, `10m`, `5h`, `7d`, `2w`. Le mute temporaire s’arrête à 28 jours, une limite de Discord.',
        },
        {
          kind: 'callout',
          key: 'quotidien-warning',
          tone: 'warning',
          title: '!ban est définitif',
          body: 'Un `!ban` reste jusqu’à un `!unban`. Vérifie deux fois le membre et la raison avant de valider.',
        },
      ],
    },
    {
      key: 'ecrire',
      title: 'Écrire la bonne commande',
      blocks: [
        {
          kind: 'demo',
          key: 'ecrire-demo',
          title: 'Démo : de l’alerte à l’avertissement',
          surface: 'discord',
          lines: [
            { author: 'Kiwi', text: 'ptdr regardez ça https://spam.example', role: 'viewer' },
            { author: 'Kiwi', text: 'ptdr regardez ça https://spam.example', role: 'viewer' },
            { author: 'Kiwi', text: 'ptdr regardez ça https://spam.example', role: 'viewer' },
          ],
          steps: [
            {
              caption:
                'Kiwi enchaîne le même message dans #général. Avant d’agir, tu regardes son historique.',
            },
            {
              caption: 'Tu tapes `!inf user @Kiwi` : Marsha liste ses infractions.',
              act: 'command',
              detail: '!inf user @Kiwi',
              say: { author: 'Marsha', text: 'Aucune infraction pour Kiwi.', role: 'bot' },
            },
            {
              caption:
                'C’est un premier constat : un avertissement, avec une raison claire, suffit.',
              act: 'command',
              detail: '!warn @Kiwi Spam dans #général',
              say: {
                author: 'Marsha',
                text: 'Avertissement enregistré pour Kiwi : Spam dans #général.',
                role: 'bot',
              },
            },
            {
              caption:
                'L’avertissement est dans l’historique : si Kiwi récidive, la prochaine étape s’appuiera dessus.',
            },
          ],
        },
        {
          kind: 'command',
          key: 'ecrire-warn',
          title: 'Un avertissement',
          prompt: 'Avertis `@Pseudo` pour la raison « Spam dans #général ».',
          accepted: ['!warn @Pseudo Spam dans #général', '!warn @Pseudo Spam dans #general'],
          hint: 'Le nom de la commande, le membre, puis la raison.',
          explanation:
            '`!warn @Pseudo Spam dans #général` : le membre reçoit un message privé et l’avertissement est enregistré.',
        },
        {
          kind: 'command',
          key: 'ecrire-tempmute',
          title: 'Un mute temporaire',
          prompt: 'Rends `@Pseudo` muet **30 minutes** pour « Flood dans le chat ».',
          accepted: ['!tempmute @Pseudo 30m Flood dans le chat'],
          hint: 'Après le membre vient la durée, un nombre collé à son unité.',
          explanation:
            '`!tempmute @Pseudo 30m Flood dans le chat` : la levée est automatique à la fin de la durée.',
        },
        {
          kind: 'command',
          key: 'ecrire-tempban',
          title: 'Un bannissement temporaire',
          prompt: 'Bannis `@Pseudo` **7 jours** pour « Récidives, période de recul ».',
          accepted: [
            '!tempban @Pseudo 7d Récidives, période de recul',
            '!tempban @Pseudo 7d Recidives, periode de recul',
          ],
          hint: 'Sept jours s’écrit `7d`.',
          explanation:
            '`!tempban @Pseudo 7d Récidives, période de recul` : Marsha programme seule le débannissement.',
        },
        {
          kind: 'command',
          key: 'ecrire-slowmode',
          title: 'Calmer un salon',
          prompt: 'Active le mode lent du salon à **30 secondes** entre deux messages.',
          accepted: ['!slowmode 30s'],
          hint: 'Une seule valeur : la durée entre deux messages.',
          explanation:
            '`!slowmode 30s`. `!slowmode 0` le coupe. Utile quand le salon s’emballe, avant de sanctionner à la chaîne.',
        },
        {
          kind: 'command',
          key: 'ecrire-clear',
          title: 'Nettoyer des messages',
          prompt: 'Supprime les **20** derniers messages de `@Pseudo` dans le salon.',
          accepted: ['!clear @Pseudo 20'],
          hint: 'Le filtre d’abord, puis le nombre.',
          explanation:
            '`!clear @Pseudo 20`. Sans nombre, Marsha supprime les 100 derniers messages du membre. Archive d’abord si les messages servent de preuve.',
        },
      ],
    },
    {
      key: 'historique',
      title: 'Hiérarchie, historique et preuves',
      blocks: [
        {
          kind: 'callout',
          key: 'historique-tip',
          tone: 'tip',
          title: 'Regarde avant d’agir',
          body: 'Avant d’appliquer un palier, ouvre l’historique du membre avec `!inf user @Pseudo`. C’est lui qui te dit si c’est un premier constat ou une récidive.',
        },
        {
          kind: 'compare',
          key: 'historique-compare',
          title: 'Supprimer une infraction, oui ou non ?',
          good: {
            title: 'Oui, c’est justifié',
            items: [
              'Une **erreur de membre**',
              'Un **appel accepté**, avec l’accord d’un Responsable',
            ],
          },
          bad: {
            title: 'Non, jamais pour ça',
            items: [
              'Parce que le membre **le demande**',
              'Pour **faire de la place** dans l’historique',
              'Pour **repartir de zéro** après une récidive',
            ],
          },
        },
        {
          kind: 'quiz',
          key: 'historique-quiz',
          title: 'Historique et hiérarchie',
          questions: [
            {
              key: 'q1',
              prompt:
                'Marsha répond « Cannot manage this member ». D’où vient presque toujours le problème ?',
              choices: [
                { key: 'a', label: 'De la hiérarchie des rôles', correct: true },
                { key: 'b', label: 'D’une faute de frappe dans la durée', correct: false },
                { key: 'c', label: 'D’un salon mal choisi', correct: false },
              ],
              explanation:
                'Tu ne peux sanctionner que les membres dont le rôle est sous le tien, et Marsha seulement ceux sous le sien. Remonte le cas à ton Responsable.',
            },
            {
              key: 'q2',
              prompt: 'Quelle commande affiche l’historique des sanctions d’un membre ?',
              choices: [
                { key: 'a', label: '!inf user', correct: true },
                { key: 'b', label: '!notes', correct: false },
                { key: 'c', label: '!clear', correct: false },
              ],
              explanation:
                '`!inf user` liste les infractions. `!notes` affiche seulement les notes internes.',
            },
            {
              key: 'q3',
              prompt: 'Quand supprimer une infraction avec `/infractions delete` ?',
              choices: [
                {
                  key: 'a',
                  label:
                    'Pour une erreur de membre ou un appel accepté, avec l’accord d’un Responsable',
                  correct: true,
                },
                { key: 'b', label: 'Dès que le membre le demande', correct: false },
                { key: 'c', label: 'Pour faire de la place dans l’historique', correct: false },
              ],
              explanation:
                'La suppression est irréversible : elle se justifie par une erreur ou un appel accepté, jamais par confort.',
            },
          ],
        },
        {
          kind: 'command',
          key: 'historique-command',
          title: 'Consulter un historique',
          prompt: 'Affiche l’historique des sanctions de `@Pseudo`.',
          accepted: ['!inf user @Pseudo'],
          hint: 'Ce sont deux mots après le point d’exclamation.',
          explanation:
            '`!inf user @Pseudo` : liste paginée avec l’identifiant, le type, le modérateur, la date et la raison.',
        },
      ],
    },
    {
      key: 'situation',
      title: 'En situation',
      blocks: [
        {
          kind: 'keypoints',
          key: 'situation-points',
          title: 'Avant de te lancer',
          points: [
            {
              glyph: 'journal',
              title: 'Historique d’abord',
              body: '`!inf user` te dit si c’est un premier constat ou une récidive.',
              tone: 'info',
            },
            {
              glyph: 'climb',
              title: 'Du léger au lourd',
              body: 'Note, avertissement, mute, expulsion, ban : on ne saute pas de palier.',
              tone: 'caution',
            },
            {
              glyph: 'note',
              title: 'Une raison à chaque fois',
              body: 'Lisible par l’équipe, avec une capture si possible.',
              tone: 'success',
            },
          ],
        },
        {
          kind: 'simulation',
          key: 'situation-sim',
          title: 'Un soir sur le serveur',
          surface: 'discord',
          context:
            'Tu es de permanence sur le serveur d’un créateur. Les alertes arrivent l’une après l’autre.',
          steps: [
            {
              key: 's1',
              lines: [
                { author: 'Kiwi', text: 'ptdr regardez ça https://spam.example', role: 'viewer' },
                { author: 'Kiwi', text: 'ptdr regardez ça https://spam.example', role: 'viewer' },
                { author: 'Kiwi', text: 'ptdr regardez ça https://spam.example', role: 'viewer' },
              ],
              prompt:
                'Kiwi enchaîne le même message dans #général, sans avertissement préalable. Ton geste ?',
              options: [
                {
                  key: 'warn',
                  label: '!warn @Kiwi Spam dans #général',
                  correct: true,
                  feedback:
                    'Exact : un avertissement avec une raison claire, le message enregistré dans l’historique.',
                },
                {
                  key: 'ban',
                  label: '!ban @Kiwi Spam',
                  correct: false,
                  feedback:
                    'Trop lourd pour un premier constat. Le ban est définitif et se réserve aux cas graves ou aux récidives.',
                },
                {
                  key: 'nothing',
                  label: 'Je regarde sans rien faire',
                  correct: false,
                  feedback: 'Le spam se propage vite, il faut réagir dès le premier signal.',
                },
              ],
            },
            {
              key: 's2',
              lines: [
                { author: 'Kiwi', text: 'lol vous êtes tous nuls', role: 'viewer' },
                {
                  author: 'Marsha',
                  text: 'Kiwi a déjà reçu un avertissement il y a 10 minutes.',
                  role: 'bot',
                },
              ],
              prompt:
                'Kiwi récidive juste après son avertissement. Quelle étape choisis-tu avant d’agir ?',
              options: [
                {
                  key: 'history',
                  label: '!inf user @Kiwi pour lire son historique',
                  correct: true,
                  feedback:
                    'Exact : l’historique te dit où tu en es sur l’échelle, tu ne devines pas.',
                },
                {
                  key: 'ban',
                  label: '!ban @Kiwi Récidive',
                  correct: false,
                  feedback: 'Tu sautes plusieurs paliers. Regarde d’abord l’historique.',
                },
                {
                  key: 'delete',
                  label: '/infractions delete pour repartir de zéro',
                  correct: false,
                  feedback:
                    'La suppression d’une infraction est irréversible et réservée aux erreurs ou appels acceptés.',
                },
              ],
            },
            {
              key: 's3',
              lines: [
                { author: 'Kiwi', text: 'vous ne me ferez rien de toute façon', role: 'viewer' },
                {
                  author: 'Marsha',
                  text: '2 avertissements dans l’historique de Kiwi.',
                  role: 'bot',
                },
              ],
              prompt:
                'Kiwi a maintenant deux avertissements et continue. Le panel demande un mute d’une heure. Ton geste ?',
              options: [
                {
                  key: 'tempmute',
                  label: '!tempmute @Kiwi 1h Récidive après avertissements',
                  correct: true,
                  feedback:
                    'Exact : un mute temporaire d’une heure, la durée collée à son unité et la raison écrite.',
                },
                {
                  key: 'mute',
                  label: '!mute @Kiwi Récidive',
                  correct: false,
                  feedback:
                    '`!mute` n’a pas de durée : il reste jusqu’à un `!unmute`. Ici le panel donne une durée, prends `!tempmute`.',
                },
                {
                  key: 'kick',
                  label: '!kick @Kiwi Récidive',
                  correct: false,
                  feedback:
                    'Une expulsion n’est pas le palier demandé et le membre peut revenir aussitôt.',
                },
              ],
            },
          ],
        },
        {
          kind: 'case',
          key: 'situation-case',
          title: 'Le premier spam',
          context:
            'Un membre que personne ne connaît poste trois fois le même lien dans #général. Son historique est vide.',
          questions: [
            {
              type: 'choice',
              key: 'c1',
              prompt: 'Quelle commande tapes-tu en premier ?',
              choices: [
                { key: 'a', label: '!warn avec une raison claire', correct: true },
                { key: 'b', label: '!ban pour protéger le serveur', correct: false },
                { key: 'c', label: '!kick pour qu’il comprenne', correct: false },
              ],
              explanation:
                'Un premier constat se traite par un avertissement. Le ban est définitif et se réserve aux cas graves ou aux récidives.',
            },
            {
              type: 'open',
              key: 'c2',
              prompt:
                'Explique avec tes mots pourquoi tu regardes l’historique avant de choisir ta commande.',
              expert:
                'L’historique me dit **où j’en suis sur l’échelle** : premier constat ou récidive. Je n’ai pas à deviner ce qui s’est passé avant moi, et je reste cohérent avec le reste de l’équipe. Chaque commande que je tape ajoute ensuite une entrée pour le collègue suivant.',
            },
          ],
        },
      ],
    },
  ],
}
