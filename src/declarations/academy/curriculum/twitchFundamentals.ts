import { TWITCH_PLUNGE } from '@/declarations/academy/curriculum/twitchPlunge'
import type { Course } from '@/declarations/academy/curriculum/types'

/**
 * Twitch moderation basics, built on the level 3 reference panel and the Twitch commands
 * @type {Course}
 */

export const TWITCH_FUNDAMENTALS: Course = {
  key: 'twitch-fondamentaux',
  name: 'Les fondamentaux de la Mod. Twitch',
  summary:
    'Lire un chat, choisir le bon geste et monter les paliers du Livecon 3 sans en faire trop.',
  track: 'indispensable',
  surface: 'twitch',
  functions: ['Lives'],
  minutes: 35,
  chapters: [
    {
      key: 'plongee',
      title: 'Plonge dans un live',
      blocks: [
        {
          kind: 'text',
          key: 'plongee-text',
          body: 'On ne commence pas par un cours. On commence par un live : **tu vas te tromper**, et c’est voulu. Personne ne te note, ce qui compte, c’est ce que tu feras de l’écart avec l’équipe. Je reste avec toi jusqu’au bout.',
        },
        TWITCH_PLUNGE,
      ],
    },
    {
      key: 'role',
      title: 'Ce que fait un modérateur',
      blocks: [
        {
          kind: 'text',
          key: 'role-text',
          body: 'Un modérateur ne surveille pas des gens, il **protège un chat**. Le streamer doit pouvoir jouer, les viewers doivent pouvoir discuter, et personne ne doit se sentir visé. Tu agis vite, de façon **juste** et **identique** d’un viewer à l’autre : c’est ce qui rend le chat sûr.',
        },
        {
          kind: 'keypoints',
          key: 'role-points',
          title: 'Trois réflexes pour commencer',
          points: [
            {
              glyph: 'shield',
              title: 'Protéger le chat',
              body: 'Le streamer joue, les viewers discutent, personne ne se sent visé.',
              tone: 'brand',
            },
            {
              glyph: 'rule',
              title: 'Même règle pour tous',
              body: 'Un habitué et un inconnu reçoivent la même réponse, selon le panel.',
              tone: 'info',
            },
            {
              glyph: 'journal',
              title: 'Toujours une raison',
              body: 'Elle reste dans l’historique du viewer et garde l’équipe cohérente.',
              tone: 'success',
            },
          ],
        },
        {
          kind: 'chat',
          key: 'role-chat',
          surface: 'twitch',
          caption: 'Un chat un soir de live',
          lines: [
            { author: 'Lyra', text: 'le boss est enfin tombé !!', role: 'viewer' },
            {
              author: 'Nightbot',
              text: 'Pense à suivre la chaîne pour ne rien rater.',
              role: 'bot',
            },
            { author: 'Zorka', text: 'streamer dédicace moi stp', role: 'viewer', flagged: true },
            { author: 'Malo', text: 'Zorka on ne demande pas de dédicace ici', role: 'moderator' },
            { author: 'Tim', text: 'GG à toute la team', role: 'vip' },
          ],
        },
        {
          kind: 'callout',
          key: 'role-rule',
          tone: 'rule',
          title: 'Le principe à retenir',
          body: 'On modère un **message**, pas une personne. Le même comportement reçoit la même réponse, que le viewer soit un habitué ou un inconnu.',
        },
        {
          kind: 'quiz',
          key: 'role-quiz',
          title: 'Ton rôle en trois questions',
          questions: [
            {
              key: 'q1',
              prompt:
                'Un habitué et un nouveau viewer envoient le même message de spam. Que fais-tu ?',
              choices: [
                {
                  key: 'a',
                  label: 'Je traite les deux de la même façon, selon le panel',
                  correct: true,
                },
                {
                  key: 'b',
                  label: 'Je laisse passer celui de l’habitué, il est sympa',
                  correct: false,
                },
                {
                  key: 'c',
                  label: 'Je sanctionne plus fort le nouveau, on ne le connaît pas',
                  correct: false,
                },
              ],
              explanation:
                'Le panel existe pour que la règle soit la même pour tous. Une exception pour un habitué se voit vite et fragilise toute l’équipe.',
            },
            {
              key: 'q2',
              prompt: 'Que protèges-tu en priorité quand tu modères ?',
              choices: [
                { key: 'a', label: 'Le confort du chat et du streamer', correct: true },
                { key: 'b', label: 'Mon autorité', correct: false },
                { key: 'c', label: 'Le silence du chat', correct: false },
              ],
              explanation:
                'Un chat vivant est un bon chat. On intervient pour le confort de tous, jamais pour faire taire.',
            },
            {
              key: 'q3',
              prompt: 'Que doit contenir toute sanction que tu poses ?',
              choices: [
                { key: 'a', label: 'Une raison claire', correct: true },
                { key: 'b', label: 'Une capture du profil du viewer', correct: false },
                { key: 'c', label: 'Un message public au chat', correct: false },
              ],
              explanation:
                'La raison permet à l’équipe de comprendre l’historique du viewer et de rester cohérente.',
            },
          ],
        },
      ],
    },
    {
      key: 'lire',
      title: 'Lire le chat',
      blocks: [
        {
          kind: 'text',
          key: 'lire-text',
          body: 'Avant de choisir un geste, il faut **décider s’il y a quelque chose à faire**. Beaucoup de messages ont l’air agressifs sans l’être : des majuscules de joie, des cœurs en rafale quand le streamer le demande. À l’inverse, un message discret peut être une vraie infraction.\n\n**Il faut savoir faire la différence entre l’euphorie et la démesure avant d’agir.** Si le streamer le demande ou si la situation s’y prête, c’est acceptable.',
        },
        {
          kind: 'chat',
          key: 'lire-chat',
          surface: 'twitch',
          caption: 'Un objectif atteint, le streamer demande des cœurs',
          lines: [
            { author: 'Lyra', text: '❤️❤️❤️❤️❤️❤️❤️❤️', role: 'viewer' },
            { author: 'Tim', text: 'BRAVO À TOUS !!!', role: 'vip' },
            { author: 'Malo', text: 'la foule est en délire', role: 'moderator' },
          ],
        },
        {
          kind: 'compare',
          key: 'lire-compare',
          title: 'Euphorie ou démesure ?',
          good: {
            title: 'Euphorie, on laisse passer',
            items: [
              'Un **pic de quelques secondes**, porté par un moment du live',
              'Le **streamer le demande** (des cœurs, un objectif atteint)',
              'Le chat reste **lisible**',
            ],
          },
          bad: {
            title: 'Démesure, on agit',
            items: [
              'Une rafale qui **se répète**, sans lien avec le live',
              'Le même message **envoyé en boucle**',
              'Le chat devient **impossible à lire**',
            ],
          },
        },
        {
          kind: 'sort',
          key: 'lire-sort',
          title: 'À modérer ou à laisser passer ?',
          prompt: 'Classe ces messages, tels qu’ils arrivent dans le chat de ton streamer.',
          buckets: [
            { key: 'moderate', label: 'À modérer' },
            { key: 'allow', label: 'À laisser passer' },
          ],
          items: [
            { key: 'dedicace', label: 'streamer dédicace moi stp !!!', bucket: 'moderate' },
            { key: 'langue', label: 'Hello how are you today', bucket: 'moderate' },
            { key: 'caca', label: 'Caca', bucket: 'moderate' },
            { key: 'caps-court', label: 'ÇA VA, MOI ÇA VA BIEN ?', bucket: 'allow' },
            { key: 'clutch', label: 'bien joué pour le clutch', bucket: 'allow' },
            { key: 'coeurs-court', label: 'STREAMER❤️❤️❤️❤️', bucket: 'allow' },
            {
              key: 'coeurs-flood',
              label: '❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️ envoyé cinq fois de suite',
              bucket: 'moderate',
            },
          ],
          explanation:
            'Une dédicace, une autre langue et un message puéril sont des infractions du panel. Des majuscules courtes et quelques cœurs sont de l’enthousiasme. Le flood, lui, gêne la lecture du chat quand il se répète.',
        },
        {
          kind: 'callout',
          key: 'lire-warning',
          tone: 'warning',
          title: 'Le doute',
          body: 'Si tu hésites entre l’euphorie et la démesure, laisse passer une fois et surveille. Une intervention de trop coupe l’ambiance plus sûrement qu’un message toléré.',
        },
      ],
    },
    {
      key: 'paliers',
      title: 'L’échelle de sanctions',
      blocks: [
        {
          kind: 'steps',
          key: 'paliers-steps',
          title: 'Comment fonctionne un panel',
          steps: [
            {
              title: 'Le Livecon fixe le barème',
              body: 'Selon l’humeur du chat, le Livecon en vigueur change. Au **Livecon 3**, on est le plus souple, la situation la plus calme.',
            },
            {
              title: 'Chaque infraction a sa fiche',
              body: 'La fiche donne la description, des exemples, l’avertissement type à copier et **l’échelle** : ce qu’on fait à chaque étape.',
            },
            {
              title: 'On monte d’un cran à chaque récidive',
              body: 'On commence par « Dès constaté », puis on monte : 1re récidive, 2e récidive, 3e récidive. On ne saute pas de palier.',
            },
          ],
        },
        {
          kind: 'callout',
          key: 'paliers-tip',
          tone: 'tip',
          title: 'Mesure douce d’abord',
          body: 'Une **suppression** du message règle souvent tout. Un **avertissement** explique la règle. Le **timeout** (TO) n’arrive que si le message revient.',
        },
        {
          kind: 'diagram',
          key: 'paliers-diagram',
          title: 'Du plus doux au plus fort',
          caption: 'On part de la mesure la plus douce et on ne monte que si le message revient.',
          nodes: [
            {
              glyph: 'remove',
              label: 'Suppression',
              note: 'Règle souvent tout',
              tone: 'success',
            },
            {
              glyph: 'warning',
              label: 'Avertissement',
              note: 'Explique la règle',
              tone: 'info',
            },
            {
              glyph: 'clock',
              label: 'Timeout',
              note: 'Si le message revient',
              tone: 'caution',
            },
            {
              glyph: 'blocked',
              label: 'Bannissement',
              note: 'Jusqu’à un /unban',
              tone: 'danger',
            },
          ],
        },
        {
          kind: 'order',
          key: 'paliers-order',
          title: 'Le flood excessif au Livecon 3',
          prompt:
            'Remets l’échelle du flood excessif dans l’ordre, du premier constat à la 3e récidive.',
          items: [
            { key: 'first', label: 'Dès constaté : suppression et avertissement' },
            { key: 'r1', label: '1re récidive : timeout de 5 minutes' },
            { key: 'r2', label: '2e récidive : timeout de 30 minutes' },
            { key: 'r3', label: '3e récidive : timeout de 5 heures' },
          ],
          explanation:
            'La durée grandit à chaque récidive : 5 minutes, 30 minutes, puis 5 heures. Le premier constat n’est jamais un timeout.',
        },
        {
          kind: 'fill',
          key: 'paliers-fill',
          title: 'Les majuscules',
          text: 'Au Livecon 3, un message en [[majuscules]] n’entraîne aucune action dès le premier constat. À la 1re récidive, on [[supprime]] le message et on donne un [[avertissement]].',
          bank: ['majuscules', 'supprime', 'avertissement', 'bannit', 'spam'],
          explanation:
            'On ne modère les majuscules que si elles sont **à outrance** : elles peuvent aussi être un moyen de capter l’attention. Tout dépend du contenu et de la longueur du message.',
        },
        {
          kind: 'quiz',
          key: 'paliers-quiz',
          title: 'Les paliers en pratique',
          questions: [
            {
              key: 'q1',
              prompt:
                'Une insulte grave envers un viewer, au Livecon 3, première fois. Que fais-tu ?',
              choices: [
                { key: 'a', label: 'Suppression et avertissement', correct: true },
                { key: 'b', label: 'Timeout de 5 heures', correct: false },
                { key: 'c', label: 'Bannissement', correct: false },
              ],
              explanation:
                'Au Livecon 3, le premier constat est suppression et avertissement. Le timeout d’une heure n’arrive qu’à la 1re récidive.',
            },
            {
              key: 'q2',
              prompt: 'Quelle mesure vient en premier pour une demande de dédicace ?',
              choices: [
                { key: 'a', label: 'La suppression du message', correct: true },
                { key: 'b', label: 'Un timeout de 30 minutes', correct: false },
                { key: 'c', label: 'Un avertissement écrit', correct: false },
              ],
              explanation:
                'Dès constaté, on supprime. Les mesures montent si la personne insiste : le mot « dédicace » est d’ailleurs déjà supprimé par NightBot.',
            },
          ],
        },
      ],
    },
    {
      key: 'gestes',
      title: 'Les gestes sur Twitch',
      blocks: [
        {
          kind: 'text',
          key: 'gestes-text',
          body: 'Sur Twitch, tu agis depuis le chat avec quelques commandes. La **durée d’un timeout s’écrit en secondes**. Pense aussi à laisser une **raison**, elle reste dans l’historique du viewer.\n\n- `/warn pseudo raison` : avertit le viewer, qui doit l’accepter avant de réécrire.\n- `/timeout pseudo durée raison` : rend muet le viewer pour la durée donnée en secondes.\n- `/ban pseudo raison` : bannit, jusqu’à un `/unban`.',
        },
        {
          kind: 'diagram',
          key: 'gestes-diagram',
          title: 'Les trois commandes du chat',
          nodes: [
            {
              glyph: 'warning',
              label: '/warn',
              note: 'pseudo raison',
              tone: 'info',
            },
            {
              glyph: 'clock',
              label: '/timeout',
              note: 'pseudo durée en secondes raison',
              tone: 'caution',
            },
            {
              glyph: 'blocked',
              label: '/ban',
              note: 'pseudo raison',
              tone: 'danger',
            },
          ],
        },
        {
          kind: 'callout',
          key: 'gestes-rule',
          tone: 'rule',
          title: 'Convertir une durée',
          body: '5 minutes = **300** secondes. 30 minutes = **1800**. 1 heure = **3600**. Vérifie ton chiffre avant de valider.',
        },
        {
          kind: 'demo',
          key: 'gestes-demo',
          title: 'Démo : un flood, de la suppression au timeout',
          surface: 'twitch',
          lines: [
            { author: 'Lyra', text: 'le boss est enfin tombé !!', role: 'viewer' },
            { author: 'Malo', text: 'GG à la team', role: 'moderator' },
            { author: 'Lucas', text: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', role: 'viewer' },
            { author: 'Lucas', text: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', role: 'viewer' },
          ],
          steps: [
            {
              caption:
                'Lucas envoie le même message en boucle. Repère la ligne, c’est du flood excessif.',
              target: 2,
            },
            {
              caption: 'Dès constaté, tu commences par supprimer le message.',
              target: 2,
              act: 'delete',
            },
            {
              caption:
                'Puis tu avertis, avec la raison : `/warn Lucas flood`. Il devra l’accepter pour écrire à nouveau.',
              target: 2,
              act: 'warn',
              detail: '/warn Lucas flood',
            },
            {
              caption:
                'Il recommence : c’est la 1re récidive. Tu poses un timeout de 5 minutes, soit 300 secondes.',
              target: 3,
              act: 'timeout',
              detail: '5 min',
            },
            {
              caption: 'Tu as monté d’un cran, sans sauter de palier : `/timeout Lucas 300 flood`.',
              target: 3,
            },
          ],
        },
        {
          kind: 'command',
          key: 'gestes-warn',
          title: 'Avertir un viewer',
          prompt: 'Écris la commande qui avertit le viewer `Lucas` pour la raison « flood ».',
          accepted: ['/warn Lucas flood', '/warn @Lucas flood'],
          hint: 'Le nom de la commande, le pseudo, puis la raison.',
          explanation:
            '`/warn Lucas flood` : le viewer reçoit l’avertissement et doit l’accepter pour écrire à nouveau.',
        },
        {
          kind: 'command',
          key: 'gestes-timeout',
          title: 'Poser un timeout de 5 minutes',
          prompt:
            'Écris la commande qui met `Lucas` en timeout **5 minutes** pour « flood ». Pense à la conversion.',
          accepted: ['/timeout Lucas 300 flood', '/timeout @Lucas 300 flood'],
          hint: 'La durée d’un timeout Twitch s’écrit en secondes.',
          explanation: '5 minutes valent 300 secondes : `/timeout Lucas 300 flood`.',
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
              glyph: 'search',
              title: 'Lis avant d’agir',
              body: 'Décide d’abord s’il y a quelque chose à faire.',
              tone: 'info',
            },
            {
              glyph: 'climb',
              title: 'Monte d’un cran',
              body: 'Chaque récidive fait monter, on ne saute pas de palier.',
              tone: 'caution',
            },
            {
              glyph: 'success',
              title: 'Doux d’abord',
              body: 'Une suppression règle souvent tout, garde le timeout pour la récidive.',
              tone: 'success',
            },
          ],
        },
        {
          kind: 'simulation',
          key: 'situation-sim',
          title: 'Ta première heure de live',
          surface: 'twitch',
          context: 'Le Livecon 3 est en vigueur. Le chat bouge, tu réagis au fur et à mesure.',
          steps: [
            {
              key: 's1',
              lines: [
                { author: 'Lyra', text: 'le boss est enfin tombé !!', role: 'viewer' },
                { author: 'Zorka', text: 'dédicace moi stp !!!', role: 'viewer', flagged: true },
              ],
              prompt: 'Zorka demande une dédicace pour la première fois. Ton geste ?',
              options: [
                {
                  key: 'delete',
                  label: 'Je supprime le message',
                  correct: true,
                  feedback:
                    'Exact : dès constaté, on supprime. Aucun timeout pour une première demande.',
                },
                {
                  key: 'to',
                  label: 'Je pose un timeout d’une heure',
                  correct: false,
                  feedback:
                    'Trop lourd. La première demande de dédicace se traite par une simple suppression.',
                },
                {
                  key: 'ignore',
                  label: 'Je laisse passer, ce n’est pas grave',
                  correct: false,
                  feedback:
                    'Une demande de dédicace est une infraction du panel : sans réaction, d’autres suivront.',
                },
              ],
            },
            {
              key: 's2',
              lines: [
                {
                  author: 'Rex',
                  text: 'Lucas espèce de sale fils de p%@*',
                  role: 'viewer',
                  flagged: true,
                },
                { author: 'Lucas', text: 'ah oui merci du soutien', role: 'viewer' },
              ],
              prompt: 'Rex insulte gravement un autre viewer, c’est la première fois. Ton geste ?',
              options: [
                {
                  key: 'delete-warn',
                  label: 'Je supprime et j’avertis',
                  correct: true,
                  feedback:
                    'Exact : suppression et avertissement au premier constat, l’avertissement type explique la règle.',
                },
                {
                  key: 'to5h',
                  label: 'Je pose un timeout de 5 heures',
                  correct: false,
                  feedback:
                    'Le timeout de 5 heures se réserve à la 2e récidive, pas au premier constat.',
                },
                {
                  key: 'ban',
                  label: 'Je bannis directement',
                  correct: false,
                  feedback:
                    'Le bannissement n’est pas l’échelle d’une insulte entre viewers au Livecon 3.',
                },
              ],
            },
            {
              key: 's3',
              lines: [
                {
                  author: 'Pixel',
                  text: 'AUJOURD’HUI J’AI ENTERRE MON POISSON ROUGE, IL ETAIT VIEUX IL AVAIT 3 JOURS DONNE MOI DES AIIIIIILES',
                  role: 'viewer',
                  flagged: true,
                },
              ],
              prompt:
                'Pixel écrit un long message en majuscules, pour la première fois. Ton geste ?',
              options: [
                {
                  key: 'nothing',
                  label: 'Aucune action, je surveille',
                  correct: true,
                  feedback:
                    'Exact : au Livecon 3, les majuscules ne déclenchent rien dès le premier constat.',
                },
                {
                  key: 'delete',
                  label: 'Je supprime',
                  correct: false,
                  feedback: 'La suppression arrive à la 1re récidive, avec un avertissement.',
                },
                {
                  key: 'to',
                  label: 'Je pose un timeout de 30 minutes',
                  correct: false,
                  feedback: 'Le timeout de 30 minutes est celui de la 3e récidive.',
                },
              ],
            },
            {
              key: 's4',
              lines: [
                {
                  author: 'Pixel',
                  text: 'JE RECOMMENCE, MON HAMSTER EST PARTI HIER SOIR ET IL ETAIT TROP MIGNON POURQUOI MOI',
                  role: 'viewer',
                  flagged: true,
                },
              ],
              prompt: 'Pixel recommence, c’est sa 1re récidive. Ton geste ?',
              options: [
                {
                  key: 'delete-warn',
                  label: 'Je supprime et j’avertis',
                  correct: true,
                  feedback:
                    'Exact : à la 1re récidive on supprime le message et on donne un avertissement.',
                },
                {
                  key: 'nothing',
                  label: 'Aucune action à nouveau',
                  correct: false,
                  feedback: 'Une récidive fait monter d’un cran : on ne peut plus laisser passer.',
                },
                {
                  key: 'to5',
                  label: 'Je pose un timeout de 5 minutes',
                  correct: false,
                  feedback: 'Le timeout de 5 minutes est pour la 2e récidive.',
                },
              ],
            },
          ],
        },
        {
          kind: 'case',
          key: 'situation-case',
          title: 'Le streamer demande le déluge',
          context:
            'Le streamer vient d’atteindre son objectif d’abonnés. Il dit à voix haute : « Mettez-moi tous les cœurs que vous pouvez ! ». Le chat se remplit de cœurs et de messages en majuscules.',
          questions: [
            {
              type: 'choice',
              key: 'c1',
              prompt: 'Que fais-tu ?',
              choices: [
                { key: 'a', label: 'Je laisse passer, le streamer le demande', correct: true },
                { key: 'b', label: 'Je supprime chaque message de flood', correct: false },
                { key: 'c', label: 'Je pose des timeouts pour calmer le chat', correct: false },
              ],
              explanation:
                'Si le streamer le demande ou si la situation s’y prête, c’est acceptable. La règle du flood ne s’applique pas à un moment voulu.',
            },
            {
              type: 'open',
              key: 'c2',
              prompt: 'Explique avec tes mots comment tu distingues l’euphorie de la démesure.',
              expert:
                'L’euphorie est **ponctuelle**, portée par un moment du live ou une demande du streamer, et elle ne gêne pas la lecture. La démesure **se répète**, sans lien avec le live, et empêche de lire le chat. Je regarde aussi la durée : un pic de quelques secondes est une fête, une rafale qui dure est un flood.',
            },
          ],
        },
      ],
    },
  ],
}
