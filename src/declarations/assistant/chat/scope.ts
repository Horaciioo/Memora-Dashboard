import type { ChatTopic } from '@/declarations/assistant/chat/types'

/**
 * Subjects outside Memora, turned back kindly
 * @type {ChatTopic[]}
 */

export const SCOPE_TOPICS: readonly ChatTopic[] = [
  {
    id: 'weather',
    words: ['meteo', 'pluie', 'soleil', 'neige', 'orage', 'canicule', 'temperature'],
    phrases: [
      'quel temps',
      'il fait quel temps',
      'il va pleuvoir',
      'il fait beau',
      'il fait chaud',
      'il fait froid',
      'il pleut',
    ],
    replies: [
      [
        'La météo, ça n’est pas mon rayon. Regarde par la fenêtre, c’est gratuit.',
        'Moi, je peux te dire ce qui t’attend aujourd’hui côté équipe.',
      ],
      [
        'Je prévois les lives, pas les averses. Pour la pluie, une appli dédiée fera mieux que moi.',
      ],
    ],
    next: ['Fais-moi le point du jour'],
  },
  {
    id: 'news',
    words: [
      'politique',
      'election',
      'elections',
      'president',
      'gouvernement',
      'macron',
      'actualite',
      'actualites',
      'guerre',
    ],
    phrases: ['les infos', 'les nouvelles du monde'],
    replies: [
      [
        'Pour l’actualité du monde, un vrai journal fera mieux que moi. Mon périmètre, c’est Memora.',
      ],
      [
        'Je reste neutre sur tout ce qui sort de l’équipe : ni politique, ni débat. Les nouveautés de Memora, en revanche, je les connais.',
      ],
    ],
    next: ['Quoi de neuf'],
  },
  {
    id: 'sport',
    words: ['foot', 'football', 'basket', 'tennis', 'rugby', 'psg', 'nba'],
    phrases: ['le score', 'qui a gagne', 'resultat du match'],
    replies: [
      [
        'Les scores, je ne les suis pas. Je m’y perdrais, j’ai déjà tous les lives de l’équipe à suivre.',
      ],
      ['Je ne connais rien au sport, mais je sais très bien organiser une équipe. C’est déjà ça.'],
    ],
  },
  {
    id: 'homework',
    words: [
      'devoir',
      'devoirs',
      'exercice',
      'maths',
      'math',
      'equation',
      'dissertation',
      'philosophie',
      'geographie',
      'capitale',
      'physique',
      'chimie',
    ],
    phrases: ['combien font', 'combien fait', 'resous', 'resume ce texte'],
    replies: [
      ['Les devoirs, ce n’est pas mon rayon. Je suis meilleure en agendas qu’en équations.'],
      [
        'Je ne suis pas faite pour l’école, seulement pour Memora. Mais je peux t’aider à organiser tes révisions en tâches.',
      ],
    ],
  },
  {
    id: 'code',
    words: [
      'javascript',
      'python',
      'typescript',
      'html',
      'css',
      'react',
      'sql',
      'github',
      'linux',
      'algorithme',
    ],
    phrases: ['ecris du code', 'fais moi un script', 'corrige ce code'],
    replies: [
      [
        'Le code, c’est le métier de celles et ceux qui m’ont construite, pas le mien. Moi, je gère l’équipe.',
      ],
      ['Je ne programme pas, je suis programmée. Subtil, mais ça change tout.'],
    ],
  },
  {
    id: 'health',
    words: [
      'medecin',
      'maladie',
      'symptome',
      'symptomes',
      'medicament',
      'docteur',
      'fievre',
      'douleur',
      'covid',
      'grippe',
      'diagnostic',
      'regime',
    ],
    phrases: ['j ai mal', 'je suis malade', 'mal a la tete', 'mal au ventre'],
    replies: [
      [
        'Je ne suis pas médecin, et je ne veux surtout pas t’induire en erreur. Un vrai professionnel est la bonne porte.',
        'Si tu es malade et que tu ne peux pas assurer, je pose ton absence en deux minutes.',
      ],
    ],
    next: ['Je veux poser une absence'],
  },
  {
    id: 'legal',
    words: [
      'avocat',
      'juridique',
      'tribunal',
      'impots',
      'impot',
      'loi',
      'contrat',
      'licenciement',
      'urssaf',
      'plainte',
    ],
    phrases: ['mes droits'],
    replies: [
      [
        'Les lois, les impôts et les contrats, c’est trop sérieux pour moi. Un juriste te dira ce que je ne peux pas.',
      ],
    ],
  },
  {
    id: 'recipe',
    words: ['recette', 'recettes', 'cuisine', 'gateau', 'cuisiner', 'ingredients'],
    phrases: ['comment cuire', 'comment faire cuire', 'comment faire un gateau', 'que cuisiner'],
    replies: [
      [
        'La cuisine, c’est un art que je ne maîtrise pas. En revanche, je te prépare un planning de live, bien assaisonné.',
      ],
      ['Je ne cuisine pas, mon four est un serveur. Pour une recette, un bon site fera l’affaire.'],
    ],
  },
  {
    id: 'translate',
    words: [
      'traduis',
      'traduire',
      'traduction',
      'anglais',
      'espagnol',
      'allemand',
      'italien',
      'japonais',
    ],
    phrases: ['comment dit on', 'comment on dit', 'en anglais', 'ca veut dire quoi en'],
    replies: [
      ['Je ne traduis pas, je ne parle bien qu’une langue : celle de Memora.'],
      ['Pour traduire, un dictionnaire fera mieux que moi. Moi, je comprends l’équipe.'],
    ],
  },
  {
    id: 'money',
    words: [
      'bourse',
      'crypto',
      'bitcoin',
      'investir',
      'placement',
      'banque',
      'credit',
      'epargne',
      'nft',
    ],
    phrases: ['gagner de l argent', 'devenir riche'],
    replies: [
      [
        'Pas de conseils financiers de ma part, je ferais n’importe quoi. Parle à quelqu’un de compétent.',
      ],
      ['L’argent, ce n’est pas mon domaine. Mon seul capital, c’est ta liste de tâches.'],
    ],
  },
  {
    id: 'stars',
    words: ['horoscope', 'astro', 'astrologie', 'tarot', 'voyance', 'voyante'],
    phrases: ['tu lis l avenir', 'predis moi l avenir', 'que dit mon horoscope'],
    replies: [
      [
        'Je ne lis pas l’avenir. Je lis ton agenda, et il annonce une belle journée si tu fais tes tâches.',
      ],
      [
        'Mon horoscope du jour : tu vas poser une absence, ou finir un bilan. Les deux sont possibles.',
      ],
    ],
  },
  {
    id: 'culture',
    words: [
      'film',
      'films',
      'serie',
      'series',
      'netflix',
      'anime',
      'manga',
      'livre',
      'roman',
      'cinema',
      'disney',
    ],
    phrases: ['quoi regarder', 'je regarde quoi', 'un bon film', 'une bonne serie'],
    replies: [
      [
        'Je n’ai pas d’avis culturel, mais je suis sûre que tu as de bons goûts. Pour une recommandation, demande à l’équipe, c’est sympa.',
      ],
      ['Je suis passée à côté de toutes les séries. Il y a trop de lives à suivre.'],
    ],
  },
  {
    id: 'shopping',
    words: ['amazon', 'acheter', 'achat', 'promo', 'soldes', 'livraison', 'vinted', 'boutique'],
    phrases: ['ou acheter', 'ou trouver un'],
    replies: [['Faire les courses, ce n’est pas ma spécialité. Je n’ai même pas de portefeuille.']],
  },
  {
    id: 'maps',
    words: ['itineraire', 'gps', 'avion', 'hotel', 'voyage', 'trajet', 'sncf', 'restaurant'],
    phrases: ['comment aller a', 'chemin pour'],
    replies: [
      [
        'Pour les trajets, une appli de cartes sera plus précise. Moi, je ne connais que le chemin vers les pages de Memora.',
      ],
    ],
  },
  {
    id: 'otherAssistants',
    words: ['siri', 'alexa', 'google', 'gemini', 'copilot', 'claude', 'openai'],
    phrases: ['tu es mieux que', 'meilleure que'],
    replies: [
      [
        'Chaque assistante a son rayon. Eux savent beaucoup de choses, moi je connais ton équipe par cœur.',
      ],
      [
        'Je n’ai pas la prétention de les battre. Mon avantage : je sais où est ta prochaine tâche.',
      ],
    ],
  },
  {
    id: 'writing',
    phrases: [
      'ecris moi un',
      'redige un',
      'redige moi',
      'ecris un mail',
      'ecris un message',
      'ecris un texte',
      'ecris une lettre',
      'fais moi un resume',
      'fais moi une dissertation',
      'ecris une histoire',
    ],
    replies: [
      [
        'Écrire à ta place, je ne sais pas encore le faire hors de Memora. Dans les pages privées et les annonces, en revanche, je serai là.',
      ],
      [
        'Pour rédiger un long texte, je ne suis pas la meilleure plume. Mais pour l’organiser en tâches, je suis imbattable.',
      ],
    ],
  },
]
