/**
 * Copy of the team surfaces
 * @type {Record<string, string>}
 */

export const TEAM_COPY = {
  title: 'Fonctions',
  lead: 'Toutes les fonctions sont ouvertes pour le créateur. Un modérateur rejoint celle qu’il tient, depuis sa fiche.',
  saved: 'Fonctions enregistrées.',
  enabled: 'Fonctions ouvertes',
  enabledEmpty: 'Aucune fonction ouverte',
  closeRootOnly:
    'Seul l’administrateur principal peut fermer une fonction, et seulement à titre exceptionnel.',
  closeWarningTitle: 'Fermer cette fonction ?',
  closeWarningDescription:
    'Ses membres quittent l’équipe du créateur et les recrutements ne peuvent plus la viser. À ne faire qu’à titre exceptionnel.',
  primary: 'Fonctions principales',
  secondary: 'Fonctions secondaires',
  memberTeams: 'Fonctions du modérateur',
  noTeam: 'Aucune fonction',
  noMembers: 'Aucun modérateur rattaché',
  noMembersHint: 'Rattache un modérateur à ce YouTubeur depuis sa fiche.',
  noFunctions: 'Ouvre une fonction pour voir qui la tient.',
} as const
