import { createEnumeration } from '@/core/lib/enumeration'

/**
 * Personal notification enumeration
 * @type {Enumeration<EnumerationSource>}
 */

export const NOTIFICATION_KINDS = createEnumeration({
  Mentioned: { id: 0, label: 'Mention' },
  TaskAssigned: { id: 1, label: 'Tâche confiée' },
  MeetingInvited: { id: 2, label: 'Réunion' },
  ProjectAssigned: { id: 3, label: 'Projet' },
  TeamAssigned: { id: 4, label: 'Équipe' },
  AbsenceReviewed: { id: 5, label: 'Absence traitée' },
  AccessChanged: { id: 6, label: 'Accès modifiés' },
  CommunicationPublished: { id: 7, label: 'Annonce' },
  SkillGraded: { id: 8, label: 'Compétence évaluée' },
  ReviewDecided: { id: 9, label: 'Bilan tranché' },
  StepValidated: { id: 10, label: 'Étape validée' },
  TrainingValidated: { id: 11, label: 'Formation validée' },
  CandidateAssigned: { id: 12, label: 'Candidature confiée' },
  RecruitmentAssigned: { id: 13, label: 'Recrutement confié' },
  AttendanceRequested: { id: 14, label: 'Appel de présence' },
  TrainingFinished: { id: 15, label: 'Formation terminée' },
  LegacyOpened: { id: 16, label: 'Parcours Legacy ouvert' },
  LegacyDecided: { id: 17, label: 'Parcours Legacy tranché' },
  AbsenceAcknowledged: { id: 18, label: 'Absence prise en compte' },
  LiveAnnounced: { id: 19, label: 'Live annoncé' },
  LiveStarted: { id: 20, label: 'Live lancé' },
  LiveCancelled: { id: 21, label: 'Live annulé' },
  LiveReportReady: { id: 22, label: 'Bilan de live prêt' },
  PimReviewDue: { id: 23, label: 'Bilan de PIM à faire' },
  PimReviewSubmitted: { id: 24, label: 'Bilan de PIM déposé' },
  PimLaunched: { id: 25, label: 'PIM lancée' },
  PimSecondPeriod: { id: 26, label: 'Période 2 lancée' },
  PimDeparture: { id: 27, label: 'Départ à annoncer' },
  LiveCoordinatorAsked: { id: 28, label: 'Coordination demandée' },
  LiveCoordinatorAccepted: { id: 29, label: 'Coordination acceptée' },
  LiveCoordinatorDeclined: { id: 30, label: 'Coordination refusée' },
  LiveCoordinatorGap: { id: 31, label: 'Coordinateur manquant' },
})

export type NotificationKindName = keyof typeof NOTIFICATION_KINDS.ids
export type NotificationKindId = (typeof NOTIFICATION_KINDS.ids)[NotificationKindName]
