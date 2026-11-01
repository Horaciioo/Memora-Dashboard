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
  StepValidated: { id: 28, label: 'Étape de PIM franchie', deprecated: true },
  JuniorEnrolled: { id: 29, label: 'Junior admis' },
  SanctionChanged: { id: 30, label: 'Sanction modifiée' },
  RecruitmentOpened: { id: 31, label: 'Recrutement ouvert' },
  RecruitmentDecided: { id: 32, label: 'Candidature tranchée' },
  SecurityChanged: { id: 33, label: 'Sécurité modifiée' },
  LeadsAnchored: { id: 34, label: 'Administration' },
  ConsentAccepted: { id: 35, label: 'Accord accepté' },
  LegacyChanged: { id: 36, label: 'Parcours Legacy modifié' },
  LiveAnnounced: { id: 37, label: 'Live annoncé' },
  LiveMoved: { id: 38, label: 'Live changé de statut' },
  LiveDeleted: { id: 81, label: 'Live supprimé' },
  PlatformLinked: { id: 39, label: 'Compte de plateforme lié' },
  ModerationActed: { id: 40, label: 'Action de Mod.' },
  LiveRosterMoved: { id: 41, label: 'Appel d’un live corrigé' },
  ParkourMoved: { id: 42, label: 'Parcours PIM' },
  LiveFocused: { id: 43, label: 'Focus sur un modérateur' },
  MemberFrozen: { id: 44, label: 'Accès gelé' },
  MemberThawed: { id: 45, label: 'Accès rétabli' },
  MemberDeparted: { id: 46, label: 'Départ enregistré' },
  LiveSuspended: { id: 47, label: 'Lives suspendus' },
  LiveSuspensionLifted: { id: 48, label: 'Suspension levée' },
  ErrorRaised: { id: 49, label: 'Erreur rencontrée' },
  AbsenceEdited: { id: 50, label: 'Absence modifiée' },
  RecruitmentEdited: { id: 51, label: 'Recrutement modifié' },
  CandidateAdded: { id: 52, label: 'Candidat ajouté' },
  CandidateEdited: { id: 53, label: 'Candidat modifié' },
  CandidateRemoved: { id: 54, label: 'Candidat retiré' },
  RecruitmentStepMoved: { id: 55, label: 'Étape de recrutement' },
  InterviewPrepared: { id: 56, label: 'Questionnaire préparé' },
  InterviewNoted: { id: 57, label: 'Entretien noté' },
  AcademyEdited: { id: 58, label: 'Promotion modifiée' },
  AcademyLaunched: { id: 59, label: 'PIM lancée' },
  JuniorRemoved: { id: 60, label: 'Junior retiré' },
  LoginFailed: { id: 61, label: 'Connexion refusée' },
  AccessDenied: { id: 62, label: 'Accès refusé' },
  RateLimited: { id: 63, label: 'Rythme limité' },
  DataExported: { id: 64, label: 'Données exportées' },
  JobFailed: { id: 65, label: 'Tâche de fond échouée' },
  JobRetried: { id: 66, label: 'Tâche de fond relancée' },
  LiveCoordinatorsChanged: { id: 67, label: 'Coordinateurs d’un live changés' },
  LiveReinforced: { id: 68, label: 'Renfort appelé sur un live' },
  PlayJoined: { id: 69, label: 'Partie Play rejointe' },
  PlayLeft: { id: 70, label: 'Partie Play quittée' },
  PlayKicked: { id: 71, label: 'Retiré d’une partie Play' },
  PlayFinished: { id: 72, label: 'Partie Play terminée' },
  PlayAdjusted: { id: 73, label: 'Progression Play modifiée' },
  InterviewStarted: { id: 74, label: 'Entretien commencé' },
  VerdictGiven: { id: 75, label: 'Avis rendu' },
  QuestionCommented: { id: 76, label: 'Question commentée' },
  RegisterSwitched: { id: 77, label: 'Registre changé' },
  RecruitmentBanned: { id: 78, label: 'Identifiant blacklisté' },
  RecruitmentUnbanned: { id: 79, label: 'Blacklist levée' },
  RecruitmentClosed: { id: 80, label: 'Recrutement clôturé' },
  PageCreated: { id: 82, label: 'Page privée créée' },
  PageShared: { id: 83, label: 'Page partagée' },
  PageUnshared: { id: 84, label: 'Partage de page retiré' },
  PageTrashed: { id: 85, label: 'Page mise à la corbeille' },
  PageRestored: { id: 86, label: 'Page restaurée' },
  PagePurged: { id: 87, label: 'Page supprimée définitivement' },
  PageMoved: { id: 88, label: 'Page déplacée' },
  PageInheritanceChanged: { id: 89, label: 'Héritage des accès changé' },
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

/**
 * Journal severity enumeration
 * @type {Enumeration<EnumerationSource>}
 */

export const LOG_LEVELS = createEnumeration({
  Info: { id: 0, label: 'Information' },
  Warning: { id: 1, label: 'Alerte' },
  Error: { id: 2, label: 'Erreur' },
})

export type LogLevelName = keyof typeof LOG_LEVELS.ids

/**
 * Severity of events above info
 * @type {Partial<Record<EventTypeName, LogLevelName>>}
 */

export const EVENT_LEVELS: Partial<Record<EventTypeName, LogLevelName>> = {
  ErrorRaised: 'Error',
  JobFailed: 'Error',
  LoginFailed: 'Warning',
  AccessDenied: 'Warning',
  RateLimited: 'Warning',
}
