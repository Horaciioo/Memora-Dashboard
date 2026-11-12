'use client'

import { useState } from 'react'

import { StreamTimers } from '@/composites/modview/StreamTimers'
import { WindowEmpty } from '@/composites/modview/ModWindow'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { MODVIEW_MOBILE_COPY as COPY } from '@/declarations/modview/mobile'
import { ICONS } from '@/declarations/ui/icons'
import { MODVIEW_MOBILE } from '@/declarations/ui/variants'
import type { ModViewState } from '@/types/modview'
import { fillTemplate } from '@/utils/format/strings'

export interface MobileStreamProps {
  state: ModViewState
}

/**
 * Stream alone on top of the page, a touch brings its title, category and audience
 * @param {MobileStreamProps} props - Stream props
 * @return {JSX.Element}
 */

export const MobileStream = ({ state }: MobileStreamProps) => {
  const [isOpen, setOpen] = useState(false)
  const ViewerIcon = ICONS.viewer

  return (
    <div
      className={MODVIEW_MOBILE.stream}
      style={{ height: `${LIVE_SETTINGS.mobileStreamPercent}dvh` }}
    >
      {state.embedUrl ? (
        <iframe
          src={state.embedUrl}
          title={MODVIEW_COPY.stream}
          className={MODVIEW_MOBILE.streamEmbed}
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      ) : (
        <WindowEmpty
          icon="streamOff"
          title={`${state.channel.name} ${MODVIEW_COPY.disconnected}`}
          body={MODVIEW_COPY.noEmbed}
        />
      )}
      <button
        type="button"
        className={MODVIEW_MOBILE.streamTap}
        aria-label={COPY.streamInfo}
        aria-expanded={isOpen}
        onClick={() => setOpen((value) => !value)}
      />
      {isOpen && (
        <div className={MODVIEW_MOBILE.streamInfo}>
          <p className={MODVIEW_MOBILE.streamTitle}>{state.title}</p>
          <p className={MODVIEW_MOBILE.streamMeta}>
            {state.channel.category && <span>{state.channel.category}</span>}
            {typeof state.viewers === 'number' && (
              <span className="flex items-center gap-1">
                <ViewerIcon className={MODVIEW_MOBILE.streamMetaIcon} aria-hidden="true" />
                {fillTemplate(COPY.viewers, { count: String(state.viewers) })}
              </span>
            )}
            <StreamTimers streamStartedAt={state.streamStartedAt} />
          </p>
        </div>
      )}
    </div>
  )
}
