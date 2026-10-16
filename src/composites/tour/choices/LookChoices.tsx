'use client'

import { useAppearanceStore } from '@/core/store/appearance'
import { useThemeStore } from '@/core/store/theme'
import { FONT_SCALE_REGISTRY, THEME_REGISTRY } from '@/declarations/access/preferences'
import type { FontScale, ThemePreference } from '@/declarations/access/preferences'
import { TOUR_COPY } from '@/declarations/tour/copy'
import { TOUR_CHAT } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Size of the sample under each text size
const SAMPLE_SIZES: Record<FontScale, string> = {
  sm: 'text-sm',
  md: 'text-xl',
  lg: 'text-3xl',
}

export interface LookChoicesProps {
  kind: 'fontScale' | 'theme'
  onAnswer: (text: string) => void
}

/**
 * The look to pick, each option drawn as it will read
 * @param {LookChoicesProps} props - What is picked and the handler
 * @return {JSX.Element}
 */

export const LookChoices = ({ kind, onAnswer }: LookChoicesProps) => {
  const setTheme = useThemeStore((state) => state.setTheme)
  const setFontScale = useAppearanceStore((state) => state.setFontScale)

  const options =
    kind === 'theme'
      ? THEME_REGISTRY.keys.map((key: ThemePreference) => ({
          key,
          label: THEME_REGISTRY.get(key).label,
          sample: (
            <span
              className={cn('tour-theme', `tour-theme-${key.toLowerCase()}`)}
              aria-hidden="true"
            />
          ),
          apply: () => setTheme(key),
        }))
      : FONT_SCALE_REGISTRY.keys.map((key: FontScale) => ({
          key,
          label: FONT_SCALE_REGISTRY.get(key).label,
          sample: (
            <span className={cn(TOUR_CHAT.previewSample, SAMPLE_SIZES[key])} aria-hidden="true">
              {TOUR_COPY.sample}
            </span>
          ),
          apply: () => setFontScale(key),
        }))

  return (
    <div className={TOUR_CHAT.quick}>
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          className={TOUR_CHAT.preview}
          onClick={() => {
            option.apply()
            onAnswer(option.label)
          }}
        >
          {option.sample}
          <span className={TOUR_CHAT.previewLabel}>{option.label}</span>
        </button>
      ))}
    </div>
  )
}
