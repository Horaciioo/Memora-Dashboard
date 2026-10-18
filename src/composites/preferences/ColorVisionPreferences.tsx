'use client'

import { Section } from '@/components/structures/page/Section'
import { Picker } from '@/composites/preferences/DisplayPreferences'
import { useColorVisionStore } from '@/core/store/colorVision'
import { COLOR_VISION_REGISTRY } from '@/declarations/access/preferences'
import { PREFERENCES_COPY } from '@/declarations/preferences/copy'
import { PICKER_CARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Tones a vision mode redraws, shown as its palette
const VISION_TONES = [
  'bg-[var(--color-success)]',
  'bg-[var(--color-caution)]',
  'bg-[var(--color-danger)]',
  'bg-[var(--color-info)]',
]

/**
 * Colour vision modes with their palette and background
 * @return {JSX.Element}
 */

export const ColorVisionPreferences = () => {
  const colorVisionMode = useColorVisionStore((state) => state.colorVisionMode)
  const setColorVisionMode = useColorVisionStore((state) => state.setColorVisionMode)

  return (
    <Section title={PREFERENCES_COPY.colorVisionTitle} padded>
      <div className={PICKER_CARD.stack}>
        <p className={PICKER_CARD.lead}>{PREFERENCES_COPY.colorVisionLead}</p>
        <Picker title={PREFERENCES_COPY.colorVisionModes} beta columns="wide">
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
                <span className={PICKER_CARD.frameStrip} aria-hidden="true" />
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
        <p className={PICKER_CARD.note}>{PREFERENCES_COPY.colorVisionNote}</p>
      </div>
    </Section>
  )
}
