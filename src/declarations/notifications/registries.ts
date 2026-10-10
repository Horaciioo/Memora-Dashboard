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
 * @property {string} verb - Past participle
 * @property {string} trail - What the act landed on
 * @property {boolean} [addressed] - Reads to the member alone, no actor, the subject filling {subject}
 */

export interface NotificationKindOption {
  label: string
  tone: Tone
  icon: IconName
  lead: string
  verb: string
  trail: string
  addressed?: boolean
}

/*
 * Every sentence reads "<actor> <lead> <verb> <trail>"
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
  AbsenceAcknowledged: {
    label: 'Absence',
    tone: 'success',
    icon: 'absences',
    lead: 'Ton absence {subject} a bien été',
    verb: 'prise en compte',
    trail: '',
    addressed: true,
  },
  MeetingRequested: {
    label: 'Réunion',
    tone: 'info',
    icon: 'meetings',
    lead: 't’a',
    verb: 'demandé',
    trail: 'un rendez-vous',
  },
  LiveAnnounced: {
    label: 'Live',
    tone: 'danger',
    icon: 'liveDot',
    lead: 't’a',
    verb: 'convoqué',
    trail: 'sur un live',
  },
  LiveCoordinatorAsked: {
    label: 'Live',
    tone: 'danger',
    icon: 'coordinator',
    lead: 'te propose de',
    verb: 'coordonner',
    trail: 'un live, réponds depuis ton Accueil',
  },
  LiveCoordinatorAccepted: {
    label: 'Live',
    tone: 'success',
    icon: 'coordinator',
    lead: 'a',
    verb: 'accepté',
    trail: 'de coordonner un live',
  },
  LiveCoordinatorDeclined: {
    label: 'Live',
    tone: 'caution',
    icon: 'coordinator',
    lead: 'a',
    verb: 'refusé',
    trail: 'de coordonner un live',
  },
  LiveCoordinatorGap: {
    label: 'Live',
    tone: 'caution',
    icon: 'coordinator',
    lead: 'Sur le live {subject},',
    verb: 'il manque un Coordinateur',
    trail: '',
    addressed: true,
  },
  LiveStarted: {
    label: 'Live',
    tone: 'danger',
    icon: 'liveDot',
    lead: 'Le live {subject} vient d’être',
    verb: 'lancé',
    trail: '',
    addressed: true,
  },
  LiveCancelled: {
    label: 'Live',
    tone: 'neutral',
    icon: 'liveDot',
    lead: 'a',
    verb: 'annulé',
    trail: 'le live',
  },
  LiveReportReady: {
    label: 'Bilan',
    tone: 'info',
    icon: 'modActions',
    lead: 'Le bilan du live {subject} est',
    verb: 'prêt',
    trail: '',
    addressed: true,
  },
  PimReviewDue: {
    label: 'PIM',
    tone: 'warning',
    icon: 'sheet',
    lead: 'Le bilan de {subject} est',
    verb: 'à faire',
    trail: '',
    addressed: true,
  },
  PimReviewSubmitted: {
    label: 'PIM',
    tone: 'warning',
    icon: 'sheet',
    lead: 'a',
    verb: 'déposé',
    trail: 'son bilan',
  },
  PimLaunched: {
    label: 'PIM',
    tone: 'success',
    icon: 'academy',
    lead: 'La PIM {subject} est',
    verb: 'lancée',
    trail: '',
    addressed: true,
  },
  PimSecondPeriod: {
    label: 'PIM',
    tone: 'brand',
    icon: 'academy',
    lead: 'La période 2 est',
    verb: 'lancée',
    trail: ': les spécialisations sont ouvertes',
    addressed: true,
  },
  PimDeparture: {
    label: 'Départ',
    tone: 'danger',
    icon: 'mail',
    lead: 'Le départ de {subject} est',
    verb: 'à annoncer',
    trail: '',
    addressed: true,
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
  TrainingFinished: {
    label: 'Formation',
    tone: 'success',
    icon: 'academy',
    lead: 'a',
    verb: 'terminé',
    trail: 'une formation',
  },
  LegacyOpened: {
    label: 'Legacy',
    tone: 'brand',
    icon: 'crown',
    lead: 'a',
    verb: 'ouvert',
    trail: 'ton parcours Legacy',
  },
  LegacyDecided: {
    label: 'Legacy',
    tone: 'brand',
    icon: 'crown',
    lead: 'a',
    verb: 'tranché',
    trail: 'ton parcours Legacy',
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
