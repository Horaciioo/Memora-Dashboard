import { createRegistry } from '@/core/lib/registry'
import type { IconName } from '@/declarations/ui/icons'
import { CalendarKinds, CalendarSources } from '@/utils/constants/workflow'
import type { CalendarKindName, CalendarSourceName } from '@/utils/constants/workflow'

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
}

export const CALENDAR_SOURCE_REGISTRY = createRegistry(CALENDAR_SOURCE_MAP)
