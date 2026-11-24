'use client'

import { useSanctionColoursStore } from '@/core/store/appearance/sanctionColours'
import { COLOUR_SETTINGS } from '@/declarations/configurations/settings/forms'
import { MODERATION_KINDS } from '@/declarations/lives/moderation'
import {
  SANCTION_COLOUR_COPY,
  SANCTION_COLOUR_KINDS,
} from '@/declarations/preferences/sanctionColours'
import { PICKER_CARD, SANCTION_COLOUR_PICKER } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * One colour choice per sanction kind
 * @return {JSX.Element}
 */

export const SanctionColourPicker = () => {
  const colours = useSanctionColoursStore((state) => state.colours)
  const setColour = useSanctionColoursStore((state) => state.setColour)

  return (
    <div className={PICKER_CARD.stack}>
      <p className={PICKER_CARD.lead}>{SANCTION_COLOUR_COPY.lead}</p>
      {SANCTION_COLOUR_KINDS.map((kind) => (
        <div key={kind} className={SANCTION_COLOUR_PICKER.row}>
          <span className={SANCTION_COLOUR_PICKER.label}>{MODERATION_KINDS[kind].label}</span>
          <div className={SANCTION_COLOUR_PICKER.swatches} role="group">
            <button
              type="button"
              aria-pressed={!colours[kind]}
              onClick={() => setColour(kind, null)}
              className={cn(
                SANCTION_COLOUR_PICKER.reset,
                !colours[kind] && SANCTION_COLOUR_PICKER.on
              )}
            >
              {SANCTION_COLOUR_COPY.none}
            </button>
            {COLOUR_SETTINGS.swatches.map((swatch) => (
              <button
                key={swatch}
                type="button"
                aria-label={swatch}
                aria-pressed={colours[kind] === swatch}
                onClick={() => setColour(kind, swatch)}
                style={{ background: swatch }}
                className={cn(
                  SANCTION_COLOUR_PICKER.swatch,
                  colours[kind] === swatch && SANCTION_COLOUR_PICKER.on
                )}
              />
            ))}
          </div>
        </div>
      ))}
      <p className={PICKER_CARD.note}>{SANCTION_COLOUR_COPY.note}</p>
    </div>
  )
}
