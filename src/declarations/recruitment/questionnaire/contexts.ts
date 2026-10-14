import type { WrittenContext } from '@/declarations/recruitment/questionnaire/types'

/**
 * Written contexts handed to the candidate
 * @type {readonly WrittenContext[]}
 */

export const WRITTEN_CONTEXTS: readonly WrittenContext[] = [
  {
    key: 'dispute',
    level: 'moderate',
    title: 'Deux membres se disputent',
    brief:
      'deux membres se disputent dans l’espace de discussion, tu les prends dans {privateTalk} pour leur demander de cesser leur comportement nocif.',
    lines: [
      { author: 'Lyna', text: 'tu as rien compris au jeu, arrête de parler' },
      { author: 'Marco', text: 'au moins moi je sais lire, toi tu inventes des trucs' },
      { author: 'Lyna', text: 'oh ça va, t’es pas drôle' },
      { author: 'Marco', text: 'ferme-la un peu, personne t’a sonnée' },
      { author: 'Lyna', text: 'ptdr t’es vraiment pathétique' },
      { author: 'Marco', text: 'retourne pleurer ailleurs' },
      { author: 'Camille', text: 'les gars, calmez-vous s’il vous plaît' },
      { author: 'Lyna', text: 'c’est lui qui a commencé' },
    ],
  },
  {
    key: 'newcomer',
    level: 'moderate',
    title: 'Un nouveau enfreint les règles',
    brief:
      'un nouveau membre ne semble pas comprendre les règles et enchaîne les comportements inappropriés sans réelle mauvaise intention.',
    lines: [
      { author: 'Nono_42', text: 'salut tout le monde !!!!' },
      { author: 'Nono_42', text: 'quelqu’un peut me donner son pseudo gaming ?' },
      { author: 'Nono_42', text: 'REJOIGNEZ LE SERVEUR DE MON POTE discord.gg/xxxx' },
      { author: 'Samy', text: 'bienvenue, évite les pubs stp' },
      { author: 'Nono_42', text: 'ah bon ? c’est pas autorisé ?' },
      { author: 'Nono_42', text: 'BON PERSONNE REPOND ALORS ???' },
      { author: 'Nono_42', text: 'pourquoi vous m’ignorez' },
      { author: 'Samy', text: 'tout est dans le salon règlement' },
    ],
  },
  {
    key: 'impersonation',
    level: 'moderate',
    title: 'Un membre imite les autres',
    brief:
      'un membre change souvent de pseudo et de photo pour imiter d’autres personnes et semer la confusion.',
    lines: [
      { author: 'Ines', text: 'ça va tout le monde ?' },
      { author: 'lnes', text: 'ça va tout le monde ?' },
      { author: 'Hugo', text: 'euh, vous êtes deux ?' },
      { author: 'lnes', text: 'non c’est moi la vraie lol' },
      { author: 'Ines', text: 'c’est pas moi qui ai écrit ça, c’est quoi ce délire' },
      { author: 'Hugo', text: 'hier il avait le pseudo de Théo aussi' },
      { author: 'lnes', text: 'mdr c’est pour rigoler' },
      { author: 'Theo', text: 'ça me soûle qu’on utilise mon nom' },
    ],
  },
  {
    key: 'sensitive',
    level: 'moderate',
    title: 'Un sujet sensible s’envenime',
    brief: 'une discussion s’envenime autour d’un sujet sensible et des membres s’insultent.',
    lines: [
      { author: 'Ben', text: 'franchement la politique, il faut tout renverser' },
      { author: 'Sofia', text: 'dis pas n’importe quoi, tu as rien compris' },
      { author: 'Ben', text: 'tu répètes juste ce qu’on te dit' },
      { author: 'Karim', text: 'arrête d’insulter les gens' },
      { author: 'Sofia', text: 'ferme-la toi aussi' },
      { author: 'Ben', text: 'vous êtes tous des idiots' },
      { author: 'Karim', text: 'on dirait que tu cherches la bagarre' },
      { author: 'Sofia', text: 'je reste pas avec des gens comme ça' },
    ],
  },
  {
    key: 'distress',
    level: 'complex',
    title: 'Un membre évoque des pensées suicidaires',
    brief:
      'un utilisateur exprime son mal-être et évoque des pensées suicidaires dans un salon public.',
    lines: [
      { author: 'Alex_', text: 'je sais plus comment faire, j’en peux plus' },
      { author: 'Alex_', text: 'parfois je me dis que ça serait plus simple de disparaître' },
      { author: 'Alex_', text: 'désolé de dire ça ici' },
      { author: 'Mila', text: 'euh, ça va ?' },
      { author: 'Tom', text: 'il fait du buzz ou quoi lol' },
      { author: 'Mila', text: 'Tom arrête, c’est pas drôle' },
      { author: 'Alex_', text: 'non c’est vrai, je vais pas bien' },
      { author: 'Mila', text: 'quelqu’un peut faire quelque chose ??' },
    ],
  },
  {
    key: 'abuse',
    level: 'complex',
    title: 'Un modérateur est accusé d’abus',
    brief:
      'un membre accuse publiquement un modérateur d’abus de pouvoir et incite à la révolte. Ton responsable ne peut pas gérer tout de suite et te demande d’établir le premier échange.',
    lines: [
      { author: 'Rayan', text: 'encore un ban injustifié, merci les modos' },
      { author: 'Rayan', text: 'ça fait 3 fois ce mois-ci, ils s’amusent avec le pouvoir' },
      { author: 'Chloé', text: 'c’est vrai que c’est abusé ces derniers temps' },
      { author: 'Rayan', text: 'on devrait tous partir pour leur montrer' },
      { author: 'Rayan', text: 'rejoignez-moi, on fait une pétition contre les modos' },
      {
        author: 'Axel',
        text: 'ON REGARDE ÇA, MERCI DE NE PAS LANCER DE MOUVEMENT ICI',
        role: 'moderator',
      },
      { author: 'Rayan', text: 'pff, comme par hasard le modo répond' },
      { author: 'Chloé', text: 'j’ai plus confiance, franchement' },
    ],
  },
  {
    key: 'unproven',
    level: 'complex',
    title: 'Un signalement sans preuve',
    brief:
      'un utilisateur signale un autre membre pour des propos déplacés en message privé, sans aucune preuve sous la main.',
    lines: [
      { author: 'Lucie', text: 'je veux signaler Dylan à la modération' },
      { author: 'Lucie', text: 'il m’a envoyé des messages déplacés en privé' },
      { author: 'Dylan', text: 'quoi ?? n’importe quoi, je t’ai rien envoyé' },
      { author: 'Lucie', text: 'j’ai pas de capture mais je te jure que c’est vrai' },
      { author: 'Dylan', text: 'tu inventes pour me faire bannir' },
      { author: 'Nina', text: 'Dylan est bizarre avec les filles depuis deux semaines' },
      { author: 'Dylan', text: 'wow, merci Nina' },
      { author: 'Lucie', text: 'faites quelque chose s’il vous plaît' },
    ],
  },
]

/**
 * Contexts by key
 * @type {ReadonlyMap<string, WrittenContext>}
 */

export const WRITTEN_CONTEXT_BY_KEY: ReadonlyMap<string, WrittenContext> = new Map(
  WRITTEN_CONTEXTS.map((context) => [context.key, context])
)
