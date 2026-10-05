import type { Course } from '@/declarations/academy/curriculum/types'

/**
 * Anti-raid course
 * @type {Course}
 */

export const ANTI_RAID: Course = {
  key: 'anti-raid',
  name: 'Contrer des raids',
  summary:
    'Reconnaître un raid, choisir le bon mode anti-raid et agir dans l’ordre sans rien oublier.',
  track: 'secondary',
  surface: 'discord',
  functions: ['Discord'],
  minutes: 25,
  chapters: [
    {
      key: 'reconnaitre',
      title: 'Reconnaître un raid',
      blocks: [
        {
          kind: 'text',
          key: 'reconnaitre-text',
          body: 'Un raid, c’est **des dizaines de comptes qui arrivent et spamment en même temps**. Un seul spammeur se gère à la commande. Un raid demande de la **vitesse** et un **ordre d’action**, sinon les raiders reviennent plus vite que tu ne les bannis.',
        },
        {
          kind: 'keypoints',
          key: 'reconnaitre-points',
          title: 'Les trois signes d’un raid',
          points: [
            {
              glyph: 'flash',
              title: 'Simultanéité',
              body: 'Des dizaines de comptes arrivent en même temps.',
              tone: 'danger',
            },
            {
              glyph: 'copy',
              title: 'Répétition',
              body: 'Le même message, le même lien, posté partout.',
              tone: 'caution',
            },
            {
              glyph: 'clock',
              title: 'Comptes récents',
              body: 'Créés le jour même, sans aucune raison d’être là.',
              tone: 'info',
            },
          ],
        },
        {
          kind: 'discord',
          key: 'reconnaitre-discord',
          caption: 'Le salon d’accueil, vingt secondes plus tôt',
          author: 'Nouveau_4821',
          message: 'REJOIGNEZ NOTRE SERVEUR https://raid.example @everyone',
        },
        {
          kind: 'sort',
          key: 'reconnaitre-sort',
          title: 'Raid ou soirée animée ?',
          prompt: 'Classe ces signaux.',
          buckets: [
            { key: 'raid', label: 'Signe d’un raid' },
            { key: 'calm', label: 'Activité normale' },
          ],
          items: [
            {
              key: 'burst',
              label: 'Trente comptes créés le jour même arrivent en une minute',
              bucket: 'raid',
            },
            {
              key: 'same',
              label: 'Le même lien est posté par dix comptes différents',
              bucket: 'raid',
            },
            { key: 'pings', label: 'Des @everyone en boucle dans tous les salons', bucket: 'raid' },
            {
              key: 'event',
              label: 'Beaucoup de monde pendant l’évènement annoncé',
              bucket: 'calm',
            },
            { key: 'chat', label: 'Un salon très actif sur le sujet du soir', bucket: 'calm' },
          ],
          explanation:
            'Un raid se reconnaît à la **simultanéité** et à la **répétition** : des comptes récents, le même message, aucune raison. L’affluence d’un évènement, elle, est attendue.',
        },
      ],
    },
    {
      key: 'modes',
      title: 'Les modes anti-raid',
      blocks: [
        {
          kind: 'text',
          key: 'modes-text',
          body: 'Les modes se **préparent à l’avance** sur le dashboard de Marsha. Pendant le raid, tu n’as plus qu’à les activer avec `/anti-raid mode`.',
        },
        {
          kind: 'diagram',
          key: 'modes-diagram',
          title: 'Trois modes, trois situations',
          nodes: [
            {
              glyph: 'lock',
              label: 'Lockdown',
              note: 'Salons verrouillés, arrivées bloquées, équipe prévenue',
              tone: 'danger',
            },
            {
              glyph: 'scan',
              label: 'Captcha',
              note: 'Chaque arrivant prouve qu’il est humain',
              tone: 'info',
            },
            {
              glyph: 'queue',
              label: 'Quarantaine',
              note: 'Rôle limité, validation humaine un par un',
              tone: 'caution',
            },
          ],
        },
        {
          kind: 'quiz',
          key: 'modes-quiz',
          title: 'Quel mode pour quelle situation ?',
          questions: [
            {
              key: 'q1',
              prompt:
                'Plus personne ne doit rejoindre et les salons doivent être verrouillés. Quel mode ?',
              choices: [
                { key: 'a', label: 'Lockdown', correct: true },
                { key: 'b', label: 'Captcha', correct: false },
                { key: 'c', label: 'Quarantaine', correct: false },
              ],
              explanation:
                'Lockdown verrouille les salons, bloque les arrivées et prévient l’équipe.',
            },
            {
              key: 'q2',
              prompt: 'Chaque nouvel arrivant doit prouver qu’il est humain. Quel mode ?',
              choices: [
                { key: 'a', label: 'Captcha', correct: true },
                { key: 'b', label: 'Lockdown', correct: false },
                { key: 'c', label: 'Quarantaine', correct: false },
              ],
              explanation: 'Captcha soumet chaque nouvel arrivant à une vérification.',
            },
            {
              key: 'q3',
              prompt:
                'Les nouveaux reçoivent un rôle limité, un modérateur les valide un par un. Quel mode ?',
              choices: [
                { key: 'a', label: 'Quarantaine', correct: true },
                { key: 'b', label: 'Lockdown', correct: false },
                { key: 'c', label: 'Captcha', correct: false },
              ],
              explanation:
                'Quarantaine isole les nouveaux avec un rôle limité, jusqu’à validation humaine.',
            },
          ],
        },
        {
          kind: 'command',
          key: 'modes-command',
          title: 'Activer le verrouillage',
          prompt: 'Active le mode anti-raid nommé **Lockdown**.',
          accepted: ['/anti-raid mode Lockdown'],
          hint: 'La commande commence par une barre oblique.',
          explanation:
            '`/anti-raid mode Lockdown` : personne ne rejoint, les salons sont verrouillés, l’équipe est notifiée.',
        },
      ],
    },
    {
      key: 'ordre',
      title: 'Agir dans l’ordre',
      blocks: [
        {
          kind: 'diagram',
          key: 'ordre-diagram',
          title: 'La séquence d’un raid, dans l’ordre',
          caption: 'On stoppe d’abord, on garde la preuve, on bannit, on nettoie, on rend.',
          nodes: [
            {
              glyph: 'lock',
              label: 'Mode anti-raid',
              note: 'On stoppe l’hémorragie',
              tone: 'danger',
            },
            { glyph: 'sheet', label: 'Archive', note: 'La preuve d’abord', tone: 'info' },
            { glyph: 'blocked', label: 'Bannir', note: 'En une fois', tone: 'caution' },
            { glyph: 'remove', label: 'Nettoyer', note: 'Les messages laissés', tone: 'neutral' },
            { glyph: 'unlock', label: 'Rendre', note: 'Mode désactivé', tone: 'success' },
          ],
        },
        {
          kind: 'demo',
          key: 'ordre-demo',
          title: 'Démo : les premières minutes d’un raid',
          surface: 'discord',
          lines: [
            { author: 'Nouveau_4821', text: 'REJOIGNEZ https://raid.example', role: 'viewer' },
            { author: 'Nouveau_4822', text: 'REJOIGNEZ https://raid.example', role: 'viewer' },
            { author: 'Marsha', text: '48 comptes ont rejoint en 40 secondes.', role: 'bot' },
          ],
          steps: [
            {
              caption:
                'Quarante-huit comptes en quarante secondes : c’est un raid, pas une soirée animée.',
            },
            {
              caption: 'Premier geste : tu bloques les arrivées avec le mode préparé.',
              act: 'command',
              detail: '/anti-raid mode Lockdown',
              say: {
                author: 'Marsha',
                text: 'Lockdown actif, salons verrouillés, équipe notifiée.',
                role: 'bot',
              },
            },
            {
              caption: 'Tu archives les messages qui servent de preuve, avant tout nettoyage.',
            },
            {
              caption:
                'Tu bannis les comptes du raid en une seule commande, identifiants séparés par une virgule.',
              act: 'command',
              detail: '!multi-ban 691285937420173312,583274691847293952 Tentative de raid',
              say: {
                author: 'Marsha',
                text: 'Confirme le bannissement de 2 comptes.',
                role: 'bot',
              },
            },
          ],
        },
        {
          kind: 'order',
          key: 'ordre-order',
          title: 'La séquence d’un raid',
          prompt: 'Remets les actions dans l’ordre où tu les fais.',
          items: [
            { key: 'mode', label: 'Activer le mode anti-raid préparé' },
            { key: 'archive', label: 'Archiver les messages qui servent de preuve' },
            { key: 'ban', label: 'Bannir les comptes du raid en une fois' },
            { key: 'clear', label: 'Nettoyer les messages laissés' },
            { key: 'disable', label: 'Désactiver le mode anti-raid' },
          ],
          explanation:
            'On **stoppe l’hémorragie** d’abord, on garde la preuve, on bannit, on nettoie, et on ne désactive le mode qu’une fois les raiders bannis et le serveur nettoyé.',
        },
        {
          kind: 'callout',
          key: 'ordre-warning',
          tone: 'warning',
          title: 'Archive avant de nettoyer',
          body: '`!clear` supprime pour de bon, et Discord refuse les messages de plus de 14 jours. Si les messages servent de preuve, archive d’abord.',
        },
        {
          kind: 'command',
          key: 'ordre-multiban',
          title: 'Bannir plusieurs comptes',
          prompt:
            'Bannis d’un coup les comptes `691285937420173312` et `583274691847293952` pour « Tentative de raid ». Les identifiants se séparent par une virgule, sans espace.',
          accepted: ['!multi-ban 691285937420173312,583274691847293952 Tentative de raid'],
          hint: 'Les identifiants sont collés, séparés par une virgule.',
          explanation:
            '`!multi-ban 691285937420173312,583274691847293952 Tentative de raid`. Marsha gère seule les limites de Discord et demande une confirmation : relis la liste avant.',
        },
        {
          kind: 'command',
          key: 'ordre-disable',
          title: 'Rendre le serveur',
          prompt: 'Une fois les raiders bannis et le serveur nettoyé, désactive le mode anti-raid.',
          accepted: ['/anti-raid disable'],
          hint: 'Même famille de commande que pour l’activer.',
          explanation:
            '`/anti-raid disable`. Jamais avant que les raiders soient bannis et le salon nettoyé.',
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
              glyph: 'lock',
              title: 'Bloque d’abord',
              body: 'Ferme le robinet avant de vider la baignoire.',
              tone: 'danger',
            },
            {
              glyph: 'sheet',
              title: 'Garde la preuve',
              body: 'Archive avant de nettoyer, `!clear` supprime pour de bon.',
              tone: 'info',
            },
            {
              glyph: 'unlock',
              title: 'Rends en dernier',
              body: 'Le mode se désactive quand les raiders sont bannis et le serveur nettoyé.',
              tone: 'success',
            },
          ],
        },
        {
          kind: 'simulation',
          key: 'situation-sim',
          title: 'Le raid de 22 h',
          surface: 'discord',
          context:
            'Il est 22 h, tu es seul de permanence. Le serveur commence à se remplir de comptes suspects.',
          steps: [
            {
              key: 's1',
              lines: [
                { author: 'Nouveau_4821', text: 'REJOIGNEZ https://raid.example', role: 'viewer' },
                { author: 'Nouveau_4822', text: 'REJOIGNEZ https://raid.example', role: 'viewer' },
                { author: 'Nouveau_4823', text: 'REJOIGNEZ https://raid.example', role: 'viewer' },
                { author: 'Marsha', text: '48 comptes ont rejoint en 40 secondes.', role: 'bot' },
              ],
              prompt: 'Que fais-tu en premier ?',
              options: [
                {
                  key: 'lockdown',
                  label: '/anti-raid mode Lockdown',
                  correct: true,
                  feedback:
                    'Exact : d’abord stopper les arrivées, avant de traiter les comptes déjà entrés.',
                },
                {
                  key: 'ban-one',
                  label: '!ban @Nouveau_4821 Raid',
                  correct: false,
                  feedback:
                    'Tu bannis un compte pendant que quarante-sept autres arrivent : commence par bloquer les arrivées.',
                },
                {
                  key: 'clear',
                  label: '!clear 100',
                  correct: false,
                  feedback:
                    'Nettoyer avant de bloquer, c’est vider une baignoire sans fermer le robinet.',
                },
              ],
            },
            {
              key: 's2',
              lines: [
                {
                  author: 'Marsha',
                  text: 'Lockdown actif, salons verrouillés, équipe notifiée.',
                  role: 'bot',
                },
                {
                  author: 'Responsable',
                  text: 'garde les captures avant de nettoyer, on en aura besoin',
                  role: 'moderator',
                },
              ],
              prompt: 'Le serveur est verrouillé. Quelle est la suite ?',
              options: [
                {
                  key: 'archive-ban',
                  label: 'J’archive les messages, puis je bannis les comptes avec !multi-ban',
                  correct: true,
                  feedback: 'Exact : la preuve d’abord, puis le bannissement groupé.',
                },
                {
                  key: 'disable',
                  label: '/anti-raid disable pour rouvrir vite',
                  correct: false,
                  feedback: 'Les raiders sont encore là : rouvrir maintenant relance le raid.',
                },
                {
                  key: 'kick-all',
                  label: 'J’expulse un par un avec !kick',
                  correct: false,
                  feedback:
                    'Une expulsion permet de revenir avec une invitation, et un par un est bien trop lent.',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
