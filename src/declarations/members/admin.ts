/**
 * Copy of the Admin tab of a moderator file
 * @type {Record<string, string>}
 */

export const MEMBER_ADMIN_COPY = {
  tab: 'Admin',
  lead: 'Des gestes lourds : ils s’appliquent tout de suite, sur la base.',
  sectionRole: 'Rôle',
  sectionState: 'État',
  sectionDeparture: 'Actions de départ',
  sectionMemora: 'Actions sur Memora',
  // Freeze
  freezeAction: 'Geler',
  freezeConfirmTitle: 'Geler cet accès ?',
  freezeConfirmDescription:
    'Ses sessions se ferment à l’instant et il ne pourra plus se connecter jusqu’au dégel.',
  frozenDone: 'Accès gelé',
  unfreezeAction: 'Dégeler',
  unfrozenDone: 'Accès rétabli',
  // Departure
  departureLead:
    'Il quitte ses fonctions : son accès est coupé, ce qu’il avait renseigné (réseaux, contraintes, anniversaire) est effacé, un message de départ est rédigé.',
  dismissAction: 'Dérank',
  dismissConfirmTitle: 'Dérank ce modérateur ?',
  dismissConfirmDescription:
    'Il perd ses fonctions sur le champ. Son accès est coupé et ce qu’il avait renseigné (réseaux, contraintes, anniversaire) est effacé pour de bon.',
  resignAction: 'Démissionnaire',
  resignConfirmTitle: 'Enregistrer sa démission ?',
  resignConfirmDescription:
    'Il quitte ses fonctions sur le champ. Son accès est coupé et ce qu’il avait renseigné (réseaux, contraintes, anniversaire) est effacé pour de bon.',
  departedDone: 'Départ enregistré',
  showMessage: 'Afficher le message de départ',
  messageTitle: 'Message de départ',
  messageLead: 'Aperçu tel qu’il apparaîtra sur Discord.',
  messageCopy: 'Copier le message',
  messageCopied: 'Message copié',
  messageAuthor: 'Memora',
  gone: 'Ce modérateur a déjà quitté ses fonctions.',
  // Sanctions
  stateNoSanction: ['Aucune sanction ', 'émise', '.'],
  stateSuspended: ['Suspendu des lives ', 'jusqu’au {date}', '.'],
  stateAccessOpen: ['Dispose de ', 'tous ses accès', '.'],
  stateAccessFrozen: ['Accès ', 'gelés', ' depuis le {date}.'],
  stateGone: ['A ', 'quitté ses fonctions', '.'],
  // Light notes under the gestures
  dismissNote: 'Retire ses fonctions.',
  resignNote: 'Départ à sa demande.',
  freezeNote: 'Coupe sa connexion, fiche intacte.',
  unfreezeNote: 'Rétablit sa connexion.',
  deleteNote: "Efface la fiche de {nameMemora}. Attention, il s'agit d'une action irréversible.",
  sanctionAction: 'Opérer à une sanction',
  sanctionDrawerTitle: 'Opérer une sanction',
  sanctionDrawerLead: 'Choisis le type de sanction et sa raison.',
  sanctionType: 'Type',
  sanctionTemporary: 'Suspension temporaire',
  sanctionPermanent: 'Suspension définitive',
  sanctionSubmit: 'Émettre la sanction',
  sanctionCancel: 'Annuler la sanction',
  permanentLead: 'Elle équivaut à un dérank immédiat.',
  temporaryLead: 'Il ne peut plus ouvrir la Mod View ni modérer un live avant la date choisie.',
  suspendTitle: 'Suspension temporaire',
  suspendUntil: 'Jusqu’au',
  suspendReason: 'Raison',
  suspendedDone: 'Suspension posée',
  liftAction: 'Lever la suspension',
  liftedDone: 'Suspension levée',
  suspendedNotice: 'Ta modération des lives est suspendue jusqu’au {date}.',
  // Delete
  deleteLead: 'La fiche et tout ce qui lui est rattaché sont effacés pour de bon.',
  deleteAction: 'Supprimer',
  deletedDone: 'Fiche supprimée',
  // Shared
  reasonPlaceholder: 'Facultatif, visible des seuls responsables.',
  untilRequired: 'Choisis une date de fin.',
} as const
