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
import { PICKER_BLOCK } from '@/declarations/ui/blocks'
import { ICONS } from '@/declarations/ui/icons'
import { PREFERENCE_STYLES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Theme, text size and colour vision as cards
 * @return {JSX.Element}
 */

export const DisplayPreferences = () => {
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  const fontScale = useAppearanceStore((state) => state.fontScale)
  const setFontScale = useAppearanceStore((state) => state.setFontScale)
  const colorVisionMode = useColorVisionStore((state) => state.colorVisionMode)
  const setColorVisionMode = useColorVisionStore((state) => state.setColorVisionMode)

  return (
    <Section title={PREFERENCES_COPY.displayTitle} padded>
      <div className={PREFERENCE_STYLES.stack}>
        <div className={PICKER_BLOCK.pair}>
          <div className={PICKER_BLOCK.group}>
            <p className={PICKER_BLOCK.title}>{PREFERENCES_COPY.themeTitle}</p>
            <div
              className={PICKER_BLOCK.three}
              role="group"
              aria-label={PREFERENCES_COPY.themeTitle}
            >
              {THEME_REGISTRY.keys.map((key) => {
                const option = THEME_REGISTRY.get(key)
                const Glyph = option.icon ? ICONS[option.icon] : null
                const isActive = theme === key

                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setTheme(key)}
                    className={cn(PICKER_BLOCK.option, isActive && PICKER_BLOCK.active)}
                  >
                    {Glyph && <Glyph className={PICKER_BLOCK.glyph} />}
                    <span className={PICKER_BLOCK.label}>{option.short}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className={PICKER_BLOCK.group}>
            <p className={PICKER_BLOCK.title}>
              {PREFERENCES_COPY.textSizeTitle}
              <MaturityTag maturity="beta" />
            </p>
            <div
              className={PICKER_BLOCK.three}
              role="group"
              aria-label={PREFERENCES_COPY.textSizeTitle}
            >
              {FONT_SCALE_REGISTRY.keys.map((key) => {
                const option = FONT_SCALE_REGISTRY.get(key)
                const isActive = fontScale === key

                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setFontScale(key)}
                    className={cn(PICKER_BLOCK.option, isActive && PICKER_BLOCK.active)}
                  >
                    <span className={cn(PICKER_BLOCK.sample, option.sample)}>
                      {PREFERENCES_COPY.textSizeSample}
                    </span>
                    <span className={PICKER_BLOCK.label}>{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className={PICKER_BLOCK.group}>
          <p className={PICKER_BLOCK.title}>
            {PREFERENCES_COPY.colorVisionTitle}
            <MaturityTag maturity="beta" />
          </p>
          <div
            className={PICKER_BLOCK.two}
            role="group"
            aria-label={PREFERENCES_COPY.colorVisionTitle}
          >
            {COLOR_VISION_REGISTRY.keys.map((key) => {
              const option = COLOR_VISION_REGISTRY.get(key)
              const isActive = colorVisionMode === key

              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setColorVisionMode(key)}
                  className={cn(PICKER_BLOCK.optionWide, isActive && PICKER_BLOCK.active)}
                >
                  <span className={PICKER_BLOCK.label}>{option.label}</span>
                  <span className={PICKER_BLOCK.description}>{option.description}</span>
                </button>
              )
            })}
          </div>
        </div>

        <p className={PREFERENCE_STYLES.notice}>{PREFERENCES_COPY.storageNotice}</p>
      </div>
    </Section>
  )
}
