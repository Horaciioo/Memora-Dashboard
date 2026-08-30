import { createRegistry } from '@/core/lib/registry'
import type { Tone } from '@/declarations/ui/theme'
import type { IconName } from '@/declarations/ui/icons'
import type { NotificationKindName } from '@/utils/constants/notifications'

/**
 * How one notification reads on screen
 * @typedef {Object} NotificationKindOption
 * @property {string} label - Tag drawn on the full listing
 * @property {Tone} tone - Colour of the tag and the glyph
 * @property {IconName} icon - Glyph drawn on the portrait
 * @property {string} lead - Words between the actor and the verb
 * @property {string} verb - Past participle, emphasised in the sentence
 * @property {string} trail - What the act landed on, its determiner included
 */

interface NotificationKindOption {
  label: string
  tone: Tone
  icon: IconName
  lead: string
  verb: string
  trail: string
}

/*
 * Every sentence reads "<actor> <lead> <verb> <trail>", the verb alone carrying the emphasis —
 * so a new kind is one line here, never a branch in a component.
 */

const NOTIFICATION_KIND_MAP: Record<NotificationKindName, NotificationKindOption> = {
  Mentioned: {
    label: 'Mention',
    tone: 'brand',
    icon: 'discord',
    lead: 't’a',
    verb: 'mentionné',
    trail: '',
  },
  TaskAssigned: {
    label: 'Tâche',
    tone: 'info',
    icon: 'tasks',
    lead: 't’a',
    verb: 'confié',
    trail: 'une tâche',
  },
  MeetingInvited: {
    label: 'Réunion',
    tone: 'info',
    icon: 'meetings',
    lead: 't’a',
    verb: 'convié',
    trail: 'à une réunion',
  },
  ProjectAssigned: {
    label: 'Projet',
    tone: 'info',
    icon: 'projects',
    lead: 't’a',
    verb: 'placé',
    trail: 'sur un projet',
  },
  TeamAssigned: {
    label: 'Équipe',
    tone: 'info',
    icon: 'teams',
    lead: 't’a',
    verb: 'affecté',
    trail: 'à une équipe',
  },
  AbsenceReviewed: {
    label: 'Absence',
    tone: 'success',
    icon: 'absences',
    lead: 'a',
    verb: 'traité',
    trail: 'ton absence',
  },
  AccessChanged: {
    label: 'Accès',
    tone: 'warning',
    icon: 'shield',
    lead: 'a',
    verb: 'modifié',
    trail: 'tes accès',
  },
  CommunicationPublished: {
    label: 'Annonce',
    tone: 'brand',
    icon: 'note',
    lead: 'a',
    verb: 'publié',
    trail: 'une annonce',
  },
  SkillGraded: {
    label: 'Compétence',
    tone: 'info',
    icon: 'skill',
    lead: 'a',
    verb: 'évalué',
    trail: 'une de tes compétences',
  },
  ReviewDecided: {
    label: 'Bilan',
    tone: 'success',
    icon: 'sheet',
    lead: 'a',
    verb: 'tranché',
    trail: 'ton bilan',
  },
  StepValidated: {
    label: 'Étape',
    tone: 'success',
    icon: 'confirm',
    lead: 'a',
    verb: 'validé',
    trail: 'une de tes étapes',
  },
  TrainingValidated: {
    label: 'Formation',
    tone: 'success',
    icon: 'academy',
    lead: 'a',
    verb: 'validé',
    trail: 'ta formation',
  },
  CandidateAssigned: {
    label: 'Candidature',
    tone: 'brand',
    icon: 'recruitment',
    lead: 't’a',
    verb: 'confié',
    trail: 'une candidature',
  },
  RecruitmentAssigned: {
    label: 'Recrutement',
    tone: 'brand',
    icon: 'recruitment',
    lead: 't’a',
    verb: 'nommé',
    trail: 'sur un recrutement',
  },
  AttendanceRequested: {
    label: 'Présence',
    tone: 'info',
    icon: 'meetings',
    lead: 't’a',
    verb: 'convié',
    trail: 'à confirmer ta présence',
  },
}

export const NOTIFICATION_KIND_REGISTRY = createRegistry(NOTIFICATION_KIND_MAP)
