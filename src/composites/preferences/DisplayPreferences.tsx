'use client'

import { MaturityTag } from '@/components/elements/display/MaturityTag'
import { Section } from '@/components/structures/Section'
import { useAppearanceStore } from '@/core/store/appearance'
import { useColorVisionStore } from '@/core/store/colorVision'
import { useThemeStore } from '@/core/store/theme'
import {
  COLOR_VISION_REGISTRY,
  FONT_SCALE_REGISTRY,
  THEME_REGISTRY,
} from '@/declarations/access/preferences'
import { PREFERENCES_COPY } from '@/declarations/preferences/copy'
import { ICONS } from '@/declarations/ui/icons'
import { PICKER_CARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import type { ReactNode } from 'react'

// Letters of each reading size, grown card by card
const FONT_SAMPLE = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' } as const

// Tones a vision mode redraws, shown as its palette
const VISION_TONES = [
  'bg-[var(--color-success)]',
  'bg-[var(--color-danger)]',
  'bg-[var(--color-info)]',
]

interface PickerProps {
  title: string
  beta?: boolean
  columns: 'three' | 'two'
  children: ReactNode
}

/**
 * Titled group of pickable cards
 * @param {PickerProps} props - Title and cards
 * @return {JSX.Element}
 */

const Picker = ({ title, beta, columns, children }: PickerProps) => (
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
 * Appearance settings as cards with their own glyph
 * @param {ReactNode} [children] - Extra rows
 * @return {JSX.Element}
 */

export const DisplayPreferences = ({ children }: { children?: ReactNode }) => {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  const fontScale = useAppearanceStore((state) => state.fontScale)
  const setFontScale = useAppearanceStore((state) => state.setFontScale)
  const colorVisionMode = useColorVisionStore((state) => state.colorVisionMode)
  const setColorVisionMode = useColorVisionStore((state) => state.setColorVisionMode)

  return (
    <Section title={PREFERENCES_COPY.displayTitle} padded>
      <div className={PICKER_CARD.stack}>
        <div className={PICKER_CARD.pair}>
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

          <Picker title={PREFERENCES_COPY.textSizeTitle} beta columns="three">
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
        </div>

        <Picker title={PREFERENCES_COPY.colorVisionTitle} beta columns="two">
          {COLOR_VISION_REGISTRY.keys.map((key) => {
            const option = COLOR_VISION_REGISTRY.get(key)

            return (
              <button
                key={key}
                type="button"
                aria-pressed={colorVisionMode === key}
                onClick={() => setColorVisionMode(key)}
                data-vision-preview={option.attribute}
                className={cn(
                  PICKER_CARD.option,
                  PICKER_CARD.optionWide,
                  colorVisionMode === key && PICKER_CARD.active
                )}
              >
                <span className={PICKER_CARD.swatches} aria-hidden="true">
                  {VISION_TONES.map((tone) => (
                    <span key={tone} className={cn(PICKER_CARD.swatch, tone)} />
                  ))}
                </span>
                <span className={PICKER_CARD.label}>{option.label}</span>
                <span className={PICKER_CARD.description}>{option.description}</span>
              </button>
            )
          })}
        </Picker>

        {children}
      </div>
      <p className={PICKER_CARD.note}>{PREFERENCES_COPY.storageNotice}</p>
    </Section>
  )
}
