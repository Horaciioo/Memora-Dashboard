import { FIXED_LIVECON_LEVELS } from '@/declarations/reference/fixed'

/**
 * One word of the team's vocabulary
 * @typedef {Object} GlossaryEntry
 * @property {string} term - Name shown when two entries tie
 * @property {string[]} keywords - Single folded words that name it
 * @property {string[]} lines - What she says
 */

export interface GlossaryEntry {
  term: string
  keywords: readonly string[]
  lines: readonly string[]
}

/**
 * Words of the team, explained
 * @type {GlossaryEntry[]}
 */

export const GLOSSARY: readonly GlossaryEntry[] = [
  {
    term: 'Livecon',
    keywords: ['livecon'],
    lines: [
      'Le Livecon est le niveau de tension d’un live, de 3 (calme) à 1 (crise).',
      // The levels are read where they are decided
      ...FIXED_LIVECON_LEVELS.map((level) => `${level.name} : ${level.summary}`),
    ],
  },
  {
    term: 'Legacy',
    keywords: ['legacy'],
    lines: [
      'Un parcours Legacy se compose de modules, comme des cours, avec des seuils à atteindre.',
      'Seule l’Administration ouvre un parcours.',
    ],
  },
  {
    term: 'Academy',
    keywords: ['academy', 'academie'],
    lines: ['L’Academy forme les Juniors : chacun suit une session avec un formateur.'],
  },
  {
    term: 'Junior',
    keywords: ['junior', 'juniors'],
    lines: ['Un Junior est un modérateur en formation, accompagné par un formateur.'],
  },
  {
    term: 'Marsha',
    keywords: ['marsha'],
    lines: ['Marsha est l’équipe de modération des créateurs, et ce dashboard est le sien.'],
  },
  {
    term: 'Déban',
    keywords: ['deban', 'debannissement'],
    lines: ['Un déban est la demande d’un viewer pour lever son bannissement.'],
  },
  {
    term: 'Mod View',
    keywords: ['modview', 'view'],
    lines: ['La Mod View est l’espace de travail d’un modérateur pendant un live.'],
  },
]
