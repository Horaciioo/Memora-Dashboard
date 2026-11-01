'use client'

import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { useAppearanceStore } from '@/core/store/appearance'
import { useThemeStore } from '@/core/store/theme'
import { FONT_SCALE_REGISTRY, THEME_REGISTRY } from '@/declarations/access/preferences'
import { PREFERENCES_COPY } from '@/declarations/preferences/copy'
import { ICONS } from '@/declarations/ui/icons'
import { PICKER_CARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { ReactNode } from 'react'

// Letters of each reading size, grown card by card
const FONT_SAMPLE = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' } as const

interface PickerProps {
  title: string
  beta?: boolean
  columns: 'two' | 'three' | 'wide'
  children: ReactNode
}

/**
 * Titled group of pickable cards
 * @param {PickerProps} props - Title and cards
 * @return {JSX.Element}
 */

export const Picker = ({ title, beta, columns, children }: PickerProps) => (
  <div className={PICKER_CARD.group}>
    <p className={PICKER_CARD.title}>
      {title}
      {beta && <MaturityTag maturity="beta" />}
    </p>
    <div className={PICKER_CARD[columns]} role="group" aria-label={title}>
      {children}
    </div>
  </div>
)

/**
 * Theme as three cards with their own glyph
 * @return {JSX.Element}
 */

export const ThemePicker = () => {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)

  return (
    <Picker title={PREFERENCES_COPY.themeTitle} columns="three">
      {THEME_REGISTRY.keys.map((key) => {
        const option = THEME_REGISTRY.get(key)
        const Glyph = option.icon ? ICONS[option.icon] : null

        return (
          <button
            key={key}
            type="button"
            aria-pressed={theme === key}
            onClick={() => setTheme(key)}
            className={cn(PICKER_CARD.option, theme === key && PICKER_CARD.active)}
          >
            {Glyph && <Glyph className={PICKER_CARD.glyph} aria-hidden="true" />}
            <span className={PICKER_CARD.label}>{option.short}</span>
          </button>
        )
      })}
    </Picker>
  )
}

/**
 * Text size as three cards grown one by one
 * @return {JSX.Element}
 */

export const TextSizePicker = () => {
  const fontScale = useAppearanceStore((state) => state.fontScale)
  const setFontScale = useAppearanceStore((state) => state.setFontScale)

  return (
    <Picker title={PREFERENCES_COPY.textSizeTitle} columns="three">
      {FONT_SCALE_REGISTRY.keys.map((key) => {
        const option = FONT_SCALE_REGISTRY.get(key)

        return (
          <button
            key={key}
            type="button"
            aria-pressed={fontScale === key}
            onClick={() => setFontScale(key)}
            className={cn(PICKER_CARD.option, fontScale === key && PICKER_CARD.active)}
          >
            <span className={cn(PICKER_CARD.sample, FONT_SAMPLE[key])}>
              {PREFERENCES_COPY.textSizeSample}
            </span>
            <span className={PICKER_CARD.label}>{option.label}</span>
          </button>
        )
      })}
    </Picker>
  )
}
