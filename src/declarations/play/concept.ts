import { PlayGames } from '@/utils/constants/play'
import type { PlayGameName } from '@/utils/constants/play'

/**
 * One step of a game's concept
 * @typedef {Object} PlayConceptStep
 */

export interface PlayConceptStep {
  title: string
  text: string
}

/**
 * How each game plays, three short steps
 * @type {Record<PlayGameName, PlayConceptStep[]>}
 */

export const PLAY_CONCEPT: Record<PlayGameName, PlayConceptStep[]> = {
  [PlayGames.Baccalaureat]: [
    {
      title: 'Une lettre tombe',
      text: 'Chaque manche tire une lettre au hasard, la même pour tout le monde.',
    },
    {
      title: 'Remplis les catégories',
      text: 'Un prénom, un pays, un animal… Un mot par case, qui commence par la lettre.',
    },
    {
      title: 'Stop et votes',
      text: 'Le premier qui a fini crie stop. Tout le monde vote les réponses douteuses, les mots uniques rapportent plus.',
    },
  ],
  [PlayGames.Bomb]: [
    {
      title: 'Une syllabe',
      text: 'La bombe arrive sur toi avec une syllabe.',
    },
    {
      title: 'Trouve un mot',
      text: 'Tape un mot qui contient la syllabe, avant que la mèche ne brûle.',
    },
    {
      title: 'Passe la bombe',
      text: 'Mot validé, la bombe passe au suivant. Si elle t’explose dans les mains, tu perds une vie.',
    },
  ],
  [PlayGames.Echo]: [
    {
      title: 'Deux cartes, un seul point commun',
      text: 'Chaque joueur reçoit une carte, une autre trône au centre. Elles partagent toujours exactement un symbole.',
    },
    {
      title: 'Clique dessus le premier',
      text: 'Repère le symbole en commun sur ta carte, même s’il est tout petit ou penché. Une erreur verrouille ta carte un instant.',
    },
    {
      title: 'Plus vite, plus de points',
      text: 'Chaque symbole trouvé rapporte des points, le premier à le trouver a un bonus.',
    },
  ],
  [PlayGames.Glitch]: [
    {
      title: 'Deux images jumelles',
      text: 'Des chiffres, des lettres, des formes : la copie diffère du modèle en quelques détails.',
    },
    {
      title: 'Clique sur chaque écart',
      text: 'Couleur, taille, forme, un élément en trop ou en moins. Un faux clic fige ton image un instant.',
    },
    {
      title: 'Boucle l’image la première',
      text: 'Chaque différence rapporte, le premier à tout trouver empoche le plus gros bonus.',
    },
  ],
  [PlayGames.Jumble]: [
    {
      title: 'Des lettres en vrac',
      text: 'Un mot apparaît mélangé, la même chose pour tout le monde en même temps.',
    },
    {
      title: 'Trouve-le le premier',
      text: 'Tape le mot dans l’ordre. Le plus rapide empoche la manche, un indice tombe si ça traîne.',
    },
    {
      title: 'Enchaîne les éclairs',
      text: 'Plus tu réponds vite, plus tu marques. Gagne plusieurs manches de suite pour faire grimper la série.',
    },
  ],
  [PlayGames.Golf]: [
    {
      title: 'Vise',
      text: 'Tire la balle vers l’arrière pour viser, plus tu tires, plus le coup est fort.',
    },
    {
      title: 'Rentre dans le trou',
      text: 'Tout le monde joue en même temps. Le moins de coups sur le parcours gagne.',
    },
    {
      title: 'Ramasse des pouvoirs',
      text: 'Roule sur une orbe pour piocher un pouvoir : un bonus pour toi ou un malus pour les autres.',
    },
  ],
  [PlayGames.Ludo]: [
    {
      title: 'Lance le dé',
      text: 'Un 1 ou un 6 sort un pion de ta base, et un 6 te fait rejouer.',
    },
    {
      title: 'Avance et mange',
      text: 'Avance d’autant de cases que le dé. Tombe sur un pion adverse pour le renvoyer chez lui.',
    },
    {
      title: 'Rentre à la maison',
      text: 'Le premier qui ramène tous ses pions au centre gagne.',
    },
  ],
  [PlayGames.Naval]: [
    {
      title: 'Cache ta flotte',
      text: 'Pose cinq navires sur ta mer, à la main ou au hasard, avant que le temps ne tombe.',
    },
    {
      title: 'Tire, touche, coule',
      text: 'Choisis une case de la mer ennemie. Un tir qui touche te donne une seconde chance.',
    },
    {
      title: 'Duel, tournoi ou chacun pour soi',
      text: 'Le dernier capitaine à flot gagne, trois fois plus d’XP en tournoi, deux fois en mêlée.',
    },
  ],
}

/**
 * Words of the Concept window
 * @type {Record<string, string>}
 */

export const PLAY_CONCEPT_COPY = {
  menu: 'Concept',
  title: 'Le concept de {game}',
  powers: 'Les pouvoirs',
  bonus: 'Bonus',
  malus: 'Malus',
} as const
