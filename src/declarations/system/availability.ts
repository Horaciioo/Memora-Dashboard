import { Availabilities } from '@/utils/constants/availability'
import type { AvailabilityName } from '@/utils/constants/availability'

/**
 * Choices of availability
 * @typedef {Object} AvailabilityChoice
 * @property {AvailabilityName} value - Stored value
 * @property {string} label - Short name
 * @property {string} note - What it does
 * @property {string} tint - Colour token
 */

export interface AvailabilityChoice {
  value: AvailabilityName
  label: string
  note: string
  tint: string
}

/**
 * Availabilities a member can pick
 * @type {AvailabilityChoice[]}
 */

export const AVAILABILITY_CHOICES: AvailabilityChoice[] = [
  {
    value: Availabilities.Online,
    label: 'En ligne',
    note: 'Les autres te voient connecté',
    tint: 'var(--color-success)',
  },
  {
    value: Availabilities.Offline,
    label: 'Hors ligne',
    note: 'Tu apparais déconnecté',
    tint: 'var(--color-ink-subtle)',
  },
  {
    value: Availabilities.Dnd,
    label: 'Ne pas déranger',
    note: 'Hors ligne, et aucune notification',
    tint: 'var(--color-danger)',
  },
]

/**
 * Availability copy
 * @type {Record<string, string>}
 */

export const AVAILABILITY_COPY = {
  title: 'Disponibilité',
  invalid: 'Disponibilité inconnue.',
  saved: 'Disponibilité mise à jour',
} as const

/**
 * Choice of a value
 * @param {AvailabilityName} value - Stored value
 * @return {AvailabilityChoice} - Choice
 */

export const availabilityOf = (value: AvailabilityName): AvailabilityChoice =>
  AVAILABILITY_CHOICES.find((choice) => choice.value === value) ?? AVAILABILITY_CHOICES[0]
