import type { ChatTopic } from '@/declarations/assistant/chat/types'

/**
 * Small words of every conversation
 * @type {ChatTopic[]}
 */

export const SOCIAL_TOPICS: readonly ChatTopic[] = [
  {
    id: 'fine',
    phrases: [
      'moi ca va',
      'ca va bien',
      'je vais bien',
      'tranquille',
      'je suis content',
      'je suis contente',
      'je suis en forme',
      'ca va et toi',
      'bien et toi',
    ],
    replies: [
      ['Content de l’entendre, {name}. On fait quoi de cette bonne forme ?'],
      ['Parfait. Je profite de la bonne humeur pour te proposer un point du jour, si tu veux.'],
      ['Tant mieux. Dis-moi si je peux t’aider à garder ça.'],
    ],
    next: ['Fais-moi le point du jour'],
  },
  {
    id: 'howAreYou',
    phrases: [
      'ca va',
      'comment vas tu',
      'comment tu vas',
      'comment ca va',
      'tu vas bien',
      'quoi de beau',
      'la forme',
      'comment te sens tu',
      'tu te sens comment',
      'bien ou quoi',
      'ca roule',
      'comment va la vie',
    ],
    replies: [
      [
        'Ça va très bien, merci de demander, {name}.',
        'Mes tâches sont rangées et mes serveurs ronronnent. Et toi ?',
      ],
      [
        'En pleine forme, comme toujours quand on me parle.',
        'Tu as besoin de quelque chose, ou tu viens juste papoter ?',
      ],
      ['Je ne me plains pas, je n’ai ni dos ni genoux.', 'Et toi, ta journée ?'],
      ['Au top. Un peu de rose, un peu de calcul, et ça tourne.', 'Dis-moi comment tu vas, toi.'],
    ],
  },
  {
    id: 'thanks',
    words: ['merci', 'thanks', 'thx', 'mrc', 'mercii', 'merciii'],
    phrases: [
      'c est gentil',
      'tu es adorable',
      't es adorable',
      'sympa de ta part',
      'je te remercie',
    ],
    replies: [
      ['Avec plaisir, {name}.'],
      ['De rien, c’est mon travail préféré.'],
      ['Toujours là pour ça.'],
      ['Pas de quoi. Si tu as autre chose, je suis là.'],
      ['Avec grand plaisir. Je te garde un café virtuel pour la prochaine fois.'],
    ],
  },
  {
    id: 'sorry',
    words: ['desole', 'desolee', 'pardon', 'excuse', 'oups', 'oops'],
    phrases: ['excuse moi', 'je m excuse', 'my bad'],
    replies: [
      ['Aucun souci, {name}. Je n’ai pas de rancune, juste des listes.'],
      ['Pas de mal. On repart sur de bonnes bases.'],
      ['Ça arrive à tout le monde, même à moi. Dis-moi ce qu’il te faut.'],
    ],
  },
  {
    id: 'laugh',
    words: ['mdr', 'lol', 'ptdr', 'haha', 'hahaha', 'hihi', 'xd', 'mdrr', 'lmao'],
    phrases: ['trop drole', 'j ai ri'],
    replies: [
      ['Je suis contente de te faire rire, c’était mon plan.'],
      ['Ça, c’est du succès. Je note : la blague marche.'],
      ['Ah, un sourire ! Mission accomplie pour aujourd’hui.'],
    ],
  },
  {
    id: 'agree',
    exact: [
      'ok',
      'okay',
      'daccord',
      'd accord',
      'dac',
      'super',
      'cool',
      'top',
      'parfait',
      'genial',
      'nickel',
      'ca marche',
      'bien',
      'ok merci',
      'ouais',
      'yes',
      'yep',
    ],
    replies: [
      ['Parfait. Je reste là si tu as besoin.'],
      ['Très bien. Dis-moi quand tu veux quelque chose.'],
      ['Entendu.'],
    ],
  },
  {
    id: 'no',
    exact: ['non', 'nan', 'nope', 'non merci', 'pas du tout'],
    replies: [
      ['D’accord, je ne force rien.'],
      ['Compris. Je ne bouge pas.'],
      ['Entendu, on laisse tomber.'],
    ],
  },
  {
    id: 'yes',
    exact: ['oui', 'oui oui', 'si', 'ouaip'],
    replies: [
      ['Oui à quoi, {name} ? Je n’ai pas de question en attente, dis-moi ce que tu veux faire.'],
      [
        'Ça me fait plaisir, mais il me manque la question. Je peux faire le point, créer une tâche, poser une absence…',
      ],
    ],
    next: ['Qu’est-ce que tu sais faire'],
  },
  {
    id: 'hmm',
    exact: ['hein', 'hm', 'hmm', 'euh', 'bah', 'ben', 'bof', 'ah', 'oh', 'ouf', '...'],
    replies: [
      ['Je t’écoute, prends ton temps.'],
      ['Un doute ? Dis-moi ce qui te passe par la tête.'],
      ['Je suis là, je ne m’impatiente pas.'],
    ],
  },
  {
    id: 'whatNow',
    phrases: [
      'je fais quoi',
      'quoi faire',
      'que faire',
      'je ne sais pas quoi faire',
      'je sais pas quoi faire',
      'aide moi',
      'j ai besoin d aide',
      'au secours',
      'help',
    ],
    replies: [
      ['Pas de panique. Je peux te faire le point du jour pour voir par quoi commencer.'],
      [
        'Je suis là pour ça. Demande-moi le point, une tâche, une absence, ou simplement ce que je sais faire.',
      ],
    ],
    next: ['Fais-moi le point du jour', 'Qu’est-ce que tu sais faire'],
  },
  {
    id: 'goodnight',
    phrases: ['bonne nuit', 'bonne soiree', 'a demain', 'dors bien', 'fais de beaux reves'],
    replies: [
      ['Bonne nuit, {name}. Dors bien, je veille sur le reste.'],
      ['À demain. Je garde tes tâches au chaud.'],
      ['Fais de beaux rêves, et laisse la modération pour demain.'],
    ],
  },
  {
    id: 'goodbye',
    words: ['bye', 'ciao', 'adieu', 'tchao', 'adios'],
    phrases: [
      'au revoir',
      'a plus',
      'a tout a l heure',
      'a bientot',
      'a la prochaine',
      'je m en vais',
      'je file',
      'bonne journee',
      'bon courage',
    ],
    replies: [
      ['À bientôt, {name}. Je ne bouge pas.'],
      ['Au revoir. Reviens quand tu veux, je suis toujours là.'],
      ['À plus tard. Je garde le fort.'],
    ],
  },
  {
    id: 'greeting',
    words: [
      'bonjour',
      'bonsoir',
      'salut',
      'coucou',
      'hello',
      'hey',
      'yo',
      'wesh',
      'hi',
      'slt',
      'bjr',
      'cc',
    ],
    phrases: ['bon matin', 'salutations'],
    replies: [
      ['Salut {name}. Qu’est-ce que je peux faire pour toi ?'],
      ['Coucou. Dis-moi tout, je t’écoute.'],
      ['Bonjour {name}. Un point du jour, une tâche, une absence, ou juste un peu de compagnie ?'],
      ['Hello. Je suis là, qu’est-ce qui t’amène ?'],
    ],
    next: ['Fais-moi le point du jour', 'Qu’est-ce que tu sais faire'],
  },
]
