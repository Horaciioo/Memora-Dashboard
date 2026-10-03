'use client'

import { ModWindow, WindowEmpty } from '@/composites/modview/ModWindow'
import { MODVIEW_COPY } from '@/declarations/modview/copy'
import { MODVIEW_STREAM } from '@/declarations/ui/variants'
import type { ModViewState } from '@/types/modview'

export interface StreamWindowProps {
  state: ModViewState
  isLit: boolean
  isTitleLit: boolean
}

/**
 * Stream player and the live title under it
 * @param {ModViewState} state - Mod View state
 * @param {boolean} isLit - Window lit by a scene
 * @param {boolean} isTitleLit - Title lit by a scene
 * @return {JSX.Element}
 */

export const StreamWindow = ({ state, isLit, isTitleLit }: StreamWindowProps) => (
  <ModWindow title={MODVIEW_COPY.stream} isLit={isLit || isTitleLit}>
    <div className={MODVIEW_STREAM.frame}>
      {state.embedUrl ? (
        <iframe
          src={state.embedUrl}
          title={MODVIEW_COPY.stream}
          className={MODVIEW_STREAM.embed}
          allowFullScreen
        />
      ) : (
        <WindowEmpty icon="stream" title={MODVIEW_COPY.latestVideo} body={MODVIEW_COPY.noEmbed} />
      )}
    </div>
    <div className={MODVIEW_STREAM.title} data-lit={isTitleLit || undefined}>
      {state.channel.categoryArt ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={state.channel.categoryArt} alt="" className={MODVIEW_STREAM.art} />
      ) : (
        <span className={MODVIEW_STREAM.art} aria-hidden="true" />
      )}
      <div className={MODVIEW_STREAM.titleBody}>
        <p className={MODVIEW_STREAM.titleText}>{state.title}</p>
        {state.channel.category && (
          <p className={MODVIEW_STREAM.category}>{state.channel.category}</p>
        )}
      </div>
    </div>
  </ModWindow>
)
