import type { CSSProperties } from 'react'

import { COLOUR_SETTINGS } from '@/declarations/configurations/settings'
import type { IconName } from '@/declarations/ui/icons'
import { isHexColour } from '@/utils/format/colour'
import { THEME, tw, type TokenRef } from '@/utils/format/theme'

export type Tone = 'brand' | 'success' | 'caution' | 'warning' | 'danger' | 'info' | 'neutral'

/**
 * Tone class set
 * @typedef {Object} ToneStyles
 * @property {string} text - Foreground colour
 * @property {string} soft - Tinted background
 * @property {string} solid - Full colour background
 * @property {string} border - Border colour
 * @property {string} dot - Status dot background
 */

export interface ToneStyles {
  text: string
  soft: string
  solid: string
  border: string
  dot: string
}

/**
 * Draw one tone from the theme format
 * @param {Object} parts - Tone tokens
 * @param {TokenRef} parts.fill - Full colour, also the default text and border
 * @param {TokenRef} parts.soft - Tinted background
 * @param {TokenRef} [parts.text] - Foreground, defaults to fill
 * @param {TokenRef} [parts.border] - Border, defaults to fill
 * @return {ToneStyles} - Class set
 */

const drawTone = ({
  fill,
  soft,
  text = fill,
  border = fill,
}: {
  fill: TokenRef
  soft: TokenRef
  text?: TokenRef
  border?: TokenRef
}): ToneStyles => ({
  text: tw('text', text),
  soft: tw('bg', soft),
  solid: tw('bg', fill),
  border: tw('border', border),
  dot: tw('bg', text),
})

/**
 * Classes per tone
 * @type {Record<Tone, ToneStyles>}
 */

export const TONES: Record<Tone, ToneStyles> = {
  brand: drawTone({
    fill: THEME.colour.brand,
    soft: THEME.colour.brandSoft,
    border: THEME.colour.brandEdge,
  }),
  success: drawTone({ fill: THEME.colour.success, soft: THEME.colour.successSoft }),
  caution: drawTone({ fill: THEME.colour.caution, soft: THEME.colour.cautionSoft }),
  warning: drawTone({ fill: THEME.colour.warning, soft: THEME.colour.warningSoft }),
  danger: drawTone({ fill: THEME.colour.danger, soft: THEME.colour.dangerSoft }),
  info: drawTone({ fill: THEME.colour.info, soft: THEME.colour.infoSoft }),
  neutral: drawTone({
    fill: THEME.colour.neutral,
    soft: THEME.colour.neutralSoft,
    text: THEME.colour.inkSubtle,
    border: THEME.colour.borderStrong,
  }),
}

/**
 * Icon per tone, read by the toaster and the overlay headers
 * @type {Record<Tone, IconName>}
 */

export const TONE_ICON: Record<Tone, IconName> = {
  brand: 'spark',
  success: 'success',
  caution: 'warning',
  warning: 'warning',
  danger: 'failure',
  info: 'info',
  neutral: 'help',
}

/**
 * Border color per notification tone
 * @type {Record<Tone, string>}
 */

export const TONE_BORDER: Record<Tone, string> = {
  brand: TONES.brand.border,
  success: TONES.success.border,
  caution: TONES.caution.border,
  warning: TONES.warning.border,
  danger: TONES.danger.border,
  info: TONES.info.border,
  neutral: TONES.neutral.border,
}

/**
 * Resolve a stored accent to a tone
 * @param {string | null | undefined} accent - Stored accent key
 * @param {Tone} [fallback] - Tone used when unknown
 * @return {Tone} - Tone key
 */

export const toTone = (accent: string | null | undefined, fallback: Tone = 'neutral'): Tone =>
  accent !== null && accent !== undefined && accent in TONES ? (accent as Tone) : fallback

/**
 * Token drawing each tone, read when an accent still holds a tone key
 * @type {Record<Tone, string>}
 */

export const TONE_VARS: Record<Tone, string> = {
  brand: THEME.colour.brand,
  success: THEME.colour.success,
  caution: THEME.colour.caution,
  warning: THEME.colour.warning,
  danger: THEME.colour.danger,
  info: THEME.colour.info,
  neutral: THEME.colour.neutral,
}

/**
 * Classes reading the accent custom property, the hexadecimal counterpart of TONES
 * @type {Record<string, string>}
 */

export const ACCENT_STYLES = {
  text: 'accent-text',
  soft: 'accent-tint',
  solid: 'accent-solid',
  border: 'accent-border',
  dot: 'accent-dot',
} as const

/**
 * Resolve a stored accent to a drawable colour
 * @param {string | null | undefined} accent - Stored accent
 * @param {Tone} [fallback] - Tone used when no colour is stored
 * @return {string} - CSS colour
 */

export const accentColour = (
  accent: string | null | undefined,
  fallback: Tone = 'neutral'
): string => (isHexColour(accent) ? (accent as string) : TONE_VARS[toTone(accent, fallback)])

/**
 * Carry an accent down to the classes drawing it
 * @param {string | null | undefined} accent - Stored accent
 * @param {Tone} [fallback] - Tone used when no colour is stored
 * @return {CSSProperties} - Custom properties
 */

export const accentVars = (
  accent: string | null | undefined,
  fallback: Tone = 'neutral'
): CSSProperties => ({ '--accent': accentColour(accent, fallback) }) as CSSProperties

/**
 * Class set and custom property drawing one stored accent
 * @typedef {Object} AccentPaint
 * @property {string} text - Foreground class
 * @property {string} soft - Tinted background class
 * @property {string} border - Border class
 * @property {string} dot - Status dot class
 * @property {CSSProperties} [style] - Custom property, only on a picked colour
 */

export interface AccentPaint extends ToneStyles {
  style?: CSSProperties
}

/**
 * Paint a stored accent, whichever notation it holds
 * @param {string | null | undefined} accent - Stored accent
 * @param {Tone} [fallback] - Tone used when no colour is stored
 * @return {AccentPaint} - Classes and custom property
 */

export const accentPaint = (
  accent: string | null | undefined,
  fallback: Tone = 'neutral'
): AccentPaint =>
  isHexColour(accent)
    ? { ...ACCENT_STYLES, style: accentVars(accent, fallback) }
    : TONES[toTone(accent, fallback)]

/**
 * Colour a brand new row starts on
 * @type {string}
 */

export const DEFAULT_ACCENT = COLOUR_SETTINGS.defaultAccent
