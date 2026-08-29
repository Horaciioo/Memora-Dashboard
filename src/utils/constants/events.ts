import { createEnumeration } from '@/core/lib/enumeration'

/**
 * Loggable event enumeration
 * @type {Enumeration<EnumerationSource>}
 */

export const EVENT_TYPES = createEnumeration({
  SessionOpened: { id: 0, label: 'Connexion' },
  SessionClosed: { id: 1, label: 'Déconnexion' },
  MemberCreated: { id: 2, label: 'Modérateur ajouté' },
  MemberUpdated: { id: 3, label: 'Modérateur modifié' },
  MemberDeleted: { id: 4, label: 'Modérateur retiré' },
  DivisionChanged: { id: 5, label: 'Division changée' },
  FunctionChanged: { id: 6, label: 'Fonction changée' },
  NoteAdded: { id: 7, label: 'Note privée ajoutée' },
  PimHeld: { id: 8, label: 'PIM tenue', deprecated: true },
  ProjectCreated: { id: 9, label: 'Projet créé' },
  ProjectUpdated: { id: 10, label: 'Projet modifié' },
  ProjectDeleted: { id: 11, label: 'Projet supprimé' },
  CommunicationPublished: { id: 12, label: 'Communication publiée' },
  TaskCreated: { id: 13, label: 'Tâche créée' },
  TaskUpdated: { id: 14, label: 'Tâche modifiée' },
  TaskDeleted: { id: 15, label: 'Tâche supprimée' },
  MeetingScheduled: { id: 16, label: 'Réunion planifiée' },
  MeetingUpdated: { id: 17, label: 'Réunion modifiée' },
  MeetingDeleted: { id: 18, label: 'Réunion supprimée' },
  AbsenceRequested: { id: 19, label: 'Absence posée' },
  AbsenceReviewed: { id: 20, label: 'Absence traitée' },
  LiveconChanged: { id: 21, label: 'Livecon changé' },
  TrainingValidated: { id: 22, label: 'Formation validée' },
  AcademyAdvanced: { id: 23, label: 'Période franchie' },
  ReferenceChanged: { id: 24, label: 'Configuration modifiée' },
  PermissionChanged: { id: 25, label: 'Permission modifiée' },
  SkillUpdated: { id: 26, label: 'Compétence évaluée' },
  ReviewValidated: { id: 27, label: 'Bilan validé' },
  StepValidated: { id: 28, label: 'Étape de PIM franchie' },
  JuniorEnrolled: { id: 29, label: 'Junior admis' },
  SanctionChanged: { id: 30, label: 'Sanction modifiée' },
  RecruitmentOpened: { id: 31, label: 'Recrutement ouvert' },
  RecruitmentDecided: { id: 32, label: 'Candidature tranchée' },
})

export type EventTypeName = keyof typeof EVENT_TYPES.ids
export type EventTypeId = (typeof EVENT_TYPES.ids)[EventTypeName]

/**
 * Event origin enumeration
 * @type {Enumeration<EnumerationSource>}
 */

export const EVENT_ORIGINS = createEnumeration({
  User: { id: 0, label: 'Utilisateur' },
  System: { id: 1, label: 'Système' },
  Automation: { id: 2, label: 'Automatisation' },
  Scheduler: { id: 3, label: 'Planificateur' },
})

export type EventOriginName = keyof typeof EVENT_ORIGINS.ids
export type EventOriginId = (typeof EVENT_ORIGINS.ids)[EventOriginName]
