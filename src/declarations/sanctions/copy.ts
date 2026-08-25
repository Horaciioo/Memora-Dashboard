/**
 * Copy of the moderation panel
 * @type {Record<string, string | string[]>}
 */

export const SANCTION_COPY = {
  title: 'Panel de sanctions',
  lead: 'Le niveau de livecon en cours choisit le barème appliqué. Plus le chiffre est bas, plus la sanction est dure.',
  moreInfo: 'En savoir plus…',
  aboutTitle: 'Comprendre le livecon',
  aboutLead:
    'Le livecon fixe la tension du moment. Chaque niveau ouvre son propre barème de sanctions.',
  currentBadge: 'En cours',
  panel: 'Panel',
  change: 'Changer le niveau',
  changeTitle: 'Changer le niveau de livecon',
  noGuidelines: 'Aucune consigne écrite pour ce niveau.',
  creator: 'Créateur',
  descriptionTitle: 'Description',
  exampleTitle: 'Exemple',
  ladderTitle: 'Barème',
  warningTitle: 'Exemple de raison',
  stepColumn: 'Palier',
  measureColumn: 'Sanction',
  noLadder: 'Aucun palier défini pour ce panel.',
  edit: 'Modifier',
  copy: 'Copier la raison',
  copied: 'Raison copiée',
  historyTitle: 'Historique du livecon',
  historyEmptyTitle: 'Aucun changement',
  historyEmptyDescription: 'Le premier basculement de niveau apparaîtra ici.',
  emptyTitle: 'Aucun panel pour ce créateur',
  emptyDescription: 'Génère le panel modèle pour commencer, puis ajuste-le.',
  generate: 'Générer le panel',
  levelsEmptyTitle: 'Aucun niveau de livecon',
  levelsEmptyDescription: 'Déclare les niveaux avant de bâtir un panel de sanctions.',
  configure: 'Ouvrir la configuration',
  creatorsEmptyTitle: 'Aucun créateur',
  creatorsEmptyDescription: 'Un panel de sanctions appartient à un créateur.',
} as const

/**
 * Labels of the ladder steps, the first one covering what is punished on sight
 * @type {readonly string[]}
 */

export const SANCTION_STEPS: readonly string[] = [
  'Dès constaté',
  '1ʳᵉ fois',
  '2ᵉ fois',
  '3ᵉ fois',
  '4ᵉ fois',
  '5ᵉ fois',
]

/**
 * Read the label of one ladder step
 * @param {number} step - Zero-based rung
 * @return {string} - Step label
 */

export const stepLabel = (step: number): string =>
  SANCTION_STEPS[step] ?? `${step + 1}ᵉ fois`

/**
 * Copy of the sanction form fields
 * @type {Record<string, string>}
 */

export const SANCTION_FIELD_COPY = {
  name: 'Titre',
  summary: 'Description',
  example: 'Exemple',
  warningExample: 'Exemple de raison d’avertissement',
  accent: 'Couleur',
  archived: 'Archivée',
  measure: 'Sanction',
  note: 'Libellé du palier',
  kind: 'Nature',
  duration: 'Durée en minutes',
  permanent: 'Définitive',
  weight: 'Poids',
} as const
