/**
 * Copy of the Baccalaureat board
 * @type {Record<string, string>}
 */

export const BAC_BOARD_COPY = {
  roundLabel: 'Manche',
  roundTotal: '/ {total}',
  letterHidden: '?',
  getReady: 'Prépare-toi',
  letter: 'Lettre',
  stop: 'Stop !',
  stopped: '{name} a dit stop !',
  stopShout: 'STOP !',
  saving: 'Enregistré',
  wordPlaceholder: 'Un mot en {letter}',
  review: 'On vérifie les mots',
  voteLead: 'Valide ou refuse chaque mot, un vote ne se change pas.',
  voteTurn: 'À toi de voter.',
  voteWaiting: 'Votes en cours, en attente de {names}.',
  voteSpectating: 'Les joueurs votent.',
  voteCounting: 'Tous les votes sont là, comptage des points.',
  yourWord: 'Ton mot',
  duplicate: 'Même mot',
  wrongLetter: 'Pas la bonne lettre',
  accepted: 'Validé',
  refused: 'Refusé',
  undecided: 'Pas encore jugé',
  accept: 'Valider',
  reject: 'Refuser',
  empty: 'Rien écrit',
  count: 'Compter les points',
  roundWinner: '{names} remporte la manche avec un total de ',
  roundPoints: '{points} points !',
  roundNoWinner: 'Aucun point sur cette manche',
  gain: '+{points}',
  equals: '=',
  words: 'Les mots',
  next: 'Manche suivante',
  finish: 'Classement final',
  points: '{points} pts',
  bonus: '+{bonus} stop',
  final: 'Classement final',
  bestWord: 'Meilleur mot',
  mostRefused: 'Le plus refusé',
  playersProgress: 'Avancement des joueurs',
  watchWriting: 'Les joueurs écrivent leurs meilleurs mots…',
  watchPatience: 'Patience…',
  waitingHost: 'L’hôte lance la suite.',
} as const

/**
 * Copy of the session page around the board
 * @type {Record<string, string>}
 */

export const BAC_SESSION_COPY = {
  players: 'Joueurs',
  spectators: 'Spectateurs',
  foldSide: 'Plier le chat et le feed',
  unfoldSide: 'Déplier le chat et le feed',
  progress: 'Avancement de la manche',
  done: 'a fini',
  writing: 'écrit encore',
  voted: 'a voté',
  voting: 'vote encore',
  feed: 'Feed',
  feedEmpty: 'Rien ne s’est encore passé.',
} as const

/**
 * Feed lines, by kind
 * @type {Record<string, string>}
 */

export const BAC_FEED_COPY = {
  letter: 'Manche {index} : lettre {letter}.',
  finished: 'a fini la manche.',
  stopped: 'a stoppé la manche.',
  closed: 'Fin de la manche {index}, place aux votes.',
  scored: 'Points de la manche {index} comptés.',
} as const

/**
 * Copy of the game setup drawer
 * @type {Record<string, string>}
 */

export const BAC_SETUP_COPY = {
  title: 'Nouvelle partie',
  tabs: 'Réglages de la partie',
  tabLetters: 'Lettres',
  tabCategories: 'Catégories',
  tabRounds: 'Manches',
  tabTournament: 'Type',
  categories: 'Catégories',
  categoriesHint: 'Les catégories choisies servent à toute la partie.',
  categoriesRange: 'Choisis entre {min} et {max} catégories.',
  sharing: 'Mots identiques',
  sharingHint: 'Ce que rapporte un mot écrit par plusieurs joueurs.',
  letters: 'Lettres',
  lettersCount: '{count} / {total}',
  lettersAll: 'Tout cocher',
  lettersNone: 'Tout décocher',
  stop: 'Bouton STOP',
  stopHint: 'Le premier qui a tout rempli peut couper la manche pour tout le monde.',
  stopEnable: 'Activer',
  autoStop: 'Déclaration auto.',
  autoStopHint: 'Le stop est déclaré automatiquement dès que le premier joueur a tout rempli.',
  roundSeconds: 'Durée d’une manche',
  roundSecondsHint: 'Temps pour remplir toutes les catégories.',
  rounds: 'Manches',
  roundsHint: 'Le nombre de manches.',
  roundsLocked: 'Bloqué à {rounds} manches par round en tournoi.',
  less: 'Une manche de moins',
  more: 'Une manche de plus',
  tournament: 'Type',
  tournamentHint:
    'Lorsqu’un tournoi est choisi, les points s’accumulent et l’XP est plus important.',
  tournamentNone: 'Partie simple',
  tournamentNoneNote: 'Une seule partie',
  tournamentGames: '{games} rounds',
  tournamentNote: '{rounds} manches chacun',
  tooFewLetters: 'Allume au moins {count} lettres.',
  create: 'Créer la partie',
  cancel: 'Annuler',
  seconds: '{minutes} min {seconds}',
  minutes: '{minutes} min',
  onlySeconds: '{seconds} s',
} as const

/**
 * Copy of the rules sheet
 * @type {Record<string, string>}
 */

export const BAC_RULES_COPY = {
  title: 'Règles de la partie',
  categories: 'Catégories',
  letters: 'Lettres',
  lettersCount: '{count} sur {total}',
  rounds: 'Manches',
  roundSeconds: 'Durée d’une manche',
  stop: 'Bouton STOP',
  stopOn: 'Activé',
  stopAuto: 'Activé, déclaré automatiquement',
  stopOff: 'Désactivé',
  sharing: 'Mots identiques',
  type: 'Type',
  single: 'Partie simple',
  tournament: 'Tournoi en {games} rounds',
} as const
