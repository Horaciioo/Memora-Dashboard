import { createRegistry } from '@/core/lib/registry'
import type { Tone } from '@/declarations/ui/theme'
import type { IconName } from '@/declarations/ui/icons'
import { Permissions } from '@/utils/constants/permissions'
import type { CalendarEntry } from '@/types/calendar'
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
 * @property {string} [plural] - Category heading
 * @property {string} summary - What the entry stands for
 * @property {string} accent - Colour token used when nothing else applies
 * @property {IconName} icon - Glyph drawn in the legend
 */

interface CalendarLegendOption {
  label: string
  plural?: string
  summary: string
  accent: string
  icon: IconName
}

const CALENDAR_KIND_MAP: Record<CalendarKindName, CalendarLegendOption> = {
  [CalendarKinds.Zone]: {
    label: 'Zone',
    plural: 'Zones',
    summary: 'Un fond posé sur une plage de jours, son titre apparaît au survol.',
    accent: 'neutral',
    icon: 'sheet',
  },
  [CalendarKinds.Period]: {
    label: 'Période',
    plural: 'Périodes',
    summary: 'Un grand cadre arrondi qui entoure ce qu’elle contient.',
    accent: 'info',
    icon: 'clock',
  },
  [CalendarKinds.Event]: {
    label: 'Évènement',
    plural: 'Évènements',
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
  [CalendarSources.AcademySession]: {
    label: 'Session PIM',
    summary: 'La durée d’une session de formation.',
    accent: 'success',
    icon: 'academy',
  },
  [CalendarSources.AcademyPeriod]: {
    label: 'Période de PIM',
    summary: 'Les périodes que traverse une promotion.',
    accent: 'info',
    icon: 'academy',
  },
  [CalendarSources.AcademyTrainings]: {
    label: 'Période de formations',
    summary: 'Le temps laissé aux formations avant les bilans.',
    accent: 'success',
    icon: 'academy',
  },
  [CalendarSources.AcademyReviews]: {
    label: 'Période de bilans',
    summary: 'Du premier bilan dû à la dernière décision.',
    accent: 'warning',
    icon: 'sheet',
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
 * @property {Tone} mobileTone - Colour its entries wear on a phone, five in all
 */

interface CalendarLayerOption {
  label: string
  icon: IconName
  sources: CalendarSourceName[]
  permission: PermissionName | null
  mobileTone: Tone
}

const CALENDAR_LAYER_MAP: Record<CalendarLayerName, CalendarLayerOption> = {
  [CalendarLayers.Events]: {
    label: 'Évènements',
    icon: 'spark',
    sources: [CalendarSources.Entry],
    permission: null,
    mobileTone: 'info',
  },
  [CalendarLayers.Lives]: {
    label: 'Lives',
    icon: 'liveDot',
    sources: [],
    permission: null,
    mobileTone: 'brand',
  },
  [CalendarLayers.Annual]: {
    label: 'Bilans annuels',
    icon: 'objective',
    sources: [],
    permission: null,
    mobileTone: 'success',
  },
  [CalendarLayers.Meetings]: {
    label: 'Réunions',
    icon: 'meetings',
    sources: [CalendarSources.Meeting],
    permission: Permissions.MeetingRead,
    mobileTone: 'info',
  },
  [CalendarLayers.Absences]: {
    label: 'Absences',
    icon: 'absences',
    sources: [CalendarSources.Absence],
    permission: Permissions.AbsenceRead,
    mobileTone: 'neutral',
  },
  [CalendarLayers.Birthdays]: {
    label: 'Anniversaires',
    icon: 'birthday',
    sources: [CalendarSources.Birthday],
    permission: Permissions.MemberRead,
    mobileTone: 'warning',
  },
  [CalendarLayers.Academy]: {
    label: 'Academy',
    icon: 'academy',
    sources: [
      CalendarSources.AcademySession,
      CalendarSources.AcademyPeriod,
      CalendarSources.AcademyTrainings,
      CalendarSources.AcademyReviews,
    ],
    permission: Permissions.AcademyRead,
    mobileTone: 'success',
  },
  [CalendarLayers.Recruitment]: {
    label: 'Recrutements',
    icon: 'recruitment',
    sources: [CalendarSources.Recruitment, CalendarSources.RecruitmentInterview],
    // Open to all, observers read their own interviews there
    permission: null,
    mobileTone: 'success',
  },
}

export const CALENDAR_LAYER_REGISTRY = createRegistry(CALENDAR_LAYER_MAP)

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
 * Colour an entry wears on a phone, set by its calendar alone
 * @param {Pick<CalendarEntry, 'source' | 'slot' | 'category'>} entry - Entry on screen
 * @return {Tone} - Tone of its calendar
 */

export const mobileToneOfEntry = (
  entry: Pick<CalendarEntry, 'source' | 'slot' | 'category'>
): Tone => CALENDAR_LAYER_REGISTRY.get(layerOfEntry(entry)).mobileTone

/**
 * Calendar an entry is shown in: its source, refined by what a model made of it
 * @param {Pick<CalendarEntry, 'source' | 'slot' | 'category'>} entry - Entry on screen
 * @return {CalendarLayerName} - Layer gathering it
 */

export const layerOfEntry = (
  entry: Pick<CalendarEntry, 'source' | 'slot' | 'category'>
): CalendarLayerName => {
  // The slots and the period of the annual reviews are a calendar of their own
  if (entry.slot) return CalendarLayers.Annual
  if (entry.source === CalendarSources.Entry && entry.category === 'Lives') {
    return CalendarLayers.Lives
  }
  if (entry.source === CalendarSources.Entry && entry.category === 'Réunions') {
    return CalendarLayers.Meetings
  }

  return layerOfSource(entry.source)
}

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
  [AttendanceStatuses.Present]: { label: 'Présent', tone: 'success', icon: 'check' },
  [AttendanceStatuses.Absent]: { label: 'Absent', tone: 'danger', icon: 'cross' },
  [AttendanceStatuses.Pending]: { label: 'Sans réponse', tone: 'neutral', icon: 'clock' },
}

export const ATTENDANCE_STATUS_REGISTRY = createRegistry(ATTENDANCE_STATUS_MAP)
