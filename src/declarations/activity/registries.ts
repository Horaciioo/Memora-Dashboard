import { createRegistry } from '@/core/lib/registry'
import type { IconName } from '@/declarations/ui/icons'
import type { Tone } from '@/declarations/ui/theme'
import type { EventTypeName } from '@/utils/constants/events'

/**
 * How one journal event reads on screen
 * @typedef {Object} ActivityEventOption
 * @property {string} label - Tag drawn before the moment
 * @property {Tone} tone - Colour of the tag
 * @property {string} verb - Past participle
 * @property {string} target - What the event landed on
 */

interface ActivityEventOption {
  label: string
  tone: Tone
  verb: string
  target: string
}

/*
 * Colour carries the nature of the act — green for what joined the corp
 */

const ACTIVITY_EVENT_MAP: Record<EventTypeName, ActivityEventOption> = {
  SessionOpened: { label: 'Connexion', tone: 'neutral', verb: 'ouvert', target: 'une session' },
  SessionClosed: { label: 'Déconnexion', tone: 'neutral', verb: 'fermé', target: 'sa session' },
  MemberCreated: { label: 'Ajout', tone: 'success', verb: 'ajouté', target: 'ce modérateur' },
  MemberUpdated: {
    label: 'Modification',
    tone: 'info',
    verb: 'modifié',
    target: 'ce modérateur',
  },
  MemberDeleted: { label: 'Retrait', tone: 'danger', verb: 'retiré', target: 'ce modérateur' },
  DivisionChanged: { label: 'Division', tone: 'info', verb: 'changé', target: 'la division' },
  FunctionChanged: { label: 'Fonction', tone: 'info', verb: 'changé', target: 'la fonction' },
  NoteAdded: { label: 'Ajout', tone: 'success', verb: 'ajouté', target: 'une note privée' },
  PimHeld: { label: 'PIM', tone: 'neutral', verb: 'tenu', target: 'une PIM' },
  ProjectCreated: { label: 'Création', tone: 'success', verb: 'créé', target: 'ce projet' },
  ProjectUpdated: { label: 'Modification', tone: 'info', verb: 'modifié', target: 'ce projet' },
  ProjectDeleted: { label: 'Suppression', tone: 'danger', verb: 'supprimé', target: 'ce projet' },
  CommunicationPublished: {
    label: 'Publication',
    tone: 'success',
    verb: 'publié',
    target: 'une annonce',
  },
  TaskCreated: { label: 'Création', tone: 'success', verb: 'créé', target: 'cette tâche' },
  TaskUpdated: { label: 'Modification', tone: 'info', verb: 'modifié', target: 'cette tâche' },
  TaskDeleted: { label: 'Suppression', tone: 'danger', verb: 'supprimé', target: 'cette tâche' },
  MeetingScheduled: {
    label: 'Planification',
    tone: 'success',
    verb: 'planifié',
    target: 'cette réunion',
  },
  MeetingUpdated: {
    label: 'Modification',
    tone: 'info',
    verb: 'modifié',
    target: 'cette réunion',
  },
  MeetingDeleted: {
    label: 'Suppression',
    tone: 'danger',
    verb: 'supprimé',
    target: 'cette réunion',
  },
  AbsenceRequested: { label: 'Demande', tone: 'success', verb: 'posé', target: 'une absence' },
  AbsenceEdited: { label: 'Modification', tone: 'info', verb: 'modifié', target: 'une absence' },
  AbsenceReviewed: { label: 'Traitement', tone: 'info', verb: 'traité', target: 'une absence' },
  LiveconChanged: { label: 'Livecon', tone: 'warning', verb: 'changé', target: 'le Livecon' },
  TrainingValidated: {
    label: 'Validation',
    tone: 'success',
    verb: 'validé',
    target: 'une formation',
  },
  AcademyAdvanced: {
    label: 'Progression',
    tone: 'success',
    verb: 'franchi',
    target: 'une période',
  },
  ReferenceChanged: {
    label: 'Configuration',
    tone: 'info',
    verb: 'modifié',
    target: 'la configuration',
  },
  PermissionChanged: {
    label: 'Permission',
    tone: 'warning',
    verb: 'modifié',
    target: 'une permission',
  },
  SkillUpdated: { label: 'Évaluation', tone: 'info', verb: 'évalué', target: 'une compétence' },
  ReviewValidated: { label: 'Validation', tone: 'success', verb: 'validé', target: 'un bilan' },
  StepValidated: {
    label: 'Étape',
    tone: 'success',
    verb: 'franchi',
    target: 'une étape de PIM',
  },
  JuniorEnrolled: { label: 'Admission', tone: 'success', verb: 'admis', target: 'un junior' },
  SanctionChanged: { label: 'Sanction', tone: 'warning', verb: 'modifié', target: 'une sanction' },
  RecruitmentEdited: {
    label: 'Modification',
    tone: 'info',
    verb: 'modifié',
    target: 'cette session de recrutement',
  },
  CandidateAdded: { label: 'Ajout', tone: 'success', verb: 'ajouté', target: 'un candidat' },
  CandidateEdited: { label: 'Modification', tone: 'info', verb: 'modifié', target: 'un candidat' },
  CandidateRemoved: { label: 'Retrait', tone: 'danger', verb: 'retiré', target: 'un candidat' },
  RecruitmentStepMoved: {
    label: 'Timeline',
    tone: 'info',
    verb: 'mis à jour',
    target: 'une étape de recrutement',
  },
  InterviewPrepared: {
    label: 'Questionnaire',
    tone: 'info',
    verb: 'préparé',
    target: 'le questionnaire',
  },
  InterviewNoted: { label: 'Entretien', tone: 'info', verb: 'noté', target: 'un entretien' },
  InterviewStarted: { label: 'Entretien', tone: 'info', verb: 'commencé', target: 'un entretien' },
  VerdictGiven: { label: 'Avis', tone: 'info', verb: 'rendu', target: 'un avis' },
  QuestionCommented: {
    label: 'Commentaire',
    tone: 'info',
    verb: 'ajouté',
    target: 'une question',
  },
  RegisterSwitched: { label: 'Registre', tone: 'info', verb: 'changé', target: 'le registre' },
  RecruitmentClosed: {
    label: 'Clôture',
    tone: 'info',
    verb: 'clôturé',
    target: 'cette session de recrutement',
  },
  RecruitmentBanned: {
    label: 'Blacklist',
    tone: 'danger',
    verb: 'blacklisté',
    target: 'un identifiant',
  },
  RecruitmentUnbanned: {
    label: 'Blacklist',
    tone: 'success',
    verb: 'levé',
    target: 'une blacklist',
  },
  AcademyEdited: {
    label: 'Modification',
    tone: 'info',
    verb: 'modifié',
    target: 'cette promotion',
  },
  AcademyLaunched: { label: 'Lancement', tone: 'success', verb: 'lancé', target: 'la PIM' },
  JuniorRemoved: { label: 'Retrait', tone: 'danger', verb: 'retiré', target: 'un junior' },
  RecruitmentOpened: {
    label: 'Recrutement',
    tone: 'info',
    verb: 'ouvert',
    target: 'une session de recrutement',
  },
  RecruitmentDecided: {
    label: 'Candidature',
    tone: 'success',
    verb: 'tranché',
    target: 'une candidature',
  },
  SecurityChanged: {
    label: 'Sécurité',
    tone: 'info',
    verb: 'modifié',
    target: 'sa sécurité',
  },
  LeadsAnchored: {
    label: 'Ancrage',
    tone: 'info',
    verb: 'ancré',
    target: 'des responsables',
  },
  ConsentAccepted: { label: 'Accord', tone: 'success', verb: 'accepté', target: 'l’accord' },
  LegacyChanged: { label: 'Legacy', tone: 'brand', verb: 'modifié', target: 'un parcours Legacy' },
  LiveAnnounced: { label: 'Live', tone: 'danger', verb: 'annoncé', target: 'un live' },
  LiveMoved: { label: 'Live', tone: 'danger', verb: 'changé', target: 'le statut d’un live' },
  PlatformLinked: {
    label: 'Plateforme',
    tone: 'info',
    verb: 'lié',
    target: 'un compte de plateforme',
  },
  ModerationActed: {
    label: 'Mod View',
    tone: 'danger',
    verb: 'fait',
    target: 'une action de Mod.',
  },
  LiveRosterMoved: {
    label: 'Appel',
    tone: 'info',
    verb: 'a corrigé',
    target: 'l’appel d’un live',
  },
  LiveCoordinatorsChanged: {
    label: 'Live',
    tone: 'info',
    verb: 'a changé',
    target: 'les Coordinateurs d’un live',
  },
  LiveReinforced: {
    label: 'Live',
    tone: 'info',
    verb: 'a appelé',
    target: 'du renfort sur un live',
  },
  PlayJoined: { label: 'Play', tone: 'info', verb: 'a rejoint', target: 'une partie' },
  PlayLeft: { label: 'Play', tone: 'neutral', verb: 'a quitté', target: 'une partie' },
  PlayKicked: {
    label: 'Play',
    tone: 'warning',
    verb: 'a retiré',
    target: 'un joueur d’une partie',
  },
  PlayFinished: { label: 'Play', tone: 'success', verb: 'a terminé', target: 'une partie' },
  PlayAdjusted: { label: 'Play', tone: 'brand', verb: 'a modifié', target: 'une progression Play' },
  ParkourMoved: {
    label: 'PIM',
    tone: 'brand',
    verb: 'a fait avancer',
    target: 'un parcours de PIM',
  },
  LiveFocused: {
    label: 'Focus',
    tone: 'info',
    verb: 'a suivi',
    target: 'un modérateur en Focus',
  },
  MemberFrozen: { label: 'Gel', tone: 'danger', verb: 'gelé', target: 'cet accès' },
  MemberThawed: { label: 'Dégel', tone: 'success', verb: 'rétabli', target: 'cet accès' },
  MemberDeparted: { label: 'Départ', tone: 'danger', verb: 'enregistré', target: 'ce départ' },
  LiveSuspended: {
    label: 'Suspension',
    tone: 'danger',
    verb: 'suspendu',
    target: 'la modération des lives',
  },
  LiveSuspensionLifted: {
    label: 'Suspension',
    tone: 'success',
    verb: 'levé',
    target: 'la suspension des lives',
  },
  ErrorRaised: {
    label: 'Erreur',
    tone: 'danger',
    verb: 'rencontré',
    target: 'une erreur',
  },
  LoginFailed: { label: 'Connexion', tone: 'warning', verb: 'refusé', target: 'une connexion' },
  AccessDenied: { label: 'Accès', tone: 'warning', verb: 'refusé', target: 'un accès' },
  RateLimited: { label: 'Limite', tone: 'warning', verb: 'ralenti', target: 'des requêtes' },
  DataExported: {
    label: 'Export',
    tone: 'info',
    verb: 'exporté',
    target: 'ses données personnelles',
  },
  JobFailed: { label: 'Erreur', tone: 'danger', verb: 'échoué', target: 'une tâche de fond' },
  JobRetried: {
    label: 'Relance',
    tone: 'info',
    verb: 'relancé',
    target: 'les tâches de fond échouées',
  },
}

export const ACTIVITY_EVENT_REGISTRY = createRegistry(ACTIVITY_EVENT_MAP)

/**
 * Three-colour reading of an act
 * @type {Record<Tone, 'success' | 'danger' | 'info'>}
 */

export const ACTIVITY_KIND: Record<Tone, 'success' | 'danger' | 'info'> = {
  success: 'success',
  danger: 'danger',
  warning: 'danger',
  caution: 'danger',
  authorityAdmin: 'danger',
  authorityLead: 'danger',
  info: 'info',
  neutral: 'info',
  brand: 'info',
}

/**
 * Glyph per kind of act
 * @type {Record<'success' | 'danger' | 'info', IconName>}
 */

export const ACTIVITY_KIND_ICON: Record<'success' | 'danger' | 'info', IconName> = {
  success: 'add',
  danger: 'remove',
  info: 'info',
}
