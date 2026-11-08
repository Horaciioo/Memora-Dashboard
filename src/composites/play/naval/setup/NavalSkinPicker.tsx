'use client'

import { useNavalSkinStore } from '@/core/store/play/navalSkin'
import { NAVAL_BOARD_COPY } from '@/declarations/play/naval/copy'
import { NAVAL_SKINS } from '@/declarations/play/naval/skins'
import type { NavalSkinName } from '@/declarations/play/naval/skins'
import { NAVAL_PLACE } from '@/declarations/ui/variants/naval'
import { cn } from '@/utils/classnames'

/**
 * Look of the viewer's ships and shells, all skins open
 * @return {JSX.Element}
 */

export const NavalSkinPicker = () => {
  const { skin, setSkin } = useNavalSkinStore()

  return (
    <div className={NAVAL_PLACE.skins} role="radiogroup" aria-label={NAVAL_BOARD_COPY.skin}>
      {(Object.keys(NAVAL_SKINS) as NavalSkinName[]).map((name) => {
        const entry = NAVAL_SKINS[name]

        return (
          <button
            key={name}
            type="button"
            role="radio"
            aria-checked={skin === name}
            className={cn(NAVAL_PLACE.skin, skin === name && NAVAL_PLACE.skinOn)}
            onClick={() => setSkin(name)}
          >
            <span
              className={NAVAL_PLACE.swatch}
              style={{
                background: `linear-gradient(90deg, ${entry.hull} 0 50%, ${entry.top} 50%)`,
              }}
            />
            {entry.label}
          </button>
        )
      })}
    </div>
  )
}
