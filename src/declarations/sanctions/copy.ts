/**
 * Copy of the moderation board
 * @type {Record<string, string>}
 */

export const SANCTION_COPY = {
  title: 'Panel de sanctions',
  lead: "Le livecon en vigueur influe sur le panel. Les sanctions affichées sont celles qui s’appliquent à ce livecon. Attention, le panel de sanctions n'est qu'une référence, il ne remplace pas ton jugement humain.",
  panelTitle: 'Panel {panel}',
  search: 'Chercher une infraction',
  opening: 'Ouverture de la fiche…',
  searchEmpty: 'Aucune infraction ne correspond à ta recherche.',
  onSight: 'Dès constaté',
  steps: '{count} paliers',
  descriptionTitle: 'Description',
  moderateTitle: 'À modérer',
  tolerateTitle: 'À laisser passer',
  ladderTitle: 'Barème au {level}',
  warningTitle: 'Raison de sanction suggérée',
  copy: 'Copier',
  copied: 'Copié dans le presse-papier',
  commandTitle: 'Commande',
  howTitle: 'À la main',
  noLadder: 'Aucun palier à ce niveau : on n’intervient pas.',
  saveLadder: 'Enregistrer le barème',
  cancel: 'Annuler',
  addRung: 'Ajouter un palier',
  removeRung: 'Retirer ce palier',
  conditionPlaceholder: 'Dès constaté, Si récidive…',
  gravity: 'Gravité à ce niveau',
  measures: 'Mesures appliquées',
  ladderSaved: 'Barème enregistré',
  offenseSaved: 'Fiche enregistrée',
  generate: 'Générer le panel de référence',
  generated: 'Panel généré',
  offenseCreated: 'Infraction ajoutée',
  offenseRemoved: 'Infraction supprimée',
  newOffense: 'Nouvelle infraction',
  newExample: 'Ajouter un exemple',
  descriptionEmpty: 'Ajouter une description',
  warningEmpty: 'Ajouter une raison de sanction suggérée',
  open: 'Ouvrir',
  rename: 'Renommer',
  remove: 'Supprimer',
  removeTitle: 'Souhaites-tu supprimer cette infraction ?',
  removeDescription: 'La fiche disparaît de ce panel, avec ses barèmes à chaque livecon.',
  ladderEmpty: 'Définir le barème',
  changeGravity: 'Changer la gravité',
  emptyTitle: 'Aucun panel pour ce créateur',
  emptyDescription: 'Génère le panel de référence, puis ajuste-le à ce créateur.',
  unwrittenTitle: 'Panel {panel} en cours d’écriture',
  unwrittenDescription:
    'Les règles de cette surface ne sont pas encore rédigées. En attendant, applique le bon sens du panel Twitch et remonte chaque cas limite à ton Responsable.',
  marshaLink: 'Voir les commandes de Marsha Bot',
  creatorsEmptyTitle: 'Aucun créateur',
  creatorsEmptyDescription: 'Un panel de sanctions appartient à un créateur.',
  levelsEmptyTitle: 'Aucun niveau de livecon',
  levelsEmptyDescription:
    'Les trois niveaux sont fixés en code, ils arrivent au prochain déploiement.',
  noFunctionTitle: 'Aucun panel pour ta fonction',
  noFunctionDescription: 'Les panels couvrent les fonctions Lives et Discord.',
} as const

/**
 * Copy of the sanction form fields
 * @type {Record<string, string>}
 */

export const SANCTION_FIELD_COPY = {
  name: 'Titre',
  summary: 'Description',
  example: 'Exemples à modérer',
  toleratedExample: 'Exemples à laisser passer',
  linesHint: 'Un exemple par ligne.',
  warningExample: 'Raison de sanction suggérée',
  accent: 'Couleur',
  archived: 'Archivée',
  measure: 'Sanction',
  note: 'Condition',
  kind: 'Nature',
  duration: 'Durée en minutes',
  permanent: 'Définitive',
  weight: 'Poids',
} as const
