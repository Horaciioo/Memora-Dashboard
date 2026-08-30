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
})

export type NotificationKindName = keyof typeof NOTIFICATION_KINDS.ids
export type NotificationKindId = (typeof NOTIFICATION_KINDS.ids)[NotificationKindName]
