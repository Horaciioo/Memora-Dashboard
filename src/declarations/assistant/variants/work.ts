/**
 * Words Memora uses to tell meetings, projects, announcements and requests
 * @type {Record<string, string>}
 */

export const WORK_COPY = {
  noMeeting: 'Tu n’as aucune réunion à venir.',
  nextMeeting: 'Ta prochaine réunion est « {title} », {when}.',
  noLateProject: 'Aucun projet n’est en retard.',
  lateProjects: '{count} projets sont en retard.',
  lateProjectOne: 'Un projet est en retard.',
  lateProject: '« {title} » devait être fini {when}.',
  projectState: '« {title} » est {state}.',
  projectStateNone: '« {title} » n’a pas encore d’état.',
  projectLeads: 'Il est mené par {names}.',
  projectLoad: 'Il compte {tasks} tâches et {meetings} réunions.',
  projectDeadline: 'Sa date limite est {when}.',
  projectLate: 'Sa date limite est dépassée : {when}.',
  noProject: 'Je ne sais pas de quel projet tu parles, dis-m’en le nom.',
  noAnnouncement: 'Aucune annonce cette semaine.',
  announcements: '{count} annonces cette semaine.',
  announcementOne: 'Une annonce cette semaine.',
  announcement: '« {title} », {origin}.',
  noPendingAbsence: 'Aucune absence n’attend ton avis.',
  pendingAbsences: '{count} absences attendent ton avis : {names}.',
  pendingAbsenceOne: 'Une absence attend ton avis : {names}.',
  noPendingUnban: 'Aucune demande de déban n’attend personne.',
  pendingUnban: '{count} demandes de déban attendent quelqu’un.',
  pendingUnbanMore: 'Plus de {count} demandes de déban attendent quelqu’un.',
  pendingUnbanOne: 'Une demande de déban attend quelqu’un.',
  unbanLine: '« {name} » demande à être débanni sur {creator}.',
  namesJoin: ', ',
  openProjects: 'Les projets',
  openAnnouncements: 'Les annonces',
  openAbsences: 'Les absences',
  openUnban: 'Le débannissement',
  openMeetings: 'Les réunions',
  approveAll: 'Valide les absences en attente',
} as const
