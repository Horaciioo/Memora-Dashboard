import { createRegistry } from '@/core/lib/registry'

/**
 * One entry of the academy lexicon
 * @typedef {Object} GlossaryEntry
 * @property {string} label - Term being defined
 * @property {string} definition - What the term means
 */

interface GlossaryEntry {
  label: string
  definition: string
}

const GLOSSARY_MAP = {
  session: {
    label: 'Session',
    definition: 'Promotion regroupant plusieurs Juniors intégrés en même temps.',
  },
  pim: {
    label: 'PIM',
    definition: 'Parcours individuel d’un Junior au sein d’une session.',
  },
  fsi: {
    label: 'FSI',
    definition:
      'Fiche de Suivi Individualisée d’un Junior : ses informations, ses notes, ses objectifs, ses bilans et ses compétences.',
  },
  junior: {
    label: 'Junior',
    definition: 'Modérateur en période d’intégration, rattaché à une session.',
  },
  trainer: {
    label: 'Formateur référent',
    definition:
      'Formateur responsable du suivi principal d’un Junior. Il rédige les bilans de ses étapes.',
  },
  lead: {
    label: 'Responsable',
    definition: 'Encadrant qui évalue les bilans et tranche le passage d’une étape à la suivante.',
  },
  dispositif: {
    label: 'Dispositif',
    definition:
      'Voie d’intégration suivie par un Junior, qui détermine les compétences attendues de lui.',
  },
  atria: {
    label: 'ATRIA',
    definition:
      'Dispositif destiné à qui découvre sa fonction : apprendre, observer, vérifier que la fonction lui plaît.',
  },
  pulse: {
    label: 'PULSE',
    definition:
      'Dispositif destiné à qui possède déjà les bases : s’adapter aux méthodes Marsha et monter vite en compétence.',
  },
  skill: {
    label: 'Compétence',
    definition:
      'Savoir attendu d’un Junior, dépendant de sa fonction et de son dispositif, suivi en pourcentage.',
  },
  review: {
    label: 'Bilan',
    definition:
      'Compte-rendu d’étape rédigé par le Formateur après un point vocal, puis évalué par un Responsable.',
  },
  objective: {
    label: 'Objectif',
    definition:
      'Cible fixée à un Junior à partir de sa deuxième étape, ouverte puis atteinte ou manquée.',
  },
  bonus: {
    label: 'Période bonus',
    definition:
      'Rallonge facultative accordée par décision commune du Responsable et du Formateur, bornée en lives supplémentaires.',
  },
} satisfies Record<string, GlossaryEntry>

/**
 * Academy lexicon, the words the domain is written in
 * @type {Registry<string, GlossaryEntry>}
 */

export const GLOSSARY_REGISTRY = createRegistry(GLOSSARY_MAP)
