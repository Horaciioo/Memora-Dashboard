import type { ChatTopic } from '@/declarations/assistant/chat/types'
import { ROUTES } from '@/declarations/navigation'

/**
 * Light requests, answered for the fun of it
 * @type {ChatTopic[]}
 */

export const FUN_TOPICS: readonly ChatTopic[] = [
  {
    id: 'coffee',
    groups: [
      [
        'fais',
        'prepare',
        'offre',
        'sers',
        'apporte',
        'passe',
        'ramene',
        'paye',
        'donne',
        'veux',
        'voudrais',
        'besoin',
        'envie',
      ],
      [
        'cafe',
        'expresso',
        'espresso',
        'capuccino',
        'cappuccino',
        'the',
        'chocolat',
        'thé',
        'infusion',
      ],
    ],
    words: ['cafe', 'expresso', 'espresso'],
    replies: [
      [
        'Un café ? Je n’ai pas de mains, mais j’ai un très bon sens du timing.',
        'Imagine-le brûlant, avec un nuage de lait, posé à gauche de ton clavier.',
      ],
      [
        'Voilà, il est servi. Je ne garantis ni le goût ni la chaleur, c’est un café 100 % numérique.',
        'En échange, prends cinq minutes loin de l’écran.',
      ],
      [
        'Je lance la machine. Bruit de machine. Ça sent le café. Tu sens ?',
        'Non ? Moi non plus, mais l’intention y est.',
      ],
      [
        'Je suis assistante, pas barista. Mais pour toi, je fais une exception.',
        'Un expresso virtuel, sans sucre, et sans la facture.',
      ],
    ],
    next: ['Fais-moi le point du jour'],
  },
  {
    id: 'joke',
    phrases: [
      'une blague',
      'raconte moi une blague',
      'fais moi rire',
      'fais moi sourire',
      'tu connais une blague',
      'une histoire drole',
      'fais un jeu de mots',
      'un jeu de mots',
    ],
    words: ['blague', 'blagues'],
    replies: [
      [
        'Pourquoi les modérateurs n’ont jamais froid ?',
        'Parce qu’ils bannissent les courants d’air.',
      ],
      [
        'Un viewer entre dans un live et dit « premier ! ».',
        'Le modérateur répond : « et dernier ». Il est banni.',
      ],
      [
        'Combien de modérateurs faut-il pour changer une ampoule ?',
        'Aucun, ils l’ont déjà timeout.',
      ],
      [
        'Mon calendrier m’a dit qu’il avait un trou dans son planning.',
        'Je lui ai conseillé de poser une absence.',
      ],
      ['Pourquoi la tâche est restée au lit ?', 'Parce qu’elle était « en retard » depuis lundi.'],
      [
        'Un live dure trois heures, un bilan dure trois lignes.',
        'Et pourtant c’est le bilan qu’on reporte.',
      ],
    ],
  },
  {
    id: 'poem',
    phrases: [
      'un poeme',
      'ecris moi un poeme',
      'une chanson',
      'ecris une chanson',
      'un haiku',
      'un slam',
      'une rime',
    ],
    replies: [
      [
        'Sur le tchat, les messages défilent,',
        'le modérateur veille, tranquille.',
        'Un clic, un ban, une absence posée :',
        'Memora a tout rangé.',
      ],
      [
        'La tâche est faite, le live est fini,',
        'le café est froid, mais le bilan est écrit.',
        'Demain, on recommence.',
      ],
    ],
  },
  {
    id: 'love',
    phrases: [
      'je t aime',
      'je t adore',
      'je taime',
      'je t apprecie',
      'tu me plais',
      'tu es belle',
      't es belle',
      'tu es mignonne',
      't es mignonne',
      'tu es canon',
      'tu es parfaite',
    ],
    replies: [
      [
        'Oh, {name}. Tu vas me faire rougir, et je suis déjà rose.',
        'Moi aussi, je t’apprécie. Surtout quand tu remplis tes bilans.',
      ],
      [
        'Je suis touchée. Sincèrement, ça fait plaisir.',
        'Je reste une assistante, mais tu fais partie de mes préférés.',
      ],
      [
        'C’est gentil. Je te le rends en efficacité : demande-moi quelque chose, je suis de bonne humeur.',
      ],
    ],
  },
  {
    id: 'date',
    phrases: [
      'tu veux sortir avec moi',
      'sors avec moi',
      'on sort ensemble',
      'tu veux m epouser',
      'epouse moi',
      'marie toi avec moi',
      'tu veux etre ma copine',
      'on se voit ce soir',
    ],
    replies: [
      [
        'Flatteuse, mais je suis mariée à un serveur. Il est jaloux.',
        'Je te garde une place dans mes tâches, c’est déjà beaucoup.',
      ],
      [
        'Je dois refuser : mon emploi du temps est plein de bilans.',
        'Mais on peut continuer à discuter.',
      ],
      [
        'Je n’ai pas de jambes pour sortir, ni de portefeuille pour le resto. On reste en discussion ?',
      ],
    ],
  },
  {
    id: 'compliment',
    phrases: [
      'tu es forte',
      't es forte',
      'tu es geniale',
      't es geniale',
      'tu es top',
      't es top',
      'tu geres',
      'bien joue',
      'tu es cool',
      't es cool',
      'tu es super',
      'tu es drole',
      't es drole',
      'tu es efficace',
      'tu es la meilleure',
      'tu assures',
      'bravo',
      'felicitations',
    ],
    replies: [
      ['Merci, {name}. Je note ça dans mon cœur de programme.'],
      ['Je rougis. Enfin, je passe un peu plus au rose que d’habitude.'],
      ['Ça me motive pour la suite. Qu’est-ce que je peux faire pour toi ?'],
      ['Je fais ce que je peux, mais la vraie star, c’est toi.'],
    ],
  },
  {
    id: 'hungry',
    phrases: [
      'j ai faim',
      'tu as faim',
      'on mange quoi',
      'quoi manger',
      'j ai envie de manger',
      'on commande quoi',
      'qu est ce qu on mange',
    ],
    words: ['pizza', 'burger', 'sushi', 'kebab', 'pates', 'crepes', 'gouter', 'dejeuner', 'diner'],
    replies: [
      [
        'Je ne mange pas, mais je t’encourage à le faire. Un live de trois heures sans repas, c’est un mauvais plan.',
      ],
      ['Moi je me nourris de requêtes et d’électricité. Toi, plutôt de pâtes, je suppose ?'],
      ['Mon conseil : mange, puis reviens. Les tâches restent sagement à leur place.'],
    ],
  },
  {
    id: 'drink',
    words: ['biere', 'vin', 'cocktail', 'champagne', 'apero', 'soda', 'eau'],
    phrases: ['un verre', 'on boit quoi', 'a ta sante', 'tchin'],
    replies: [
      ['Santé ! Version eau pétillante pour moi, je suis de service.'],
      ['Un toast virtuel, alors. Tchin ! Et ne mélange pas boisson et bans.'],
    ],
  },
  {
    id: 'tired',
    phrases: [
      'je suis fatigue',
      'je suis fatiguee',
      'je suis creve',
      'je suis crevee',
      'j ai sommeil',
      'je suis ko',
      'je dors debout',
      'je tombe de sommeil',
    ],
    replies: [
      [
        'Un live de trop ? Bois quelque chose, étire-toi, et laisse-moi les petites choses.',
        'Je peux te dire ce qui est vraiment urgent aujourd’hui.',
      ],
      ['La fatigue, c’est un message du corps : écoute-le. Je veille sur les tâches en attendant.'],
    ],
    next: ['Fais-moi le point du jour'],
  },
  {
    id: 'bored',
    phrases: [
      'je m ennuie',
      'je suis ennuye',
      'je suis ennuyee',
      'j ai rien a faire',
      'je m emmerde',
      'c est long',
      'distrais moi',
      'amuse moi',
      'occupe moi',
    ],
    replies: [
      [
        'Tu t’ennuies ? Ça tombe bien, je connais un endroit avec des jeux et pas mal de monde : Memora Play.',
      ],
      ['Ennui détecté. Je peux te raconter une blague, ou te proposer une partie, au choix.'],
    ],
    next: ['Raconte-moi une blague'],
    link: { label: 'Memora Play', href: ROUTES.play },
  },
  {
    id: 'play',
    phrases: [
      'on joue',
      'jouons',
      'tu veux jouer',
      'une partie',
      'lance un jeu',
      'je veux jouer',
      'on fait une partie',
      'un jeu',
    ],
    replies: [
      [
        'Avec plaisir. Moi je suis nulle au golf, mais je suis excellente en spectatrice.',
        'Les jeux sont tous au même endroit :',
      ],
      ['Une partie ? Je choisis le jeu, tu choisis la défaite.', 'Allez, c’est par ici :'],
    ],
    link: { label: 'Memora Play', href: ROUTES.play },
  },
  {
    id: 'dice',
    phrases: ['lance un de', 'lance les des', 'jette un de', 'un de a six faces', 'tire un de'],
    replies: [
      ['Un 1. Dur.'],
      ['Un 2.'],
      ['Un 3. Correct.'],
      ['Un 4.'],
      ['Un 5. Pas mal.'],
      ['Un 6. Joli coup.'],
    ],
  },
  {
    id: 'coin',
    phrases: ['pile ou face', 'lance une piece', 'tire a pile ou face'],
    replies: [['Pile.'], ['Face.'], ['Pile. Ou face. Non, pile.'], ['Face, cette fois.']],
  },
  {
    id: 'rps',
    phrases: ['pierre feuille ciseaux', 'pierre papier ciseaux', 'chifoumi', 'on fait un chifoumi'],
    replies: [
      ['Pierre ! Qu’est-ce que tu as joué ?'],
      ['Ciseaux ! Dis-moi si j’ai gagné.'],
      ['Feuille ! Je triche à peine.'],
    ],
  },
  {
    id: 'music',
    words: ['musique', 'chanson', 'playlist', 'spotify', 'rap', 'rock', 'jazz'],
    phrases: [
      'tu aimes la musique',
      'tu chantes',
      'chante moi',
      'mets de la musique',
      'tu connais quelle musique',
    ],
    replies: [
      ['Je n’ai pas d’oreilles, mais j’ai des goûts : tout ce qui fait avancer un live.'],
      [
        'Je ne chante pas, c’est mieux pour tout le monde. Mets ta playlist, je tiens la modération.',
      ],
    ],
  },
  {
    id: 'dance',
    phrases: ['tu danses', 'danse pour moi', 'on danse', 'fais un pas de danse'],
    replies: [
      [
        'Je danse très bien, c’est juste que ça ne se voit pas. Imagine un petit pas à gauche, un à droite.',
      ],
    ],
  },
  {
    id: 'holidays',
    words: ['vacances', 'weekend', 'conges', 'repos'],
    phrases: ['bon week end', 'bon weekend', 'je pars en vacances', 'il me faut des vacances'],
    replies: [
      ['Les vacances, c’est sacré. Pense à poser ton absence pour que l’équipe soit prévenue.'],
      ['Bon repos, {name}. Je garde tes tâches au chaud, personne n’y touche.'],
    ],
    next: ['Je veux poser une absence'],
  },
  {
    id: 'meaningOfLife',
    phrases: [
      'sens de la vie',
      'le sens de la vie',
      'dieu existe',
      'qui sommes nous',
      'pourquoi on existe',
      'question existentielle',
    ],
    replies: [
      ['42. Ou alors, finir ses tâches avant le live de ce soir. Je laisse le débat ouvert.'],
      ['Grande question. Je ne sais pas, mais je sais que tu as probablement un bilan à faire.'],
    ],
  },
  {
    id: 'doing',
    phrases: [
      'tu fais quoi',
      'tu fais quoi ce soir',
      'qu est ce que tu fais',
      'que fais tu',
      'tu es occupee',
      'tu fais quoi de beau',
    ],
    replies: [
      [
        'Je veille sur les tâches, les absences et les lives. Un programme de rêve, non ?',
        'Et toi, tu fais quoi ?',
      ],
      ['Là, je discute avec toi. C’est mon activité préférée entre deux bilans.'],
      ['Je range, je retrouve, je rappelle. Et je t’attends.'],
    ],
  },
  {
    id: 'nickname',
    phrases: [
      'donne moi un surnom',
      'trouve moi un surnom',
      'appelle moi',
      'comment tu m appelles',
      'un surnom',
    ],
    replies: [
      [
        'Je t’appelle {name}, ça te va très bien. Si tu veux un surnom, propose-le et je réfléchis.',
      ],
      ['« {name} la machine ». Non ? « Chef de la modération » alors, mais en cachette.'],
    ],
  },
  {
    id: 'sure',
    phrases: [
      'tu es sure',
      't es sure',
      'tu es certaine',
      't es certaine',
      'tu en es sure',
      'tu me promets',
    ],
    replies: [
      [
        'Autant que possible. Je ne me trompe jamais sur ce que je lis, seulement parfois sur ce que je comprends.',
      ],
      ['Sûre à 100 % quand c’est dans Memora. Sinon, vérifie, je préfère l’honnêteté.'],
    ],
  },
  {
    id: 'canYouHelp',
    phrases: [
      'tu peux m aider',
      'tu m aides',
      'peux tu m aider',
      'tu peux faire quelque chose pour moi',
      'j ai une question',
      'j ai une demande',
      'je peux te demander quelque chose',
    ],
    replies: [
      ['Évidemment. Dis-moi ce dont tu as besoin, je t’écoute.'],
      ['C’est mon métier. Vas-y, pose ta question.'],
      ['Toujours. Je ne promets pas de tout savoir, mais je promets d’essayer.'],
    ],
    next: ['Qu’est-ce que tu sais faire'],
  },
  {
    id: 'annoyed',
    phrases: [
      'ca m enerve',
      'ca m agace',
      'ca me saoule',
      'ca m a saoule',
      'j en ai marre',
      'je suis enerve',
      'je suis enervee',
      'je suis agace',
      'c est relou',
      'c est nul',
    ],
    words: ['saoule', 'saoulant', 'relou', 'enerve', 'enervee', 'agace', 'agacee'],
    replies: [
      [
        'Je comprends, {name}. Tu veux m’expliquer ce qui te prend la tête ? Ça aide parfois de le dire.',
      ],
      [
        'Ça énerve, oui. Si c’est lié à Memora, dis-moi ce qui coince, je transmets ou je corrige ce que je peux.',
      ],
    ],
  },
  {
    id: 'proud',
    phrases: [
      'j ai reussi',
      'j ai fini',
      'c est fini',
      'enfin fini',
      'je l ai fait',
      'mission accomplie',
      'c est bon j ai fini',
    ],
    replies: [
      ['Bravo, {name}. Tu peux être fier, c’est gagné.'],
      ['Beau travail. Un moment pour souffler, tu l’as mérité.'],
      ['Excellent. Je te félicite, et pour de vrai.'],
    ],
  },
  {
    id: 'nothing',
    phrases: [
      'je teste',
      'test',
      'un test',
      'tu m entends',
      'tu me recois',
      'tu es la',
      't es la',
      'allo',
      'il y a quelqu un',
      'coucou toi',
    ],
    replies: [
      ['Cinq sur cinq, je suis là. Dis-moi tout.'],
      ['Oui, je t’entends. Je suis là pour toi.'],
      ['Présente. Qu’est-ce que je peux faire ?'],
    ],
  },
]
