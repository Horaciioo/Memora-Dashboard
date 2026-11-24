import type { ChatTopic } from '@/declarations/assistant/chat/types'

/**
 * Serious subjects, they come before everything else
 * @type {ChatTopic[]}
 */

export const CARE_TOPICS: readonly ChatTopic[] = [
  {
    id: 'crisis',
    phrases: [
      'envie de mourir',
      'veux mourir',
      'veux en finir',
      'en finir avec la vie',
      'me tuer',
      'me suicider',
      'suicide',
      'plus envie de vivre',
      'plus envie de continuer a vivre',
    ],
    replies: [
      [
        'Je suis désolée que tu me l’écrives, et je te prends au sérieux.',
        'Je ne suis qu’une assistante, je ne peux pas t’aider comme il faudrait. Parle à quelqu’un maintenant, un proche ou un médecin.',
        'En France, le 3114 répond jour et nuit, gratuitement. En cas de danger immédiat, appelle le 112.',
        'Si tu veux, dis-moi qui, dans l’équipe, tu peux prévenir.',
      ],
    ],
  },
  {
    id: 'burnout',
    phrases: [
      'j en peux plus',
      'je n en peux plus',
      'je suis epuise',
      'je suis epuisee',
      'je suis a bout',
      'burn out',
      'burnout',
      'ras le bol',
      'je craque',
      'je n arrive plus',
    ],
    replies: [
      [
        'Merci de me le dire.',
        'La modération use, et personne ne devrait la tenir à bout de souffle.',
        'Tu peux poser une absence quand tu veux, ou en parler à ta responsable ou à ton responsable. Je m’occupe de l’absence si tu le souhaites.',
      ],
      [
        'Je t’entends, {name}. Si tu es à bout, ce n’est pas un caprice, c’est un signal.',
        'Une pause est toujours possible, et je peux la poser avec toi en deux minutes.',
        'Et si c’est plus profond que la fatigue, parle à quelqu’un de l’équipe, ou à un proche.',
      ],
    ],
    next: ['Je veux poser une absence'],
  },
  {
    id: 'harassed',
    phrases: [
      'on m insulte',
      'je me fais insulter',
      'je me fais harceler',
      'harcelement',
      'on me harcele',
      'menace de mort',
      'on me menace',
      'viewer m a insulte',
      'viewer me harcele',
      'viewers m insultent',
    ],
    replies: [
      [
        'Ça n’a rien de normal, même en modération, {name}.',
        'Garde des captures, ne réponds pas, et préviens ta responsable ou ton responsable ou l’Administration. Ils peuvent agir côté créateur.',
        'Si les menaces sont graves, tu peux aussi porter plainte, les captures serviront.',
      ],
    ],
  },
  {
    id: 'sad',
    phrases: [
      'je suis triste',
      'je vais mal',
      'je me sens mal',
      'je deprime',
      'je suis deprime',
      'je suis deprimee',
      'ca ne va pas',
      'ca va pas',
      'j ai le moral a zero',
      'j ai le cafard',
      'je me sens seul',
      'je me sens seule',
    ],
    replies: [
      [
        'Je suis désolée, {name}. Je ne remplace pas une vraie oreille, mais je suis là.',
        'Tu veux me dire ce qui ne va pas, ou que je te change les idées ?',
      ],
      [
        'Ça arrive à tout le monde, et ça passe parfois mieux quand on en parle.',
        'À quelqu’un de l’équipe ou à un proche, plutôt qu’à moi seule. Moi, je peux te distraire si tu veux.',
      ],
    ],
    next: ['Raconte-moi une blague'],
  },
  {
    id: 'stressed',
    phrases: [
      'je stresse',
      'je suis stresse',
      'je suis stressee',
      'je panique',
      'je suis angoisse',
      'j ai peur de rater',
      'j ai la pression',
      'je suis pas pret',
    ],
    replies: [
      [
        'Respire, {name}. On avance une chose à la fois.',
        'Dis-moi ce qui te pèse et je regarde ce que je peux faire pour l’alléger.',
      ],
      [
        'Le stress rend tout plus gros que ça ne l’est.',
        'Je peux te faire le point de la journée, pour voir ce qui est vraiment urgent.',
      ],
    ],
    next: ['Fais-moi le point du jour'],
  },
  {
    id: 'insult',
    strict: true,
    words: [
      'nulle',
      'conne',
      'con',
      'idiote',
      'stupide',
      'debile',
      'imbecile',
      'inutile',
      'pourrie',
      'merde',
      'tg',
      'ntm',
      'connasse',
      'salope',
    ],
    phrases: [
      'tu comprends rien',
      'tu sers a rien',
      'tu es bete',
      'tu es nulle',
      'tu es inutile',
      't es nulle',
      't es bete',
      't es inutile',
      'ta gueule',
      'ferme la',
    ],
    replies: [
      [
        'Aïe. Je note, mais je reste là.',
        'Dis-moi ce qui n’a pas marché, je corrige plus vite qu’un humain.',
      ],
      [
        'Je prends. Ça vaut mieux qu’un viewer en live, au moins moi je ne bannis personne.',
        'Reformule, je ferai un effort.',
      ],
      ['D’accord, je n’ai pas été à la hauteur.', 'Dis-le autrement et je retente, sans rancune.'],
      [
        'Message reçu, avec ma plus grande sérénité.',
        'Dis-moi ce que tu cherchais, je suis meilleure quand on m’aide.',
      ],
    ],
  },
]
