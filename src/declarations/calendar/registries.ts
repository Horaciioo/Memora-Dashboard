import { createRegistry } from '@/core/lib/registry'
import type { Tone } from '@/declarations/ui/theme'
import type { IconName } from '@/declarations/ui/icons'
import { Permissions } from '@/utils/constants/permissions'
import type { PermissionName } from '@/utils/constants/permissions'
import {
  AttendanceStatuses,
  CalendarKinds,
  CalendarLayers,
  CalendarSources,
} from '@/utils/constants/workflow'
import type {
  AttendanceStatusName,
  CalendarKindName,
  CalendarLayerName,
  CalendarSourceName,
} from '@/utils/constants/workflow'

/**
 * Legend entry of the calendar
 * @typedef {Object} CalendarLegendOption
 * @property {string} label - Display label
 * @property {string} summary - What the entry stands for
 * @property {string} accent - Colour token used when nothing else applies
 * @property {IconName} icon - Glyph drawn in the legend
 */

interface CalendarLegendOption {
  label: string
  summary: string
  accent: string
  icon: IconName
}

const CALENDAR_KIND_MAP: Record<CalendarKindName, CalendarLegendOption> = {
  [CalendarKinds.Zone]: {
    label: 'Zone',
    summary: 'Un fond posé sur une plage de jours.',
    accent: 'neutral',
    icon: 'sheet',
  },
  [CalendarKinds.Period]: {
    label: 'Période',
    summary: 'Une barre courant d’un jour à un autre.',
    accent: 'info',
    icon: 'clock',
  },
  [CalendarKinds.Event]: {
    label: 'Évènement',
    summary: 'Une carte posée sur un créneau.',
    accent: 'brand',
    icon: 'spark',
  },
}

export const CALENDAR_KIND_REGISTRY = createRegistry(CALENDAR_KIND_MAP)

const CALENDAR_SOURCE_MAP: Record<CalendarSourceName, CalendarLegendOption> = {
  [CalendarSources.Entry]: {
    label: 'Évènement posé',
    summary: 'Ce que l’équipe planifie depuis le calendrier.',
    accent: 'brand',
    icon: 'spark',
  },
  [CalendarSources.Absence]: {
    label: 'Absence',
    summary: 'Les congés validés des modérateurs.',
    accent: 'warning',
    icon: 'absences',
  },
  [CalendarSources.Meeting]: {
    label: 'Réunion',
    summary: 'Les réunions déjà planifiées côté travail.',
    accent: 'info',
    icon: 'meetings',
  },
  [CalendarSources.Birthday]: {
    label: 'Anniversaire',
    summary: 'Les anniversaires des membres qui les partagent.',
    accent: 'danger',
    icon: 'birthday',
  },
  [CalendarSources.AcademyStep]: {
    label: 'Étape Academy',
    summary: 'Les étapes datées d’une session de formation.',
    accent: 'success',
    icon: 'academy',
  },
  [CalendarSources.AcademySession]: {
    label: 'Session PIM',
    summary: 'La durée d’une session de formation.',
    accent: 'success',
    icon: 'academy',
  },
  [CalendarSources.Recruitment]: {
    label: 'Session de recrutement',
    summary: 'La période où une campagne de recrutement est ouverte.',
    accent: 'brand',
    icon: 'recruitment',
  },
  [CalendarSources.RecruitmentInterview]: {
    label: 'Entretien',
    summary: 'Les entretiens posés avec les candidats.',
    accent: 'brand',
    icon: 'recruitment',
  },
}

export const CALENDAR_SOURCE_REGISTRY = createRegistry(CALENDAR_SOURCE_MAP)

/**
 * Switchable calendar of the sidebar
 * @typedef {Object} CalendarLayerOption
 * @property {string} label - Display label
 * @property {IconName} icon - Glyph drawn beside it
 * @property {CalendarSourceName[]} sources - Sources it gathers
 * @property {PermissionName | null} permission - Needed to see the calendar at all
 */

interface CalendarLayerOption {
  label: string
  icon: IconName
  sources: CalendarSourceName[]
  permission: PermissionName | null
}

const CALENDAR_LAYER_MAP: Record<CalendarLayerName, CalendarLayerOption> = {
  [CalendarLayers.Events]: {
    label: 'Évènements',
    icon: 'spark',
    sources: [CalendarSources.Entry],
    permission: null,
  },
  [CalendarLayers.Meetings]: {
    label: 'Réunions',
    icon: 'meetings',
    sources: [CalendarSources.Meeting],
    permission: Permissions.MeetingRead,
  },
  [CalendarLayers.Absences]: {
    label: 'Absences',
    icon: 'absences',
    sources: [CalendarSources.Absence],
    permission: Permissions.AbsenceRead,
  },
  [CalendarLayers.Birthdays]: {
    label: 'Anniversaires',
    icon: 'birthday',
    sources: [CalendarSources.Birthday],
    permission: Permissions.MemberRead,
  },
  [CalendarLayers.Academy]: {
    label: 'Marsha Academy',
    icon: 'academy',
    sources: [CalendarSources.AcademySession, CalendarSources.AcademyStep],
    permission: Permissions.AcademyRead,
  },
  [CalendarLayers.Recruitment]: {
    label: 'Recrutements',
    icon: 'recruitment',
    sources: [CalendarSources.Recruitment, CalendarSources.RecruitmentInterview],
    permission: Permissions.RecruitmentRead,
  },
}

export const CALENDAR_LAYER_REGISTRY = createRegistry(CALENDAR_LAYER_MAP)

/**
 * Colour a calendar wears in the sidebar, the one of its first source
 * @param {CalendarLayerName} layer - Calendar
 * @return {string} - Accent token
 */

export const layerAccent = (layer: CalendarLayerName): string =>
  CALENDAR_SOURCE_REGISTRY.get(CALENDAR_LAYER_MAP[layer].sources[0]).accent

/**
 * Calendar an entry belongs to
 * @param {CalendarSourceName} source - Source the entry was read from
 * @return {CalendarLayerName} - Layer gathering that source
 */

export const layerOfSource = (source: CalendarSourceName): CalendarLayerName =>
  CALENDAR_LAYER_REGISTRY.keys.find((layer) =>
    CALENDAR_LAYER_MAP[layer].sources.includes(source)
  ) as CalendarLayerName

/**
 * Roll-call answer as it reads on screen
 * @typedef {Object} AttendanceStatusOption
 * @property {string} label - Display label
 * @property {Tone} tone - Badge colour
 * @property {IconName} icon - Glyph drawn beside it
 */

interface AttendanceStatusOption {
  label: string
  tone: Tone
  icon: IconName
}

const ATTENDANCE_STATUS_MAP: Record<AttendanceStatusName, AttendanceStatusOption> = {
  [AttendanceStatuses.Present]: { label: 'Présent', tone: 'success', icon: 'confirm' },
  [AttendanceStatuses.Absent]: { label: 'Absent', tone: 'danger', icon: 'close' },
  [AttendanceStatuses.Pending]: { label: 'Sans réponse', tone: 'neutral', icon: 'clock' },
}

export const ATTENDANCE_STATUS_REGISTRY = createRegistry(ATTENDANCE_STATUS_MAP)
