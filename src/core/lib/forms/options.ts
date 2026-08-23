import { TONE_KEYS, TONE_LABELS } from '@/declarations/ui/theme'
import type { Registry } from '@/core/lib/registry'
import type { FieldOption } from '@/types/forms'

/**
 * Turn a registry into select options
 * @param {Registry<TKey, TValue>} registry - Registry to read
 * @return {FieldOption[]} - Select options
 */

export const toOptions = <
  TKey extends string,
  TValue extends { label: string; accent?: string | null },
>(
  registry: Registry<TKey, TValue>
): FieldOption[] =>
  registry.keys.map((key) => ({
    value: key,
    label: registry.label(key),
    accent: registry.get(key).accent ?? undefined,
  }))

/**
 * Turn database rows into select options
 * @param {Array<{ id: string, name: string, accent?: string, avatarUrl?: string }>} rows - Rows to map
 * @return {FieldOption[]} - Select options
 */

export const rowsToOptions = (
  rows: { id: string; name: string; accent?: string | null; avatarUrl?: string | null }[]
): FieldOption[] =>
  rows.map((row) => ({
    value: row.id,
    label: row.name,
    accent: row.accent ?? undefined,
    image: row.avatarUrl ?? undefined,
  }))

/**
 * Colour tones offered on a reference form
 * @type {FieldOption[]}
 */

export const TONE_OPTIONS: FieldOption[] = TONE_KEYS.map((tone) => ({
  value: tone,
  label: TONE_LABELS[tone],
  accent: tone,
}))
