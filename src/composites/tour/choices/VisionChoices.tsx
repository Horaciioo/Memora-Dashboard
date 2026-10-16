'use client'

import { Button } from '@/components/elements/actions/Button'
import type { IntakeAnswers } from '@/core/lib/tour/chat'
import { useColorVisionStore } from '@/core/store/colorVision'
import { COLOR_VISION_REGISTRY } from '@/declarations/access/preferences'
import { TOUR_COPY } from '@/declarations/tour/copy'
import { TOUR_CHAT } from '@/declarations/ui/variants'

export interface VisionChoicesProps {
  onAnswer: (text: string, patch?: IntakeAnswers) => void
}

/**
 * What Memora offers for colour vision, each mode named and explained, and the way out
 * @param {VisionChoicesProps} props - Handler
 * @return {JSX.Element}
 */

export const VisionChoices = ({ onAnswer }: VisionChoicesProps) => {
  const setColorVision = useColorVisionStore((state) => state.setColorVisionMode)
  const modes = COLOR_VISION_REGISTRY.keys.filter((key) => key !== 'NONE')

  return (
    <div className={TOUR_CHAT.offer}>
      <div className={TOUR_CHAT.quick}>
        {modes.map((key) => (
          <button
            key={key}
            type="button"
            className={TOUR_CHAT.preview}
            onClick={() => {
              setColorVision(key)
              onAnswer(COLOR_VISION_REGISTRY.get(key).label, { colorFit: true })
            }}
          >
            <span className={TOUR_CHAT.previewLabel}>{COLOR_VISION_REGISTRY.get(key).label}</span>
            <span className={TOUR_CHAT.previewHint}>
              {COLOR_VISION_REGISTRY.get(key).description}
            </span>
          </button>
        ))}
      </div>
      <Button
        variant="ghost"
        className={TOUR_CHAT.offerNone}
        onClick={() => onAnswer(TOUR_COPY.colorNone, { colorFit: false })}
      >
        {TOUR_COPY.colorNone}
      </Button>
    </div>
  )
}
