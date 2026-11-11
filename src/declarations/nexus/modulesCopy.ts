/**
 * Database module wording
 * @type {Record<string, string>}
 */

export const DB_COPY = {
  noId: 'Cette entité n’a pas de colonne id simple',
  readOnly: 'Entité en lecture seule',
  seeded: 'Collection de référence semée, ajoute --force-seeded en mode danger',
  serviceOwned: 'Cette entité passe par son service métier, pas par l’accès générique',
  badFilter: 'Filtre attendu : colonne,opérateur,valeur',
  badOperator: 'Opérateur parmi eq, ne, lt, gt, in, contains, null',
  badColumn: 'Colonne inconnue ou protégée',
  searchShort: 'Recherche trop courte',
  searchNone: 'Aucune colonne de recherche pour cette entité',
  rowMissing: 'Ligne introuvable',
  rowMoved: 'La ligne a changé depuis l’aperçu, relance la commande',
  nothingToSet: 'Aucune colonne à modifier',
  hasDependents: 'Suppression refusée, des lignes dépendent de celle-ci',
  notMigratable: 'Migration d’identifiant non déclarée pour cette entité',
  idTaken: 'Le nouvel identifiant existe déjà',
  idSame: 'Le nouvel identifiant est identique',
  auditMissing: 'Ligne d’audit introuvable',
  notReversible: 'Cette ligne d’audit ne peut pas être annulée',
  alreadyReverted: 'Cette ligne d’audit est déjà annulée',
  stateMoved: 'L’état actuel ne correspond plus à l’après de l’audit',
  masked: 'Des colonnes protégées empêchent la restauration',
} as const

/**
 * System module wording
 * @type {Record<string, string>}
 */

export const SYSTEM_COPY = {
  unknownCategory: 'Catégorie de configuration introuvable',
  notEditable: 'Cette catégorie ne se modifie pas depuis Nexus',
  unknownKey: 'Clé absente du fichier',
  wrongType: 'Type de valeur différent de celui du fichier',
  outOfBounds: 'Valeur hors des bornes du lecteur',
  restartRequired: 'Prise en compte au prochain démarrage',
  noOverride: 'Aucune surcouche à retirer',
  unknownService: 'Service introuvable',
  notRestartable: 'Ce service ne se redémarre pas depuis Nexus',
  unknownQueue: 'File introuvable',
  unknownCache: 'Cache introuvable',
  unknownFeature: 'Fonctionnalité introuvable',
  maintenanceOn: 'Maintenance activée',
  maintenanceOff: 'Maintenance désactivée',
} as const
