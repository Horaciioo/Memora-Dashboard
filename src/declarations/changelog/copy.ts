/**
 * Release notes copy
 * @type {Record<string, string | ((value: string) => string)>}
 */

export const CHANGELOG_COPY = {
  pageTitle: 'Nouveautés',
  // Home notice
  noticeKicker: 'Nouvelle note de mise à jour',
  noticeCta: 'Lire la note',
  noticeDismiss: 'Masquer cette note',
  // Developer word
  commentLabel: 'Le mot de l’équipe : ',
  wholeApp: 'Tout Memora',
  archiveTitle: 'Notes précédentes',
  archiveButton: (month: string) => `Notes de ${month}`,
  archiveDialog: (month: string) => `Notes de mise à jour de ${month}`,
  archiveCurrent: 'Tu la lis',
  descriptionTitle: 'Description',
  versionLabel: (version: string) => `Version ${version}`,
  emptyTitle: 'Rien de neuf pour l’instant',
  emptyLead: 'Les prochaines nouveautés atterriront ici.',
  versionField: 'Version',
  unknownVersion: 'Cette note de mise à jour n’existe pas.',
  stageSnapshot: 'Snapshot',
  stageCandidate: 'Release Candidate',
} as const
