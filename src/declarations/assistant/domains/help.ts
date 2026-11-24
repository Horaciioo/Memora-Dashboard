import { defineDomain } from '@/declarations/assistant/domains/types'
import { GLOSSARY } from '@/declarations/assistant/help/glossary'

// A question outranks the action words it quotes
const QUESTION_BOOST = 40

/**
 * Help
 * @type {DomainDef}
 */

export const HELP = defineDomain({
  label: 'Aide',
  summary: 'Je te dis ce que je sais faire, où se trouve une page et ce que veut dire un mot.',
  intents: {
    capabilities: {
      label: 'Savoir ce que Memora sait faire',
      kind: 'help',
      nouns: ['aide', 'capacites', 'fonctionnalites'],
      phrases: ['sais faire', 'peux faire', 'a quoi tu sers', 'tu sers a quoi'],
      needs: 'noun',
      boost: QUESTION_BOOST,
      examples: ['Qu’est-ce que tu sais faire', 'À quoi tu sers'],
    },
    howTo: {
      label: 'Comprendre comment faire quelque chose',
      kind: 'help',
      phrases: [
        'comment faire',
        'comment je',
        'comment on',
        'comment puis je',
        'comment ca marche',
        'a quoi sert',
        'ca sert a quoi',
      ],
      needs: 'noun',
      boost: QUESTION_BOOST,
      examples: ['Comment je pose une absence', 'À quoi sert le calendrier'],
    },
    define: {
      label: 'Comprendre un mot de l’équipe',
      kind: 'help',
      verbs: ['quoi', 'qu', 'signifie', 'definition', 'explique', 'expliquer'],
      nouns: GLOSSARY.flatMap((entry) => entry.keywords),
      needs: 'both',
      examples: ['C’est quoi le Livecon', 'Explique-moi Legacy'],
    },
    whyNot: {
      label: 'Comprendre pourquoi une page est fermée',
      kind: 'help',
      phrases: [
        'pourquoi je ne vois pas',
        'pourquoi je ne peux pas',
        'pourquoi je n ai pas acces',
        'je n ai pas acces',
        'je ne vois pas la page',
        'pourquoi pas acces',
      ],
      needs: 'noun',
      boost: QUESTION_BOOST,
      examples: ['Pourquoi je ne vois pas le calendrier', 'Je n’ai pas accès aux lives'],
    },
    whatsNew: {
      label: 'Savoir ce qui a changé',
      kind: 'help',
      phrases: ['quoi de neuf', 'quoi de nouveau', 'ce qui a change', 'derniere version'],
      needs: 'noun',
      boost: QUESTION_BOOST,
      examples: ['Quoi de neuf', 'Qu’est-ce qui a changé'],
    },
    whereIs: {
      label: 'Trouver où se trouve une page',
      kind: 'help',
      phrases: [
        'ou se trouve',
        'ou est',
        'ou sont',
        'ou trouver',
        'ou je trouve',
        'ou puis je trouver',
      ],
      needs: 'noun',
      boost: QUESTION_BOOST,
      examples: ['Où se trouve le calendrier', 'Où je trouve mes notes'],
    },
  },
})
