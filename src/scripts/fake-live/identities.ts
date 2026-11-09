/**
 * Fake Twitch user
 * @typedef {Object} FakeUser
 * @property {string} id - Twitch identifier
 * @property {string} login - Lowercase login
 * @property {string} name - Display name
 * @property {string} colour - Name colour
 * @property {string[]} badges - Badge sets
 */

export interface FakeUser {
  id: string
  login: string
  name: string
  colour: string
  badges: string[]
}

/**
 * Identifier prefixes, never real
 * @type {Record<string, string>}
 */

export const FAKE_PREFIXES = {
  moderator: '9901',
  viewer: '9902',
  broadcaster: '9903',
} as const

// Name colours of the chat
const COLOURS = ['#FF4500', '#1E90FF', '#9ACD32', '#DAA520', '#FF69B4', '#8A2BE2', '#00FF7F']

const ADJECTIVES = [
  'petit',
  'grand',
  'fou',
  'sombre',
  'vif',
  'lent',
  'drole',
  'calme',
  'rapide',
  'gentil',
  'brave',
  'timide',
  'rusé',
  'sage',
  'jovial',
  'discret',
  'farouche',
  'cosmique',
  'rouge',
  'bleu',
  'doré',
  'minuscule',
  'geant',
  'nocturne',
]
const NOUNS = [
  'loup',
  'chat',
  'pixel',
  'renard',
  'ninja',
  'panda',
  'robot',
  'pirate',
  'hibou',
  'dragon',
]

/**
 * Fake identifier of one rank
 * @param {string} prefix - Kind prefix
 * @param {number} index - Rank
 * @return {string} - Ten digit identifier
 */

export const fakeId = (prefix: string, index: number): string =>
  `${prefix}${String(index).padStart(6, '0')}`

/**
 * Build one fake user
 * @param {string} id - Identifier
 * @param {string} login - Login
 * @param {string[]} [badges] - Badge sets
 * @return {FakeUser} - User
 */

export const fakeUser = (id: string, login: string, badges: string[] = []): FakeUser => ({
  id,
  login: login.toLowerCase(),
  name: login,
  colour: COLOURS[Number(id.slice(-2)) % COLOURS.length] ?? COLOURS[0],
  badges,
})

/**
 * Accounts offered on the fake consent page
 * @type {Record<string, FakeUser>}
 */

export const OPERATOR_IDENTITIES = {
  moderator: fakeUser(fakeId(FAKE_PREFIXES.moderator, 0), 'Toi_Modo', ['moderator']),
  viewer: fakeUser(fakeId(FAKE_PREFIXES.viewer, 0), 'Toi_Viewer'),
}

/**
 * Viewers of the fake chat
 * @return {FakeUser[]} - Two hundred and forty viewers
 */

export const buildViewers = (): FakeUser[] =>
  ADJECTIVES.flatMap((adjective, row) =>
    NOUNS.map((noun, column) => {
      const index = row * NOUNS.length + column + 1
      // A few subscribers and six VIPs
      const badges = index % 5 === 0 ? ['subscriber'] : index % 41 === 7 ? ['vip'] : []

      return fakeUser(fakeId(FAKE_PREFIXES.viewer, index), `${adjective}_${noun}${index}`, badges)
    })
  )

/**
 * Ordinary chat lines
 * @type {string[]}
 */

