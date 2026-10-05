'use client'

import { Button } from '@/components/elements/actions/Button'
import { Checkbox } from '@/components/elements/forms/Toggle'
import { MODVIEW_INSPECT_COPY } from '@/declarations/modview/copy'
import { MODVIEW_INSPECT } from '@/declarations/ui/variants'

export interface FocusBannerProps {
  name: string
  actInPlace: boolean
  onActInPlace: (value: boolean) => void
  onStop: () => void
}

/**
 * Banner of a Focus in course
 * @param {string} name - Moderator followed
 * @param {boolean} actInPlace - Gestures noted in their place
 * @param {(value: boolean) => void} onActInPlace - Switch handler
 * @param {() => void} onStop - Stop following
 * @return {JSX.Element}
 */

export const FocusBanner = ({ name, actInPlace, onActInPlace, onStop }: FocusBannerProps) => (
  <div className={MODVIEW_INSPECT.banner} role="status">
    <div className={MODVIEW_INSPECT.bannerText}>
      <span className={MODVIEW_INSPECT.bannerTitle}>
        {MODVIEW_INSPECT_COPY.following.replace('{name}', name)}
      </span>
      <span className={MODVIEW_INSPECT.bannerHint}>{MODVIEW_INSPECT_COPY.followingHint}</span>
    </div>
    <Checkbox
      checked={actInPlace}
      onChange={onActInPlace}
      label={MODVIEW_INSPECT_COPY.actInPlace}
      hint={MODVIEW_INSPECT_COPY.actInPlaceHint.replace('{name}', name)}
    />
    <Button variant="ghost" icon="close" onClick={onStop}>
      {MODVIEW_INSPECT_COPY.stop}
    </Button>
  </div>
)
