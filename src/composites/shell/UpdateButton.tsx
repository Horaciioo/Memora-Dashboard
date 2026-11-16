'use client'

import { useState } from 'react'

import { useInstallState, useUpdateOffer } from '@/core/hooks/pwa'
import { UPDATE_COPY } from '@/declarations/pwa/update'
import { UPDATE_BUTTON } from '@/declarations/ui/blocks'

/**
 * Update offer above the account box
 * @return {JSX.Element | null}
 */

export const UpdateButton = () => {
  const { isOffered, isIconNew, apply, acknowledge } = useUpdateOffer()
  const { route, install } = useInstallState()
  const [isNoted, setNoted] = useState(false)

  if (!isOffered && !isNoted) return null

  const onClick = () => {
    apply()
    if (isIconNew) {
      setNoted(true)
      acknowledge()
    }
  }

  return (
    <div className={UPDATE_BUTTON.wrapper}>
      <button
        type="button"
        aria-label={UPDATE_COPY.aria}
        onClick={onClick}
        className={UPDATE_BUTTON.button}
      >
        {UPDATE_COPY.label}
      </button>

      {isNoted && (
        <div role="status" className={UPDATE_BUTTON.note}>
          <p>{UPDATE_COPY.iconSteps}</p>
          <div className={UPDATE_BUTTON.actions}>
            {route === 'prompt' && (
              <button type="button" onClick={() => void install()} className={UPDATE_BUTTON.link}>
                {UPDATE_COPY.reinstall}
              </button>
            )}
            <button type="button" onClick={() => setNoted(false)} className={UPDATE_BUTTON.link}>
              {UPDATE_COPY.done}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
