import { createRegistry } from '@/core/lib/registry'
import type { Tone } from '@/declarations/ui/theme'
import type { EventTypeName } from '@/utils/constants/events'

/**
 * How one journal event reads on screen
 * @typedef {Object} ActivityEventOption
 * @property {string} label - Tag drawn before the moment
 * @property {Tone} tone - Colour of the tag
 * @property {string} verb - Past participle, emphasised in the sentence
 * @property {string} target - What the event landed on, its determiner included
 */

interface ActivityEventOption {
  label: string
  tone: Tone
  verb: string
  target: string
}

/*
 * Colour carries the nature of the act — green for what joined the corp, red for what left
 * it, blue for a plain edit, amber for anything touching rights or moderation.
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
}

export const ACTIVITY_EVENT_REGISTRY = createRegistry(ACTIVITY_EVENT_MAP)