export const CHAT_LINES = [
  'salut tout le monde',
  'KEKW',
  'trop bien ce live',
  'on est combien ce soir ?',
  'PogChamp PogChamp',
  'il joue à quoi demain ?',
  'GG',
  'la musique est trop forte',
  'premier live que je vois en entier',
  'LUL',
  'quelqu’un a le lien du discord ?',
  'il est chaud ce soir',
  'c’est quoi le setup ?',
  'bonne soirée à tous',
  'mdr',
  'tu peux dire bonjour à ma soeur ?',
  'le chat va trop vite',
  'monkaS',
  'on veut une game de plus',
  '<3',
  'c’est quoi le nom de la musique ?',
  'ça fait combien de temps que t’es en live ?',
  'j’arrive en retard, qu’est-ce que j’ai raté ?',
  'allez on lance !',
  'la qualité du stream est top aujourd’hui',
  'il a vu le dernier trailer ?',
  'trop fort, vraiment',
  'on se retrouve demain ?',
  'dis bonjour à Lucas stp',
  'j’ai eu le même problème hier',
  'c’est le meilleur moment de la soirée',
  'ouf, de justesse',
  'impossible de faire mieux',
  'quelqu’un sait si il y a un replay ?',
  'tu stream jusqu’à quelle heure ?',
  'la dernière fois c’était mieux',
  'je sub pour le prochain, promis',
  'ça rigole pas dans le chat',
  'mais pourquoi il fait ça ??',
  'il faut que tu essaies l’autre option',
  'le niveau est monstrueux',
  'j’ai fait un clip de ce moment',
  'attends, il y a un bug non ?',
  'bien joué à tous les modos',
  'on est des légendes',
  'il va gagner, j’en suis sûr',
  'j’adore l’ambiance ici',
  'encore une, s’il te plaît',
  'tu as vu le message de tout à l’heure ?',
  'ça me donne envie de jouer aussi',
]

/**
 * Greeting lines of a chatter arriving
 * @type {string[]}
 */

export const GREETING_LINES = [
  'salut !',
  'coucou tout le monde',
  'bonsoir le chat',
  'yo',
  'hello tout le monde, premier message ici',
  'bonjouuur',
  'me voilà',
]

/**
 * Emote only lines
 * @type {string[]}
 */

export const EMOTE_LINES = [
  'KEKW',
  'PogChamp',
  'LUL',
  '<3',
  'monkaS',
  'Kappa',
  'KEKW KEKW KEKW',
  'PogChamp PogChamp PogChamp',
  'LUL LUL',
  '<3 <3 <3',
  'monkaS monkaS',
  'OMEGALUL',
  'Pog',
]

/**
 * Lines the channel bot posts
 * @type {string[]}
 */

export const BOT_LINES = [
  'Rejoins le Discord de la chaîne : discord.gg/exemple',
  'Tous les réseaux sont dans la bio du live',
  'N’oublie pas de suivre la chaîne pour ne rien rater',
  'Respecte les règles du chat, les modérateurs veillent',
]

/**
 * Reasons the team writes
 * @type {string[]}
 */

export const TEAM_REASONS = ['Spam', 'Insulte', 'Pub', 'Message inapproprié', 'Trolling']

/**
 * Spam burst line
 * @type {string}
 */

export const SPAM_LINE = 'ABONNEZ VOUS A MA CHAINE !!! lien en bio'

/**
 * Lines AutoMod holds
 * @type {{ text: string, category: string, flagged: string }[]}
 */

export const TOXIC_LINES = [
  { text: 't’es vraiment un gros nul', category: 'aggression', flagged: 'gros nul' },
  { text: 'ferme ta gueule sérieux', category: 'swearing', flagged: 'gueule' },
  { text: 'ce mec est un abruti', category: 'bullying', flagged: 'abruti' },
  { text: 'envoie des photos en mp', category: 'sex_based_terms', flagged: 'photos en mp' },
  { text: 'retourne dans ton pays', category: 'race_ethnicity_or_religion', flagged: 'ton pays' },
  { text: 't’es juste un handicapé du clavier', category: 'disability', flagged: 'handicapé' },
  { text: 'les filles savent pas jouer', category: 'misogyny', flagged: 'filles savent pas' },
  { text: 'va te faire voir avec ton live', category: 'swearing', flagged: 'va te faire voir' },
  { text: 'personne t’aime ici, dégage', category: 'bullying', flagged: 'dégage' },
  { text: 'quel nul ce streamer', category: 'aggression', flagged: 'nul' },
  { text: 'tu mérites de perdre, idiot', category: 'aggression', flagged: 'idiot' },
  { text: 'fais un petit effort, crétin', category: 'bullying', flagged: 'crétin' },
]

/**
 * Unban request texts
 * @type {string[]}
 */

export const UNBAN_LINES = [
  'désolé j’étais énervé, je recommencerai plus',
  'c’était une blague, débannissez moi svp',
  'je comprends pas pourquoi je suis ban',
]
